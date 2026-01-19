import { Router } from "express";
import { notifyRoutes } from "./notifyRoutes";

const router = Router();

router.use("/api", notifyRoutes);

export { router as routes };