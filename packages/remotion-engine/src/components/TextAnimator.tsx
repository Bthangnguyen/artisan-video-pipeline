import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import type { WordTiming } from "@artisan/types";

interface TextAnimatorProps {
  text: string;
  wordTimings?: WordTiming[];
}

export const TextAnimator: React.FC<TextAnimatorProps> = ({ text, wordTimings }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If no word timings, just show the full text
  if (!wordTimings || wordTimings.length === 0) {
    return (
      <div style={{ fontSize: 60, color: "white", fontWeight: "bold", textAlign: "center", textShadow: "0 4px 8px rgba(0,0,0,0.5)" }}>
        {text}
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", 
      justifyContent: "center", 
      gap: "12px",
      fontSize: 50,
      fontWeight: "900",
      color: "white",
      textShadow: "0 6px 12px rgba(0,0,0,0.6)",
      textTransform: "uppercase",
      width: "480px",
      textAlign: "center",
      wordBreak: "break-word"
    }}>
      {wordTimings.map((word, i) => {
        const start = word.startFrame;
        
        // Pop animation
        const pop = spring({
          frame: frame - start,
          fps,
          config: {
            stiffness: 200,
            damping: 15,
          },
        });

        // Opacity and Y-offset
        const opacity = interpolate(pop, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
        const translateY = interpolate(pop, [0, 1], [30, 0]);
        const scale = interpolate(pop, [0, 1], [0.8, 1]);

        // Highlight logic
        const isActive = frame >= start && frame < start + word.duration;
        const color = isActive ? "#fbbf24" : "white"; // Yellow highlight

        return (
          <span
            key={`${word.text}-${i}`}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              color,
              transition: "color 0.1s"
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
