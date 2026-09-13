import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "./app.js";
import { InMemoryServiceStore } from "./service-store.js";
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

  it("activates only an ENS-authorized agent", async () => {
    const app = buildApp({
      now: () => "2026-09-11T22:00:00.000Z",
      authorityReader: {
        async readAuthority(agentName) {
          if (agentName === "risk-agent.agentdock.eth") {
            return {
              role: "risk-agent",
              capabilities: ["purchase-risk-report"],
              expiresAt: "2026-10-01T00:00:00.000Z",
              endpoint: "https://risk-api.agentdock.example/v1/risk-reports",
              x402Network: "hedera-testnet",
              policyHash: `0x${"a".repeat(64)}`,
            };
          }

          return undefined;
        },
      },
    });
    apps.push(app);

    await app.inject({
      method: "POST",
      url: "/v1/workflows",
      payload: { id: "authorized-workflow" },
    });
    const activated = await app.inject({
      method: "POST",
      url: "/v1/workflows/authorized-workflow/authorize-ens",
      payload: {
        agentName: "risk-agent.agentdock.eth",
        idempotencyKey: "authorize-ens",
      },
    });
    const denied = await app.inject({
      method: "POST",
      url: "/v1/workflows/authorized-workflow/authorize-ens",
      payload: {
        agentName: "revoked-agent.agentdock.eth",
        idempotencyKey: "authorize-revoked",
      },
    });

    expect(activated.statusCode).toBe(200);
    expect(activated.json()).toMatchObject({ status: "ACTIVE" });
    expect(denied.statusCode).toBe(403);
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

  it("requires consent and completes a paid report purchase", async () => {
    const serviceStore = new InMemoryServiceStore();
    serviceStore.create({
      id: "risk-service",
      providerName: "Risk Provider",
      ensName: "risk.agentdock.eth",
      capability: "purchase-risk-report",
      description: "Signed risk report",
      endpoint: "https://risk.example",
      priceTinybars: "10000",
      createdAt: "2026-09-11T22:00:00.000Z",
    });
    const app = buildApp({
      now: () => "2026-09-11T22:00:00.000Z",
      serviceStore,
      authorityReader: {
        async readAuthority() {
          return {
            role: "risk-agent",
            capabilities: ["purchase-risk-report"],
            expiresAt: "2026-10-01T00:00:00.000Z",
            endpoint: "https://risk.example",
            x402Network: "hedera:testnet",
            policyHash: `0x${"a".repeat(64)}`,
          };
        },
      },
      riskReportRequester: {
        async requestReport(requestId) {
          return {
            requestId,
            chain: "evm",
            generatedAt: "2026-09-11T22:00:00.000Z",
            balances: [],
            totalWei: "0",
            evidenceHash: `0x${"b".repeat(64)}`,
            signature: "signed",
          };
        },
      },
    });
    apps.push(app);
    await app.inject({
      method: "POST",
      url: "/v1/workflows",
      payload: { id: "paid-workflow" },
    });
    await app.inject({
      method: "POST",
      url: "/v1/workflows/paid-workflow/select-service",
      payload: { serviceId: "risk-service" },
    });
    await app.inject({
      method: "POST",
      url: "/v1/workflows/paid-workflow/authorize-ens",
      payload: { agentName: "risk.agentdock.eth", idempotencyKey: "ens" },
    });

    const denied = await app.inject({
      method: "POST",
      url: "/v1/workflows/paid-workflow/purchase-risk-report",
      payload: {
        requestId: "report-1",
        addresses: [`0x${"1".repeat(40)}`],
        paymentConfirmed: false,
      },
    });
    const purchased = await app.inject({
      method: "POST",
      url: "/v1/workflows/paid-workflow/purchase-risk-report",
      payload: {
        requestId: "report-1",
        addresses: [`0x${"1".repeat(40)}`],
        paymentConfirmed: true,
      },
    });

    expect(denied.statusCode).toBe(400);
    expect(purchased.statusCode).toBe(201);
    expect(purchased.json()).toMatchObject({
      paid: true,
      workflow: { status: "REPORT_RECEIVED" },
      report: { requestId: "report-1", totalWei: "0", signature: "signed" },
    });
  });

  it("isolates workflows by authenticated user", async () => {
    const app = buildApp({
      authVerifier: {
        async verifyAuthorization(authorization) {
          if (!authorization?.startsWith("Bearer "))
            throw new Error("missing token");
          return authorization.slice("Bearer ".length);
        },
      },
    });
    apps.push(app);

    await app.inject({
      method: "POST",
      url: "/v1/workflows",
      headers: { authorization: "Bearer user-one" },
      payload: { id: "private-workflow" },
    });
    const otherList = await app.inject({
      method: "GET",
      url: "/v1/workflows",
      headers: { authorization: "Bearer user-two" },
    });
    const otherGet = await app.inject({
      method: "GET",
      url: "/v1/workflows/private-workflow",
      headers: { authorization: "Bearer user-two" },
    });

    expect(otherList.json()).toEqual({ workflows: [] });
    expect(otherGet.statusCode).toBe(404);
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
