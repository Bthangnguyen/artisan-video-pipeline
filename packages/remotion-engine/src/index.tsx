import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { RemotionVideo } from "./Video";
import dummyState from "../dummy/final_state.json";
import type { ProjectState } from "@artisan/types";

const Root: React.FC = () => {
  const state = dummyState as unknown as ProjectState;

  return (
    <>
      <Composition
        id="MyVideo"
        component={RemotionVideo}
        durationInFrames={state.audioTrack.durationInFrames}
        fps={state.globalConfig.fps}
        width={state.globalConfig.width}
        height={state.globalConfig.height}
        defaultProps={state}
      />
    </>
  );
};

registerRoot(Root);
