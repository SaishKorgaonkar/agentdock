export type PaidRiskReport = Readonly<{
  requestId: string;
  evidenceHash: string;
  signature: string;
}>;

export class RiskServiceError extends Error {}

export class RiskReportClient {
  readonly #baseUrl: string;

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  async requestReport(
    requestId: string,
    addresses: readonly string[],
  ): Promise<PaidRiskReport> {
    const response = await fetch(`${this.#baseUrl}/v1/risk-reports`, {
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
