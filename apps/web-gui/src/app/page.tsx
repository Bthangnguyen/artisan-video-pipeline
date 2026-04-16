import React from 'react';
import { CockpitHeader } from '../components/CockpitHeader';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { Timeline } from '../components/Timeline';

export default function Page() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <CockpitHeader />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '30%', minWidth: 300 }}>
          <LeftPanel />
        </div>
        <div style={{ flex: 1, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#888' }}>Upload a draft state to preview</p>
        </div>
        <div style={{ width: '30%', minWidth: 300 }}>
          <RightPanel />
        </div>
      </div>
      <div style={{ height: '20%', minHeight: 150 }}>
        <Timeline />
      </div>
    </div>
  );
}
