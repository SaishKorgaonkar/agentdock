import Link from "next/link";

const timeline = [
  ["ENS authority", "Authorized", "risk-agent.agentdock.eth"],
  ["Payment quote", "Ready", "10,000 tinybars / Hedera testnet"],
  ["Risk report", "Waiting", "x402 service request"],
  ["Private policy", "Waiting", "Chainlink CRE confidential workflow"],
  ["Receipt", "Waiting", "Sepolia registry"],
];

export default function WorkflowPage() {
  return (
    <main className="min-h-screen bg-[#07110e] text-[#edf6ef]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-8 place-items-center rounded-full bg-[#b9ff61] text-sm text-[#07110e]">
            A
          </span>
          AgentDock
        </Link>
        <span className="font-mono text-xs text-white/45">WORKFLOW_001</span>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[1.45fr_.75fr] lg:px-10">
        <section className="border border-white/12 bg-[#0b1914] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[.2em] text-[#b9ff61]">
            Treasury risk assessment
          </p>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium tracking-[-.05em]">
                Bounded execution timeline
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Every step requires an explicit, auditable state transition.
              </p>
            </div>
            <span className="rounded-full bg-[#b9ff61]/10 px-3 py-1 font-mono text-xs text-[#b9ff61]">
              DRAFT
            </span>
          </div>
          <div className="mt-10 space-y-1">
            {timeline.map(([title, status, detail], index) => (
              <article
                key={title}
                className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border border-white/8 bg-[#08120f] p-4"
              >
                <span className="font-mono text-xs text-white/35">
                  0{index + 1}
                </span>
                <div>
                  <h2 className="text-sm font-medium">{title}</h2>
                  <p className="mt-1 text-xs text-white/40">{detail}</p>
                </div>
                <span
                  className={`font-mono text-[10px] ${status === "Authorized" ? "text-[#b9ff61]" : "text-white/35"}`}
                >
                  {status.toUpperCase()}
                </span>
              </article>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="border border-white/12 p-6">
            <p className="font-mono text-xs uppercase tracking-[.18em] text-white/40">
              Authority
            </p>
            <p className="mt-5 text-lg font-medium">Scoped and revocable</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-white/40">Capability</dt>
                <dd>purchase-risk-report</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/40">Network</dt>
                <dd>Hedera testnet</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/40">Policy</dt>
                <dd className="font-mono text-xs">sealed</dd>
              </div>
            </dl>
          </section>
          <button className="w-full rounded-full bg-[#b9ff61] px-5 py-3 text-sm font-semibold text-[#07110e]">
            Start authorized workflow
          </button>
          <p className="px-2 text-center text-xs leading-5 text-white/35">
            Requires configured ENS authority and testnet payment credentials.
          </p>
        </aside>
      </div>
    </main>
  );
}
