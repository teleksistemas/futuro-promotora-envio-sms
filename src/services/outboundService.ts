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

const getAuthKeyForRouter = (router: string) => {
  const normalizedRouter = router.trim();
  const authKey = env.routerAuthKeys[normalizedRouter];
  if (!authKey) {
    throw new Error(
      `Auth key nao configurada para o router informado: ${router}`
    );
  }
  return authKey;
};

const toInputJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
};

export const sendDownstreamRequests = async (
  payload: IncomingPayload
): Promise<DownstreamResult> => {
  const logEntry = await prisma.log.create({
    data: {
      payload,
      phoneDialed: payload.phoneDialed
    }
  });

  const smsTarget = formatPhoneTarget(payload.phoneDialed);
  const routerAuthKey = getAuthKeyForRouter(payload.router);

  const msgingPayload = {
    id: randomUUID(),
    to: smsTarget,
    type: "text/plain",
    content: payload.template
  };

  const requestOnePromise = httpClient
    .post(env.msgingUrl, msgingPayload, {
      headers: {
        Authorization: env.authKeySms
      }
    })
    .then(async (response) => {
      await prisma.log.update({
        where: { id: logEntry.id },
        data: {
          smsStatus: response.status,
          smsError: Prisma.DbNull
        }
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
    identity: "55"+payload.phoneDialed+"@wa.gw.msging.net",
      extras: {
        emailAgente: payload.email,
        nomeAgente: payload.nome,
        ramalAgente: String(payload.ramal),
        idAgente: String(payload.user_id),
        phoneUse: payload.phoneDialed,
        nameUser: payload.phoneName,
        apisms: payload.apisms ?? "true"
      },
      source: "SMS"
    }
  };

  const requestTwoPromise = httpClient.post(
    env.msgingCommandsUrl,
    msgingCommandsPayload,
    {
      headers: {
        Authorization: routerAuthKey
      }
    }
  );

  const [requestOneResponse, requestTwoResponse] = await Promise.all([
    requestOnePromise,
    requestTwoPromise
  ]);

  const results: DownstreamResult = {
    requestOne: {
      status: requestOneResponse.status,
      data: requestOneResponse.data
    },
    requestTwo: {
      status: requestTwoResponse.status,
      data: requestTwoResponse.data
    }
  };

  await prisma.log.update({
    where: { id: logEntry.id },
    data: {
      apiResponsePayload: toInputJsonValue(results)
    }
  });

  return results;
};
