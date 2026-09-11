import {
  createWorkflow,
  transitionWorkflow,
  type TransitionRequest,
  type Workflow,
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
