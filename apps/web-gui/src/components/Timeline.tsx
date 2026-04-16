"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export const Timeline = () => {
  const { state } = useProjectStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  if (!state) return <div style={{ padding: 20 }}>No state loaded</div>;

  const { fps } = state.globalConfig;
  const maxFrames = state.audioTrack.durationInFrames || 1000;
  const maxDuration = maxFrames / fps;

  const handleNodeClick = (startFrame: number, offsetFrames: number) => {
    if (audioRef.current) {
      const seekTime = (startFrame + offsetFrames) / fps;
      audioRef.current.currentTime = seekTime;
      audioRef.current.play();
    }
  };

  const playheadPercent = (currentTime / maxDuration) * 100;

  return (
    <div style={{ height: '100%', padding: 20, borderTop: '1px solid #ddd', backgroundColor: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3>Timeline</h3>
        <audio 
          ref={audioRef} 
          src={state.audioTrack.url} 
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          controls
          style={{ height: 30 }}
        />
      </div>
      
      <div style={{ position: 'relative', height: 60, backgroundColor: '#eaeaea', borderRadius: 5, overflow: 'hidden', cursor: 'pointer' }}
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const percent = x / rect.width;
             if (audioRef.current) {
               audioRef.current.currentTime = percent * maxDuration;
             }
           }}
      >
        {/* Playhead */}
        <div 
          style={{
            position: 'absolute',
            left: `${playheadPercent}%`,
            top: 0,
            width: 2,
            height: '100%',
            backgroundColor: '#e11d48',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        />

        {state.nodes.map(node => {
          const actualStart = node.timing.startFrame + node.timing.offsetFrames;
          const leftPercent = (actualStart / maxFrames) * 100;
          const widthPercent = (node.timing.baseDuration / maxFrames) * 100;

          return (
            <div 
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node.timing.startFrame, node.timing.offsetFrames);
              }}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                border: '1px solid #2563eb',
                color: 'white',
                fontSize: 10,
                padding: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                zIndex: 5,
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleY(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
              title={`Asset: ${node.assetId} | Start: ${actualStart}`}
            >
              {node.id}
            </div>
          );
        })}
      </div>
    </div>
  );
};

