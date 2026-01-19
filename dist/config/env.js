"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("3000"),
    MSGING_URL: zod_1.z.string().url(),
    MSGING_AUTH_KEY: zod_1.z.string().min(1),
    MSGING_COMMANDS_URL: zod_1.z.string().url(),
    MSGING_COMMANDS_AUTH_KEY: zod_1.z.string().min(1),
    REQUEST_TIMEOUT_MS: zod_1.z.string().optional()
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
}
const { PORT, MSGING_URL, MSGING_AUTH_KEY, MSGING_COMMANDS_URL, MSGING_COMMANDS_AUTH_KEY, REQUEST_TIMEOUT_MS } = parsed.data;
exports.env = {
    port: Number(PORT),
    msgingUrl: MSGING_URL,
    msgingAuthKey: MSGING_AUTH_KEY,
    msgingCommandsUrl: MSGING_COMMANDS_URL,
    msgingCommandsAuthKey: MSGING_COMMANDS_AUTH_KEY,
    requestTimeoutMs: REQUEST_TIMEOUT_MS ? Number(REQUEST_TIMEOUT_MS) : 8000
};
