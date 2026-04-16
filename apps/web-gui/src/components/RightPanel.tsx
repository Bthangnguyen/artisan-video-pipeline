"use client";

import React from 'react';
import { useProjectStore } from '../store/useProjectStore';

export const RightPanel = () => {
  const { state, updateCameraWaypoint } = useProjectStore();

  if (!state) return <div style={{ padding: 20 }}>No state loaded</div>;

  return (
    <div style={{ padding: 20, borderLeft: '1px solid #ddd', height: '100%', overflowY: 'auto' }}>
      <h3>Camera Path</h3>
      {state.camera.waypoints.map((wp, i) => (
        <div key={i} style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc', borderRadius: 5 }}>
          <h4>Waypoint {i + 1} (Start: {wp.frameStart})</h4>
          
          <label style={{ display: 'block', marginBottom: 5 }}>
            Damping:<br/>
            <input 
              type="range" 
              min="1" max="50" 
              value={wp.springConfig.damping} 
              onChange={e => updateCameraWaypoint(i, { springConfig: { ...wp.springConfig, damping: parseInt(e.target.value) } })}
              style={{ width: '100%' }}
            />
            {wp.springConfig.damping}
          </label>

          <label style={{ display: 'block' }}>
            Stiffness:<br/>
            <input 
              type="range" 
              min="10" max="200" 
              value={wp.springConfig.stiffness} 
              onChange={e => updateCameraWaypoint(i, { springConfig: { ...wp.springConfig, stiffness: parseInt(e.target.value) } })}
              style={{ width: '100%' }}
            />
            {wp.springConfig.stiffness}
          </label>
        </div>
      ))}
    </div>
  );
};
