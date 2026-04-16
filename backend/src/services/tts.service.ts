import path from "path";
import fs from "fs";
import { config } from "../config/env";
import {
  Beat,
  BeatTiming,
  TtsChunk,
  WordTimestamp,
} from "../schemas/project-state.schema";

// --- CRITICAL CONSTRAINT 1: Zero-Cost Testing ---
const USE_MOCK_TTS = false;

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface ElevenLabsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
  normalized_alignment?: ElevenLabsAlignment;
}

export interface TtsSynthesisResult {
  audioPath: string;
  spokenScript: string;
  beats: Beat[];
  beatTimings: BeatTiming[];
  words: WordTimestamp[];
  ttsChunks: TtsChunk[];
}

export class TtsService {
  async synthesize(projectId: string, beats: Beat[], fps: number): Promise<TtsSynthesisResult> {
    const normalizedBeats = beats.map((beat) => ({
      ...beat,
      spokenText: this.normalizeForSpeech(beat.spokenText ?? beat.text),
    }));
    
    const spokenScript = normalizedBeats
      .map((beat) => beat.spokenText ?? beat.text)
      .join(" ");

    // 1. Fetch Audio & Alignments (API or Mock)
    const { audioPath, alignment } = await this.fetchElevenLabs(projectId, spokenScript);

    // 2. Extract Timestamps via The Resolver
    const words = this.extractWordTimestamps(spokenScript, alignment, fps, normalizedBeats);
    
    // 3. Map BeatTimings based on extracted Words
    const beatTimings = this.computeBeatTimings(normalizedBeats, words, fps);

    return {
      audioPath,
      spokenScript,
      beats: normalizedBeats,
      beatTimings,
      words,
      ttsChunks: [], // Legacy chunking removed for ElevenLabs unified call
    };
  }

  private async fetchElevenLabs(projectId: string, text: string): Promise<{audioPath: string; alignment: ElevenLabsAlignment}> {
    const outputFileName = `voiceover_${Date.now()}.mp3`;
    const audioPath = path.join(config.storagePath, projectId, outputFileName);
    
    const dummyPath = path.join(process.cwd(), "..", "dummy", "tts_mock_response.json"); // Placed in root dummy folder

    if (USE_MOCK_TTS) {
      console.log(`[TTS] Using Mock Response. Bypassing API credits cost.`);
      if (!fs.existsSync(dummyPath)) {
        throw new Error(`Mock response file not found at ${dummyPath}! Please create it to test.`);
      }
      const mockData = JSON.parse(fs.readFileSync(dummyPath, "utf-8")) as ElevenLabsResponse;
      
      const targetDir = path.dirname(audioPath);
      if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
      }
      if (mockData.audio_base64) {
          fs.writeFileSync(audioPath, Buffer.from(mockData.audio_base64, "base64"));
      }

      const activeAlignment = mockData.normalized_alignment ?? mockData.alignment;
      return { audioPath, alignment: activeAlignment };
    }

    // Call Real ElevenLabs API
    console.log("[TTS] Calling REAL ElevenLabs API. Deducting credits...");
    const voiceId = "pFZP5JQG7iQjIQuC4Bku"; // Friendly Vietnamese default (or similar)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY environment variable.");

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as ElevenLabsResponse;
    const activeAlignment = data.normalized_alignment ?? data.alignment;

    const targetDir = path.dirname(audioPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(audioPath, Buffer.from(data.audio_base64, "base64"));

    return { audioPath, alignment: activeAlignment };
  }

