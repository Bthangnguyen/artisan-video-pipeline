import { Agent } from "./agent.interface";
import { ProjectRepository } from "../storage/project.repository";

export class PacingAgent implements Agent {
  constructor(private readonly repository: ProjectRepository) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    project.pacing = {
      offsetFrames: 0,
    };

    await this.repository.save(project);
  }
}
