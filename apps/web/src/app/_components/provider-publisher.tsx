"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

type PublishedService = {
  id: string;
  providerName: string;
  ensName: string;
  capability?: string;
  priceTinybars?: string;
};
type ProviderSummary = {
  services: PublishedService[];
  deliveries: number;
  earnedTinybars: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function ProviderPublisher() {
  const { authenticated, getAccessToken, login, ready } = usePrivy();
  const [form, setForm] = useState({
    providerName: "",
    ensName: "",
    capability: "",
    description: "",
    endpoint: "",
    priceTinybars: "10000",
  });
  const [published, setPublished] = useState<PublishedService>();
  const [summary, setSummary] = useState<ProviderSummary>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function loadSummary() {
    if (!apiUrl || !authenticated) return;
    const token = await getAccessToken();
    const response = await fetch(`${apiUrl}/v1/provider/services`, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    if (response.ok) {
      const body = (await response.json()) as { summary: ProviderSummary };
      setSummary(body.summary);
    }
  }

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => void loadSummary(), 0);
    return () => window.clearTimeout(timeout);
    // loadSummary intentionally refreshes when the Privy session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!authenticated) return login();
    if (!apiUrl) return setError("NEXT_PUBLIC_API_URL is not configured.");

    setLoading(true);
    setError(undefined);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${apiUrl}/v1/services`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      const body = (await response.json()) as PublishedService & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          body.error ?? `Publishing returned HTTP ${response.status}`,
        );
      setPublished(body);
      await loadSummary();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to publish service",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fr-card-featured">
      <p className="fr-label">Provider console</p>
      <h2 className="fr-display-md mt-4">Publish a live service</h2>
      <p className="fr-body fr-ink-muted mt-3 max-w-2xl">
        The ENS authority must be active and authorize the advertised capability
        and public endpoint.
      </p>
      <form onSubmit={publish} className="mt-8 grid gap-5 sm:grid-cols-2">
        {(
          [
            ["providerName", "Provider name", "RiskLab"],
            ["ensName", "Provider ENS name", "risk-api.example.eth"],
            ["capability", "Capability", "treasury-risk-report"],
            [
              "endpoint",
              "Public x402 endpoint",
              "https://api.example/v1/report",
            ],
            ["priceTinybars", "Price in tinybars", "10000"],
          ] as const
        ).map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="fr-label">{label}</span>
            <input
              required
              value={form[key]}
              onChange={(event) => update(key, event.target.value)}
              placeholder={placeholder}
              className="fr-input mt-2 w-full"
            />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="fr-label">Description</span>
          <textarea
            required
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Explain what your service returns and how delivery is verified."
            className="fr-input mt-2 min-h-28 w-full"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="fr-btn-primary disabled:opacity-50"
          >
            {!authenticated
              ? "Sign in to publish"
              : loading
                ? "Validating…"
                : "Validate ENS and publish"}
          </button>
        </div>
      </form>
      {error && <p className="fr-alert-error mt-5">{error}</p>}
      {published && (
        <p className="mt-5 border border-[#b9ff61]/30 bg-[#b9ff61]/10 p-4 text-sm text-[#b9ff61]">
          Published {published.providerName} as {published.ensName}. Service ID:{" "}
          {published.id}
        </p>
      )}
      {authenticated && summary && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="fr-label">My provider account</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="fr-console-panel">
              <p className="fr-micro fr-ink-muted">Services</p>
              <p className="mt-2 text-2xl">{summary.services.length}</p>
            </div>
            <div className="fr-console-panel">
              <p className="fr-micro fr-ink-muted">Verified deliveries</p>
              <p className="mt-2 text-2xl">{summary.deliveries}</p>
            </div>
            <div className="fr-console-panel">
              <p className="fr-micro fr-ink-muted">Earned</p>
              <p className="mt-2 text-2xl">{summary.earnedTinybars}</p>
              <p className="fr-micro fr-ink-muted">tinybars</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {summary.services.map((service) => (
              <div key={service.id} className="fr-console-row">
                <span>
                  <strong>{service.providerName}</strong>
                  <span className="fr-micro fr-ink-muted ml-3">
                    {service.ensName}
                  </span>
                </span>
                <span className="fr-caption">
                  {service.priceTinybars} tinybars
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
