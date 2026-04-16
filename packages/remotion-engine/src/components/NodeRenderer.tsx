import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { SceneNode } from "@artisan/types";
import { SvgAssetId, SVG_PATHS } from "@artisan/assets";

// Renders a high-fidelity SVG path based on the assetId
const SvgAsset: React.FC<{ id: string }> = ({ id }) => {
  const path = SVG_PATHS[id] || SVG_PATHS['star'];
  return (
    <svg 
      viewBox="0 0 16 16" 
      width="120" 
      height="120" 
      fill="#e11d48"
      style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))", marginBottom: 20 }}
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
              <SvgAsset id={node.assetId} />
              <TextAnimator text={node.text} wordTimings={node.wordTimings} />
            </div>
          </Sequence>
        );
      })}
    </>
  );
};
