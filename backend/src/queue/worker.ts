import { Worker } from "bullmq";
import { PipelineRunner } from "../pipeline/pipeline.runner";
import { config } from "../config/env";
import { PipelineJobData } from "./job.queue";

function buildRedisConnectionOptions() {
  const redisUrl = new URL(config.redisUrl);

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || "6379"),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: redisUrl.pathname && redisUrl.pathname !== "/" ? Number(redisUrl.pathname.slice(1)) : 0,
    maxRetriesPerRequest: null as null,
  };
}

export function startPipelineWorker(
  runner = new PipelineRunner(),
): Worker<PipelineJobData> {
  const worker = new Worker<PipelineJobData>(
    config.queueName,
    async (job) => {
      await runner.run(job.data.projectId);
    },
    {
      connection: buildRedisConnectionOptions(),
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Pipeline completed for project ${job.data.projectId}.`);
  });

  worker.on("failed", (job, error) => {
    console.error(
      `Pipeline failed for project ${job?.data.projectId ?? "unknown"}.`,
      error,
    );
  });

  return worker;
}

if (require.main === module) {
  startPipelineWorker();
  console.log(`Pipeline worker is listening on queue "${config.queueName}".`);
}
