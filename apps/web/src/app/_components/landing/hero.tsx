import { hero, trustStrip } from "../../../lib/landing-content";
import { ButtonGroup } from "../ui/button";

export function Hero() {
  return (
    <section className="fr-hero">
      <div className="fr-hero-glow" aria-hidden="true" />
      <div className="fr-container fr-hero-content fr-hero-content--center">
        <div className="fr-hero-stack">
          <div className="fr-hero-copy fr-animate-in">
            <p className="fr-caption fr-ink-muted">{hero.eyebrow}</p>
            <h1 className="fr-display-xxl fr-animate-in fr-delay-1">
              {hero.headline[0]}
              <br />
              {hero.headline[1]}
            </h1>
            <p className="fr-body-lg fr-ink-muted fr-animate-in fr-delay-2">
              {hero.subhead}
            </p>
          </div>

          <div className="fr-hero-actions fr-animate-in fr-delay-3">
            <ButtonGroup
              primary={hero.primaryCta}
              secondary={hero.secondaryCta}
              centered
            />
          </div>

          <ul className="fr-hero-trust fr-trust-strip fr-trust-strip--center fr-animate-in fr-delay-3">
            {trustStrip.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
