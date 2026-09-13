import type { ReactNode } from "react";

type SpotlightVariant = "violet" | "magenta" | "orange" | "coral";

const variants: Record<SpotlightVariant, string> = {
  violet: "fr-spotlight-violet",
  magenta: "fr-spotlight-magenta",
  orange: "fr-spotlight-orange",
  coral: "fr-spotlight-coral",
};

export function SpotlightCard({
  variant = "violet",
  children,
  className = "",
}: {
  variant?: SpotlightVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`fr-spotlight ${variants[variant]} ${className}`}>{children}</article>
  );
}
