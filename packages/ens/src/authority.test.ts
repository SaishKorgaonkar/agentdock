import { describe, expect, it } from "vitest";

import { isAuthorityActive, parseAuthorityRecords } from "./authority.js";

const policyHash = `0x${"a".repeat(64)}` as const;

function records(overrides: Partial<Record<string, string>> = {}) {
  return {
    "agentdock.role": "risk-agent",
    "agentdock.capabilities": '["purchase-risk-report"]',
    "agentdock.expiresAt": "2026-10-01T00:00:00.000Z",
    "agentdock.endpoint": "https://risk-api.agentdock.example/v1/risk-reports",
    "agentdock.x402Network": "hedera-testnet",
    "agentdock.policyHash": policyHash,
    "agentdock.revokedAt": "",
    ...overrides,
  };
}

describe("ENS authority records", () => {
  it("parses active authority records", () => {
    const authority = parseAuthorityRecords(records());

    expect(authority).toEqual({
      role: "risk-agent",
      capabilities: ["purchase-risk-report"],
      expiresAt: "2026-10-01T00:00:00.000Z",
      endpoint: "https://risk-api.agentdock.example/v1/risk-reports",
      x402Network: "hedera-testnet",
      policyHash,
    });
    expect(
      isAuthorityActive(authority!, new Date("2026-09-11T00:00:00.000Z")),
    ).toBe(true);
  });

  it("rejects expired and revoked authority", () => {
    const expired = parseAuthorityRecords(
      records({ "agentdock.expiresAt": "2026-01-01T00:00:00.000Z" }),
    );
    const revoked = parseAuthorityRecords(
      records({ "agentdock.revokedAt": "2026-09-10T00:00:00.000Z" }),
    );

    expect(
      isAuthorityActive(expired!, new Date("2026-09-11T00:00:00.000Z")),
    ).toBe(false);
    expect(
      isAuthorityActive(revoked!, new Date("2026-09-11T00:00:00.000Z")),
    ).toBe(false);
  });

  it("rejects malformed or incomplete records", () => {
    expect(() =>
      parseAuthorityRecords(records({ "agentdock.capabilities": "not-json" })),
    ).toThrow("ENS authority capabilities must be a JSON array");

    expect(() =>
      parseAuthorityRecords(records({ "agentdock.policyHash": "0x1234" })),
    ).toThrow(
      "ENS authority policy hash must be a 32-byte 0x-prefixed hex value",
    );
  });
});
