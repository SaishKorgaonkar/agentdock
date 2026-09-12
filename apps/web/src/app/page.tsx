const stages = [
  ["01", "ENS authority", "Scoped agent identity checked"],
  ["02", "Hedera x402", "Specialist report purchased"],
  ["03", "CRE policy", "Private threshold evaluated"],
  ["04", "Sepolia receipt", "Minimal public evidence recorded"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07110e] text-[#edf6ef]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-full bg-[#b9ff61] text-sm text-[#07110e]">
            A
          </span>
          AgentDock
        </div>
        <div className="hidden items-center gap-7 text-sm text-white/55 md:flex">
          <a href="#workflow" className="transition hover:text-white">
            Workflow
          </a>
          <a href="#security" className="transition hover:text-white">
            Security
          </a>
          <a
            href="https://github.com/SaishKorgaonkar/agentdock"
            className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:bg-white hover:text-[#07110e]"
          >
            GitHub
          </a>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:pb-36 lg:pt-28">
        <div className="absolute inset-x-0 top-0 -z-0 h-full bg-[radial-gradient(circle_at_68%_20%,rgba(109,183,91,.22),transparent_27%),radial-gradient(circle_at_20%_70%,rgba(39,97,71,.26),transparent_32%)]" />
        <div className="relative z-10">
          <p className="mb-7 font-mono text-xs uppercase tracking-[.24em] text-[#b9ff61]">
            Policy-controlled agent execution
          </p>
          <h1 className="max-w-4xl text-5xl font-medium leading-[.96] tracking-[-.065em] sm:text-7xl lg:text-[5.6rem]">
            Let agents act.
            <br />
            Keep authority <span className="text-[#b9ff61]">bounded.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-white/60">
            AgentDock lets organizations buy specialist intelligence with AI
            agents—without exposing unrestricted keys, spending power, or
            private policy.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#workflow"
              className="rounded-full bg-[#b9ff61] px-6 py-3 text-sm font-semibold text-[#07110e] transition hover:bg-[#d4ff98]"
            >
              Explore the workflow
            </a>
            <span className="rounded-full border border-white/15 px-5 py-3 font-mono text-xs text-white/55">
              Testnet / v0.1
            </span>
          </div>
        </div>

        <div className="relative z-10 border border-white/15 bg-[#0b1914]/90 p-3 shadow-2xl shadow-black/30">
          <div className="border border-white/10 bg-[#08120f] p-5 sm:p-7">
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-base font-medium">
                  Treasury risk assessment
                </p>
                <p className="mt-1 font-mono text-xs text-white/40">
                  WORKFLOW_001 / ACTIVE
                </p>
              </div>
              <span className="size-2 rounded-full bg-[#b9ff61] shadow-[0_0_16px_#b9ff61]" />
            </div>
            <div className="space-y-5 py-7">
              {stages.map(([number, title, detail], index) => (
                <div
                  key={title}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3"
                >
                  <span className="font-mono text-xs text-white/35">
                    {number}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs text-white/40">{detail}</p>
                  </div>
                  <span
                    className={`size-2 rounded-full ${index === 0 ? "bg-[#b9ff61]" : "bg-white/20"}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[11px] text-white/40">
              <span>PRIVATE INPUTS: SEALED</span>
              <span>RECEIPT: PENDING</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-y border-white/10 bg-[#b9ff61] text-[#07110e]"
      >
        <div className="mx-auto grid max-w-7xl gap-7 px-6 py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
          <p className="max-w-sm text-3xl font-medium leading-tight tracking-[-.04em]">
            One constrained workflow. Four verifiable boundaries.
          </p>
          <div className="grid gap-px bg-[#07110e]/20 sm:grid-cols-2">
            {stages.map(([number, title, detail]) => (
              <article key={title} className="bg-[#b9ff61] p-6">
                <p className="font-mono text-xs opacity-55">{number}</p>
                <h2 className="mt-12 text-xl font-medium tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm opacity-65">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="security"
        className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-3 lg:px-10"
      >
        <p className="font-mono text-xs uppercase tracking-[.2em] text-[#b9ff61]">
          Designed for trust
        </p>
        <h2 className="text-3xl font-medium leading-tight tracking-[-.045em] sm:text-4xl">
          The model proposes. Deterministic systems authorize.
        </h2>
        <p className="text-base leading-7 text-white/55">
          Scoped ENS authority can expire or be revoked. Hedera handles
          paid-service settlement. CRE keeps thresholds private. A public
          receipt contains evidence—not secrets.
        </p>
      </section>
    </main>
  );
}
