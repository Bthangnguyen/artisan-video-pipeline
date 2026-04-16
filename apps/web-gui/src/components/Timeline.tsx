"use client";

import React from 'react';
import { useProjectStore } from '../store/useProjectStore';

export const Timeline = () => {
  const { state } = useProjectStore();

  if (!state) return <div style={{ padding: 20 }}>No state loaded</div>;

  const maxFrames = state.audioTrack.durationInFrames || 1000;

  return (
    <div style={{ height: '100%', padding: 20, borderTop: '1px solid #ddd', backgroundColor: '#fafafa' }}>
      <h3>Timeline</h3>
      <div style={{ position: 'relative', height: 40, backgroundColor: '#eaeaea', borderRadius: 5, overflow: 'hidden' }}>
        {state.nodes.map(node => {
          const actualStart = node.timing.startFrame + node.timing.offsetFrames;
          const leftPercent = (actualStart / maxFrames) * 100;
          const widthPercent = (node.timing.baseDuration / maxFrames) * 100;

          return (
            <div 
              key={node.id}
              style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '100%',
                backgroundColor: '#3b82f6',
                border: '1px solid #2563eb',
                color: 'white',
                fontSize: 10,
                padding: '2px 4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
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
