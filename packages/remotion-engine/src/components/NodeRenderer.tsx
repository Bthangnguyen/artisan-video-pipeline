import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { SceneNode } from "@artisan/types";
import { SvgAssetId, SVG_PATHS } from "@artisan/assets";

import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const SvgAsset: React.FC<{ id: string; startFrame: number }> = ({ id, startFrame }) => {
  const path = SVG_PATHS[id] || SVG_PATHS['star'];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cinematic Spring Pop-in
  const pop = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const scale = interpolate(pop, [0, 1], [0, 1]);
  const opacity = interpolate(pop, [0, 0.2], [0, 1]);

  // Breathing Glow (Sine wave oscillation)
  const breathingScale = Math.sin(frame / 8) * 0.5 + 0.5; // Oscillates between 0 and 1
  const outerGlowRadius = interpolate(breathingScale, [0, 1], [15, 35]);
  const glowOpacity = interpolate(breathingScale, [0, 1], [0.5, 0.9]);

  return (
    <svg 
      viewBox="0 0 16 16" 
      width="180" 
      height="180" 
      fill="#e11d48" // A sharp contrast color
      style={{ 
        filter: `drop-shadow(0 0 ${outerGlowRadius}px rgba(225,29,72,${glowOpacity})) drop-shadow(0 0 10px rgba(225,29,72,0.5))`, 
        marginBottom: 30,
        transform: `scale(${scale})`,
        opacity
      }}
    >
      <path d={path} />
    </svg>
  );
};

import { TextAnimator } from "./TextAnimator";

export const NodeRenderer: React.FC<{ nodes: SceneNode[] }> = ({ nodes }) => {
  return (
    <>
      {nodes.map((node) => {
        const actualStart = node.timing.startFrame + node.timing.offsetFrames;
        
        return (
          <Sequence
            key={node.id}
            from={actualStart}
            durationInFrames={node.timing.baseDuration}
          >
            <div
              style={{
                position: "absolute",
                left: node.spatialData.x,
                top: node.spatialData.y,
                transform: `translate(-50%, -50%) scale(${node.spatialData.scale})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%"
              }}
            >
              <SvgAsset id={node.assetId} startFrame={actualStart} />
              <TextAnimator text={node.text} wordTimings={node.wordTimings} />
            </div>
          </Sequence>
        );
      })}
    </>
  );
};
