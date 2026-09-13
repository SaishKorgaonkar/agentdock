import Link from "next/link";
import type { ReactNode } from "react";

import { footer } from "../../lib/landing-content";
import { SiteNav } from "./site-nav";

export function SiteFooter() {
  return (
    <footer className="fr-footer">
      <div className="fr-container">
        <div className="fr-footer-top">
          <div className="fr-footer-brand">
            <Link href="/" className="fr-body-sm font-semibold">
              AgentDock
            </Link>
            <p className="fr-micro fr-ink-muted mt-3 max-w-xs">{footer.tagline}</p>
            <p className="fr-micro fr-ink-muted mt-6">Testnet v0.1 · ETHOnline 2026</p>
          </div>
          <div className="fr-footer-columns">
            {footer.columns.map((col) => (
              <div key={col.title}>
                <h4 className="fr-caption mb-4">{col.title}</h4>
                <ul className="fr-footer-links">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="fr-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="fr-footer-bottom">
          <p className="fr-micro fr-ink-muted">
            No mocked payments, reports, or identity records.
          </p>
          <Link href="/workflow" className="fr-link fr-caption">
            Get started →
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="fr-page-bg min-h-screen overflow-x-hidden text-white">
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}
