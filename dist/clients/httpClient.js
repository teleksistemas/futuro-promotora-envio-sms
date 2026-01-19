"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
exports.httpClient = axios_1.default.create({
    timeout: env_1.env.requestTimeoutMs,
    headers: {
        "Content-Type": "application/json"
    }
});
