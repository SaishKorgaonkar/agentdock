import Link from "next/link";

import WorkflowConsole from "./workflow-console";

export default function WorkflowPage() {
  return (
    <main className="min-h-screen bg-[#07110e] text-[#edf6ef]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-8 place-items-center rounded-full bg-[#b9ff61] text-sm text-[#07110e]">A</span>
          AgentDock
        </Link>
        <Link href="/services" className="font-mono text-xs text-white/55 hover:text-[#b9ff61]">SERVICES ↗</Link>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <WorkflowConsole />
        <div className="mt-6 grid gap-px border border-white/10 bg-white/10 md:grid-cols-4">
          {["ENS authority", "Hedera x402", "CRE policy", "Sepolia receipt"].map((item, index) => (
            <div key={item} className="bg-[#07110e] p-5"><p className="font-mono text-xs text-[#b9ff61]">0{index + 1}</p><p className="mt-8 text-sm font-medium">{item}</p></div>
          ))}
        </div>
      </div>
    </main>
  );
}
