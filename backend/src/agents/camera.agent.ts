import { Agent } from "./agent.interface";
import { CameraWaypoint } from "../schemas/project-state.schema";
import { ProjectRepository } from "../storage/project.repository";

export class CameraAgent implements Agent {
  constructor(private readonly repository: ProjectRepository) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    project.cameraWaypoints = this.buildWaypoints(project.fps, project.beats, project.nodes);
    await this.repository.save(project);
  }

  private buildWaypoints(
    fps: number,
    beats: Array<{ text: string }>,
    nodes: Array<{ x: number; y: number }>,
  ): CameraWaypoint[] {
    let frameCursor = 0;

    return beats.map((beat, index) => {
      const node = nodes[index] ?? { x: 0, y: index * 180 };
      const wordCount = beat.text.split(/\s+/).filter(Boolean).length;
      const beatDurationInFrames = Math.max(fps, Math.round(wordCount * (fps * 0.35)));
      const waypoint: CameraWaypoint = {
        frameStart: frameCursor,
        targetX: node.x,
        targetY: node.y,
        targetZoom: Number((1 + (index % 3) * 0.12).toFixed(2)),
      };

      frameCursor += beatDurationInFrames;
      return waypoint;
    });
  }
}
