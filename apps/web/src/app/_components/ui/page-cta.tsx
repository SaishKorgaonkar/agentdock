import type { ReactNode } from "react";
import { ButtonGroup } from "./button";

type PageCtaProps = {
  label?: string;
  title: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  children?: ReactNode;
};

export function PageCta({ label, title, primary, secondary, children }: PageCtaProps) {
  return (
    <section className="fr-section border-t border-[rgba(255,255,255,0.06)]">
      <div className="fr-container flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div>
          {label && <p className="fr-label">{label}</p>}
          <h2 className="fr-display-md mt-4 max-w-xl">{title}</h2>
        </div>
        {children ?? <ButtonGroup primary={primary} secondary={secondary} />}
      </div>
    </section>
  );
}
