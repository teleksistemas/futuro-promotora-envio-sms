"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDownstreamRequests = void 0;
const env_1 = require("../config/env");
const httpClient_1 = require("../clients/httpClient");
const crypto_1 = require("crypto");
const prisma_1 = require("../clients/prisma");
const client_1 = require("@prisma/client");
const formatPhoneTarget = (phoneDialed) => {
    const trimmed = phoneDialed.trim();
    const normalized = trimmed.startsWith("+55") ? trimmed : `+55${trimmed}`;
    return `${normalized}@sms.gw.msging.net`;
};
const normalizeRouterForKeyLookup = (router) => {
    const trimmed = router.trim();
    if (trimmed.length >= 3 && trimmed[2] === "9") {
        return `${trimmed.slice(0, 2)}${trimmed.slice(3)}`;
    }
    return trimmed;
};
const getAuthKeyForRouter = (router) => {
    const normalizedRouter = normalizeRouterForKeyLookup(router);
    const authKey = env_1.env.routerAuthKeys[normalizedRouter];
    if (!authKey) {
        throw new Error(`Auth key nao configurada para o router informado: ${router}`);
    }
    return authKey;
};
const sendDownstreamRequests = async (payload) => {
    const logEntry = await prisma_1.prisma.log.create({
        data: {
            payload
        }
    });
    const smsTarget = formatPhoneTarget(payload.phoneDialed);
    const routerAuthKey = getAuthKeyForRouter(payload.router);
    const msgingPayload = {
        id: (0, crypto_1.randomUUID)(),
        to: smsTarget,
        type: "text/plain",
        content: payload.template
    };
    const requestOnePromise = httpClient_1.httpClient
        .post(env_1.env.msgingUrl, msgingPayload, {
        headers: {
            Authorization: env_1.env.authKeySms
        }
    })
        .then(async (response) => {
        await prisma_1.prisma.log.update({
            where: { id: logEntry.id },
            data: { smsStatus: response.status, smsError: client_1.Prisma.DbNull }
        });
        return response;
    })
        .catch(async (error) => {
        const status = error?.response?.status ?? 0;
        const errorBody = error?.response?.data ?? null;
        await prisma_1.prisma.log.update({
            where: { id: logEntry.id },
            data: {
                smsStatus: status,
                smsError: errorBody ?? client_1.Prisma.DbNull
            }
        });
        throw error;
    });
    const msgingCommandsPayload = {
        id: (0, crypto_1.randomUUID)(),
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
    const requestTwoPromise = httpClient_1.httpClient.post(env_1.env.msgingCommandsUrl, msgingCommandsPayload, {
        headers: {
            Authorization: routerAuthKey
        }
    });
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
exports.sendDownstreamRequests = sendDownstreamRequests;
