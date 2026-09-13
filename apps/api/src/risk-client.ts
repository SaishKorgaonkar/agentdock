import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import {
  createClientHederaSigner,
  ExactHederaScheme,
  PrivateKey,
} from "@x402/hedera";

export type PaidRiskReport = Readonly<{
  requestId: string;
  chain: "evm";
  generatedAt: string;
  balances: readonly Readonly<{ address: string; wei: string }>[];
  totalWei: string;
  evidenceHash: string;
  signature: string;
  paymentReference?: string;
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

    const paymentReference =
      response.headers.get("PAYMENT-RESPONSE") ?? undefined;
    const report = (await response.json()) as Partial<PaidRiskReport>;
    if (
      report.requestId !== requestId ||
      report.chain !== "evm" ||
      typeof report.generatedAt !== "string" ||
      !Array.isArray(report.balances) ||
      typeof report.totalWei !== "string" ||
      typeof report.evidenceHash !== "string" ||
      typeof report.signature !== "string"
    ) {
      throw new RiskServiceError(
        "Risk service returned an invalid signed report",
      );
    }

    return { ...report, paymentReference } as PaidRiskReport;
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
    spendControls: {
      allowedAssets: [
        {
          network: "hedera:testnet",
          asset: "0.0.0",
          maxAmountPerPayment: "10000",
        },
      ],
    },
  });

  return new RiskReportClient(baseUrl, fetcher);
}
