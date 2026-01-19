import { z } from "zod";
import { Request, Response } from "express";
import { sendDownstreamRequests } from "../services/outboundService";
import { IncomingPayload } from "../types/request";

const payloadSchema = z.object({
  email: z.string().email(),
  nome: z.string().min(1),
  ramal: z.number().int(),
  user_id: z.number().int(),
  phoneDialed: z.string().min(1),
  phoneName: z.string().min(1)
});

export const handleIncomingRequest = async (req: Request, res: Response) => {
  const parsed = payloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Payload invalido",
      issues: parsed.error.issues
    });
  }

  const payload: IncomingPayload = parsed.data;
  const results = await sendDownstreamRequests(payload);

  return res.status(200).json({
    message: "Requisicoes enviadas",
    results
  });
};