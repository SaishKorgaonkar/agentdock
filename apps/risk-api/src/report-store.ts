import { DatabaseSync } from "node:sqlite";

import type { RiskReport } from "./report.js";

export interface ReportStore {
  get(requestId: string): RiskReport | undefined;
  save(report: RiskReport): RiskReport;
  close?(): void;
}

export class InMemoryReportStore implements ReportStore {
  readonly #reports = new Map<string, RiskReport>();

  get(requestId: string): RiskReport | undefined {
    return this.#reports.get(requestId);
  }

  save(report: RiskReport): RiskReport {
    const existing = this.#reports.get(report.requestId);
    if (existing) {
      return existing;
    }

    this.#reports.set(report.requestId, report);
    return report;
  }
}

export class SqliteReportStore implements ReportStore {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS risk_reports (
        request_id TEXT PRIMARY KEY,
        report_json TEXT NOT NULL
      );
    `);
  }

  get(requestId: string): RiskReport | undefined {
    const row = this.#database
      .prepare("SELECT report_json FROM risk_reports WHERE request_id = ?")
      .get(requestId) as { report_json: string } | undefined;
    return row ? (JSON.parse(row.report_json) as RiskReport) : undefined;
  }

  save(report: RiskReport): RiskReport {
    const existing = this.get(report.requestId);
    if (existing) {
      return existing;
    }

    this.#database
      .prepare(
        "INSERT INTO risk_reports (request_id, report_json) VALUES (?, ?)",
      )
      .run(report.requestId, JSON.stringify(report));
    return report;
  }

  close(): void {
    this.#database.close();
  }
}
