import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { SceneNode, Edge } from "@artisan/types";

interface EdgeRendererProps {
  nodes: SceneNode[];
  edges: Edge[];
}

export const EdgeRenderer: React.FC<EdgeRendererProps> = ({ nodes, edges }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Create a lookup for fast access
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  return (
    <svg 
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible", // So lines spanning far apart don't clip
        zIndex: 0 // Behind nodes
      }}
    >
      <defs>
        {/* Glow Filter for the mind-map connections */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      {edges.map((edge, i) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) return null;

        // The edge should "draw" itself when the target node begins
        const targetStart = targetNode.timing.startFrame;
        
        const progress = spring({
          frame: frame - (targetStart - 10), // start drawing slightly before target node appears
          fps,
          config: { damping: 14, stiffness: 100 },
        });

        // Path coordinates (from center of source to center of target)
        // Since spatialData has centered coords, we just use them directly
        const x1 = sourceNode.spatialData.x;
        const y1 = sourceNode.spatialData.y;
        const x2 = targetNode.spatialData.x;
        const y2 = targetNode.spatialData.y;
        
        // Calculate length for stroke-dasharray animation
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        const strokeDashoffset = interpolate(progress, [0, 1], [length, 0], {
            extrapolateRight: "clamp",
        });

        const drawOpacity = interpolate(progress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
        
        // Continuous pulse flowing along the line forever
        const pulseOffset = (frame * 3) % 45;

        return (
          <g key={edge.id} style={{ opacity: drawOpacity }}>
            {/* The base drawn line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fbbf24" // Yellow connection lines
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.4}
              strokeDasharray={length}
              strokeDashoffset={strokeDashoffset}
              filter="url(#glow)"
            />
            {/* The pulse layer overlays the drawn line */}
            {progress > 0.5 && (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fff" // White hot pulse
                strokeWidth="1.5"
                strokeOpacity={0.8}
                strokeDasharray="15 30"
                strokeDashoffset={-pulseOffset} // Negative offset moves it forward
                style={{ mixBlendMode: 'overlay' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
