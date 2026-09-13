import { PageShell } from "../_components/site-chrome";
import { CustomerFlow } from "../_components/flows/customer-flow";
import { ProviderFlow } from "../_components/flows/provider-flow";
import { ButtonGroup } from "../_components/ui/button";
import { PageCta } from "../_components/ui/page-cta";
import { PageHero } from "../_components/ui/page-hero";
import { PageSection } from "../_components/ui/page-section";
import { SpotlightCard } from "../_components/ui/spotlight-card";

const architectureLayers = [
  {
    layer: "Agent reasoning",
    role: "Proposes actions within typed workflow templates",
    boundary: "No unrestricted keys or spending authority",
  },
  {
    layer: "Deterministic authorization",
    role: "ENS authority, payment verification, state machine",
    boundary: "Idempotency key + immutable event log per transition",
  },
  {
    layer: "Confidential evaluation",
    role: "CRE handlerInTee for private policy thresholds",
    boundary: "Simulator verified. Real enclave pending.",
  },
  {
    layer: "Public evidence",
    role: "Signed reports + Sepolia receipt registry",
    boundary: "Hashes and references only, never private policy",
  },
];

const integrations = [
  ["ENSv2 authority", "Sepolia write/read verified on agentdock.eth"],
  ["Hedera x402", "Testnet transfer and settlement verifier verified"],
  ["Signed reports", "Ed25519 engine with idempotent SQLite storage"],
  ["Chainlink CRE", "AWS Nitro simulator verified. Real TEE access pending."],
  ["Sepolia receipts", "WorkflowReceiptRegistry deployed and verified"],
  ["Staging platform", "Catalog API and workflow launcher on testnet"],
];

export default function HowItWorksPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          label="User flows"
          title="Customer and provider journeys, step by step"
          description="Every step uses real testnet infrastructure. User flows are documented here, separate from the product feature overview on the landing page."
        >
          <ButtonGroup primary={{ href: "/workflow", label: "Launch workflow" }} />
        </PageHero>

        <PageSection
          eyebrow="Architecture"
          title="Four-layer trust model"
          description="Each layer enforces a boundary between agent reasoning and verifiable execution."
          size="md"
        >
          <div className="grid gap-4 lg:grid-cols-4">
            {architectureLayers.map(({ layer, role, boundary }, i) =>
              i === 2 ? (
                <SpotlightCard key={layer} variant="violet">
                  <p className="fr-label !text-[10px] opacity-80">{layer}</p>
                  <p className="fr-body mt-4">{role}</p>
                  <p className="fr-micro mt-3 opacity-75">{boundary}</p>
                </SpotlightCard>
              ) : (
                <article key={layer} className="fr-use-case">
                  <p className="fr-label !text-[10px]">{layer}</p>
                  <p className="fr-body mt-4">{role}</p>
                  <p className="fr-micro fr-ink-muted mt-3">{boundary}</p>
                </article>
              ),
            )}
          </div>
        </PageSection>

        <PageSection
          eyebrow="Customer flow"
          title="From directory browse to on-chain receipt"
          description="Six stages from service discovery through private policy evaluation to Sepolia evidence."
          size="md"
          band="surface"
        >
          <div className="space-y-4">
            <CustomerFlow />
          </div>
        </PageSection>

        <PageSection
          eyebrow="Provider flow"
          title="Publish, price, payment, delivery, reputation"
          description="Provider earnings flow documented step by step."
          size="md"
        >
          <div className="space-y-4">
            <ProviderFlow />
          </div>
        </PageSection>

        <PageSection eyebrow="State machine" title="Every transition is idempotent and auditable" size="md">
          <div className="grid gap-8 lg:grid-cols-2">
            <p className="fr-body-lg">
              Invalid transitions are rejected. Each stage maps to a real integration boundary.
            </p>
            <div className="fr-code-block">
              <p className="fr-label !text-[10px]">Workflow lifecycle</p>
              <pre className="mt-4">{`DRAFT → ACTIVE → SERVICE_DISCOVERED
→ PAYMENT_QUOTED → PAYMENT_AUTHORIZED
→ PAYMENT_SETTLED → REPORT_RECEIVED
→ PRIVATE_EVALUATION_RUNNING
→ COMPLETED | REQUIRES_APPROVAL | FAILED | EXPIRED`}</pre>
            </div>
          </div>
        </PageSection>

        <PageSection eyebrow="Integration status" title="No fake claims" size="md" band="surface">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map(([title, status]) => (
              <article key={title} className="fr-use-case">
                <h3>{title}</h3>
                <p className="fr-body fr-ink-muted mt-2">{status}</p>
              </article>
            ))}
          </div>
        </PageSection>

        <PageCta
          label="Ready to try it"
          title="Run the customer or provider flow on testnet."
        />
      </main>
    </PageShell>
  );
}
