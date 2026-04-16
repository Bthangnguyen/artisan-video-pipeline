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
    const synthesis = await this.ttsService.synthesize(projectId, project.beats, project.fps);

    project.audioPath = synthesis.audioPath;
    project.spokenScript = synthesis.spokenScript;
    project.beats = synthesis.beats;
    project.beatTimings = synthesis.beatTimings;
    project.words = synthesis.words;
    project.ttsChunks = synthesis.ttsChunks;

    await this.repository.save(project);
  }
}
