import { DatabaseSync } from "node:sqlite";

export type AgentService = Readonly<{
  id: string;
  providerName: string;
  ensName: string;
  capability: string;
  description: string;
  endpoint: string;
  priceTinybars: string;
  createdAt: string;
}>;

export interface ServiceStore {
  create(service: AgentService): AgentService;
  list(query?: string): AgentService[];
  get(id: string): AgentService | undefined;
  selectForWorkflow(workflowId: string, serviceId: string): AgentService;
  selectedForWorkflow(workflowId: string): AgentService | undefined;
  close?(): void;
}

export class InMemoryServiceStore implements ServiceStore {
  readonly #services = new Map<string, AgentService>();
  readonly #selections = new Map<string, string>();
  create(service: AgentService): AgentService {
    this.#services.set(service.id, service);
    return service;
  }
  list(query = ""): AgentService[] {
    const needle = query.toLowerCase();
    return [...this.#services.values()].filter(
      (service) =>
        !needle ||
        `${service.providerName} ${service.capability} ${service.description}`
          .toLowerCase()
          .includes(needle),
    );
  }
  get(id: string): AgentService | undefined {
    return this.#services.get(id);
  }
  selectForWorkflow(workflowId: string, serviceId: string): AgentService {
    const service = this.get(serviceId);
    if (!service) throw new Error("Service not found");
    this.#selections.set(workflowId, serviceId);
    return service;
  }
  selectedForWorkflow(workflowId: string): AgentService | undefined {
    const serviceId = this.#selections.get(workflowId);
    return serviceId ? this.get(serviceId) : undefined;
  }
}

export class SqliteServiceStore implements ServiceStore {
  readonly #database: DatabaseSync;
  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(`CREATE TABLE IF NOT EXISTS agent_services (
      id TEXT PRIMARY KEY, provider_name TEXT NOT NULL, ens_name TEXT NOT NULL UNIQUE,
      capability TEXT NOT NULL, description TEXT NOT NULL, endpoint TEXT NOT NULL,
      price_tinybars TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workflow_service_selections (
      workflow_id TEXT PRIMARY KEY, service_id TEXT NOT NULL REFERENCES agent_services(id)
    );`);
  }
  create(service: AgentService): AgentService {
    this.#database
      .prepare(`INSERT INTO agent_services VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        service.id,
        service.providerName,
        service.ensName,
        service.capability,
        service.description,
        service.endpoint,
        service.priceTinybars,
        service.createdAt,
      );
    return service;
  }
  list(query = ""): AgentService[] {
    const like = `%${query}%`;
    return this.#database
      .prepare(
        `SELECT id, provider_name as providerName, ens_name as ensName, capability, description, endpoint, price_tinybars as priceTinybars, created_at as createdAt FROM agent_services WHERE provider_name LIKE ? OR capability LIKE ? OR description LIKE ? ORDER BY created_at DESC`,
      )
      .all(like, like, like) as AgentService[];
  }
  get(id: string): AgentService | undefined {
    return this.#database
      .prepare(
        `SELECT id, provider_name as providerName, ens_name as ensName, capability, description, endpoint, price_tinybars as priceTinybars, created_at as createdAt FROM agent_services WHERE id = ?`,
      )
      .get(id) as AgentService | undefined;
  }
  selectForWorkflow(workflowId: string, serviceId: string): AgentService {
    const service = this.get(serviceId);
    if (!service) throw new Error("Service not found");
    this.#database
      .prepare(
        `INSERT INTO workflow_service_selections VALUES (?, ?) ON CONFLICT(workflow_id) DO UPDATE SET service_id = excluded.service_id`,
      )
      .run(workflowId, serviceId);
    return service;
  }
  selectedForWorkflow(workflowId: string): AgentService | undefined {
    return this.#database
      .prepare(
        `SELECT s.id, s.provider_name as providerName, s.ens_name as ensName, s.capability, s.description, s.endpoint, s.price_tinybars as priceTinybars, s.created_at as createdAt FROM agent_services s JOIN workflow_service_selections w ON w.service_id = s.id WHERE w.workflow_id = ?`,
      )
      .get(workflowId) as AgentService | undefined;
  }
  close(): void {
    this.#database.close();
  }
}
