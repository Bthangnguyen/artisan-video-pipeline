import { Agent } from "./agent.interface";
import { CameraService } from "../services/camera.service";
import { LlmService } from "../services/llm.service";
import { ProjectRepository } from "../storage/project.repository";

export class CameraAgent implements Agent {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly llmService = new LlmService(),
    private readonly cameraService = new CameraService(),
  ) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    const cameraPlan = this.llmService.planCamera(project.beats, project.beatTimings);

    project.cameraPlan = cameraPlan;
    project.cameraWaypoints = this.cameraService.buildWaypoints(project, cameraPlan);

    await this.repository.save(project);
  }
}
