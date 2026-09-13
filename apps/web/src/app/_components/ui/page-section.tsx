import type { ReactNode } from "react";
import { SectionHeader } from "./section-header";

type PageSectionProps = {
  children: ReactNode;
  bordered?: boolean;
  band?: "default" | "surface";
  className?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  size?: "xl" | "lg" | "md";
};

export function PageSection({
  children,
  bordered = true,
  band = "default",
  className = "",
  eyebrow,
  title,
  description,
  size = "lg",
}: PageSectionProps) {
  const bandClass = band === "surface" ? "fr-surface-band" : "";
  const borderClass = bordered ? "border-t border-[rgba(255,255,255,0.06)]" : "";

  return (
    <section className={`fr-section ${borderClass} ${bandClass} ${className}`}>
      <div className="fr-container">
        {(eyebrow || title) && (
          <SectionHeader eyebrow={eyebrow} title={title ?? ""} description={description} size={size} />
        )}
        <div className={eyebrow || title ? "fr-section-body" : undefined}>{children}</div>
      </div>
    </section>
  );
}
