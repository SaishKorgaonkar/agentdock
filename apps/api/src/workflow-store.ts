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

export interface WorkflowStore {
  create(workflowId: string): Workflow;
  get(workflowId: string): Workflow;
  transition(workflowId: string, request: TransitionRequest): Workflow;
  close?(): void;
}

export class InMemoryWorkflowStore implements WorkflowStore {
  readonly #workflows = new Map<string, Workflow>();

  create(workflowId: string): Workflow {
    if (this.#workflows.has(workflowId)) {
      throw new WorkflowAlreadyExistsError(workflowId);
    }

    const workflow = createWorkflow(workflowId);
    this.#workflows.set(workflowId, workflow);
    return workflow;
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
}

type WorkflowRow = {
  id: string;
  status: string;
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
        status TEXT NOT NULL
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
  }

  create(workflowId: string): Workflow {
    const existing = this.#selectWorkflow(workflowId);
    if (existing) {
      throw new WorkflowAlreadyExistsError(workflowId);
    }

    const workflow = createWorkflow(workflowId);
    this.#database
      .prepare("INSERT INTO workflows (id, status) VALUES (?, ?)")
      .run(workflow.id, workflow.status);
    return workflow;
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

  close(): void {
    this.#database.close();
  }

  #selectWorkflow(workflowId: string): WorkflowRow | undefined {
    return this.#database
      .prepare("SELECT id, status FROM workflows WHERE id = ?")
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
