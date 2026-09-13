import { faq } from "../../../lib/landing-content";
import { SectionHeader } from "../ui/section-header";

export function FaqSection() {
  return (
    <section id="faq" className="fr-section fr-spec-anchor fr-surface-band">
      <div className="fr-container max-w-3xl">
        <SectionHeader eyebrow={faq.eyebrow} title={faq.title} size="md" align="center" />
        <div className="fr-faq fr-section-body">
          {faq.items.map(({ q, a }) => (
            <details key={q}>
              <summary className="fr-body">{q}</summary>
              <p className="fr-body fr-ink-muted pb-6">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
