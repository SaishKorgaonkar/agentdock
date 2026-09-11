import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { SqliteReportStore } from "./report-store.js";

const report = {
  requestId: "request-1",
  chain: "evm" as const,
  generatedAt: "2026-09-11T23:00:00.000Z",
  balances: [],
  totalWei: "0",
  evidenceHash: `0x${"a".repeat(64)}`,
  signature: "signature",
};

describe("SqliteReportStore", () => {
  it("returns the original report after a restart", () => {
    const directory = mkdtempSync(join(tmpdir(), "agentdock-risk-"));
    const path = join(directory, "reports.sqlite");

    try {
      const first = new SqliteReportStore(path);
      first.save(report);
      first.close();

      const second = new SqliteReportStore(path);
      expect(second.get(report.requestId)).toEqual(report);
      expect(second.save({ ...report, signature: "different" })).toEqual(
        report,
      );
      second.close();
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});
