import { Agent } from "./agent.interface";
import { LayoutService } from "../services/layout.service";
import { ProjectRepository } from "../storage/project.repository";

export class LayoutAgent implements Agent {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly layoutService = new LayoutService(),
  ) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    const layout = this.layoutService.generate(project.beats);

    project.nodes = layout.nodes;
    project.edges = layout.edges;

    await this.repository.save(project);
  }
}
