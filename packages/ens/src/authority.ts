import {
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  namehash,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const authorityKeys = {
  role: "agentdock.role",
  capabilities: "agentdock.capabilities",
  expiresAt: "agentdock.expiresAt",
  endpoint: "agentdock.endpoint",
  x402Network: "agentdock.x402Network",
  policyHash: "agentdock.policyHash",
  revokedAt: "agentdock.revokedAt",
} as const;

const resolverAbi = [
  {
    type: "function",
    name: "setText",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "text",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export type AgentAuthority = Readonly<{
  role: string;
  capabilities: readonly string[];
  expiresAt: string;
  endpoint: string;
  x402Network: string;
  policyHash: Hex;
  revokedAt?: string;
}>;

export type EnsAuthorityAdapterConfig = Readonly<{
  rpcUrl: string;
  resolverAddress: string;
  privateKey?: string;
}>;

export function isAuthorityActive(
  authority: AgentAuthority,
  now = new Date(),
): boolean {
  return (
    !authority.revokedAt &&
    new Date(authority.expiresAt).getTime() > now.getTime()
  );
}

export function parseAuthorityRecords(
  records: Readonly<
    Record<(typeof authorityKeys)[keyof typeof authorityKeys], string>
  >,
): AgentAuthority | undefined {
  if (
    !records[authorityKeys.role] &&
    !records[authorityKeys.capabilities] &&
    !records[authorityKeys.expiresAt] &&
    !records[authorityKeys.endpoint] &&
    !records[authorityKeys.x402Network] &&
    !records[authorityKeys.policyHash]
  ) {
    return undefined;
  }

  let capabilities: unknown;
  try {
    capabilities = JSON.parse(records[authorityKeys.capabilities]);
  } catch {
    throw new Error("ENS authority capabilities must be a JSON array");
  }

  const authority: AgentAuthority = {
    role: records[authorityKeys.role],
    capabilities: validateCapabilities(capabilities),
    expiresAt: records[authorityKeys.expiresAt],
    endpoint: records[authorityKeys.endpoint],
    x402Network: records[authorityKeys.x402Network],
    policyHash: records[authorityKeys.policyHash] as Hex,
    ...(records[authorityKeys.revokedAt]
      ? { revokedAt: records[authorityKeys.revokedAt] }
      : {}),
  };

  validateAuthority(authority);
  return authority;
}

export class EnsAuthorityAdapter {
  readonly #resolver: Address;
  readonly #publicClient: ReturnType<typeof createPublicClient>;
  readonly #privateKey?: Hex;
  readonly #rpcUrl: string;

  constructor(config: EnsAuthorityAdapterConfig) {
    if (!isAddress(config.resolverAddress)) {
      throw new Error("ENS resolver address must be a valid Ethereum address");
    }

    this.#resolver = config.resolverAddress;
    this.#rpcUrl = config.rpcUrl;
    this.#publicClient = createPublicClient({
      chain: sepolia,
      transport: http(config.rpcUrl),
    });

    if (config.privateKey) {
      if (!/^0x[a-fA-F0-9]{64}$/.test(config.privateKey)) {
        throw new Error(
          "ENS private key must be a 32-byte 0x-prefixed hex value",
        );
      }

      this.#privateKey = config.privateKey as Hex;
    }
  }

  async readAuthority(name: string): Promise<AgentAuthority | undefined> {
    const node = namehash(name);
    const [
      role,
      capabilities,
      expiresAt,
      endpoint,
      x402Network,
      policyHash,
      revokedAt,
    ] = await Promise.all([
      this.#readText(node, authorityKeys.role),
      this.#readText(node, authorityKeys.capabilities),
      this.#readText(node, authorityKeys.expiresAt),
      this.#readText(node, authorityKeys.endpoint),
      this.#readText(node, authorityKeys.x402Network),
      this.#readText(node, authorityKeys.policyHash),
      this.#readText(node, authorityKeys.revokedAt),
    ]);

    return parseAuthorityRecords({
      [authorityKeys.role]: role,
      [authorityKeys.capabilities]: capabilities,
      [authorityKeys.expiresAt]: expiresAt,
      [authorityKeys.endpoint]: endpoint,
      [authorityKeys.x402Network]: x402Network,
      [authorityKeys.policyHash]: policyHash,
      [authorityKeys.revokedAt]: revokedAt,
    });
  }

  async publishAuthority(
    name: string,
    authority: AgentAuthority,
  ): Promise<readonly Hex[]> {
    validateAuthority(authority);
    const values = authorityToRecords(authority);
    return this.#writeRecords(name, values);
  }

  async revokeAuthority(
    name: string,
    revokedAt = new Date(),
  ): Promise<readonly Hex[]> {
    if (Number.isNaN(revokedAt.getTime())) {
      throw new Error("Revocation timestamp must be valid");
    }

    return this.#writeRecords(name, {
      [authorityKeys.revokedAt]: revokedAt.toISOString(),
    });
  }

  async #writeRecords(
    name: string,
    records: Readonly<Record<string, string>>,
  ): Promise<readonly Hex[]> {
    if (!this.#privateKey) {
      throw new Error("ENS private key is required to write authority records");
    }

    const walletClient = createWalletClient({
      account: privateKeyToAccount(this.#privateKey),
      chain: sepolia,
      transport: http(this.#rpcUrl),
    });
    const node = namehash(name);
    const transactionHashes: Hex[] = [];

    for (const [key, value] of Object.entries(records)) {
      const hash = await walletClient.writeContract({
        address: this.#resolver,
        abi: resolverAbi,
        functionName: "setText",
        args: [node, key, value],
      });
      const receipt = await this.#publicClient.waitForTransactionReceipt({
        hash,
      });

      if (receipt.status !== "success") {
        throw new Error(`ENS resolver write failed: ${hash}`);
      }

      transactionHashes.push(hash);
    }

    return transactionHashes;
  }

  async #readText(node: Hex, key: string): Promise<string> {
    return this.#publicClient.readContract({
      address: this.#resolver,
      abi: resolverAbi,
      functionName: "text",
      args: [node, key],
    });
  }
}

