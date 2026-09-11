import { describe, expect, it } from "vitest";

import { createWorkflow, transitionWorkflow } from "./workflow.js";

const at = "2026-09-11T21:30:00.000Z";

function transition(
  workflow: ReturnType<typeof createWorkflow>,
  to: Parameters<typeof transitionWorkflow>[1]["to"],
  key: string,
) {
  return transitionWorkflow(workflow, {
    to,
    idempotencyKey: key,
    occurredAt: at,
  });
}

describe("workflow state machine", () => {
  it("reaches a completed decision only through every required stage", () => {
    let workflow = createWorkflow("workflow-1");

    workflow = transition(workflow, "ACTIVE", "activate");
    workflow = transition(workflow, "SERVICE_DISCOVERED", "discover-service");
    workflow = transition(workflow, "PAYMENT_QUOTED", "quote-payment");
    workflow = transition(workflow, "PAYMENT_AUTHORIZED", "authorize-payment");
    workflow = transition(workflow, "PAYMENT_SETTLED", "settle-payment");
    workflow = transition(workflow, "REPORT_RECEIVED", "receive-report");
    workflow = transition(
      workflow,
      "PRIVATE_EVALUATION_RUNNING",
      "evaluate-policy",
    );
    workflow = transition(workflow, "COMPLETED", "complete");

    expect(workflow.status).toBe("COMPLETED");
    expect(workflow.events).toHaveLength(8);
    expect(workflow.events.map((event) => event.sequence)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(Object.isFrozen(workflow)).toBe(true);
    expect(Object.isFrozen(workflow.events)).toBe(true);
    expect(Object.isFrozen(workflow.events[0])).toBe(true);
  });

  it("rejects skipped and terminal-state transitions", () => {
    const draft = createWorkflow("workflow-2");

    expect(() => transition(draft, "PAYMENT_SETTLED", "skip")).toThrow(
      "Cannot transition workflow from DRAFT to PAYMENT_SETTLED",
    );

    const expired = transition(draft, "EXPIRED", "expire");

    expect(() => transition(expired, "ACTIVE", "reactivate")).toThrow(
      "Cannot transition workflow from EXPIRED to ACTIVE",
    );
  });

  it("makes repeated transition requests idempotent without creating events", () => {
    const draft = createWorkflow("workflow-3");
    const active = transition(draft, "ACTIVE", "activate");
    const retried = transition(active, "ACTIVE", "activate");

    expect(retried).toBe(active);
    expect(retried.events).toHaveLength(1);

    expect(() => transition(active, "EXPIRED", "activate")).toThrow(
      "Idempotency key activate was already used for ACTIVE",
    );
  });

  it("requires non-empty workflow ids and idempotency keys", () => {
    expect(() => createWorkflow(" ")).toThrow("Workflow id must not be empty");

    expect(() =>
      transitionWorkflow(createWorkflow("workflow-4"), {
        to: "ACTIVE",
        idempotencyKey: " ",
        occurredAt: at,
      }),
    ).toThrow("Transition idempotency key must not be empty");
  });
});
