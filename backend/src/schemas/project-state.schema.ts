import { z } from "zod";
import { ProjectStatus } from "../state/project-status.enum";

export const PROJECT_STATE_FILE_NAME = "project_state.json";

export interface Beat {
  id: string;
  text: string;
  spokenText?: string;
  emotion: string;
}

export interface BeatTiming {
  beatId: string;
  sourceText: string;
  spokenText: string;
  sourceCharStart: number;
  sourceCharEndExclusive: number;
  spokenCharStart: number;
  spokenCharEndExclusive: number;
  rawVoiceStartSeconds: number;
  rawVoiceEndSeconds: number;
  rawVoiceStartFrame: number;
  rawVoiceEndFrame: number;
  offsetFrames: number;
}

export interface WordTimestamp {
  beatId: string;
  word: string;
  spokenWord: string;
  spokenCharStart: number;
  spokenCharEndExclusive: number;
  rawVoiceStartSeconds: number;
  rawVoiceEndSeconds: number;
  rawVoiceStartFrame: number;
  rawVoiceEndFrame: number;
}

export interface Node {
  id: string;
  beatId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface Visual {
  beatId: string;
  assetId: string;
  animation: string;
}

export type CameraMotionPreset =
  | "gentle_float"
  | "smooth_glide"
  | "aggressive_snap";

export type CameraFraming = "tight" | "medium" | "wide";

export type CameraHoldBehavior = "follow_exact" | "lead_in" | "linger_out";

export interface CameraFocusSegment {
  id: string;
  focusBeatIds: string[];
  motionPreset: CameraMotionPreset;
  framing: CameraFraming;
  holdBehavior: CameraHoldBehavior;
}

export interface CameraPlan {
  segments: CameraFocusSegment[];
}

export interface CameraWaypoint {
  frameStart: number;
  frameEnd: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
  motionPreset: CameraMotionPreset;
  focusBeatIds: string[];
}

export interface TtsChunk {
  chunkId: string;
  text: string;
  spokenText: string;
  beatIds: string[];
  startBeatIndex: number;
  endBeatIndexInclusive: number;
  requestId?: string;
  audioPath?: string;
}

export interface PacingConfig {
  defaultOffsetFrames: number;
}

export interface ProjectState {
  projectId: string;
  status: ProjectStatus;
  fps: number;
  resolution: string;
  script: string;
  spokenScript?: string;
  audioPath?: string;
  beats: Beat[];
  beatTimings: BeatTiming[];
  words: WordTimestamp[];
  nodes: Node[];
  edges: Edge[];
  visuals: Visual[];
  ttsChunks: TtsChunk[];
  cameraPlan?: CameraPlan;
  cameraWaypoints: CameraWaypoint[];
  pacing: PacingConfig;
  createdAt: Date;
  updatedAt: Date;
}

export const BeatSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  spokenText: z.string().min(1).optional(),
  emotion: z.string().min(1),
});

export const BeatTimingSchema = z.object({
  beatId: z.string().min(1),
  sourceText: z.string(),
  spokenText: z.string(),
  sourceCharStart: z.number().int().nonnegative(),
  sourceCharEndExclusive: z.number().int().nonnegative(),
  spokenCharStart: z.number().int().nonnegative(),
  spokenCharEndExclusive: z.number().int().nonnegative(),
  rawVoiceStartSeconds: z.number().nonnegative(),
  rawVoiceEndSeconds: z.number().nonnegative(),
  rawVoiceStartFrame: z.number().int().nonnegative(),
  rawVoiceEndFrame: z.number().int().nonnegative(),
  offsetFrames: z.number().int(),
});

export const WordTimestampSchema = z.object({
  beatId: z.string().min(1),
  word: z.string().min(1),
  spokenWord: z.string().min(1),
  spokenCharStart: z.number().int().nonnegative(),
  spokenCharEndExclusive: z.number().int().nonnegative(),
  rawVoiceStartSeconds: z.number().nonnegative(),
  rawVoiceEndSeconds: z.number().nonnegative(),
  rawVoiceStartFrame: z.number().int().nonnegative(),
  rawVoiceEndFrame: z.number().int().nonnegative(),
});

export const NodeSchema = z.object({
  id: z.string().min(1),
  beatId: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const EdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});

export const VisualSchema = z.object({
  beatId: z.string().min(1),
  assetId: z.string().min(1),
  animation: z.string().min(1),
});

export const CameraMotionPresetSchema = z.enum([
  "gentle_float",
  "smooth_glide",
  "aggressive_snap",
]);

export const CameraFramingSchema = z.enum(["tight", "medium", "wide"]);

export const CameraHoldBehaviorSchema = z.enum([
  "follow_exact",
  "lead_in",
  "linger_out",
]);

export const CameraFocusSegmentSchema = z.object({
  id: z.string().min(1),
  focusBeatIds: z.array(z.string().min(1)).min(1),
  motionPreset: CameraMotionPresetSchema,
  framing: CameraFramingSchema,
  holdBehavior: CameraHoldBehaviorSchema,
});

export const CameraPlanSchema = z.object({
  segments: z.array(CameraFocusSegmentSchema).min(1),
});

export const CameraWaypointSchema = z.object({
  frameStart: z.number().int().nonnegative(),
  frameEnd: z.number().int().nonnegative(),
  targetX: z.number(),
  targetY: z.number(),
  targetZoom: z.number().positive(),
  motionPreset: CameraMotionPresetSchema,
  focusBeatIds: z.array(z.string().min(1)).min(1),
});

export const TtsChunkSchema = z.object({
  chunkId: z.string().min(1),
  text: z.string(),
  spokenText: z.string(),
  beatIds: z.array(z.string().min(1)).min(1),
  startBeatIndex: z.number().int().nonnegative(),
  endBeatIndexInclusive: z.number().int().nonnegative(),
  requestId: z.string().min(1).optional(),
  audioPath: z.string().min(1).optional(),
});

export const PacingConfigSchema = z.object({
  defaultOffsetFrames: z.number().int(),
});

export const ProjectStateSchema = z.object({
  projectId: z.string().min(1),
  status: z.nativeEnum(ProjectStatus),
  fps: z.number().int().positive(),
  resolution: z.string().min(1),
  script: z.string().min(1),
  spokenScript: z.string().optional(),
  audioPath: z.string().min(1).optional(),
  beats: z.array(BeatSchema),
  beatTimings: z.array(BeatTimingSchema),
  words: z.array(WordTimestampSchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  visuals: z.array(VisualSchema),
  ttsChunks: z.array(TtsChunkSchema),
  cameraPlan: CameraPlanSchema.optional(),
  cameraWaypoints: z.array(CameraWaypointSchema),
  pacing: PacingConfigSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProjectStateInput = z.input<typeof ProjectStateSchema>;
