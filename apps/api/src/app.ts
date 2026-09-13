import { evaluatePrivatePolicy, isWorkflowStatus } from "@agentdock/domain";
import { isAuthorityActive, type AgentAuthority } from "@agentdock/ens";
import Fastify from "fastify";

import { InMemoryArtifactStore, type ArtifactStore } from "./artifact-store.js";
import { AuthenticationError, type AuthVerifier } from "./auth.js";
import { InMemoryServiceStore, type ServiceStore } from "./service-store.js";
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
  ): Promise<{
    requestId: string;
    chain?: "evm";
    generatedAt?: string;
    balances?: readonly Readonly<{ address: string; wei: string }>[];
    totalWei?: string;
    evidenceHash: string;
    signature: string;
    paymentReference?: string;
  }>;
};

type ReceiptWriter = {
  write(input: {
    workflowId: string;
    agentName: string;
    serviceName: string;
    evidenceHash: `0x${string}`;
    decisionHash: `0x${string}`;
    hederaPaymentReference: string;
    status: "COMPLETED" | "REQUIRES_APPROVAL";
  }): Promise<`0x${string}`>;
};

type BuildAppOptions = {
  artifactStore?: ArtifactStore;
  authVerifier?: AuthVerifier;
  authorityReader?: AuthorityReader;
  now?: () => string;
  receiptWriter?: ReceiptWriter;
  riskReportRequester?: RiskReportRequester;
  serviceStore?: ServiceStore;
  workflowStore?: WorkflowStore;
};

