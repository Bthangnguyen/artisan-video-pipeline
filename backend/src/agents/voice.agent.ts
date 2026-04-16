import { Agent } from "./agent.interface";
import { TtsService } from "../services/tts.service";
import { ProjectRepository } from "../storage/project.repository";

export class VoiceAgent implements Agent {
  constructor(
    private readonly repository: ProjectRepository,
    private readonly ttsService = new TtsService(),
  ) {}

  async run(projectId: string): Promise<void> {
    const project = await this.repository.requireById(projectId);
    const synthesis = this.ttsService.synthesize(projectId, project.script);

    project.audioPath = synthesis.audioPath;
    project.words = synthesis.words;

    await this.repository.save(project);
  }
}
