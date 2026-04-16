import express from "express";
import { ProjectController, handleProjectControllerError } from "./api/project.controller";
import { config } from "./config/env";
import { pipelineQueue } from "./queue/job.queue";
import { startPipelineWorker } from "./queue/worker";

async function main(): Promise<void> {
  const app = express();
  const projectController = new ProjectController();
  const worker = startPipelineWorker();

  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_request, response) => {
    response.status(200).json({
      ok: true,
      rendersTriggeredAutomatically: false,
    });
  });
  app.use(projectController.router);
  app.use(handleProjectControllerError);

  const server = app.listen(config.port, () => {
    console.log(`AI backend is running on port ${config.port}.`);
    console.log("This service only generates project_state.json and never renders video.");
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down backend services.`);
    await Promise.allSettled([worker.close(), pipelineQueue.close()]);
    server.close();
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void main().catch((error) => {
  console.error("Failed to start AI backend.", error);
  process.exit(1);
});
