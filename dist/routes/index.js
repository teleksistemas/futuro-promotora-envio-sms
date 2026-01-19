"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const notifyRoutes_1 = require("./notifyRoutes");
const router = (0, express_1.Router)();
exports.routes = router;
router.use("/api", notifyRoutes_1.notifyRoutes);
