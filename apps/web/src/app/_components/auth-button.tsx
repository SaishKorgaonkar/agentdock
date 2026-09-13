"use client";

import Link from "next/link";

import { useAgentDockAuth } from "./auth-provider";

export function AuthButton() {
  const { authenticated, configured, identity, login, logout, ready } =
    useAgentDockAuth();

  if (!configured) {
    return (
      <Link href="/workflow" className="fr-btn-primary fr-nav-cta">
        Get started
      </Link>
    );
  }

  if (!ready) return <span className="fr-micro fr-ink-muted">Connecting…</span>;

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={login}
        className="fr-btn-primary fr-nav-cta"
      >
        Sign in
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      title={identity ? `Signed in as ${identity}` : "Signed in"}
      className="fr-btn-secondary fr-nav-cta"
    >
      {identity ? `${identity.slice(0, 9)}…` : "Sign out"}
    </button>
  );
}
