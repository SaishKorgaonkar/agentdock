import { platformSection } from "../../../lib/landing-content";
import { productSpecs } from "../../../lib/product-specs";
import { SectionHeader } from "../ui/section-header";
import { SpotlightCard } from "../ui/spotlight-card";

export function ProductOverviewSection() {
  return (
    <section id="platform" className="fr-section fr-spec-anchor">
      <div className="fr-container">
        <SectionHeader
          eyebrow={platformSection.eyebrow}
          title={platformSection.title}
          description={platformSection.description}
          size="lg"
          align="center"
        />
        <div className="fr-section-body grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productSpecs.map(({ id, name, tagline, specs, spotlight }) => (
            <article key={id} id={id} className="fr-spec-anchor">
              {spotlight ? (
                <SpotlightCard variant={spotlight} className="h-full">
                  <h3 className="fr-headline">{name}</h3>
                  <p className="fr-caption mt-2 opacity-80">{tagline}</p>
                  <ul className="fr-spec-list mt-8">
                    {specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                </SpotlightCard>
              ) : (
                <div className="fr-card h-full">
                  <h3 className="fr-headline">{name}</h3>
                  <p className="fr-caption fr-ink-muted mt-2">{tagline}</p>
                  <ul className="fr-spec-list fr-ink-muted mt-8">
                    {specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
