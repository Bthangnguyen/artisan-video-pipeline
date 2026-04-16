import { Beat, Visual } from "../schemas/project-state.schema";

const EMOTION_TO_ANIMATION: Record<string, string> = {
  curious: "pan-in",
  energetic: "kinetic-pulse",
  confident: "steady-rise",
  grounded: "slow-drift",
  uplifting: "float-up",
};

export class AssetService {
  assignVisuals(beats: Beat[]): Visual[] {
    return beats.map((beat, index) => ({
      beatId: beat.id,
      assetId: this.pickAssetId(beat, index),
      animation: this.pickAnimation(beat),
    }));
  }

  private pickAssetId(beat: Beat, index: number): string {
    const textLower = beat.text.toLowerCase();
    
    if (textLower.includes("watching") || textLower.includes("video") || textLower.includes("digging")) {
        return "eye";
    }
    if (textLower.includes("book") || textLower.includes("read")) {
        return "book";
    }
    if (textLower.includes("change") || textLower.includes("wake up") || textLower.includes("start")) {
        return "flame";
    }
    if (textLower.includes("plan") || textLower.includes("discipline")) {
        return "target";
    }
    if (textLower.includes("10,000") || textLower.includes("hours") || textLower.includes("years") || textLower.includes("5 am") || textLower.includes("time")) {
        return "clock";
    }
    if (textLower.includes("wrong") || textLower.includes("fail")) {
        return "cross";
    }
    if (textLower.includes("click") || textLower.includes("holding")) {
        return "infinite";
    }

    const fallbacks = ["eye", "flame", "target", "infinite", "clock", "book", "cross"];
    return fallbacks[index % fallbacks.length];
  }

  private pickAnimation(beat: Beat): string {
    return EMOTION_TO_ANIMATION[beat.emotion] ?? "steady-hold";
  }
}
