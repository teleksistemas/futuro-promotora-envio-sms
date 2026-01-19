"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyRoutes = void 0;
const express_1 = require("express");
const requestController_1 = require("../controllers/requestController");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
exports.notifyRoutes = router;
router.post("/notify", (0, asyncHandler_1.asyncHandler)(requestController_1.handleIncomingRequest));
