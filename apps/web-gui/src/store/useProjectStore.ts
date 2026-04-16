import { create } from 'zustand';
import type { ProjectState, CameraWaypoint, SceneNode } from '@artisan/types';

interface ProjectStore {
  state: ProjectState | null;
  setState: (state: ProjectState) => void;
  updateGlobalConfig: (config: Partial<ProjectState['globalConfig']>) => void;
  updateNode: (nodeId: string, updates: Partial<SceneNode>) => void;
  updateCameraWaypoint: (index: number, updates: Partial<CameraWaypoint>) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  state: null,
  setState: (state) => set({ state }),
  updateGlobalConfig: (config) =>
    set((store) => ({
      state: store.state
        ? { ...store.state, globalConfig: { ...store.state.globalConfig, ...config } }
        : null,
    })),
  updateNode: (nodeId, updates) =>
    set((store) => {
      if (!store.state) return store;
      return {
        state: {
          ...store.state,
          nodes: store.state.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...updates } : n
          ),
        },
      };
    }),
  updateCameraWaypoint: (index, updates) =>
    set((store) => {
      if (!store.state) return store;
      const newWaypoints = [...store.state.camera.waypoints];
      newWaypoints[index] = { ...newWaypoints[index], ...updates };
      return {
        state: {
          ...store.state,
          camera: {
            waypoints: newWaypoints,
          },
        },
      };
    }),
}));
