"use client";

import React, { useRef, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { ProjectStateSchema } from '@artisan/types';

export const CockpitHeader = () => {
  const { state, setState } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRendering, setIsRendering] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const parsedState = ProjectStateSchema.parse(json);
        setState(parsedState);
      } catch (err) {
        alert("Failed to parse ProjectState. Invalid JSON or mismatching Schema.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleExportState = () => {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'final_state.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRender = async () => {
    if (!state) return;
    setIsRendering(true);
    try {
      const res = await fetch('http://localhost:3001/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });

      if (res.status === 429) {
          alert('System is currently rendering. Please wait!');
      } else if (res.ok) {
          const data = await res.json();
          alert(`Render started! output: ${data.url}`);
      } else {
          alert('Failed to render. Check server logs.');
      }
    } catch (err) {
      alert('Error connecting to Render API.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#111', color: '#fff', borderBottom: '1px solid #333' }}>
      <h2>The Artisan Cockpit</h2>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
        />
        <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Import Draft State
        </button>
        <button disabled={!state} onClick={handleExportState} style={{ padding: '8px 16px', cursor: state ? 'pointer' : 'not-allowed' }}>
          Download Final JSON
        </button>
        <button disabled={!state || isRendering} onClick={handleRender} style={{ padding: '8px 16px', cursor: state && !isRendering ? 'pointer' : 'not-allowed', backgroundColor: '#e11d48', color: '#fff', border: 'none' }}>
          {isRendering ? 'Rendering...' : 'Trigger Remotion Render'}
        </button>
      </div>
    </div>
  );
};
