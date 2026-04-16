import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { SceneNode, ValidAssetId } from "@artisan/types";
import { SvgAssetId } from "@artisan/assets";

// A dummy component for SVG assets for now
const SvgAsset: React.FC<{ id: string }> = ({ id }) => {
  return (
    <div style={{ padding: 20, backgroundColor: 'white', borderRadius: 10, marginBottom: 10, color: 'black' }}>
      Asset: {id}
    </div>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div style={{ fontSize: 40, color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
      {text}
    </div>
  );
};

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
                alignItems: "center"
              }}
            >
              <SvgAsset id={node.assetId} />
              <Subtitle text={node.text} />
            </div>
          </Sequence>
        );
      })}
    </>
  );
};
