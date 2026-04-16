import path from "path";
import { config } from "../config/env";
import { WordTimestamp } from "../schemas/project-state.schema";

export interface TtsSynthesisResult {
  audioPath: string;
  words: WordTimestamp[];
}

export class TtsService {
  synthesize(projectId: string, script: string): TtsSynthesisResult {
    const words = this.tokenize(script);
    let cursor = 0;

    const timestamps = words.map((word, index) => {
      const duration = this.getWordDuration(word, index);
      const start = Number(cursor.toFixed(2));
      cursor += duration;

      return {
        word,
        start,
        end: Number(cursor.toFixed(2)),
      };
    });

    return {
      audioPath: path.join(config.storagePath, projectId, "voiceover.wav"),
      words: timestamps,
    };
  }

  private tokenize(script: string): string[] {
    const matches = script.match(/\p{L}[\p{L}\p{N}'-]*/gu);
    return matches ?? [];
  }

  private getWordDuration(word: string, index: number): number {
    const baseDuration = 0.22;
    const lengthModifier = Math.min(word.length, 12) * 0.015;
    const cadenceModifier = index % 5 === 0 ? 0.03 : 0;

    return Number((baseDuration + lengthModifier + cadenceModifier).toFixed(2));
  }
}
