import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "link";
  className?: string;
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  if (variant === "link") {
    return (
      <Link href={href} className={`fr-link fr-body-sm ${className}`}>
        {children}
      </Link>
    );
  }

  const cls = variant === "primary" ? "fr-btn-primary" : "fr-btn-secondary";
  return (
    <Link href={href} className={`${cls} ${className}`}>
      {children}
    </Link>
  );
}

export function ButtonGroup({
  primary = { href: "/workflow", label: "Get started" },
  secondary = { href: "/services", label: "Browse services" },
  centered = false,
  className = "",
}: {
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  centered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`fr-actions ${centered ? "fr-actions--center" : ""} ${className}`}
    >
      <Button href={primary.href}>{primary.label}</Button>
      <Button href={secondary.href} variant="secondary">
        {secondary.label}
      </Button>
    </div>
  );
}
