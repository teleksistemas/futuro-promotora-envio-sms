"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleIncomingRequest = void 0;
const zod_1 = require("zod");
const outboundService_1 = require("../services/outboundService");
const payloadSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    nome: zod_1.z.string().min(1),
    ramal: zod_1.z.number().int(),
    user_id: zod_1.z.number().int(),
    phoneDialed: zod_1.z.string().min(1),
    phoneName: zod_1.z.string().min(1),
    template: zod_1.z.string().min(1),
    router: zod_1.z.string().min(1),
    apisms: zod_1.z.string().optional()
});
const handleIncomingRequest = async (req, res) => {
    const receivedAt = new Date().toISOString();
    console.log(`[${receivedAt}] Body recebido na API:`, req.body);
    const parsed = payloadSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Payload invalido",
            issues: parsed.error.issues
        });
    }
    const payload = parsed.data;
    const results = await (0, outboundService_1.sendDownstreamRequests)(payload);
    return res.status(200).json({
        message: "Requisicoes enviadas",
        results
    });
};
exports.handleIncomingRequest = handleIncomingRequest;
