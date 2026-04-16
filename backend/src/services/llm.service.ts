import { Beat } from "../schemas/project-state.schema";

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
      emotion: this.inferEmotion(text, index),
    }));
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
}
