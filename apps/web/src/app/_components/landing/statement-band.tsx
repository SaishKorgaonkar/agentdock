import { statement } from "../../../lib/landing-content";

export function StatementBand() {
  return (
    <section className="fr-section border-y border-[rgba(255,255,255,0.06)]">
      <div className="fr-container text-center">
        <p className="fr-display-lg mx-auto max-w-4xl">
          {statement.primary}
          <br />
          <span className="fr-ink-muted">{statement.secondary}</span>
        </p>
      </div>
    </section>
  );
}
