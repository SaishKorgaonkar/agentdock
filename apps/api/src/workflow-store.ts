import { DatabaseSync } from "node:sqlite";

import {
  createWorkflow,
  transitionWorkflow,
  type TransitionRequest,
  type Workflow,
  type WorkflowEvent,
} from "@agentdock/domain";

export class WorkflowNotFoundError extends Error {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`);
  }
}

export class WorkflowAlreadyExistsError extends Error {
  constructor(workflowId: string) {
    super(`Workflow already exists: ${workflowId}`);
  }
}

export type WorkflowReportEvidence = Readonly<{
  requestId: string;
  chain?: "evm";
  generatedAt?: string;
  balances?: readonly Readonly<{ address: string; wei: string }>[];
  totalWei?: string;
  evidenceHash: string;
  signature: string;
}>;

export interface WorkflowStore {
  create(workflowId: string, ownerId?: string): Workflow;
  list(ownerId?: string): Workflow[];
  ownerId(workflowId: string): string | undefined;
  get(workflowId: string): Workflow;
  transition(workflowId: string, request: TransitionRequest): Workflow;
  saveReportEvidence(
    workflowId: string,
    evidence: WorkflowReportEvidence,
  ): void;
  getReportEvidence(workflowId: string): WorkflowReportEvidence | undefined;
  close?(): void;
}

export class InMemoryWorkflowStore implements WorkflowStore {
  readonly #workflows = new Map<string, Workflow>();
  readonly #owners = new Map<string, string>();
  readonly #reports = new Map<string, WorkflowReportEvidence>();

  create(workflowId: string, ownerId?: string): Workflow {
    if (this.#workflows.has(workflowId)) {
      throw new WorkflowAlreadyExistsError(workflowId);
    }

    const workflow = createWorkflow(workflowId);
    this.#workflows.set(workflowId, workflow);
    if (ownerId) this.#owners.set(workflowId, ownerId);
    return workflow;
  }

  list(ownerId?: string): Workflow[] {
    return [...this.#workflows.values()].filter(
      (workflow) => !ownerId || this.#owners.get(workflow.id) === ownerId,
    );
  }

  ownerId(workflowId: string): string | undefined {
    this.get(workflowId);
    return this.#owners.get(workflowId);
  }

  get(workflowId: string): Workflow {
    const workflow = this.#workflows.get(workflowId);

    if (!workflow) {
      throw new WorkflowNotFoundError(workflowId);
    }

    return workflow;
  }

  transition(workflowId: string, request: TransitionRequest): Workflow {
    const workflow = this.get(workflowId);
    const transitioned = transitionWorkflow(workflow, request);
    this.#workflows.set(workflowId, transitioned);
    return transitioned;
  }

  saveReportEvidence(
    workflowId: string,
    evidence: WorkflowReportEvidence,
  ): void {
    this.get(workflowId);
    this.#reports.set(workflowId, Object.freeze({ ...evidence }));
  }

  getReportEvidence(workflowId: string): WorkflowReportEvidence | undefined {
    this.get(workflowId);
    return this.#reports.get(workflowId);
  }
}

type WorkflowRow = {
  id: string;
  status: string;
  owner_id?: string | null;
};

type WorkflowEventRow = {
  workflow_id: string;
  sequence: number;
  from_status: string;
  to_status: string;
  idempotency_key: string;
  occurred_at: string;
};

export class SqliteWorkflowStore implements WorkflowStore {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS workflows (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        owner_id TEXT
      );
      CREATE TABLE IF NOT EXISTS workflow_reports (
        workflow_id TEXT PRIMARY KEY REFERENCES workflows(id),
        request_id TEXT NOT NULL,
        evidence_hash TEXT NOT NULL,
        signature TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workflow_report_payloads (
        workflow_id TEXT PRIMARY KEY REFERENCES workflows(id),
        payload_json TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS workflow_events (
        workflow_id TEXT NOT NULL REFERENCES workflows(id),
        sequence INTEGER NOT NULL,
        from_status TEXT NOT NULL,
        to_status TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        occurred_at TEXT NOT NULL,
        PRIMARY KEY (workflow_id, sequence),
        UNIQUE (workflow_id, idempotency_key)
      );
    `);
    const workflowColumns = this.#database
      .prepare("PRAGMA table_info(workflows)")
      .all() as { name: string }[];
    if (!workflowColumns.some((column) => column.name === "owner_id")) {
      this.#database.exec("ALTER TABLE workflows ADD COLUMN owner_id TEXT");
    }
  }

  create(workflowId: string, ownerId?: string): Workflow {
    const existing = this.#selectWorkflow(workflowId);
    if (existing) {
      throw new WorkflowAlreadyExistsError(workflowId);
    }

    const workflow = createWorkflow(workflowId);
    this.#database
      .prepare("INSERT INTO workflows (id, status, owner_id) VALUES (?, ?, ?)")
      .run(workflow.id, workflow.status, ownerId ?? null);
    return workflow;
  }

  list(ownerId?: string): Workflow[] {
    const rows = (
      ownerId
        ? this.#database
            .prepare(
              "SELECT id FROM workflows WHERE owner_id = ? ORDER BY id DESC",
            )
            .all(ownerId)
        : this.#database
            .prepare("SELECT id FROM workflows ORDER BY id DESC")
            .all()
    ) as { id: string }[];
    return rows.map((row) => this.get(row.id));
  }

  ownerId(workflowId: string): string | undefined {
    const row = this.#selectWorkflow(workflowId);
    if (!row) throw new WorkflowNotFoundError(workflowId);
    return row.owner_id ?? undefined;
  }

  get(workflowId: string): Workflow {
    const row = this.#selectWorkflow(workflowId);
    if (!row) {
      throw new WorkflowNotFoundError(workflowId);
    }

    const events = this.#database
      .prepare(
        `SELECT workflow_id, sequence, from_status, to_status, idempotency_key, occurred_at
         FROM workflow_events WHERE workflow_id = ? ORDER BY sequence`,
      )
      .all(workflowId) as WorkflowEventRow[];

    let workflow = createWorkflow(row.id);
    for (const event of events) {
      workflow = transitionWorkflow(workflow, {
        to: event.to_status as WorkflowEvent["to"],
        idempotencyKey: event.idempotency_key,
        occurredAt: event.occurred_at,
      });
    }

    if (workflow.status !== row.status) {
      throw new Error(`Workflow ${workflowId} has inconsistent stored state`);
    }

    return workflow;
  }

  transition(workflowId: string, request: TransitionRequest): Workflow {
    this.#database.exec("BEGIN IMMEDIATE");

    try {
      const workflow = this.get(workflowId);
      const transitioned = transitionWorkflow(workflow, request);

      if (transitioned !== workflow) {
        const event = transitioned.events.at(-1);
        if (!event) {
          throw new Error("Transition did not produce an event");
        }

        this.#database
          .prepare("UPDATE workflows SET status = ? WHERE id = ?")
          .run(transitioned.status, workflowId);
        this.#database
          .prepare(
            `INSERT INTO workflow_events
             (workflow_id, sequence, from_status, to_status, idempotency_key, occurred_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .run(
            event.workflowId,
            event.sequence,
            event.from,
            event.to,
            event.idempotencyKey,
            event.occurredAt,
          );
      }

      this.#database.exec("COMMIT");
      return transitioned;
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  saveReportEvidence(
    workflowId: string,
    evidence: WorkflowReportEvidence,
  ): void {
    this.get(workflowId);
    this.#database
      .prepare(
        `INSERT INTO workflow_reports (workflow_id, request_id, evidence_hash, signature)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(workflow_id) DO UPDATE SET
           request_id = excluded.request_id,
           evidence_hash = excluded.evidence_hash,
           signature = excluded.signature`,
      )
      .run(
        workflowId,
        evidence.requestId,
        evidence.evidenceHash,
        evidence.signature,
      );
    this.#database
      .prepare(
        `INSERT INTO workflow_report_payloads (workflow_id, payload_json) VALUES (?, ?)
         ON CONFLICT(workflow_id) DO UPDATE SET payload_json = excluded.payload_json`,
      )
      .run(workflowId, JSON.stringify(evidence));
  }

  getReportEvidence(workflowId: string): WorkflowReportEvidence | undefined {
    this.get(workflowId);
    const row = this.#database
      .prepare(
        `SELECT request_id, evidence_hash, signature
         FROM workflow_reports WHERE workflow_id = ?`,
      )
      .get(workflowId) as
      | { request_id: string; evidence_hash: string; signature: string }
      | undefined;

    if (!row) return undefined;
    const payload = this.#database
      .prepare(
        "SELECT payload_json FROM workflow_report_payloads WHERE workflow_id = ?",
      )
      .get(workflowId) as { payload_json: string } | undefined;
    if (payload)
      return JSON.parse(payload.payload_json) as WorkflowReportEvidence;
    return {
      requestId: row.request_id,
      evidenceHash: row.evidence_hash,
      signature: row.signature,
    };
  }

  close(): void {
    this.#database.close();
  }

  #selectWorkflow(workflowId: string): WorkflowRow | undefined {
    return this.#database
      .prepare("SELECT id, status, owner_id FROM workflows WHERE id = ?")
      .get(workflowId) as WorkflowRow | undefined;
  }
}

export function sqlitePathFromDatabaseUrl(databaseUrl: string): string {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must use a file: URL for the SQLite workflow store",
    );
  }

  const path = databaseUrl.slice("file:".length);
  if (!path) {
    throw new Error("DATABASE_URL must include a SQLite database path");
  }

  return path;
}
