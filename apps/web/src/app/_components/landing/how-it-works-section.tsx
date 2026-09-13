import { howItWorks } from "../../../lib/landing-content";
import { SectionHeader } from "../ui/section-header";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="fr-section fr-spec-anchor fr-surface-band">
      <div className="fr-container">
        <SectionHeader
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          size="lg"
          align="center"
        />
        <ol className="fr-steps fr-section-body">
          {howItWorks.steps.map(({ step, title, body }) => (
            <li key={step} className="fr-step-card">
              <span className="fr-step-num">{step}</span>
              <h3 className="fr-headline fr-step-title">{title}</h3>
              <p className="fr-body fr-ink-muted fr-step-body">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
