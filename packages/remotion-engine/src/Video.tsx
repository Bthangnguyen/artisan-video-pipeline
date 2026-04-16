import React from "react";
import { Composition } from "remotion";
import type { ProjectState } from "@artisan/types";

// Setup some mock props for Studio
import dummyState from "../dummy/final_state.json";

// We will need to implement CinematicCamera, AudioTrack, NodeRenderer
import { CinematicCamera } from "./components/CinematicCamera";
import { AudioTrack } from "./components/AudioTrack";
import { NodeRenderer } from "./components/NodeRenderer";

export const RemotionVideo: React.FC<ProjectState> = (props) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: props.globalConfig.backgroundColor,
        position: "relative",
        width: props.globalConfig.width,
        height: props.globalConfig.height,
        overflow: "hidden"
      }}
    >
      <AudioTrack track={props.audioTrack} />
      <CinematicCamera camera={props.camera}>
        <NodeRenderer nodes={props.nodes} />
      </CinematicCamera>
    </div>
  );
};
