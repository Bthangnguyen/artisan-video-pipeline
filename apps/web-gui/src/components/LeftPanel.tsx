"use client";

import React from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { SvgAssetId } from '@artisan/assets';

export const LeftPanel = () => {
  const { state, updateNode } = useProjectStore();

  if (!state) return <div style={{ padding: 20 }}>No state loaded</div>;

  return (
    <div style={{ padding: 20, borderRight: '1px solid #ddd', height: '100%', overflowY: 'auto' }}>
      <h3>Scene Nodes</h3>
      {state.nodes.map(node => (
        <div key={node.id} style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc', borderRadius: 5 }}>
          <h4>{node.id}</h4>
          
          <label style={{ display: 'block', marginBottom: 5 }}>
            Asset:
            <select 
              value={node.assetId} 
              onChange={e => updateNode(node.id, { assetId: e.target.value as SvgAssetId })}
              style={{ marginLeft: 10, padding: 5 }}
            >
              {Object.values(SvgAssetId).map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'block' }}>
            Offset Frames (Human Tweak):
            <input 
              type="number" 
              value={node.timing.offsetFrames} 
              onChange={e => updateNode(node.id, { timing: { ...node.timing, offsetFrames: parseInt(e.target.value) || 0 } })}
              style={{ marginLeft: 10, padding: 5, width: 60 }}
            />
          </label>
        </div>
      ))}
    </div>
  );
};
