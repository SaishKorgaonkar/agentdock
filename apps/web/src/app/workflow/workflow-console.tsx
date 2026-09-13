"use client";

import { useEffect, useState } from "react";

type WorkflowEvent = { sequence: number; from: string; to: string; occurredAt: string };
type Workflow = { id: string; status: string; events: WorkflowEvent[] };
type AgentService = { id: string; providerName: string; ensName: string; capability: string; priceTinybars: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function WorkflowConsole() {
  const [workflow, setWorkflow] = useState<Workflow>();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [services, setServices] = useState<AgentService[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [agentName, setAgentName] = useState("agentdock.eth");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!apiUrl) return;
    try {
      const [workflowResponse, serviceResponse] = await Promise.all([fetch(`${apiUrl}/v1/workflows`), fetch(`${apiUrl}/v1/services`)]);
      if (workflowResponse.ok) setWorkflows(((await workflowResponse.json()) as { workflows?: Workflow[] }).workflows ?? []);
      if (serviceResponse.ok) setServices(((await serviceResponse.json()) as { services?: AgentService[] }).services ?? []);
    } catch { setError("Unable to load AgentDock staging data."); }
  }

  useEffect(() => { void load(); }, []);

  async function createWorkflow() {
    if (!apiUrl) return setError("NEXT_PUBLIC_API_URL is not configured.");
    setLoading(true); setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/workflows`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: `workflow-${crypto.randomUUID()}` }) });
      if (!response.ok) throw new Error(`Workflow API returned HTTP ${response.status}`);
      setWorkflow((await response.json()) as Workflow); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create workflow"); }
    finally { setLoading(false); }
  }

  async function selectService() {
    if (!apiUrl || !workflow || !serviceId) return;
    setLoading(true); setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/workflows/${workflow.id}/select-service`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ serviceId }) });
      if (!response.ok) throw new Error(`Service selection returned HTTP ${response.status}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to select service"); }
    finally { setLoading(false); }
  }

  async function authorizeEns() {
    if (!apiUrl || !workflow || !agentName) return;
    setLoading(true); setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/workflows/${workflow.id}/authorize-ens`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ agentName, idempotencyKey: `ens-${workflow.id}` }) });
      if (!response.ok) throw new Error(`ENS authorization returned HTTP ${response.status}`);
      setWorkflow((await response.json()) as Workflow); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to authorize ENS agent"); }
    finally { setLoading(false); }
  }

  return <section className="border border-white/12 bg-[#0b1914] p-6 sm:p-8">
    <p className="font-mono text-xs uppercase tracking-[.2em] text-[#b9ff61]">Workflow launcher</p>
    <h1 className="mt-5 text-3xl font-medium tracking-[-.05em]">Start a governed execution</h1>
    <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Create a draft, select a paid agent service, then attach ENS authority before any payment can occur.</p>
    <div className="mt-7 flex flex-wrap gap-3"><button onClick={createWorkflow} disabled={loading} className="rounded-full bg-[#b9ff61] px-5 py-3 text-sm font-semibold text-[#07110e] disabled:opacity-50">{loading ? "Working…" : "1. Create workflow"}</button></div>
    {error && <p className="mt-5 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
    {workflow && <div className="mt-8 space-y-5 border border-white/10 bg-[#08120f] p-5"><div className="flex justify-between gap-4"><p className="font-mono text-xs text-white/45">{workflow.id}</p><span className="font-mono text-xs text-[#b9ff61]">{workflow.status}</span></div><div><label className="font-mono text-xs text-white/45">2. SELECT PAID SERVICE</label><div className="mt-2 flex flex-wrap gap-3"><select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="min-w-64 border border-white/15 bg-[#07110e] px-3 py-3 text-sm"><option value="">Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.providerName} · {service.priceTinybars} tinybars</option>)}</select><button onClick={selectService} disabled={!serviceId || loading} className="rounded-full border border-[#b9ff61]/60 px-4 py-2 text-sm text-[#b9ff61] disabled:opacity-40">Attach service</button></div></div><div className="border-t border-white/10 pt-5"><label className="font-mono text-xs text-white/45">3. AUTHORIZE ENS AGENT</label><div className="mt-2 flex flex-wrap gap-3"><input value={agentName} onChange={(event) => setAgentName(event.target.value)} className="min-w-64 border border-white/15 bg-[#07110e] px-3 py-3 text-sm" /><button onClick={authorizeEns} disabled={loading || !agentName} className="rounded-full border border-[#b9ff61]/60 px-4 py-2 text-sm text-[#b9ff61] disabled:opacity-40">Verify authority</button></div></div><p className="text-sm text-white/45">4. x402 payment, 5. private policy, and 6. receipt unlock after authorization.</p></div>}
    <div className="mt-8 border-t border-white/10 pt-6"><p className="font-mono text-xs uppercase tracking-[.18em] text-white/40">Workflow history</p>{workflows.length ? <div className="mt-4 space-y-2">{workflows.map((item) => <button key={item.id} onClick={() => setWorkflow(item)} className="flex w-full justify-between border border-white/10 bg-[#08120f] px-4 py-3 text-left"><span className="font-mono text-xs text-white/55">{item.id}</span><span className="font-mono text-xs text-[#b9ff61]">{item.status}</span></button>)}</div> : <p className="mt-4 text-sm text-white/40">No workflows created yet.</p>}</div>
  </section>;
}
