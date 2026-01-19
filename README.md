# futuro-promotora-envio-sms

Servico em TypeScript com rota POST para receber dados e repassar para duas requisicoes externas.

## Estrutura

- `src/server.ts`: bootstrap do servidor
- `src/app.ts`: configuracao do Express
- `src/routes/notifyRoutes.ts`: rota `POST /api/notify`
- `src/controllers/requestController.ts`: validacao e controle
- `src/services/outboundService.ts`: chamadas externas
- `src/config/env.ts`: variaveis de ambiente

## Como rodar

1. Copie `.env.example` para `.env` e ajuste as URLs.
2. Instale dependencias: `npm install`
3. Gere o client e rode a migration: `npx prisma migrate dev --name init`
4. Inicie: `npm run dev`

## Docker

1. Build da imagem: `docker build -t futuro-promotora-envio-sms .`
2. Suba o container: `docker run --env-file .env -p 3000:3000 futuro-promotora-envio-sms`
