import {
  BeatTiming,
  CameraFocusSegment,
  CameraFraming,
  CameraPlan,
  CameraWaypoint,
  Node,
  ProjectState,
} from "../schemas/project-state.schema";

const CAMERA_PADDING: Record<CameraFraming, number> = {
  tight: 1.15,
  medium: 1.35,
  wide: 1.65,
};

const CAMERA_LIMITS = {
  minZoom: 0.65,
  maxZoom: 2.4,
  leadInFrames: 6,
  lingerFrames: 8,
} as const;

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export class CameraService {
  buildWaypoints(project: ProjectState, plan?: CameraPlan): CameraWaypoint[] {
    const sanitizedPlan = this.sanitizePlan(project, plan);

    return sanitizedPlan.segments
      .map((segment) => this.buildWaypoint(project, segment))
      .sort((left, right) => left.frameStart - right.frameStart);
  }

  private sanitizePlan(project: ProjectState, plan?: CameraPlan): CameraPlan {
    const beatIds = new Set(project.beats.map((beat) => beat.id));
    const consumedBeatIds = new Set<string>();
    const segments = (plan?.segments ?? [])
      .map((segment) => ({
        ...segment,
        focusBeatIds: segment.focusBeatIds.filter(
          (beatId) => beatIds.has(beatId) && !consumedBeatIds.has(beatId),
        ),
      }))
      .filter((segment) => segment.focusBeatIds.length > 0)
      .map((segment) => {
        segment.focusBeatIds.forEach((beatId) => consumedBeatIds.add(beatId));
        return segment;
      });

    if (segments.length > 0) {
      return { segments };
    }

    return {
      segments: project.beats.map((beat, index) => ({
        id: `camera-fallback-${index + 1}`,
        focusBeatIds: [beat.id],
        motionPreset: "smooth_glide",
        framing: "medium",
        holdBehavior:
          index === 0
            ? "lead_in"
            : index === project.beats.length - 1
              ? "linger_out"
              : "follow_exact",
      })),
    };
  }

  private buildWaypoint(project: ProjectState, segment: CameraFocusSegment): CameraWaypoint {
    const timingWindow = this.resolveTimingWindow(project.beatTimings, segment.focusBeatIds);
    const nodes = project.nodes.filter((node) => segment.focusBeatIds.includes(node.beatId));
    const bounds = this.computeBounds(nodes);

    const emotionZoomMap: Record<string, number> = {
      curious: 1.4,
      tension: 1.7,
      confident: 1.7,
      overwhelm: 0.8,
      grounded: 0.8,
      uplifting: 2.0,
      insight: 2.0
    };

    // Grab the emotion from the primary focus beat
    const primaryBeat = project.beats.find(b => b.id === segment.focusBeatIds[0]);
    const emotion = primaryBeat?.emotion || "curious";
    const mappedZoom = emotionZoomMap[emotion] || 1.4;

    const targetZoom = this.clamp(
      mappedZoom,
      CAMERA_LIMITS.minZoom,
      CAMERA_LIMITS.maxZoom,
    );

    return {
      frameStart: this.applyLeadBehavior(timingWindow.frameStart, segment.holdBehavior),
      frameEnd: this.applyLingerBehavior(timingWindow.frameEnd, segment.holdBehavior),
      targetX: Number(((bounds.left + bounds.right) / 2).toFixed(2)),
      targetY: Number(((bounds.top + bounds.bottom) / 2).toFixed(2)),
      targetZoom: Number(targetZoom.toFixed(3)),
      motionPreset: segment.motionPreset,
      focusBeatIds: segment.focusBeatIds,
    };
  }

  private resolveTimingWindow(
    beatTimings: BeatTiming[],
    focusBeatIds: string[],
  ): { frameStart: number; frameEnd: number } {
    const relevantTimings = beatTimings.filter((timing) => focusBeatIds.includes(timing.beatId));

    if (relevantTimings.length === 0) {
      return { frameStart: 0, frameEnd: 30 };
    }

    const frameStart = Math.min(
      ...relevantTimings.map((timing) => timing.rawVoiceStartFrame + timing.offsetFrames),
    );
    const frameEnd = Math.max(
      ...relevantTimings.map((timing) => timing.rawVoiceEndFrame + timing.offsetFrames),
    );

    return {
      frameStart: Math.max(0, frameStart),
      frameEnd: Math.max(frameStart + 1, frameEnd),
    };
  }

  private computeBounds(nodes: Node[]): Bounds {
    if (nodes.length === 0) {
      return {
        left: -160,
        right: 160,
        top: -90,
        bottom: 90,
      };
    }

    return nodes.reduce<Bounds>(
      (bounds, node) => ({
        left: Math.min(bounds.left, node.x - node.width / 2),
        right: Math.max(bounds.right, node.x + node.width / 2),
        top: Math.min(bounds.top, node.y - node.height / 2),
        bottom: Math.max(bounds.bottom, node.y + node.height / 2),
      }),
      {
        left: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY,
      },
    );
  }

  private parseResolution(resolution: string): { width: number; height: number } {
    const match = resolution.match(/^(\d+)x(\d+)$/);

    if (!match) {
      return { width: 1080, height: 1920 };
    }

    return {
      width: Number(match[1]),
      height: Number(match[2]),
    };
  }

  private applyLeadBehavior(
    frameStart: number,
    holdBehavior: CameraFocusSegment["holdBehavior"],
  ): number {
    // anticipation delay: stay still for leadInFrames, then snap
    return frameStart + CAMERA_LIMITS.leadInFrames;
  }

  private applyLingerBehavior(
    frameEnd: number,
    holdBehavior: CameraFocusSegment["holdBehavior"],
  ): number {
    if (holdBehavior === "linger_out") {
      return frameEnd + CAMERA_LIMITS.lingerFrames;
    }

    return frameEnd;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
