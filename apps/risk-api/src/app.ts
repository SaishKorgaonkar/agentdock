import Fastify from "fastify";

import { configureHederaX402, type HederaX402Config } from "./x402.js";

type BuildAppOptions = {
  x402?: HederaX402Config;
};

export function buildApp({ x402 }: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    service: "agentdock-risk-api",
    status: "ok",
  }));

  if (x402) {
    configureHederaX402(app, x402);
  }

  app.post("/v1/risk-reports", async (_request, reply) => {
    if (!x402) {
      return reply
        .code(503)
        .send({ error: "Hedera x402 payment is not configured" });
    }

    return reply.code(501).send({
      error: "Paid risk-report generation is not configured",
    });
  });

  return app;
}
