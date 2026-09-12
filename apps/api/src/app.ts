import { isWorkflowStatus } from "@agentdock/domain";
import { isAuthorityActive, type AgentAuthority } from "@agentdock/ens";
import Fastify from "fastify";

import {
  InMemoryWorkflowStore,
  WorkflowAlreadyExistsError,
  WorkflowNotFoundError,
  type WorkflowStore,
} from "./workflow-store.js";

type AuthorityReader = {
  readAuthority(name: string): Promise<AgentAuthority | undefined>;
};

type RiskReportRequester = {
  requestReport(
    requestId: string,
    addresses: readonly string[],
  ): Promise<{ requestId: string; evidenceHash: string; signature: string }>;
};

type BuildAppOptions = {
  authorityReader?: AuthorityReader;
  now?: () => string;
  riskReportRequester?: RiskReportRequester;
  workflowStore?: WorkflowStore;
};

export function buildApp({
  authorityReader,
  now = () => new Date().toISOString(),
  riskReportRequester,
  workflowStore = new InMemoryWorkflowStore(),
}: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });

  app.addHook("onClose", () => {
    workflowStore.close?.();
  });

  app.get("/health", async () => ({
    service: "agentdock-api",
    status: "ok",
  }));

  app.post("/v1/workflows", async (request, reply) => {
    const workflowId = stringValue(request.body, "id");

    if (!workflowId) {
      return reply.code(400).send({ error: "Workflow id is required" });
    }

    try {
      return reply.code(201).send(workflowStore.create(workflowId));
    } catch (error) {
      if (error instanceof WorkflowAlreadyExistsError) {
        return reply.code(409).send({ error: error.message });
      }

      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post(
    "/v1/workflows/:workflowId/authorize-ens",
    async (request, reply) => {
      const workflowId = stringValue(request.params, "workflowId");
      const agentName = stringValue(request.body, "agentName");
      const idempotencyKey = stringValue(request.body, "idempotencyKey");
      const capability =
        stringValue(request.body, "capability") ?? "purchase-risk-report";

      if (!workflowId || !agentName || !idempotencyKey) {
        return reply.code(400).send({
          error: "workflowId, agentName, and idempotencyKey are required",
        });
      }

      if (!authorityReader) {
        return reply
          .code(503)
          .send({ error: "ENS authority is not configured" });
      }

      try {
        const authority = await authorityReader.readAuthority(agentName);
        if (
          !authority ||
          !isAuthorityActive(authority, new Date(now())) ||
          !authority.capabilities.includes(capability)
        ) {
          return reply
            .code(403)
            .send({ error: "ENS authority does not permit this workflow" });
        }

        return workflowStore.transition(workflowId, {
          to: "ACTIVE",
          idempotencyKey,
          occurredAt: now(),
        });
      } catch (error) {
        if (error instanceof WorkflowNotFoundError) {
          return reply.code(404).send({ error: error.message });
        }

        if (error instanceof Error) {
          return reply.code(409).send({ error: error.message });
        }

        throw error;
      }
    },
  );

  app.post(
    "/v1/workflows/:workflowId/request-risk-report",
    async (request, reply) => {
      const workflowId = stringValue(request.params, "workflowId");
      const requestId = stringValue(request.body, "requestId");
      const idempotencyKey = stringValue(request.body, "idempotencyKey");
      const addresses = stringArrayValue(request.body, "addresses");

      if (!workflowId || !requestId || !idempotencyKey || !addresses?.length) {
        return reply.code(400).send({
          error: "requestId, idempotencyKey, and a non-empty addresses array are required",
        });
      }
      if (!riskReportRequester) {
        return reply.code(503).send({ error: "Risk report client is not configured" });
      }

      try {
        const workflow = workflowStore.get(workflowId);
        const existing = workflowStore.getReportEvidence(workflowId);
        if (existing) {
          return { workflow, report: existing };
        }
        if (workflow.status !== "PAYMENT_SETTLED") {
          return reply.code(409).send({
            error: "Risk reports can only be requested after payment settlement",
          });
        }

        const report = await riskReportRequester.requestReport(requestId, addresses);
        workflowStore.saveReportEvidence(workflowId, report);
        const transitioned = workflowStore.transition(workflowId, {
          to: "REPORT_RECEIVED",
          idempotencyKey,
          occurredAt: now(),
        });
        return reply.code(201).send({ workflow: transitioned, report });
      } catch (error) {
        if (error instanceof WorkflowNotFoundError) {
          return reply.code(404).send({ error: error.message });
        }
        if (error instanceof Error) {
          return reply.code(409).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get("/v1/workflows/:workflowId", async (request, reply) => {
    const workflowId = stringValue(request.params, "workflowId");

    try {
      return workflowStore.get(workflowId ?? "");
    } catch (error) {
      if (error instanceof WorkflowNotFoundError) {
        return reply.code(404).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post("/v1/workflows/:workflowId/transitions", async (request, reply) => {
    const workflowId = stringValue(request.params, "workflowId");
    const status = stringValue(request.body, "status");
    const idempotencyKey = stringValue(request.body, "idempotencyKey");

    if (!workflowId || !status || !idempotencyKey) {
      return reply.code(400).send({
        error: "workflowId, status, and idempotencyKey are required",
      });
    }

    if (!isWorkflowStatus(status)) {
      return reply
        .code(400)
        .send({ error: `Unknown workflow status: ${status}` });
    }

    try {
      return workflowStore.transition(workflowId, {
        to: status,
        idempotencyKey,
        occurredAt: now(),
      });
    } catch (error) {
      if (error instanceof WorkflowNotFoundError) {
        return reply.code(404).send({ error: error.message });
      }

      if (error instanceof Error) {
        return reply.code(409).send({ error: error.message });
      }

      throw error;
    }
  });

  return app;
}

function stringArrayValue(value: unknown, key: string): string[] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const candidate = (value as Record<string, unknown>)[key];
  return Array.isArray(candidate) && candidate.every((item) => typeof item === "string")
    ? candidate
    : undefined;
}

function stringValue(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : undefined;
}
