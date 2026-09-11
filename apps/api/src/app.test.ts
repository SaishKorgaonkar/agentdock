import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "./app.js";
import { SqliteWorkflowStore } from "./workflow-store.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("GET /health", () => {
  it("reports that the orchestrator is healthy", async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "agentdock-api",
      status: "ok",
    });
  });
});

describe("workflow API", () => {
  it("creates, transitions, and retrieves an idempotent workflow", async () => {
    const app = buildApp({ now: () => "2026-09-11T22:00:00.000Z" });
    apps.push(app);

    const created = await app.inject({
      method: "POST",
      url: "/v1/workflows",
      payload: { id: "workflow-1" },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ id: "workflow-1", status: "DRAFT" });

    const transition = {
      method: "POST" as const,
      url: "/v1/workflows/workflow-1/transitions",
      payload: { status: "ACTIVE", idempotencyKey: "activate" },
    };
    const activated = await app.inject(transition);
    const retried = await app.inject(transition);

    expect(activated.statusCode).toBe(200);
    expect(retried.json()).toEqual(activated.json());
    expect(activated.json().events).toEqual([
      {
        workflowId: "workflow-1",
        sequence: 1,
        from: "DRAFT",
        to: "ACTIVE",
        idempotencyKey: "activate",
        occurredAt: "2026-09-11T22:00:00.000Z",
      },
    ]);

    const retrieved = await app.inject({
      method: "GET",
      url: "/v1/workflows/workflow-1",
    });
    expect(retrieved.json()).toEqual(activated.json());
  });

  it("persists events across orchestrator restarts", async () => {
    const directory = mkdtempSync(join(tmpdir(), "agentdock-"));
    const databasePath = join(directory, "workflows.sqlite");
    const firstApp = buildApp({
      now: () => "2026-09-11T22:15:00.000Z",
      workflowStore: new SqliteWorkflowStore(databasePath),
    });

    try {
      await firstApp.inject({
        method: "POST",
        url: "/v1/workflows",
        payload: { id: "durable-workflow" },
      });
      await firstApp.inject({
        method: "POST",
        url: "/v1/workflows/durable-workflow/transitions",
        payload: { status: "ACTIVE", idempotencyKey: "activate" },
      });
      await firstApp.close();

      const secondApp = buildApp({
        workflowStore: new SqliteWorkflowStore(databasePath),
      });
      const recovered = await secondApp.inject({
        method: "GET",
        url: "/v1/workflows/durable-workflow",
      });
      const retried = await secondApp.inject({
        method: "POST",
        url: "/v1/workflows/durable-workflow/transitions",
        payload: { status: "ACTIVE", idempotencyKey: "activate" },
      });
      await secondApp.close();

      expect(recovered.statusCode).toBe(200);
      expect(recovered.json()).toMatchObject({
        id: "durable-workflow",
        status: "ACTIVE",
        events: [{ idempotencyKey: "activate" }],
      });
      expect(retried.json()).toEqual(recovered.json());
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });

  it("rejects invalid transitions and unknown workflows", async () => {
    const app = buildApp();
    apps.push(app);

    const missing = await app.inject({
      method: "GET",
      url: "/v1/workflows/missing",
    });
    expect(missing.statusCode).toBe(404);

    await app.inject({
      method: "POST",
      url: "/v1/workflows",
      payload: { id: "workflow-2" },
    });
    const skipped = await app.inject({
      method: "POST",
      url: "/v1/workflows/workflow-2/transitions",
      payload: { status: "PAYMENT_SETTLED", idempotencyKey: "skip" },
    });

    expect(skipped.statusCode).toBe(409);
    expect(skipped.json()).toEqual({
      error: "Cannot transition workflow from DRAFT to PAYMENT_SETTLED",
    });
  });
});
