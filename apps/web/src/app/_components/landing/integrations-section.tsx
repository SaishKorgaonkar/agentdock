import { integrations } from "../../../lib/landing-content";
import { SectionHeader } from "../ui/section-header";

export function IntegrationsSection() {
  return (
    <section id="integrations" className="fr-section fr-spec-anchor border-t border-[rgba(255,255,255,0.06)]">
      <div className="fr-container">
        <SectionHeader
          eyebrow={integrations.eyebrow}
          title={integrations.title}
          size="lg"
          align="center"
        />
        <div className="fr-section-body grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.items.map(({ name, status, detail }) => (
            <article key={name} className="fr-card">
              <div className="flex items-center justify-between gap-3">
                <h3 className="fr-headline">{name}</h3>
                <span className="fr-status-pill">{status}</span>
              </div>
              <p className="fr-body fr-ink-muted mt-4">{detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
