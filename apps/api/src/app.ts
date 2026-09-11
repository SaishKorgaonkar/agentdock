import { isWorkflowStatus } from "@agentdock/domain";
import Fastify from "fastify";

import {
  InMemoryWorkflowStore,
  WorkflowAlreadyExistsError,
  WorkflowNotFoundError,
  type WorkflowStore,
} from "./workflow-store.js";

type BuildAppOptions = {
  now?: () => string;
  workflowStore?: WorkflowStore;
};

export function buildApp({
  now = () => new Date().toISOString(),
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

function stringValue(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" ? candidate : undefined;
}
