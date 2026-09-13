"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";

function PrivyAuthButton() {
  const { authenticated, login, logout, ready, user } = usePrivy();
  const identity = user?.email?.address ?? user?.wallet?.address;

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
      onClick={logout}
      title={identity ? `Signed in as ${identity}` : "Signed in"}
      className="fr-btn-secondary fr-nav-cta"
    >
      {identity ? `${identity.slice(0, 9)}…` : "Sign out"}
    </button>
  );
}

export function AuthButton() {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return (
      <Link href="/workflow" className="fr-btn-primary fr-nav-cta">
        Get started
      </Link>
    );
  }

  return <PrivyAuthButton />;
}
