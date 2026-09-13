import { PageShell } from "./_components/site-chrome";
import { CtaSection } from "./_components/landing/cta-section";
import { FaqSection } from "./_components/landing/faq-section";
import { Hero } from "./_components/landing/hero";
import { HowItWorksSection } from "./_components/landing/how-it-works-section";
import { IntegrationsSection } from "./_components/landing/integrations-section";
import { ProductOverviewSection } from "./_components/landing/product-overview-section";
import { StatementBand } from "./_components/landing/statement-band";
import { UseCaseSection } from "./_components/landing/use-case-section";

export default function Home() {
  return (
    <PageShell>
      <main>
        <Hero />
        <HowItWorksSection />
        <ProductOverviewSection />
        <IntegrationsSection />
        <UseCaseSection />
        <StatementBand />
        <FaqSection />
        <CtaSection />
      </main>
    </PageShell>
  );
}