function authorityToRecords(authority: AgentAuthority): Record<string, string> {
  return {
    [authorityKeys.role]: authority.role,
    [authorityKeys.capabilities]: JSON.stringify(authority.capabilities),
    [authorityKeys.expiresAt]: authority.expiresAt,
    [authorityKeys.endpoint]: authority.endpoint,
    [authorityKeys.x402Network]: authority.x402Network,
    [authorityKeys.policyHash]: authority.policyHash,
    ...(authority.revokedAt
      ? { [authorityKeys.revokedAt]: authority.revokedAt }
      : {}),
  };
}

function validateAuthority(authority: AgentAuthority): void {
  if (!authority.role.trim()) {
    throw new Error("ENS authority role must not be empty");
  }

  validateCapabilities(authority.capabilities);

  if (Number.isNaN(new Date(authority.expiresAt).getTime())) {
    throw new Error("ENS authority expiry must be a valid timestamp");
  }

  try {
    new URL(authority.endpoint);
  } catch {
    throw new Error("ENS authority endpoint must be a valid URL");
  }

  if (!authority.x402Network.trim()) {
    throw new Error("ENS authority x402 network must not be empty");
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(authority.policyHash)) {
    throw new Error(
      "ENS authority policy hash must be a 32-byte 0x-prefixed hex value",
    );
  }

  if (
    authority.revokedAt &&
    Number.isNaN(new Date(authority.revokedAt).getTime())
  ) {
    throw new Error("ENS authority revocation time must be a valid timestamp");
  }
}

function validateCapabilities(value: unknown): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("ENS authority capabilities must be a non-empty array");
  }

  if (
    value.some(
      (capability) => typeof capability !== "string" || !capability.trim(),
    )
  ) {
    throw new Error(
      "ENS authority capabilities must contain non-empty strings",
    );
  }

  return Object.freeze([...value]);
}
