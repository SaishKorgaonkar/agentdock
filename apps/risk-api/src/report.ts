import {
  createHash,
  createPrivateKey,
  sign,
  type KeyObject,
} from "node:crypto";

export type RiskReportRequest = Readonly<{
  requestId: string;
  addresses: readonly string[];
}>;

export type RiskReport = Readonly<{
  requestId: string;
  chain: "evm";
  generatedAt: string;
  balances: readonly Readonly<{ address: string; wei: string }>[];
  totalWei: string;
  evidenceHash: string;
  signature: string;
}>;

export interface EvmBalanceSource {
  getBalance(address: string): Promise<bigint>;
}

export class JsonRpcEvmBalanceSource implements EvmBalanceSource {
  readonly #rpcUrl: string;

  constructor(rpcUrl: string) {
    this.#rpcUrl = rpcUrl;
  }

  async getBalance(address: string): Promise<bigint> {
    const response = await fetch(this.#rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });

    if (!response.ok) {
      throw new Error(`Risk-data RPC returned HTTP ${response.status}`);
    }

    const payload = (await response.json()) as {
      error?: { message?: string };
      result?: unknown;
    };
    if (
      payload.error ||
      typeof payload.result !== "string" ||
      !/^0x[0-9a-fA-F]+$/.test(payload.result)
    ) {
      throw new Error(
        payload.error?.message ?? "Risk-data RPC returned an invalid balance",
      );
    }

    return BigInt(payload.result);
  }
}

export class Ed25519ReportGenerator {
  readonly #balanceSource: EvmBalanceSource;
  readonly #privateKey: KeyObject;
  readonly #now: () => string;

  constructor({
    balanceSource,
    privateKeyPem,
    now = () => new Date().toISOString(),
  }: {
    balanceSource: EvmBalanceSource;
    privateKeyPem: string;
    now?: () => string;
  }) {
    this.#balanceSource = balanceSource;
    this.#privateKey = createPrivateKey(privateKeyPem);
    this.#now = now;
  }

  async generate(request: RiskReportRequest): Promise<RiskReport> {
    validateRequest(request);

    const addresses = [
      ...new Set(request.addresses.map((address) => address.toLowerCase())),
    ].sort();
    const balances = await Promise.all(
      addresses.map(async (address) => ({
        address,
        wei: (await this.#balanceSource.getBalance(address)).toString(),
      })),
    );
    const totalWei = balances
      .reduce((total, balance) => total + BigInt(balance.wei), 0n)
      .toString();
    const unsigned = {
      requestId: request.requestId,
      chain: "evm" as const,
      generatedAt: this.#now(),
      balances,
      totalWei,
    };
    const payload = JSON.stringify(unsigned);
    const evidenceHash = `0x${createHash("sha256").update(payload).digest("hex")}`;
    const signature = sign(
      null,
      Buffer.from(payload),
      this.#privateKey,
    ).toString("base64");

    return { ...unsigned, evidenceHash, signature };
  }
}

function validateRequest(request: RiskReportRequest): void {
  if (!request.requestId.trim()) {
    throw new Error("Risk report requestId must not be empty");
  }

  if (request.addresses.length === 0) {
    throw new Error("Risk report requires at least one address");
  }

  if (
    request.addresses.some((address) => !/^0x[a-fA-F0-9]{40}$/.test(address))
  ) {
    throw new Error("Risk report addresses must be EVM addresses");
  }
}
