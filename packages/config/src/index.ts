import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(
  env: NodeJS.ProcessEnv = process.env,
): ServerEnv {
  return serverEnvSchema.parse(env);
}

export const serverEnv = parseServerEnv();
