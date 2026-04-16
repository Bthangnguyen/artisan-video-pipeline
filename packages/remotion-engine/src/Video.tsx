import React from "react";
import { Composition } from "remotion";
import type { ProjectState } from "@artisan/types";

// Setup some mock props for Studio
import dummyState from "../dummy/final_state.json";

// We will need to implement CinematicCamera, AudioTrack, NodeRenderer
import { CinematicCamera } from "./components/CinematicCamera";
import { AudioTrack } from "./components/AudioTrack";
import { NodeRenderer } from "./components/NodeRenderer";
import { EdgeRenderer } from "./components/EdgeRenderer";

export const RemotionVideo: React.FC<ProjectState> = (props) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#000000", // True Black for cinematic Mind-Map
        position: "relative",
        width: props.globalConfig.width,
        height: props.globalConfig.height,
        overflow: "hidden"
      }}
    >
      <AudioTrack track={props.audioTrack} />
      <CinematicCamera camera={props.camera}>
        {props.edges && <EdgeRenderer edges={props.edges} nodes={props.nodes} />}
        <NodeRenderer nodes={props.nodes} />
      </CinematicCamera>
      
      {/* 
        Cinematic Overlays
      */}
      
      {/* 1. Vignette (Darkens the corners heavily) */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: "radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.8) 100%)",
          zIndex: 10
        }}
      />

      {/* 2. Film Grain (Noise texture overlaid via mix-blend-mode) */}
      <svg 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.25, // Light but noticeable grain
          mixBlendMode: "overlay",
          zIndex: 11
        }}
      >
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)"/>
      </svg>
    </div>
  );
};
