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
    AUTH_KEY_SMS: zod_1.z.string().min(1),
    AUTH_KEY_5181091766: zod_1.z.string().min(1),
    AUTH_KEY_5181091767: zod_1.z.string().min(1),
    AUTH_KEY_5181091768: zod_1.z.string().min(1),
    MSGING_COMMANDS_URL: zod_1.z.string().url(),
    REQUEST_TIMEOUT_MS: zod_1.z.string().optional(),
    API_TOKEN: zod_1.z.string().min(1)
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
}
const { PORT, MSGING_URL, AUTH_KEY_SMS, AUTH_KEY_5181091766, AUTH_KEY_5181091767, AUTH_KEY_5181091768, MSGING_COMMANDS_URL, REQUEST_TIMEOUT_MS, API_TOKEN } = parsed.data;
exports.env = {
    port: Number(PORT),
    msgingUrl: MSGING_URL,
    msgingCommandsUrl: MSGING_COMMANDS_URL,
    requestTimeoutMs: REQUEST_TIMEOUT_MS ? Number(REQUEST_TIMEOUT_MS) : 8000,
    apiToken: API_TOKEN,
    authKeySms: AUTH_KEY_SMS,
    routerAuthKeys: {
        "5181091766": AUTH_KEY_5181091766,
        "5181091767": AUTH_KEY_5181091767,
        "5181091768": AUTH_KEY_5181091768
    }
};
