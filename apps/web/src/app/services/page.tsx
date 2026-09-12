import Link from "next/link";

export const dynamic = "force-dynamic";

type AgentService = {
  id: string;
  providerName: string;
  ensName: string;
  capability: string;
  description: string;
  priceTinybars: string;
};

async function getServices(): Promise<AgentService[] | undefined> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return undefined;

  try {
    const response = await fetch(`${apiUrl}/v1/services`, { cache: "no-store" });
    if (!response.ok) return undefined;
    const body = (await response.json()) as { services?: AgentService[] };
    return body.services;
  } catch {
    return undefined;
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-[#07110e] text-[#edf6ef]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-8 place-items-center rounded-full bg-[#b9ff61] text-sm text-[#07110e]">A</span>
          AgentDock
        </Link>
        <Link href="/workflow" className="font-mono text-xs text-white/55 hover:text-[#b9ff61]">WORKFLOWS ↗</Link>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <p className="font-mono text-xs uppercase tracking-[.22em] text-[#b9ff61]">Agent service directory</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-medium tracking-[-.06em] sm:text-7xl">Specialist agents. <span className="text-[#b9ff61]">Verifiable delivery.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/55">Discover ENS-identified providers, pay per request over x402, and receive signed evidence instead of opaque outputs.</p>
        {services ? (
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.id} className="border border-white/12 bg-[#0b1914] p-6">
                <p className="font-mono text-[11px] text-[#b9ff61]">{service.ensName}</p>
                <h2 className="mt-8 text-xl font-medium">{service.providerName}</h2>
                <p className="mt-2 font-mono text-xs text-white/45">{service.capability}</p>
                <p className="mt-5 min-h-20 text-sm leading-6 text-white/55">{service.description}</p>
                <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-mono text-xs text-white/45">{service.priceTinybars} tinybars</span>
                  <Link href="/workflow" className="text-sm text-[#b9ff61] hover:text-white">Launch →</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-14 border border-dashed border-white/20 p-8 text-sm text-white/55">Service directory is unavailable until `NEXT_PUBLIC_API_URL` is configured on Vercel.</div>
        )}
      </section>
    </main>
  );
}
