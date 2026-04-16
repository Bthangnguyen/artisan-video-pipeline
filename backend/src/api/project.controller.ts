import { NextFunction, Request, Response, Router } from "express";
import { ZodError, z } from "zod";
import { enqueuePipeline } from "../queue/job.queue";
import { ProjectRepository, ProjectNotFoundError } from "../storage/project.repository";

const CreateProjectBodySchema = z.object({
  script: z.string().trim().min(1),
});

export class ProjectController {
  public readonly router: Router;

  constructor(private readonly repository = new ProjectRepository()) {
    this.router = Router();
    this.router.post("/project", this.createProject);
    this.router.get("/project/:id", this.getProject);
    this.router.post("/project/:id/run", this.runProject);
  }

  private createProject = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { script } = CreateProjectBodySchema.parse(request.body);
      const project = await this.repository.create(script);
      response.status(201).json({ projectId: project.projectId });
    } catch (error) {
      next(error);
    }
  };

  private getProject = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const project = await this.repository.requireById(request.params.id);
      response.status(200).json(project);
    } catch (error) {
      next(error);
    }
  };

  private runProject = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const project = await this.repository.requireById(request.params.id);
      const job = await enqueuePipeline(project.projectId);

      response.status(202).json({
        queued: true,
        projectId: project.projectId,
        jobId: job.id,
      });
    } catch (error) {
      next(error);
    }
  };
}

export function handleProjectControllerError(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Invalid request payload.",
      details: error.issues,
    });
    return;
  }

  if (error instanceof ProjectNotFoundError) {
    response.status(404).json({
      error: error.message,
    });
    return;
  }

  response.status(500).json({
    error: error instanceof Error ? error.message : "Unexpected server error.",
  });
}
