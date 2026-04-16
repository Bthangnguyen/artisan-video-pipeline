import { Queue } from "bullmq";
import { config } from "../config/env";

export interface PipelineJobData {
  projectId: string;
}

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

export const pipelineQueue = new Queue<PipelineJobData>(config.queueName, {
  connection: buildRedisConnectionOptions(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export async function enqueuePipeline(projectId: string) {
  return pipelineQueue.add(
    "run-project-pipeline",
    { projectId },
    {
      jobId: `${projectId}-${Date.now()}`,
    },
  );
}
