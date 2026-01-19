import { Router } from "express";
import { handleIncomingRequest } from "../controllers/requestController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/notify", asyncHandler(handleIncomingRequest));

export { router as notifyRoutes };