  // --- CRITICAL CONSTRAINT 2: The Fast-Path & Fallback (The Resolver) ---
  private extractWordTimestamps(
    originalText: string,
    alignment: ElevenLabsAlignment,
    fps: number,
    beats: Beat[]
  ): WordTimestamp[] {
    const words: WordTimestamp[] = [];
    
    // 1. Build character stream excluding whitespaces
    const stream: { char: string; start: number; end: number }[] = [];
    for (let i = 0; i < alignment.characters.length; i++) {
        const char = alignment.characters[i];
        if (char.trim() !== "") {
            stream.push({
                char,
                start: alignment.character_start_times_seconds[i],
                end: alignment.character_end_times_seconds[i]
            });
        }
    }

    const originalClean = originalText.replace(/\s+/g, "");
    const streamClean = stream.map((s) => s.char).join("");
    
    if (originalClean.length !== streamClean.length) {
        console.warn(`[TTS] Stream length mismatch. Original: ${originalClean.length}, ElevenLabs: ${streamClean.length}. Resolver will attempt safe-fallback mapping.`);
    }

    const segmenterCtor = (Intl as any).Segmenter;
    let segments: any[] = [];
    
    if (segmenterCtor) {
        const segmenter = new segmenterCtor("vi", { granularity: "word" });
        segments = Array.from(segmenter.segment(originalText));
    } else {
        const iter = originalText.matchAll(/\p{L}[\p{L}\p{M}\p{N}_'-]*|[^\p{L}\s]+/gu);
        segments = Array.from(iter).map((match) => ({
            segment: match[0],
            isWordLike: /\p{L}/u.test(match[0]),
            index: match.index ?? 0
        }));
    }

    let streamPointer = 0;
    
    // Map character index back to Beat logic
    const getBeatIdForIndex = (charIndex: number): string => {
        let cursor = 0;
        for (const beat of beats) {
            const btText = beat.spokenText ?? beat.text;
            if (charIndex >= cursor && charIndex <= cursor + btText.length) {
                return beat.id;
            }
            cursor += btText.length + 1; // +1 space delimiter
        }
        return beats[beats.length - 1].id;
    };

    for (const segment of segments) {
      if (!segment.isWordLike) continue;

      const wordClean = segment.segment.replace(/\s+/g, "");
      if (wordClean.length === 0) continue;

      const startSec = stream[streamPointer]?.start ?? 0;
      const charsToConsume = Math.min(wordClean.length, stream.length - streamPointer);
      streamPointer += charsToConsume;
      const endSec = stream[streamPointer - 1]?.end ?? startSec;

      const beatId = getBeatIdForIndex(segment.index);

      // CRITICAL CONSTRAINT 3: Exact Frame calculation
      words.push({
        beatId: beatId,
        word: segment.segment,
        spokenWord: segment.segment,
        spokenCharStart: segment.index,
        spokenCharEndExclusive: segment.index + segment.segment.length,
        rawVoiceStartSeconds: startSec,
        rawVoiceEndSeconds: endSec,
        rawVoiceStartFrame: Math.round(startSec * fps),
        rawVoiceEndFrame: Math.round(endSec * fps),
      });
    }

    return words;
  }

  private computeBeatTimings(beats: Beat[], words: WordTimestamp[], fps: number): BeatTiming[] {
    const timings: BeatTiming[] = [];
    const groupedList = this.groupByBeat(words);

    let charCursor = 0;
    for (const beat of beats) {
        const btText = beat.spokenText ?? beat.text;
        const bWords = groupedList.get(beat.id) || [];
        
        const sourceCharStart = charCursor;
        const sourceCharEndExclusive = charCursor + beat.text.length;
        
        let startFrame = 0;
        let endFrame = Math.round(0.1 * fps);
        let startSec = 0;
        let endSec = 0.1;

        if (bWords.length > 0) {
            startSec = bWords[0].rawVoiceStartSeconds;
            endSec = bWords[bWords.length - 1].rawVoiceEndSeconds;
            startFrame = bWords[0].rawVoiceStartFrame;
            endFrame = bWords[bWords.length - 1].rawVoiceEndFrame;
        }

        timings.push({
            beatId: beat.id,
            sourceText: beat.text,
            spokenText: btText,
            sourceCharStart: sourceCharStart,
            sourceCharEndExclusive: sourceCharEndExclusive,
            spokenCharStart: sourceCharStart,
            spokenCharEndExclusive: sourceCharEndExclusive,
            rawVoiceStartSeconds: startSec,
            rawVoiceEndSeconds: endSec,
            rawVoiceStartFrame: startFrame,
            rawVoiceEndFrame: endFrame,
            offsetFrames: 0,
        });

        charCursor += btText.length + 1;
    }
    return timings;
  }

  private groupByBeat(words: WordTimestamp[]): Map<string, WordTimestamp[]> {
      const map = new Map<string, WordTimestamp[]>();
      for (const w of words) {
          if (!map.has(w.beatId)) map.set(w.beatId, []);
          map.get(w.beatId)!.push(w);
      }
      return map;
  }

  private normalizeForSpeech(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim();
  }
}
