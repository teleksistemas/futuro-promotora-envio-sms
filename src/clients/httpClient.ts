import axios from "axios";
import { env } from "../config/env";

export const httpClient = axios.create({
  timeout: env.requestTimeoutMs,
  headers: {
    "Content-Type": "application/json"
  }
});