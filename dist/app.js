"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const env_1 = require("./config/env");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: "1mb" }));
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });
    app.use("/api", (req, res, next) => {
        const token = req.header("token");
        if (!token || token !== env_1.env.apiToken) {
            return res.status(401).json({ message: "Token invalido" });
        }
        return next();
    });
    app.use(routes_1.routes);
    app.use((err, _req, res, _next) => {
        res.status(500).json({
            message: "Erro interno",
            error: err.message
        });
    });
    return app;
};
exports.createApp = createApp;
