import { Beat, Edge, Node } from "../schemas/project-state.schema";

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export class LayoutService {
  generate(beats: Beat[]): LayoutResult {
    const nodes = beats.map((beat, index) => ({
      id: beat.id,
      x: (index % 2) * 420 - 210,
      y: Math.floor(index / 2) * 240,
    }));

    const edges = beats.slice(1).map((beat, index) => ({
      id: `edge-${index + 1}`,
      source: beats[index].id,
      target: beat.id,
    }));

    return { nodes, edges };
  }
}
