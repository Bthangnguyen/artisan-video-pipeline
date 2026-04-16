import { z } from "zod";

// --- Global Config ---
export const GlobalConfigSchema = z.object({
  fps: z.number().default(30),
  width: z.number().default(1080),
  height: z.number().default(1920),
  backgroundColor: z.string().default("#000000"),
});

export type GlobalConfig = z.infer<typeof GlobalConfigSchema>;

// --- Audio Track ---
export const AudioTrackSchema = z.object({
  url: z.string().url(),
  durationInFrames: z.number(),
});

export type AudioTrack = z.infer<typeof AudioTrackSchema>;

// --- Scene Node ---
export const SpatialDataSchema = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number(),
});

export const TimingSchema = z.object({
  startFrame: z.number(),
  baseDuration: z.number(),
  offsetFrames: z.number().default(0),
});

export const SceneNodeSchema = z.object({
  id: z.string(),
  text: z.string(),
  assetId: z.string(), // Maps to the SVG Enum in @artisan/assets
  spatialData: SpatialDataSchema,
  timing: TimingSchema,
});

export type SceneNode = z.infer<typeof SceneNodeSchema>;

// --- Camera ---
export const SpringConfigSchema = z.object({
  mass: z.number().default(1),
  damping: z.number().default(14),
  stiffness: z.number().default(90),
});

export const CameraWaypointSchema = z.object({
  frameStart: z.number(),
  targetX: z.number(),
  targetY: z.number(),
  targetZoom: z.number(),
  springConfig: SpringConfigSchema,
});

export const CameraPathSchema = z.object({
  waypoints: z.array(CameraWaypointSchema),
});

export type CameraWaypoint = z.infer<typeof CameraWaypointSchema>;
export type CameraPath = z.infer<typeof CameraPathSchema>;

// --- Global State ---
export const ProjectStateSchema = z.object({
  projectId: z.string(),
  globalConfig: GlobalConfigSchema,
  audioTrack: AudioTrackSchema,
  nodes: z.array(SceneNodeSchema),
  camera: CameraPathSchema,
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;
