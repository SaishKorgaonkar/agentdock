import { useCase } from "../../../lib/landing-content";
import { Button } from "../ui/button";
import { SpotlightCard } from "../ui/spotlight-card";

export function UseCaseSection() {
  return (
    <section className="fr-section border-t border-[rgba(255,255,255,0.06)]">
      <div className="fr-container">
        <SpotlightCard variant="violet" className="text-center">
          <p className="fr-caption opacity-80">{useCase.eyebrow}</p>
          <h2 className="fr-display-md mx-auto mt-4 max-w-2xl">{useCase.title}</h2>
          <p className="fr-body-lg mx-auto mt-6 max-w-3xl opacity-90">{useCase.body}</p>
          <div className="mt-12 flex justify-center lg:mt-14">
            <Button href={useCase.cta.href}>{useCase.cta.label}</Button>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
