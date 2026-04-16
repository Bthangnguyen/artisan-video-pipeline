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
    return `asset-${beat.emotion.toLowerCase()}-${index + 1}`;
  }

  private pickAnimation(beat: Beat): string {
    return EMOTION_TO_ANIMATION[beat.emotion] ?? "steady-hold";
  }
}
