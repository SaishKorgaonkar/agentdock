import Fastify from "fastify";

import { type RiskReport, type RiskReportRequest } from "./report.js";
import { configureHederaX402, type HederaX402Config } from "./x402.js";

type RiskReportGenerator = {
  generate(request: RiskReportRequest): Promise<RiskReport>;
};

type BuildAppOptions = {
  reportGenerator?: RiskReportGenerator;
  x402?: HederaX402Config;
};

export function buildApp({ reportGenerator, x402 }: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const reports = new Map<string, RiskReport>();

  app.get("/health", async () => ({
    service: "agentdock-risk-api",
    status: "ok",
  }));

  if (x402) {
    configureHederaX402(app, x402);
  }

  app.post("/v1/risk-reports", async (request, reply) => {
    if (!x402) {
      return reply
        .code(503)
        .send({ error: "Hedera x402 payment is not configured" });
    }

    if (!reportGenerator) {
      return reply
        .code(503)
        .send({ error: "Risk report generation is not configured" });
    }

    const reportRequest = parseReportRequest(request.body);
    if (!reportRequest) {
      return reply.code(400).send({
        error: "requestId and a non-empty addresses array are required",
      });
    }

    const existing = reports.get(reportRequest.requestId);
    if (existing) {
      return existing;
    }

    try {
      const report = await reportGenerator.generate(reportRequest);
      reports.set(report.requestId, report);
      return reply.code(201).send(report);
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }

      throw error;
    }
  });

  return app;
}

function parseReportRequest(body: unknown): RiskReportRequest | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const { addresses, requestId } = body as Record<string, unknown>;
  if (
    typeof requestId !== "string" ||
    !Array.isArray(addresses) ||
    addresses.some((address) => typeof address !== "string")
  ) {
    return undefined;
  }

  return { requestId, addresses };
}
