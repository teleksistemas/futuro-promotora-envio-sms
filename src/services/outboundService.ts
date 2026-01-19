import { env } from "../config/env";
import { httpClient } from "../clients/httpClient";
import { IncomingPayload } from "../types/request";
import { randomUUID } from "crypto";
import { prisma } from "../clients/prisma";
import { Prisma } from "@prisma/client";

export type DownstreamResult = {
  requestOne: {
    status: number;
    data: unknown;
  };
  requestTwo: {
    status: number;
    data: unknown;
  };
};

const formatPhoneTarget = (phoneDialed: string) => {
  const trimmed = phoneDialed.trim();
  const normalized = trimmed.startsWith("+55") ? trimmed : `+55${trimmed}`;
  return `${normalized}@sms.gw.msging.net`;
};

export const sendDownstreamRequests = async (
  payload: IncomingPayload
): Promise<DownstreamResult> => {
  const logEntry = await prisma.log.create({
    data: {
      payload
    }
  });

  const smsTarget = formatPhoneTarget(payload.phoneDialed);

  const msgingPayload = {
    id: randomUUID(),
    to: smsTarget,
    type: "text/plain",
    content: "Mensagem enviada"
  };

  const requestOnePromise = httpClient
    .post(env.msgingUrl, msgingPayload, {
      headers: {
        Authorization: env.msgingAuthKey
      }
    })
    .then(async (response) => {
      await prisma.log.update({
        where: { id: logEntry.id },
        data: { smsStatus: response.status, smsError: Prisma.DbNull }
      });
      return response;
    })
    .catch(async (error) => {
      const status = error?.response?.status ?? 0;
      const errorBody = error?.response?.data ?? null;
      await prisma.log.update({
        where: { id: logEntry.id },
        data: {
          smsStatus: status,
          smsError: errorBody ?? Prisma.DbNull
        }
      });
      throw error;
    });

  const msgingCommandsPayload = {
    id: randomUUID(),
    to: "postmaster@crm.msging.net",
    method: "merge",
    uri: "/contacts",
    type: "application/vnd.lime.contact+json",
    resource: {
      identity: smsTarget,
      extras: {
        emailAgente: payload.email,
        nomeAgente: payload.nome,
        ramalAgente: String(payload.ramal),
        idAgente: String(payload.user_id),
        phoneUse: payload.phoneDialed,
        nameUser: payload.phoneName
      },
      source: "SMS"
    }
  };

  const requestTwoPromise = httpClient.post(
    env.msgingCommandsUrl,
    msgingCommandsPayload,
    {
      headers: {
        Authorization: env.msgingCommandsAuthKey
      }
    }
  );

  const [requestOneResponse, requestTwoResponse] = await Promise.all([
    requestOnePromise,
    requestTwoPromise
  ]);

  return {
    requestOne: {
      status: requestOneResponse.status,
      data: requestOneResponse.data
    },
    requestTwo: {
      status: requestTwoResponse.status,
      data: requestTwoResponse.data
    }
  };
};
