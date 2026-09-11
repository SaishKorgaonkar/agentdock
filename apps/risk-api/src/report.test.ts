import { generateKeyPairSync } from "node:crypto";

import { describe, expect, it } from "vitest";

import { Ed25519ReportGenerator } from "./report.js";

describe("Ed25519ReportGenerator", () => {
  it("produces a deterministic signed report from RPC-backed balances", async () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const generator = new Ed25519ReportGenerator({
      balanceSource: {
        async getBalance(address) {
          return address.endsWith("01") ? 100n : 250n;
        },
      },
      privateKeyPem: privateKey
        .export({ type: "pkcs8", format: "pem" })
        .toString(),
      now: () => "2026-09-11T22:30:00.000Z",
    });

    const report = await generator.generate({
      requestId: "request-1",
      addresses: [
        "0x0000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000001",
      ],
    });

    expect(report).toMatchObject({
      requestId: "request-1",
      chain: "evm",
      generatedAt: "2026-09-11T22:30:00.000Z",
      totalWei: "350",
    });
    expect(report.balances).toEqual([
      { address: "0x0000000000000000000000000000000000000001", wei: "100" },
      { address: "0x0000000000000000000000000000000000000002", wei: "250" },
    ]);
    expect(report.evidenceHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(report.signature).not.toBe("");
  });

  it("rejects invalid address input before querying RPC", async () => {
    const { privateKey } = generateKeyPairSync("ed25519");
    const generator = new Ed25519ReportGenerator({
      balanceSource: {
        async getBalance() {
          return 0n;
        },
      },
      privateKeyPem: privateKey
        .export({ type: "pkcs8", format: "pem" })
        .toString(),
    });

    await expect(
      generator.generate({
        requestId: "request-2",
        addresses: ["not-an-address"],
      }),
    ).rejects.toThrow("Risk report addresses must be EVM addresses");
  });
});