export function buildApp({
  artifactStore = new InMemoryArtifactStore(),
  authVerifier,
  authorityReader,
  now = () => new Date().toISOString(),
  receiptWriter,
  riskReportRequester,
  serviceStore = new InMemoryServiceStore(),
  workflowStore = new InMemoryWorkflowStore(),
}: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const authenticatedUsers = new WeakMap<object, string>();
  const assertWorkflowAccess = (request: object, workflowId: string) => {
    if (!authVerifier) return;
    const userId = authenticatedUsers.get(request);
    if (!userId || workflowStore.ownerId(workflowId) !== userId) {
      throw new WorkflowNotFoundError(workflowId);
    }
  };
  const allowedOrigins = process.env.WEB_URL?.split(",").filter(Boolean) ?? [];
  app.addHook("onRequest", (request, reply, done) => {
    const origin = request.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      reply.header("access-control-allow-origin", origin);
      reply.header("access-control-allow-credentials", "true");
      reply.header(
        "access-control-allow-headers",
        "content-type, authorization",
      );
      reply.header("access-control-allow-methods", "GET, POST, OPTIONS");
      reply.header("vary", "Origin");
    }
    if (request.method === "OPTIONS") {
      reply.code(204).send();
      return;
    }
    done();
  });

  app.addHook("preHandler", async (request, reply) => {
    if (
      !authVerifier ||
      request.method === "OPTIONS" ||
      request.url === "/health" ||
      (request.method === "GET" && request.url.startsWith("/v1/services"))
    ) {
      return;
    }

    try {
      const userId = await authVerifier.verifyAuthorization(
        request.headers.authorization,
      );
      authenticatedUsers.set(request, userId);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return reply.code(401).send({ error: error.message });
      }
      throw error;
    }
  });

  app.addHook("onClose", () => {
    artifactStore.close?.();
  });

  app.addHook("onClose", () => {
    workflowStore.close?.();
  });

  app.addHook("onClose", () => {
    serviceStore.close?.();
  });

  app.get("/health", async () => ({
    service: "agentdock-api",
    status: "ok",
  }));

  app.get("/v1/services", async (request) => {
    const query = stringValue(request.query, "q");
    return { services: serviceStore.list(query) };
  });

  app.get("/v1/provider/services", async (request) => ({
    summary: serviceStore.providerSummary(
      authenticatedUsers.get(request) ?? "",
    ),
  }));

  app.post("/v1/services", async (request, reply) => {
    const providerName = stringValue(request.body, "providerName");
    const ensName = stringValue(request.body, "ensName");
    const capability = stringValue(request.body, "capability");
    const description = stringValue(request.body, "description");
    const endpoint = stringValue(request.body, "endpoint");
    const priceTinybars = stringValue(request.body, "priceTinybars");
    if (
      !providerName ||
      !ensName ||
      !capability ||
      !description ||
      !endpoint ||
      !priceTinybars
    ) {
      return reply.code(400).send({
        error:
          "providerName, ensName, capability, description, endpoint, and priceTinybars are required",
      });
    }
    try {
      if (!authorityReader) {
        return reply
          .code(503)
          .send({ error: "ENS authority is not configured" });
      }
      const authority = await authorityReader.readAuthority(ensName);
      if (
        !authority ||
        !isAuthorityActive(authority, new Date(now())) ||
        !authority.capabilities.includes(capability) ||
        authority.endpoint.replace(/\/$/, "") !== endpoint.replace(/\/$/, "") ||
        authority.x402Network !== "hedera:testnet"
      ) {
        return reply.code(403).send({
          error:
            "ENS authority must permit this capability, endpoint, and Hedera testnet service",
        });
      }

      return reply.code(201).send(
        serviceStore.create(
          {
            id: crypto.randomUUID(),
            providerName,
            ensName,
            capability,
            description,
            endpoint,
            priceTinybars,
            createdAt: now(),
          },
          authenticatedUsers.get(request),
        ),
      );
    } catch (error) {
      return reply.code(409).send({
        error:
          error instanceof Error ? error.message : "Unable to publish service",
      });
    }
  });

  app.post(
    "/v1/workflows/:workflowId/select-service",
    async (request, reply) => {
      const workflowId = stringValue(request.params, "workflowId");
      const serviceId = stringValue(request.body, "serviceId");
      if (!workflowId || !serviceId)
        return reply.code(400).send({ error: "serviceId is required" });
      try {
        assertWorkflowAccess(request, workflowId);
        workflowStore.get(workflowId);
        return {
          service: serviceStore.selectForWorkflow(workflowId, serviceId),
        };
      } catch (error) {
        return reply.code(404).send({
          error:
            error instanceof Error
              ? error.message
              : "Service or workflow not found",
        });
      }
    },
  );

  app.post("/v1/workflows", async (request, reply) => {
    const workflowId = stringValue(request.body, "id");

    if (!workflowId) {
      return reply.code(400).send({ error: "Workflow id is required" });
    }

    try {
      return reply
        .code(201)
        .send(
          workflowStore.create(workflowId, authenticatedUsers.get(request)),
        );
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
        assertWorkflowAccess(request, workflowId);
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
    "/v1/workflows/:workflowId/purchase-risk-report",
    async (request, reply) => {
      const workflowId = stringValue(request.params, "workflowId");
      const requestId = stringValue(request.body, "requestId");
      const addresses = stringArrayValue(request.body, "addresses");
      const paymentConfirmed = booleanValue(request.body, "paymentConfirmed");

      if (!workflowId || !requestId || !addresses?.length) {
        return reply.code(400).send({
          error: "requestId and a non-empty addresses array are required",
        });
      }
      if (!paymentConfirmed) {
        return reply.code(400).send({
          error: "Explicit payment confirmation is required",
        });
      }
      if (!riskReportRequester) {
        return reply
          .code(503)
          .send({ error: "Risk report client is not configured" });
      }

      try {
        assertWorkflowAccess(request, workflowId);
        let workflow = workflowStore.get(workflowId);
        const existing = workflowStore.getReportEvidence(workflowId);
        if (existing) return { workflow, report: existing, paid: true };
        const service = serviceStore.selectedForWorkflow(workflowId);
        if (!service) {
          return reply
            .code(409)
            .send({ error: "Select a paid service before purchase" });
        }
        if (workflow.status !== "ACTIVE") {
          return reply
            .code(409)
            .send({ error: "Authorize the ENS agent before purchase" });
        }

        const transition = (
          status:
            | "SERVICE_DISCOVERED"
            | "PAYMENT_QUOTED"
            | "PAYMENT_AUTHORIZED"
            | "PAYMENT_SETTLED"
            | "REPORT_RECEIVED",
        ) => {
          workflow = workflowStore.transition(workflowId, {
            to: status,
            idempotencyKey: `purchase-${requestId}-${status.toLowerCase()}`,
            occurredAt: now(),
          });
        };
        transition("SERVICE_DISCOVERED");
        transition("PAYMENT_QUOTED");
        transition("PAYMENT_AUTHORIZED");
        let report;
        try {
          report = await riskReportRequester.requestReport(
            requestId,
            addresses,
          );
        } catch (error) {
          workflowStore.transition(workflowId, {
            to: "FAILED",
            idempotencyKey: `purchase-${requestId}-failed`,
            occurredAt: now(),
          });
          throw error;
        }
        transition("PAYMENT_SETTLED");
        workflowStore.saveReportEvidence(workflowId, report);
        transition("REPORT_RECEIVED");

        return reply.code(201).send({ workflow, service, report, paid: true });
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
    "/v1/workflows/:workflowId/evaluate-policy",
    async (request, reply) => {
      const workflowId = stringValue(request.params, "workflowId");
      const agentName = stringValue(request.body, "agentName");
      const maximumWei = stringValue(request.body, "maximumWei");
      const policyVersion =
        stringValue(request.body, "policyVersion") ?? "agentdock-policy-v1";
      if (!workflowId || !agentName || !maximumWei) {
        return reply
          .code(400)
          .send({ error: "agentName and maximumWei are required" });
      }
      if (!receiptWriter) {
        return reply
          .code(503)
          .send({ error: "Sepolia receipt writer is not configured" });
      }

      try {
        assertWorkflowAccess(request, workflowId);
        const existing = artifactStore.getDecision(workflowId);
        if (existing)
          return {
            workflow: workflowStore.get(workflowId),
            decision: existing,
          };
        const workflow = workflowStore.get(workflowId);
        const report = workflowStore.getReportEvidence(workflowId);
        const service = serviceStore.selectedForWorkflow(workflowId);
        if (
          workflow.status !== "REPORT_RECEIVED" ||
          !report?.totalWei ||
          !service
        ) {
          return reply.code(409).send({
            error:
              "A settled signed report is required before policy evaluation",
          });
        }
        if (!report.paymentReference) {
          return reply
            .code(409)
            .send({ error: "The Hedera x402 payment reference is missing" });
        }

        workflowStore.transition(workflowId, {
          to: "PRIVATE_EVALUATION_RUNNING",
          idempotencyKey: `cre-${workflowId}`,
          occurredAt: now(),
        });
        const decision = evaluatePrivatePolicy({
          policyVersion,
          reportEvidenceHash: report.evidenceHash,
          totalWei: report.totalWei,
          maximumWei,
        });
        const receiptTransactionHash = await receiptWriter.write({
          workflowId,
          agentName,
          serviceName: service.ensName,
          evidenceHash: report.evidenceHash as `0x${string}`,
          decisionHash: decision.decisionHash as `0x${string}`,
          hederaPaymentReference: report.paymentReference,
          status: decision.status,
        });
        const artifact = {
          ...decision,
          policyVersion,
          maximumWei,
          simulator: "chainlink-cre-handlerInTee" as const,
          receiptTransactionHash,
        };
        artifactStore.saveDecision(workflowId, artifact);
        const transitioned = workflowStore.transition(workflowId, {
          to: decision.status,
          idempotencyKey: `decision-${workflowId}`,
          occurredAt: now(),
        });
        return reply
          .code(201)
          .send({ workflow: transitioned, decision: artifact });
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
          error:
            "requestId, idempotencyKey, and a non-empty addresses array are required",
        });
      }
      if (!riskReportRequester) {
        return reply
          .code(503)
          .send({ error: "Risk report client is not configured" });
      }

      try {
        assertWorkflowAccess(request, workflowId);
        const workflow = workflowStore.get(workflowId);
        const existing = workflowStore.getReportEvidence(workflowId);
        if (existing) {
          return { workflow, report: existing };
        }
        if (workflow.status !== "PAYMENT_SETTLED") {
          return reply.code(409).send({
            error:
              "Risk reports can only be requested after payment settlement",
          });
        }

        const report = await riskReportRequester.requestReport(
          requestId,
          addresses,
        );
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

  app.get("/v1/workflows", async (request) => ({
    workflows: workflowStore.list(authenticatedUsers.get(request)),
  }));

  app.get("/v1/workflows/:workflowId/context", async (request, reply) => {
    const workflowId = stringValue(request.params, "workflowId");
    try {
      assertWorkflowAccess(request, workflowId ?? "");
      return {
        workflow: workflowStore.get(workflowId ?? ""),
        service: serviceStore.selectedForWorkflow(workflowId ?? ""),
        report: workflowStore.getReportEvidence(workflowId ?? ""),
        decision: artifactStore.getDecision(workflowId ?? ""),
      };
    } catch (error) {
      if (error instanceof WorkflowNotFoundError) {
        return reply.code(404).send({ error: error.message });
      }
      throw error;
    }
  });

  app.get("/v1/workflows/:workflowId", async (request, reply) => {
    const workflowId = stringValue(request.params, "workflowId");

    try {
      assertWorkflowAccess(request, workflowId ?? "");
      return workflowStore.get(workflowId ?? "");
    } catch (error) {
      if (error instanceof WorkflowNotFoundError) {
        return reply.code(404).send({ error: error.message });
      }

      throw error;
    }
  });

  app.post("/v1/workflows/:workflowId/transitions", async (request, reply) => {
    if (authVerifier) {
      return reply.code(404).send({ error: "Route not found" });
    }
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
      assertWorkflowAccess(request, workflowId);
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

function booleanValue(value: unknown, key: string): boolean | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "boolean" ? candidate : undefined;
}

function stringArrayValue(value: unknown, key: string): string[] | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const candidate = (value as Record<string, unknown>)[key];
  return Array.isArray(candidate) &&
    candidate.every((item) => typeof item === "string")
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
