import { afterEach, describe, expect, it } from "vitest";

import { buildApp } from "./app.js";

const apps: ReturnType<typeof buildApp>[] = [];

afterEach(async () => {
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

describe("GET /health", () => {
  it("reports that the paid risk service is healthy", async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: "agentdock-risk-api",
      status: "ok",
    });
  });
});

describe("POST /v1/risk-reports", () => {
  it("does not serve reports before Hedera x402 is configured", async () => {
    const app = buildApp();
    apps.push(app);

    const response = await app.inject({
      method: "POST",
      url: "/v1/risk-reports",
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: "Hedera x402 payment is not configured",
    });
  });
});
