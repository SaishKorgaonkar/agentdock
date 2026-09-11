export const workflowStatuses = [
  "DRAFT",
  "ACTIVE",
  "SERVICE_DISCOVERED",
  "PAYMENT_QUOTED",
  "PAYMENT_AUTHORIZED",
  "PAYMENT_SETTLED",
  "REPORT_RECEIVED",
  "PRIVATE_EVALUATION_RUNNING",
  "COMPLETED",
  "REQUIRES_APPROVAL",
  "FAILED",
  "EXPIRED",
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return workflowStatuses.includes(value as WorkflowStatus);
}

export type WorkflowEvent = Readonly<{
  workflowId: string;
  sequence: number;
  from: WorkflowStatus;
  to: WorkflowStatus;
  idempotencyKey: string;
  occurredAt: string;
}>;

export type Workflow = Readonly<{
  id: string;
  status: WorkflowStatus;
  events: readonly WorkflowEvent[];
}>;

export type TransitionRequest = Readonly<{
  to: WorkflowStatus;
  idempotencyKey: string;
  occurredAt: string;
}>;

const transitions: Readonly<Record<WorkflowStatus, readonly WorkflowStatus[]>> =
  {
    DRAFT: ["ACTIVE", "EXPIRED"],
    ACTIVE: ["SERVICE_DISCOVERED", "FAILED", "EXPIRED"],
    SERVICE_DISCOVERED: ["PAYMENT_QUOTED", "FAILED", "EXPIRED"],
    PAYMENT_QUOTED: ["PAYMENT_AUTHORIZED", "FAILED", "EXPIRED"],
    PAYMENT_AUTHORIZED: ["PAYMENT_SETTLED", "FAILED", "EXPIRED"],
    PAYMENT_SETTLED: ["REPORT_RECEIVED", "FAILED", "EXPIRED"],
    REPORT_RECEIVED: ["PRIVATE_EVALUATION_RUNNING", "FAILED", "EXPIRED"],
    PRIVATE_EVALUATION_RUNNING: [
      "COMPLETED",
      "REQUIRES_APPROVAL",
      "FAILED",
      "EXPIRED",
    ],
    COMPLETED: [],
    REQUIRES_APPROVAL: [],
    FAILED: [],
    EXPIRED: [],
  };

export function createWorkflow(id: string): Workflow {
  if (!id.trim()) {
    throw new Error("Workflow id must not be empty");
  }

  return freezeWorkflow({ id, status: "DRAFT", events: [] });
}

export function transitionWorkflow(
  workflow: Workflow,
  request: TransitionRequest,
): Workflow {
  const idempotencyKey = request.idempotencyKey.trim();

  if (!idempotencyKey) {
    throw new Error("Transition idempotency key must not be empty");
  }

  const previousEvent = workflow.events.find(
    (event) => event.idempotencyKey === idempotencyKey,
  );

  if (previousEvent) {
    if (previousEvent.to === request.to) {
      return workflow;
    }

    throw new Error(
      `Idempotency key ${idempotencyKey} was already used for ${previousEvent.to}`,
    );
  }

  if (!transitions[workflow.status].includes(request.to)) {
    throw new Error(
      `Cannot transition workflow from ${workflow.status} to ${request.to}`,
    );
  }

  const event = Object.freeze({
    workflowId: workflow.id,
    sequence: workflow.events.length + 1,
    from: workflow.status,
    to: request.to,
    idempotencyKey,
    occurredAt: request.occurredAt,
  });

  return freezeWorkflow({
    id: workflow.id,
    status: request.to,
    events: [...workflow.events, event],
  });
}

function freezeWorkflow(workflow: {
  id: string;
  status: WorkflowStatus;
  events: WorkflowEvent[];
}): Workflow {
  return Object.freeze({
    ...workflow,
    events: Object.freeze([...workflow.events]),
  });
}
