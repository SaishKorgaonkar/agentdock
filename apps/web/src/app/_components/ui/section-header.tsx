import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  size?: "xl" | "lg" | "md";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  size = "lg",
}: SectionHeaderProps) {
  const sizeClass =
    size === "xl" ? "fr-display-xl" : size === "md" ? "fr-display-md" : "fr-display-lg";
  const alignClass = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";

  return (
    <div className={`fr-section-header ${alignClass}`}>
      {eyebrow && (
        <p className={`fr-label ${align === "center" ? "mx-auto w-fit" : ""}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={sizeClass}>{title}</h2>
      {description && (
        <p
          className={`fr-body-lg fr-ink-muted ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
