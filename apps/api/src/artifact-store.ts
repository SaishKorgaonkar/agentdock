import { DatabaseSync } from "node:sqlite";

export type DecisionArtifact = Readonly<{
  status: "COMPLETED" | "REQUIRES_APPROVAL";
  decisionHash: string;
  policyVersion: string;
  maximumWei: string;
  simulator: "chainlink-cre-handlerInTee";
  receiptTransactionHash: string;
}>;

export interface ArtifactStore {
  saveDecision(workflowId: string, artifact: DecisionArtifact): void;
  getDecision(workflowId: string): DecisionArtifact | undefined;
  close?(): void;
}

export class InMemoryArtifactStore implements ArtifactStore {
  readonly #decisions = new Map<string, DecisionArtifact>();
  saveDecision(workflowId: string, artifact: DecisionArtifact): void {
    this.#decisions.set(workflowId, Object.freeze({ ...artifact }));
  }
  getDecision(workflowId: string): DecisionArtifact | undefined {
    return this.#decisions.get(workflowId);
  }
}

export class SqliteArtifactStore implements ArtifactStore {
  readonly #database: DatabaseSync;
  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(`CREATE TABLE IF NOT EXISTS workflow_decisions (
      workflow_id TEXT PRIMARY KEY,
      artifact_json TEXT NOT NULL
    )`);
  }
  saveDecision(workflowId: string, artifact: DecisionArtifact): void {
    this.#database
      .prepare(
        `INSERT INTO workflow_decisions (workflow_id, artifact_json) VALUES (?, ?)
        ON CONFLICT(workflow_id) DO UPDATE SET artifact_json = excluded.artifact_json`,
      )
      .run(workflowId, JSON.stringify(artifact));
  }
  getDecision(workflowId: string): DecisionArtifact | undefined {
    const row = this.#database
      .prepare(
        "SELECT artifact_json FROM workflow_decisions WHERE workflow_id = ?",
      )
      .get(workflowId) as { artifact_json: string } | undefined;
    return row
      ? (JSON.parse(row.artifact_json) as DecisionArtifact)
      : undefined;
  }
  close(): void {
    this.#database.close();
  }
}
