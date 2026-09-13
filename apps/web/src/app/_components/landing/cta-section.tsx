import { finalCta } from "../../../lib/landing-content";
import { ButtonGroup } from "../ui/button";

export function CtaSection() {
  return (
    <section className="fr-section border-t border-[rgba(255,255,255,0.06)]">
      <div className="fr-container fr-cta-panel fr-cta-panel--center">
        <div className="text-center">
          <h2 className="fr-display-md mx-auto max-w-lg">{finalCta.title}</h2>
          <p className="fr-body-lg fr-ink-muted mx-auto mt-6 max-w-md">{finalCta.subhead}</p>
        </div>
        <ButtonGroup
          primary={finalCta.primary}
          secondary={finalCta.secondary}
          centered
          className="pt-2"
        />
      </div>
    </section>
  );
}
