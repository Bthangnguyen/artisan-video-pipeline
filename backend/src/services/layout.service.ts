import { Beat, Edge, Node } from "../schemas/project-state.schema";

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export class LayoutService {
  generate(beats: Beat[]): LayoutResult {
    const nodes = beats.map((beat, index) => {
      const estimatedWidth = Math.min(520, Math.max(280, 240 + beat.text.length * 4));
      const estimatedHeight = Math.min(
        260,
        Math.max(150, 140 + Math.ceil(beat.text.length / 42) * 28),
      );

      const x = index * 700;
      const y = index * 300;

      return {
        id: `node-${beat.id}`,
        beatId: beat.id,
        x,
        y,
        width: estimatedWidth,
        height: estimatedHeight,
      };
    });

    const edges = nodes.slice(1).map((node, index) => ({
      id: `edge-${index + 1}`,
      source: nodes[index].id,
      target: node.id,
    }));

    return { nodes, edges };
  }
}
