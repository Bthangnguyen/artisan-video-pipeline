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

  const springConfig = waypoint.springConfig;
  const startFrame = waypoint.frameStart;
  
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: {
      damping: springConfig.damping,
      mass: springConfig.mass,
      stiffness: springConfig.stiffness,
    },
  });

  // Calculate the target values based on the progress of the spring
  const x = prevWaypoint.targetX + (waypoint.targetX - prevWaypoint.targetX) * progress;
  const y = prevWaypoint.targetY + (waypoint.targetY - prevWaypoint.targetY) * progress;
  const zoom = prevWaypoint.targetZoom + (waypoint.targetZoom - prevWaypoint.targetZoom) * progress;

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
      }}
    >
      {children}
    </div>
  );
};
