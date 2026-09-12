import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import {
  createClientHederaSigner,
  ExactHederaScheme,
  PrivateKey,
} from "@x402/hedera";

export type PaidRiskReport = Readonly<{
  requestId: string;
  evidenceHash: string;
  signature: string;
}>;

export class RiskServiceError extends Error {}

type FetchLike = typeof fetch;

export class RiskReportClient {
  readonly #baseUrl: string;
  readonly #fetch: FetchLike;

  constructor(baseUrl: string, fetcher: FetchLike = fetch) {
    this.#baseUrl = baseUrl;
    this.#fetch = fetcher;
  }

  async requestReport(
    requestId: string,
    addresses: readonly string[],
  ): Promise<PaidRiskReport> {
    const response = await this.#fetch(`${this.#baseUrl}/v1/risk-reports`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ requestId, addresses }),
    });

    if (!response.ok) {
      throw new RiskServiceError(
        `Risk service returned HTTP ${response.status}`,
      );
    }

    const report = (await response.json()) as Partial<PaidRiskReport>;
    if (
      report.requestId !== requestId ||
      typeof report.evidenceHash !== "string" ||
      typeof report.signature !== "string"
    ) {
      throw new RiskServiceError(
        "Risk service returned an invalid signed report",
      );
    }

    return report as PaidRiskReport;
  }
}

export function createHederaPaidRiskReportClient({
  baseUrl,
  operatorId,
  operatorPrivateKey,
}: {
  baseUrl: string;
  operatorId: string;
  operatorPrivateKey: string;
}): RiskReportClient {
  const signer = createClientHederaSigner(
    operatorId,
    PrivateKey.fromStringECDSA(operatorPrivateKey.replace(/^0x/, "")),
  );
  const fetcher = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: "hedera:testnet",
        client: new ExactHederaScheme(signer),
      },
    ],
  });

  return new RiskReportClient(baseUrl, fetcher);
}
