"use client";

import { useEffect, useState } from "react";

import { useAgentDockAuth } from "../_components/auth-provider";

type WorkflowEvent = {
  sequence: number;
  from: string;
  to: string;
  occurredAt: string;
};
type Workflow = { id: string; status: string; events: WorkflowEvent[] };
type AgentService = {
  id: string;
  providerName: string;
  ensName: string;
  capability: string;
  priceTinybars: string;
};
type RiskReport = {
  requestId: string;
  generatedAt?: string;
  totalWei?: string;
  evidenceHash: string;
  signature: string;
  paymentReference?: string;
};
type PolicyDecision = {
  status: "COMPLETED" | "REQUIRES_APPROVAL";
  decisionHash: string;
  simulator: "chainlink-cre-handlerInTee";
  receiptTransactionHash: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function responseError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }
}

export default function WorkflowConsole() {
  const { authenticated, configured, getAccessToken, login, ready } =
    useAgentDockAuth();
  const [workflow, setWorkflow] = useState<Workflow>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [services, setServices] = useState<AgentService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [agentName, setAgentName] = useState("agentdock.eth");
  const [selectedService, setSelectedService] = useState<AgentService>();
  const [address, setAddress] = useState(
    "0xA6CFC222852f77E48FD22201DBcf205ECC16eE31",
  );
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [report, setReport] = useState<RiskReport>();
  const [maximumWei, setMaximumWei] = useState("1000000000000000000");
  const [decision, setDecision] = useState<PolicyDecision>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function authHeaders(includeContentType = false) {
    const token = await getAccessToken();
    return {
      ...(includeContentType ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    };
  }

  async function load() {
    if (!apiUrl) return;
    try {
      const [workflowResponse, serviceResponse] = await Promise.all([
        authenticated
          ? fetch(`${apiUrl}/v1/workflows`, { headers: await authHeaders() })
          : Promise.resolve(undefined),
        fetch(`${apiUrl}/v1/services`),
      ]);
      if (workflowResponse?.ok)
        setWorkflows(
          ((await workflowResponse.json()) as { workflows?: Workflow[] })
            .workflows ?? [],
        );
      if (serviceResponse.ok)
        setServices(
          ((await serviceResponse.json()) as { services?: AgentService[] })
            .services ?? [],
        );
    } catch {
      setError("Unable to load AgentDock staging data.");
    }
  }

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
    // load intentionally refreshes when the Privy session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  async function createWorkflow() {
    if (!authenticated) return login();
    if (!apiUrl) return setError("NEXT_PUBLIC_API_URL is not configured.");
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/workflows`, {
        method: "POST",
        headers: await authHeaders(true),
        body: JSON.stringify({ id: `workflow-${crypto.randomUUID()}` }),
      });
      if (!response.ok)
        throw new Error(`Workflow API returned HTTP ${response.status}`);
      setWorkflow((await response.json()) as Workflow);
      setServiceId("");
      setSelectedService(undefined);
      setReport(undefined);
      setDecision(undefined);
      setPaymentConfirmed(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create workflow",
      );
    } finally {
      setLoading(false);
    }
  }

  async function selectService() {
    if (!apiUrl || !workflow || !serviceId) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(
        `${apiUrl}/v1/workflows/${workflow.id}/select-service`,
        {
          method: "POST",
          headers: await authHeaders(true),
          body: JSON.stringify({ serviceId }),
        },
      );
      if (!response.ok)
        throw new Error(
          await responseError(response, "Unable to attach service"),
        );
      const result = (await response.json()) as { service: AgentService };
      setSelectedService(result.service);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to select service",
      );
    } finally {
      setLoading(false);
    }
  }

  async function authorizeEns() {
    if (!apiUrl || !workflow || !agentName) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(
        `${apiUrl}/v1/workflows/${workflow.id}/authorize-ens`,
        {
          method: "POST",
          headers: await authHeaders(true),
          body: JSON.stringify({
            agentName,
            idempotencyKey: `ens-${workflow.id}`,
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          await responseError(response, "ENS authorization failed"),
        );
      setWorkflow((await response.json()) as Workflow);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to authorize ENS agent",
      );
    } finally {
      setLoading(false);
    }
  }

  async function openWorkflow(item: Workflow) {
    setError(undefined);
    if (!apiUrl) return setWorkflow(item);
    try {
      const response = await fetch(
        `${apiUrl}/v1/workflows/${item.id}/context`,
        {
          headers: await authHeaders(),
        },
      );
      if (!response.ok)
        throw new Error(
          await responseError(response, "Unable to restore workflow"),
        );
      const context = (await response.json()) as {
        workflow: Workflow;
        service?: AgentService;
        report?: RiskReport;
        decision?: PolicyDecision;
      };
      setWorkflow(context.workflow);
      setSelectedService(context.service);
      setServiceId(context.service?.id ?? "");
      setReport(context.report);
      setDecision(context.decision);
      setPaymentConfirmed(false);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to restore workflow",
      );
    }
  }

  async function evaluatePolicy() {
    if (!apiUrl || !workflow || !report) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(
        `${apiUrl}/v1/workflows/${workflow.id}/evaluate-policy`,
        {
          method: "POST",
          headers: await authHeaders(true),
          body: JSON.stringify({
            agentName,
            maximumWei,
            policyVersion: "agentdock-policy-v1",
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          await responseError(response, "Policy evaluation failed"),
        );
      const result = (await response.json()) as {
        workflow: Workflow;
        decision: PolicyDecision;
      };
      setWorkflow(result.workflow);
      setDecision(result.decision);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to evaluate policy",
      );
    } finally {
      setLoading(false);
    }
  }

  async function purchaseReport() {
    if (!apiUrl || !workflow || !selectedService || !paymentConfirmed) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(
        `${apiUrl}/v1/workflows/${workflow.id}/purchase-risk-report`,
        {
          method: "POST",
          headers: await authHeaders(true),
          body: JSON.stringify({
            requestId: `report-${crypto.randomUUID()}`,
            addresses: [address],
            paymentConfirmed,
          }),
        },
      );
      if (!response.ok)
        throw new Error(
          await responseError(response, "Paid report request failed"),
        );
      const result = (await response.json()) as {
        workflow: Workflow;
        report: RiskReport;
      };
      setWorkflow(result.workflow);
      setReport(result.report);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to purchase risk report",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fr-card-featured">
      <button
        type="button"
        onClick={createWorkflow}
        disabled={loading}
        className="fr-btn-primary disabled:opacity-50"
      >
        {!configured
          ? "Configure Privy to create"
          : !authenticated
            ? "Sign in to create"
            : loading
              ? "Working…"
              : "1. Create workflow"}
      </button>

      {error && <p className="fr-alert-error mt-5">{error}</p>}

      {workflow && (
        <div className="fr-console-panel mt-8 space-y-6">
          <div className="flex justify-between gap-4">
            <p className="fr-micro fr-ink-muted">{workflow.id}</p>
            <span className="fr-status-pill">{workflow.status}</span>
          </div>

          <div>
            <label className="fr-label">2. Select paid service</label>
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                className="fr-select"
              >
                <option value="">Choose a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.providerName}, {service.priceTinybars} tinybars
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={selectService}
                disabled={!serviceId || loading}
                className="fr-btn-secondary disabled:opacity-40"
              >
                Attach service
              </button>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
            <label className="fr-label">3. Authorize ENS agent</label>
            <div className="mt-3 flex flex-wrap gap-3">
              <input
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                className="fr-input"
              />
              <button
                type="button"
                onClick={authorizeEns}
                disabled={loading || !agentName}
                className="fr-btn-secondary disabled:opacity-40"
              >
                Verify authority
              </button>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
            <label className="fr-label">4. Purchase signed risk report</label>
            <p className="fr-body fr-ink-muted mt-2">
              This sends a real Hedera testnet x402 payment to the selected
              provider.
            </p>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              aria-label="EVM address to analyze"
              className="fr-input mt-3 w-full"
            />
            <label className="mt-4 flex items-start gap-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={paymentConfirmed}
                onChange={(event) => setPaymentConfirmed(event.target.checked)}
                className="mt-1"
              />
              <span>
                I authorize a payment of{" "}
                {selectedService?.priceTinybars ?? "10,000"} tinybars on Hedera
                testnet.
              </span>
            </label>
            <button
              type="button"
              onClick={purchaseReport}
              disabled={
                workflow.status !== "ACTIVE" ||
                !selectedService ||
                !paymentConfirmed ||
                loading
              }
              className="fr-btn-primary mt-4 disabled:opacity-40"
            >
              Pay and request report
            </button>
          </div>

          {report && (
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <p className="fr-label">Signed delivery evidence</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="fr-ink-muted">Evidence hash</dt>
                  <dd className="mt-1 break-all font-mono text-xs">
                    {report.evidenceHash}
                  </dd>
                </div>
                <div>
                  <dt className="fr-ink-muted">Total balance</dt>
                  <dd className="mt-1 font-mono text-xs">
                    {report.totalWei ?? "—"} wei
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="fr-ink-muted">Ed25519 signature</dt>
                  <dd className="mt-1 break-all font-mono text-xs">
                    {report.signature}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {report && (
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
              <p className="fr-label">5. Evaluate confidential policy</p>
              <p className="fr-body fr-ink-muted mt-2">
                Uses the same deterministic evaluator verified through Chainlink
                CRE handlerInTee simulation.
              </p>
              <input
                value={maximumWei}
                onChange={(event) => setMaximumWei(event.target.value)}
                aria-label="Maximum permitted balance in wei"
                className="fr-input mt-3 w-full"
              />
              <button
                type="button"
                onClick={evaluatePolicy}
                disabled={loading || !!decision}
                className="fr-btn-secondary mt-4 disabled:opacity-40"
              >
                Evaluate and write Sepolia receipt
              </button>
            </div>
          )}

          {decision && (
            <div className="border border-[#b9ff61]/30 bg-[#b9ff61]/10 p-5">
              <p className="fr-label">Terminal decision · {decision.status}</p>
              <p className="mt-3 break-all font-mono text-xs">
                {decision.decisionHash}
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${decision.receiptTransactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="fr-link mt-4 inline-block text-sm"
              >
                View confirmed Sepolia receipt ↗
              </a>
              <p className="fr-micro fr-ink-muted mt-3">
                CRE simulator verified · receipt written onchain
              </p>
            </div>
          )}

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6">
            <p className="fr-label">Evidence timeline</p>
            <ol className="mt-4 space-y-3">
              {workflow.events.map((event) => (
                <li key={event.sequence} className="fr-console-row">
                  <span className="fr-micro fr-ink-muted">
                    {String(event.sequence).padStart(2, "0")} · {event.from}
                  </span>
                  <span className="fr-caption">{event.to}</span>
                </li>
              ))}
            </ol>
            {!decision && (
              <p className="fr-body fr-ink-muted mt-4">
                Complete the policy step to produce the terminal Sepolia
                receipt.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6">
        <p className="fr-label">Workflow history</p>
        {workflows.length ? (
          <div className="mt-4 space-y-2">
            {workflows.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void openWorkflow(item)}
                className="fr-console-row"
              >
                <span className="fr-micro fr-ink-muted">{item.id}</span>
                <span className="fr-caption">{item.status}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="fr-body fr-ink-muted mt-4">No workflows created yet.</p>
        )}
      </div>
    </div>
  );
}
