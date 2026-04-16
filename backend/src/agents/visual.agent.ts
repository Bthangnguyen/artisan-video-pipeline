import { Agent } from "./agent.interface";
import { AssetService } from "../services/asset.service";
import { ProjectRepository } from "../storage/project.repository";

export class VisualAgent implements Agent {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly assetService = new AssetService(),
  ) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    project.visuals = this.assetService.assignVisuals(project.beats);
    await this.repository.save(project);
  }
}
