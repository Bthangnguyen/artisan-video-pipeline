import { mkdir, readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { config } from "../config/env";
import {
  PROJECT_STATE_FILE_NAME,
  ProjectState,
  ProjectStateSchema,
} from "../schemas/project-state.schema";
import { ProjectStatus } from "../state/project-status.enum";

export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project ${projectId} was not found.`);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectRepository {
  constructor(private readonly storagePath = config.storagePath) {}

  async create(script: string): Promise<ProjectState> {
    const now = new Date();
    const project: ProjectState = {
      projectId: randomUUID(),
      status: ProjectStatus.DRAFT,
      fps: 30,
      resolution: "1080x1920",
      script: script.trim(),
      beats: [],
      words: [],
      nodes: [],
      edges: [],
      visuals: [],
      cameraWaypoints: [],
      pacing: {
        offsetFrames: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    return this.save(project);
  }

  async findById(id: string): Promise<ProjectState | null> {
    try {
      const raw = await readFile(this.getProjectStatePath(id), "utf8");
      const parsed = JSON.parse(raw);
      return ProjectStateSchema.parse(parsed);
    } catch (error) {
      if (this.isMissingFileError(error)) {
        return null;
      }

      throw error;
    }
  }

  async save(project: ProjectState): Promise<ProjectState> {
    const normalizedProject = ProjectStateSchema.parse({
      ...project,
      updatedAt: new Date(),
    });

    await mkdir(this.getProjectDirectory(normalizedProject.projectId), { recursive: true });
    await writeFile(
      this.getProjectStatePath(normalizedProject.projectId),
      JSON.stringify(normalizedProject, null, 2),
      "utf8",
    );

    return normalizedProject;
  }

  async requireById(id: string): Promise<ProjectState> {
    const project = await this.findById(id);

    if (!project) {
      throw new ProjectNotFoundError(id);
    }

    return project;
  }

  getProjectDirectory(projectId: string): string {
    return path.join(this.storagePath, projectId);
  }

  getProjectStatePath(projectId: string): string {
    return path.join(this.getProjectDirectory(projectId), PROJECT_STATE_FILE_NAME);
  }

  private isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
    return Boolean(
      error &&
        typeof error === "object" &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT",
    );
  }
}
