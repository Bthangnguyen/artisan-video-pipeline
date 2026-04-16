import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { CameraPath } from "@artisan/types";

export const CinematicCamera: React.FC<{ camera: CameraPath; children: React.ReactNode }> = ({ camera, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find the active waypoint
  const activeWaypointIndex = useMemo(() => {
    let index = 0;
    for (let i = 0; i < camera.waypoints.length; i++) {
        if (frame >= camera.waypoints[i].frameStart) {
            index = i;
        } else {
            break;
        }
    }
    return index;
  }, [frame, camera.waypoints]);

  const waypoint = camera.waypoints[activeWaypointIndex];
  const prevWaypoint = activeWaypointIndex > 0 ? camera.waypoints[activeWaypointIndex - 1] : camera.waypoints[0];

  const startFrame = waypoint.frameStart;
  
  // Map MotionPreset to spring physics (Dark Needle Style)
  // Camera feels like a physical object with mass, creating a deliberate overshoot and settle.
  const motionConfig = {
    aggressive_snap: { damping: 14, stiffness: 90, mass: 0.9 },
    smooth_glide: { damping: 18, stiffness: 70, mass: 0.9 }, // Dramatic reveal style
    gentle_float: { damping: 20, stiffness: 60, mass: 1 },
  }[waypoint.motionPreset || "aggressive_snap"];

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: motionConfig,
  });

  const x = prevWaypoint.targetX + (waypoint.targetX - prevWaypoint.targetX) * progress;
  const y = prevWaypoint.targetY + (waypoint.targetY - prevWaypoint.targetY) * progress;
  const zoom = prevWaypoint.targetZoom + (waypoint.targetZoom - prevWaypoint.targetZoom) * progress;

  // Real-time faux-velocity calculation to simulate motion blur
  // progress will typically overshoot or change rapidly during transitive frames
  // We can approximate velocity by looking at the derivative of the spring progress,
  // but a simpler method in Remotion is to check if progress is between 0 and 0.8
  const isMoving = progress > 0.05 && progress < 0.95 && activeWaypointIndex > 0;
  
  // Apply a small blur during fast movements (aggressive snap)
  const isAggressive = waypoint.motionPreset === "aggressive_snap";
  const blurAmount = isMoving && isAggressive ? 4 : (isMoving ? 2 : 0);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        transform: `scale(${zoom}) translate(${-x}px, ${-y}px)`,
        transformOrigin: "center center",
        willChange: "transform, filter",
        filter: `blur(${blurAmount}px)`,
        transition: "filter 0.1s linear" // Smooth out the blur
      }}
    >
      {children}
    </div>
  );
};
