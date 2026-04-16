import { Beat, BeatTiming, CameraPlan } from "../schemas/project-state.schema";

const FALLBACK_EMOTIONS = ["grounded", "confident", "curious", "uplifting"];

export class LlmService {
  segmentScript(script: string): Beat[] {
    const segments = script
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    const normalizedSegments = segments.length > 0 ? segments : [script.trim()];

    return normalizedSegments.map((text, index) => ({
      id: `beat-${index + 1}`,
      text,
      spokenText: this.normalizeWhitespace(text),
      emotion: this.inferEmotion(text, index),
    }));
  }

  planCamera(beats: Beat[], beatTimings: BeatTiming[]): CameraPlan {
    const timingByBeatId = new Map(beatTimings.map((timing) => [timing.beatId, timing]));
    const segments: CameraPlan["segments"] = [];

    for (let index = 0; index < beats.length; index += 1) {
      const beat = beats[index];
      const nextBeat = beats[index + 1];
      const currentTiming = timingByBeatId.get(beat.id);
      const nextTiming = nextBeat ? timingByBeatId.get(nextBeat.id) : undefined;
      const focusBeatIds = [beat.id];

      if (
        nextBeat &&
        currentTiming &&
        nextTiming &&
        this.canGroupBeats(beat, nextBeat, currentTiming, nextTiming)
      ) {
        focusBeatIds.push(nextBeat.id);
        index += 1;
      }

      const isFirstSegment = segments.length === 0;
      const isLastSegment = focusBeatIds.at(-1) === beats.at(-1)?.id;

      segments.push({
        id: `camera-segment-${segments.length + 1}`,
        focusBeatIds,
        motionPreset: this.pickMotionPreset(beat.emotion),
        framing: focusBeatIds.length > 1 ? "wide" : this.pickFraming(beat, currentTiming),
        holdBehavior: isFirstSegment
          ? "lead_in"
          : isLastSegment
            ? "linger_out"
            : "follow_exact",
      });
    }

    return { segments };
  }

  private inferEmotion(text: string, index: number): string {
    if (text.includes("?")) {
      return "curious";
    }

    if (text.includes("!")) {
      return "energetic";
    }

    return FALLBACK_EMOTIONS[index % FALLBACK_EMOTIONS.length];
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim();
  }

  private canGroupBeats(
    currentBeat: Beat,
    nextBeat: Beat,
    currentTiming: BeatTiming,
    nextTiming: BeatTiming,
  ): boolean {
    const combinedDuration =
      nextTiming.rawVoiceEndFrame - currentTiming.rawVoiceStartFrame;

    return (
      combinedDuration <= 90 &&
      currentBeat.emotion !== "energetic" &&
      nextBeat.emotion !== "energetic"
    );
  }

  private pickMotionPreset(
    emotion: Beat["emotion"],
  ): CameraPlan["segments"][number]["motionPreset"] {
    if (emotion === "energetic") {
      return "aggressive_snap";
    }

    if (emotion === "curious" || emotion === "uplifting") {
      return "gentle_float";
    }

    return "smooth_glide";
  }

  private pickFraming(
    beat: Beat,
    timing?: BeatTiming,
  ): CameraPlan["segments"][number]["framing"] {
    const durationInFrames =
      timing !== undefined ? timing.rawVoiceEndFrame - timing.rawVoiceStartFrame : 0;

    if (beat.emotion === "energetic" || durationInFrames <= 42) {
      return "tight";
    }

    return "medium";
  }
}
