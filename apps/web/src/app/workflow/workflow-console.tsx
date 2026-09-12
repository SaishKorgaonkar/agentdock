"use client";

import { useEffect, useState } from "react";

type Event = { sequence: number; from: string; to: string; occurredAt: string };
type Workflow = { id: string; status: string; events: Event[] };

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function WorkflowConsole() {
  const [workflow, setWorkflow] = useState<Workflow>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  async function loadWorkflows() {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}/v1/workflows`);
      if (!response.ok) return;
      const body = (await response.json()) as { workflows?: Workflow[] };
      setWorkflows(body.workflows ?? []);
    } catch {
      // The create action reports actionable errors; history is best-effort.
    }
  }

  useEffect(() => {
    void loadWorkflows();
  }, []);

  async function createWorkflow() {
    if (!apiUrl) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const id = `workflow-${crypto.randomUUID()}`;
      const response = await fetch(`${apiUrl}/v1/workflows`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error(`Workflow API returned HTTP ${response.status}`);
      setWorkflow((await response.json()) as Workflow);
      await loadWorkflows();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create workflow");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-white/12 bg-[#0b1914] p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.2em] text-[#b9ff61]">Workflow launcher</p>
          <h1 className="mt-5 text-3xl font-medium tracking-[-.05em]">Start a governed execution</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">A workflow begins as an immutable draft. ENS authority, payment, reports, policy evaluation, and receipts are recorded as discrete evidence-backed transitions.</p>
        </div>
        <button onClick={createWorkflow} disabled={loading} className="rounded-full bg-[#b9ff61] px-5 py-3 text-sm font-semibold text-[#07110e] disabled:opacity-50">
          {loading ? "Creating…" : "Create workflow"}
        </button>
      </div>
      {error && <p className="mt-6 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}
      {workflow && <div className="mt-8 border border-white/10 bg-[#08120f] p-5">
        <div className="flex items-center justify-between gap-4"><p className="font-mono text-xs text-white/45">{workflow.id}</p><span className="font-mono text-xs text-[#b9ff61]">{workflow.status}</span></div>
        <p className="mt-5 text-sm text-white/55">Next: attach an ENS-authorized agent and select a paid provider service.</p>
        {workflow.events.length > 0 && <ol className="mt-6 space-y-2">{workflow.events.map((event) => <li key={event.sequence} className="font-mono text-xs text-white/45">{event.sequence}. {event.from} → {event.to}</li>)}</ol>}
      </div>}
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="font-mono text-xs uppercase tracking-[.18em] text-white/40">Workflow history</p>
        {workflows.length ? <div className="mt-4 space-y-2">{workflows.map((item) => <button key={item.id} onClick={() => setWorkflow(item)} className="flex w-full items-center justify-between border border-white/10 bg-[#08120f] px-4 py-3 text-left hover:border-[#b9ff61]/60"><span className="font-mono text-xs text-white/55">{item.id}</span><span className="font-mono text-xs text-[#b9ff61]">{item.status}</span></button>)}</div> : <p className="mt-4 text-sm text-white/40">No workflows created yet.</p>}
      </div>
    </section>
  );
}
