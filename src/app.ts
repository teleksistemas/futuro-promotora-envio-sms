import express from "express";
import { routes } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(routes);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({
      message: "Erro interno",
      error: err.message
    });
  });

  return app;
};