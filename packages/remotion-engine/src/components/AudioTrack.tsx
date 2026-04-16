import React from "react";
import { Audio } from "remotion";
import type { AudioTrack as AudioTrackType } from "@artisan/types";

export const AudioTrack: React.FC<{ track: AudioTrackType }> = ({ track }) => {
  return <Audio src={track.url} />;
};
