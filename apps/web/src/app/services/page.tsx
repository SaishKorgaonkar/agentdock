import Link from "next/link";
import { PageShell } from "../_components/site-chrome";
import { PageHero } from "../_components/ui/page-hero";
import { PageSection } from "../_components/ui/page-section";
import { Button } from "../_components/ui/button";

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
    <PageShell>
      <main>
        <PageHero
          label="Agent service directory"
          title="Specialist agents. Verifiable delivery."
          description="Discover ENS-identified providers, pay per request over x402, and receive signed evidence instead of opaque outputs."
        >
          <Button href="/workflow" variant="primary">
            Launch workflow
          </Button>
        </PageHero>

        <PageSection bordered={false}>
          {services ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.id} className="fr-card flex flex-col">
                  <p className="fr-label !text-[10px]">{service.ensName}</p>
                  <h2 className="fr-headline mt-4">{service.providerName}</h2>
                  <p className="fr-micro fr-ink-muted mt-2">{service.capability}</p>
                  <p className="fr-body fr-ink-muted mt-4 min-h-16 flex-1">{service.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <span className="fr-micro fr-ink-muted">{service.priceTinybars} tinybars</span>
                    <Link href="/workflow" className="fr-link fr-body-sm font-semibold uppercase tracking-wider">
                      Launch →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="fr-card p-8">
              <p className="fr-body fr-ink-muted">
                Service directory is unavailable until NEXT_PUBLIC_API_URL is configured.
              </p>
            </div>
          )}
        </PageSection>
      </main>
    </PageShell>
  );
}
