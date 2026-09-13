import type { ReactNode } from "react";

type PageHeroProps = {
  label: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
};

export function PageHero({ label, title, description, children }: PageHeroProps) {
  return (
    <section className="fr-hero-frame border-b border-[rgba(255,255,255,0.06)]">
      <div className="fr-container pt-12 pb-24 lg:pt-16 lg:pb-32">
        <div className="max-w-4xl">
          <div className="flex flex-col gap-6">
            <p className="fr-label fr-animate-in">{label}</p>
            <h1 className="fr-display-xl fr-animate-in fr-delay-1">{title}</h1>
            {description && (
              <p className="fr-body-lg fr-ink-muted fr-animate-in fr-delay-2 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="fr-animate-in fr-delay-3 fr-actions-spaced">{children}</div>
          )}
        </div>
      </div>
    </section>
  );
}
