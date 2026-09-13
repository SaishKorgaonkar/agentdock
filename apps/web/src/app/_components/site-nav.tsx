"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { navLinks } from "../../lib/landing-content";
import { AuthButton } from "./auth-button";

function LogoMark() {
  return (
    <span className="fr-logo-mark" aria-hidden="true">
      <span className="fr-logo-mark-inner" />
    </span>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fr-nav-shell ${scrolled ? "fr-nav-shell--scrolled" : ""}`}
    >
      <div className="fr-nav-inner">
        <Link href="/" className="fr-nav-brand">
          <LogoMark />
          AgentDock
        </Link>

        <nav className="fr-nav-links" aria-label="Main">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="fr-nav-link"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <AuthButton />

        <button
          type="button"
          className="fr-nav-menu-btn"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="fr-nav-mobile" aria-label="Mobile">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="fr-nav-mobile-link"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/workflow"
            className="fr-btn-primary mt-4 w-full justify-center"
            onClick={() => setOpen(false)}
          >
            Get started
          </Link>
        </nav>
      )}
    </header>
  );
}
