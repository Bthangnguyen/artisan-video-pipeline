import { Agent } from "../agents/agent.interface";
import { CameraAgent } from "../agents/camera.agent";
import { LayoutAgent } from "../agents/layout.agent";
import { PacingAgent } from "../agents/pacing.agent";
import { ScriptAgent } from "../agents/script.agent";
import { VisualAgent } from "../agents/visual.agent";
import { VoiceAgent } from "../agents/voice.agent";
import { ProjectRepository } from "../storage/project.repository";
import {
  canTransition,
  isTerminalStatus,
} from "../state/project-state-machine";
import { ProjectStatus } from "../state/project-status.enum";

interface PipelineStage {
  nextStatus: ProjectStatus;
  agent: Agent;
}

export class PipelineRunner {
  private readonly stages: PipelineStage[];

  constructor(private readonly repository = new ProjectRepository()) {
    this.stages = [
      {
        nextStatus: ProjectStatus.SCRIPT_READY,
        agent: new ScriptAgent(this.repository),
      },
      {
        nextStatus: ProjectStatus.VOICE_READY,
        agent: new VoiceAgent(this.repository),
      },
      {
        nextStatus: ProjectStatus.LAYOUT_READY,
        agent: new LayoutAgent(this.repository),
      },
      {
        nextStatus: ProjectStatus.VISUAL_READY,
        agent: new VisualAgent(this.repository),
      },
      {
        nextStatus: ProjectStatus.CAMERA_READY,
        agent: new CameraAgent(this.repository),
      },
      {
        nextStatus: ProjectStatus.PACING_READY,
        agent: new PacingAgent(this.repository),
      },
    ];
  }

  async run(projectId: string): Promise<void> {
    let project = await this.repository.requireById(projectId);

    if (isTerminalStatus(project.status)) {
      return;
    }

    const startIndex = this.getStartIndex(project.status);

    for (const stage of this.stages.slice(startIndex)) {
      await stage.agent.run(projectId);

      project = await this.repository.requireById(projectId);
      this.assertNextTransition(project.status, stage.nextStatus);

      project.status = stage.nextStatus;
      await this.repository.save(project);
    }

    project = await this.repository.requireById(projectId);

    if (project.status === ProjectStatus.PACING_READY) {
      this.assertNextTransition(project.status, ProjectStatus.READY_FOR_REVIEW);
      project.status = ProjectStatus.READY_FOR_REVIEW;
      await this.repository.save(project);
    }
  }

  private getStartIndex(status: ProjectStatus): number {
    switch (status) {
      case ProjectStatus.DRAFT:
        return 0;
      case ProjectStatus.SCRIPT_READY:
        return 1;
      case ProjectStatus.VOICE_READY:
        return 2;
      case ProjectStatus.LAYOUT_READY:
        return 3;
      case ProjectStatus.VISUAL_READY:
        return 4;
      case ProjectStatus.CAMERA_READY:
        return 5;
      case ProjectStatus.PACING_READY:
      case ProjectStatus.READY_FOR_REVIEW:
      case ProjectStatus.RENDERED:
        return this.stages.length;
      default:
        throw new Error(`Unsupported project status: ${status}`);
    }
  }

  private assertNextTransition(currentStatus: ProjectStatus, nextStatus: ProjectStatus): void {
    if (!canTransition(currentStatus, nextStatus)) {
      throw new Error(
        `Invalid project transition from ${currentStatus} to ${nextStatus}.`,
      );
    }
  }
}
