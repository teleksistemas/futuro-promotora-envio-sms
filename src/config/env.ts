import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  MSGING_URL: z.string().url(),
  MSGING_AUTH_KEY: z.string().min(1),
  MSGING_COMMANDS_URL: z.string().url(),
  MSGING_COMMANDS_AUTH_KEY: z.string().min(1),
  REQUEST_TIMEOUT_MS: z.string().optional(),
  API_TOKEN: z.string().min(1)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Invalid environment configuration: ${issues}`);
}

const {
  PORT,
  MSGING_URL,
  MSGING_AUTH_KEY,
  MSGING_COMMANDS_URL,
  MSGING_COMMANDS_AUTH_KEY,
  REQUEST_TIMEOUT_MS,
  API_TOKEN
} = parsed.data;

export const env = {
  port: Number(PORT),
  msgingUrl: MSGING_URL,
  msgingAuthKey: MSGING_AUTH_KEY,
  msgingCommandsUrl: MSGING_COMMANDS_URL,
  msgingCommandsAuthKey: MSGING_COMMANDS_AUTH_KEY,
  requestTimeoutMs: REQUEST_TIMEOUT_MS ? Number(REQUEST_TIMEOUT_MS) : 8000,
  apiToken: API_TOKEN
};
