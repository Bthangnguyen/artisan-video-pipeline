import { z } from "zod";
import { ProjectStatus } from "../state/project-status.enum";

export const PROJECT_STATE_FILE_NAME = "project_state.json";

export interface Beat {
  id: string;
  text: string;
  emotion: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface Node {
  id: string;
  x: number;
  y: number;
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

export interface CameraWaypoint {
  frameStart: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

export interface PacingConfig {
  offsetFrames: number;
}

export interface ProjectState {
  projectId: string;
  status: ProjectStatus;
  fps: number;
  resolution: string;
  script: string;
  audioPath?: string;
  beats: Beat[];
  words: WordTimestamp[];
  nodes: Node[];
  edges: Edge[];
  visuals: Visual[];
  cameraWaypoints: CameraWaypoint[];
  pacing: PacingConfig;
  createdAt: Date;
  updatedAt: Date;
}

export const BeatSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  emotion: z.string().min(1),
});

export const WordTimestampSchema = z.object({
  word: z.string().min(1),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
});

export const NodeSchema = z.object({
  id: z.string().min(1),
  x: z.number(),
  y: z.number(),
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

export const CameraWaypointSchema = z.object({
  frameStart: z.number().int().nonnegative(),
  targetX: z.number(),
  targetY: z.number(),
  targetZoom: z.number().positive(),
});

export const PacingConfigSchema = z.object({
  offsetFrames: z.number().int(),
});

export const ProjectStateSchema = z.object({
  projectId: z.string().min(1),
  status: z.nativeEnum(ProjectStatus),
  fps: z.number().int().positive(),
  resolution: z.string().min(1),
  script: z.string().min(1),
  audioPath: z.string().min(1).optional(),
  beats: z.array(BeatSchema),
  words: z.array(WordTimestampSchema),
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  visuals: z.array(VisualSchema),
  cameraWaypoints: z.array(CameraWaypointSchema),
  pacing: PacingConfigSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProjectStateInput = z.input<typeof ProjectStateSchema>;
