import path from "path";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  STORAGE_PATH: z.string().min(1).default("./data"),
});

const env = EnvSchema.parse(process.env);
const packageRoot = path.resolve(__dirname, "..", "..");

export const config = {
  port: env.PORT,
  redisUrl: env.REDIS_URL,
  storagePath: path.resolve(packageRoot, env.STORAGE_PATH),
  queueName: "pipeline",
} as const;
