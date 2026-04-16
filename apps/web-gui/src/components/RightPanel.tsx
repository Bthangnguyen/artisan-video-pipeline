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
            Motion Preset:<br/>
            <select 
              value={wp.motionPreset || "smooth_glide"} 
              onChange={e => updateCameraWaypoint(i, { motionPreset: e.target.value as any })}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="smooth_glide">Smooth Glide</option>
              <option value="aggressive_snap">Aggressive Snap</option>
              <option value="gentle_float">Gentle Float</option>
            </select>
          </label>
        </div>
      ))}
    </div>
  );
};
