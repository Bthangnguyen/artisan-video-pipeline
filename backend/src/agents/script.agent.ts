import { Agent } from "./agent.interface";
import { LlmService } from "../services/llm.service";
import { ProjectRepository } from "../storage/project.repository";

export class ScriptAgent implements Agent {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly llmService = new LlmService(),
  ) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    project.beats = this.llmService.segmentScript(project.script);
    await this.repository.save(project);
  }
}
