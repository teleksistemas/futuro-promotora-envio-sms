import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  MSGING_URL: z.string().url(),
  AUTH_KEY_SMS: z.string().min(1),
  AUTH_KEY_51981091766: z.string().min(1),
  AUTH_KEY_51981095827: z.string().min(1),
  AUTH_KEY_51981028528: z.string().min(1),
  MSGING_COMMANDS_URL: z.string().url(),
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
  AUTH_KEY_SMS,
  AUTH_KEY_51981091766,
  AUTH_KEY_51981095827,
  AUTH_KEY_51981028528,
  MSGING_COMMANDS_URL,
  REQUEST_TIMEOUT_MS,
  API_TOKEN
} = parsed.data;

export const env = {
  port: Number(PORT),
  msgingUrl: MSGING_URL,
  msgingCommandsUrl: MSGING_COMMANDS_URL,
  requestTimeoutMs: REQUEST_TIMEOUT_MS ? Number(REQUEST_TIMEOUT_MS) : 8000,
  apiToken: API_TOKEN,
  authKeySms: AUTH_KEY_SMS,
  routerAuthKeys: {
    "51981091766": AUTH_KEY_51981091766,
    "51981095827": AUTH_KEY_51981095827,
    "51981028528": AUTH_KEY_51981028528
  } as Record<string, string>
};
