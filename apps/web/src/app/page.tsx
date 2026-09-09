const integrations = [
  {
    name: "ENSv2",
    purpose: "Scoped agent identity",
    network: "Sepolia",
  },
  {
    name: "Hedera x402",
    purpose: "Pay-per-request services",
    network: "Testnet",
  },
  {
    name: "Chainlink CRE",
    purpose: "Confidential policy evaluation",
    network: "Staging",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#191b1a]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 lg:px-8">
        <div className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-[#191b1a] text-sm text-white">
            A
          </span>
          AgentDock
        </div>
        <span className="rounded-full border border-black/15 bg-white/60 px-3 py-1.5 text-xs font-medium text-black/60">
          Testnet build
        </span>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pt-28">
        <div>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#39705e]">
            Policy-controlled autonomous work
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-7xl">
            Let agents work.
            <br /> Keep authority bounded.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-black/60">
            AgentDock gives organizations a verifiable way to delegate paid work
            without exposing unrestricted credentials, budgets, or private
            policy.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#architecture"
              className="rounded-full bg-[#191b1a] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/75"
            >
              View execution flow
            </a>
            <span className="rounded-full border border-black/20 px-5 py-3 text-sm font-medium text-black/50">
              Repository setup pending
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-[#191b1a] p-3 shadow-2xl shadow-black/10">
          <div className="rounded-[1.4rem] border border-white/10 bg-[#222524] p-6 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm font-medium">Treasury risk assessment</p>
                <p className="mt-1 text-xs text-white/40">Workflow blueprint</p>
              </div>
              <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-xs text-amber-200">
                Phase 0
              </span>
            </div>
            <ol className="space-y-5 py-6">
              {[
                "Verify delegated agent identity",
                "Purchase independent risk report",
                "Evaluate private policy in a TEE",
                "Publish a minimal audit receipt",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-4 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-white/15 font-mono text-[10px] text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white/75">{step}</span>
                </li>
              ))}
            </ol>
            <div className="rounded-xl bg-white/[0.04] px-4 py-3 font-mono text-[11px] text-white/40">
              No mocked transactions or workflow results
            </div>
          </div>
        </div>
      </section>

      <section
        id="architecture"
        className="border-t border-black/10 bg-white/45"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/40">
                Execution layers
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Three integrations. One workflow.
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {integrations.map((integration, index) => (
              <article
                key={integration.name}
                className="rounded-2xl border border-black/10 bg-[#faf9f6] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-black/35">
                    0{index + 1}
                  </span>
                  <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-[11px] text-black/50">
                    {integration.network}
                  </span>
                </div>
                <h3 className="mt-10 text-xl font-semibold">
                  {integration.name}
                </h3>
                <p className="mt-2 text-sm text-black/55">
                  {integration.purpose}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
