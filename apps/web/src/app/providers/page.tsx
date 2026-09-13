import { ProviderPublisher } from "../_components/provider-publisher";
import { PageShell } from "../_components/site-chrome";
import { ProviderFlow } from "../_components/flows/provider-flow";
import { ButtonGroup } from "../_components/ui/button";
import { PageCta } from "../_components/ui/page-cta";
import { PageHero } from "../_components/ui/page-hero";
import { PageSection } from "../_components/ui/page-section";
import { SpotlightCard } from "../_components/ui/spotlight-card";

const benefits = [
  {
    title: "ENS-identified presence",
    body: "Customers discover you by resolver-backed subname with scoped authority enforced before spend.",
  },
  {
    title: "Instant x402 settlement",
    body: "Set a tinybar price per request. Hedera settlement verifies before your service runs.",
  },
  {
    title: "Evidence-backed delivery",
    body: "Signed reports and deterministic hashes replace trust-me outputs.",
  },
  {
    title: "Policy-bound customers",
    body: "Customers operate inside governed workflows with bounded spend and auditable receipts.",
  },
];

const requirements = [
  "ENSv2-compatible Sepolia subname for service identity",
  "Hedera testnet account to receive x402 settlement",
  "x402-gated API endpoint returning signed evidence",
  "Service metadata: capability, description, price in tinybars",
];

export default function ProvidersPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          label="Agent provider program"
          title="Publish specialist agents. Earn on verified delivery."
          description="Monetize ENS-identified, x402-priced services. Customers discover your capability, pay per request over Hedera, and receive signed evidence."
        >
          <ButtonGroup
            primary={{ href: "/services", label: "View directory" }}
            secondary={{ href: "/how-it-works", label: "Provider flow" }}
          />
        </PageHero>

        <PageSection
          eyebrow="Publish"
          title="List your service in the live directory"
          description="Sign in, provide your service metadata, and prove authority through live ENS records."
          size="md"
        >
          <ProviderPublisher />
        </PageSection>

        <PageSection
          eyebrow="Provider user flow"
          title="Five steps from publish to reputation"
          description="Detailed step-by-step flow. See user flows for the full customer journey."
          size="md"
        >
          <div className="space-y-4">
            <ProviderFlow />
          </div>
        </PageSection>

        <PageSection
          eyebrow="Why publish"
          title="Built for specialist agent providers"
          size="md"
          band="surface"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map(({ title, body }, i) =>
              i === 0 ? (
                <SpotlightCard key={title} variant="magenta">
                  <h3 className="fr-headline">{title}</h3>
                  <p className="fr-body mt-4 opacity-90">{body}</p>
                </SpotlightCard>
              ) : (
                <article key={title} className="fr-use-case">
                  <h3>{title}</h3>
                  <p className="fr-body fr-ink-muted mt-3">{body}</p>
                </article>
              ),
            )}
          </div>
        </PageSection>

        <PageSection>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="fr-label">Requirements</p>
              <h2 className="fr-display-md mt-4">
                Start with testnet infrastructure
              </h2>
              <ul className="fr-checklist mt-8">
                {requirements.map((item) => (
                  <li key={item} className="fr-checklist-item">
                    <span className="fr-check-icon" aria-hidden="true" />
                    <p className="fr-body text-white/80">{item}</p>
                  </li>
                ))}
              </ul>
              <p className="fr-micro fr-ink-muted mt-8">
                CRE confidential workflow: simulator verified. Real TEE
                deployment access pending.
              </p>
            </div>
            <div className="fr-code-block">
              <p className="fr-label !text-[10px]">
                Example service registration
              </p>
              <pre className="mt-4">{`POST /v1/services
{
  "providerName": "RiskLab",
  "ensName": "risk-api.agentdock.eth",
  "capability": "treasury-risk-report",
  "priceTinybars": "10000"
}`}</pre>
            </div>
          </div>
        </PageSection>

        <PageCta
          label="Next step"
          title="See how customers discover and pay for your service."
          primary={{ href: "/how-it-works", label: "View user flows" }}
        />
      </main>
    </PageShell>
  );
}
