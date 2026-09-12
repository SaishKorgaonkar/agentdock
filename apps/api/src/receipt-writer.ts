import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  namehash,
  stringToHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const receiptRegistryAbi = [
  {
    type: "function",
    name: "recordReceipt",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "receipt",
        type: "tuple",
        components: [
          { name: "workflowId", type: "bytes32" },
          { name: "agentNamehash", type: "bytes32" },
          { name: "serviceNamehash", type: "bytes32" },
          { name: "evidenceHash", type: "bytes32" },
          { name: "decisionHash", type: "bytes32" },
          { name: "hederaPaymentReference", type: "string" },
          { name: "status", type: "uint8" },
          { name: "recordedAt", type: "uint64" },
        ],
      },
    ],
    outputs: [],
  },
] as const;

export type ReceiptStatus = "COMPLETED" | "REQUIRES_APPROVAL" | "FAILED" | "EXPIRED";

export type ReceiptInput = Readonly<{
  workflowId: string;
  agentName: string;
  serviceName: string;
  evidenceHash: `0x${string}`;
  decisionHash: `0x${string}`;
  hederaPaymentReference: string;
  status: ReceiptStatus;
}>;

export class SepoliaReceiptWriter {
  readonly #address: `0x${string}`;
  readonly #walletClient;
  readonly #publicClient;

  constructor({
    rpcUrl,
    privateKey,
    registryAddress,
  }: {
    rpcUrl: string;
    privateKey: `0x${string}`;
    registryAddress: `0x${string}`;
  }) {
    const account = privateKeyToAccount(privateKey);
    this.#address = registryAddress;
    this.#walletClient = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });
    this.#publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
  }

  async write(input: ReceiptInput): Promise<`0x${string}`> {
    const hash = await this.#walletClient.writeContract({
      address: this.#address,
      abi: receiptRegistryAbi,
      functionName: "recordReceipt",
      args: [
        {
          workflowId: keccak256(stringToHex(input.workflowId)),
          agentNamehash: namehash(input.agentName),
          serviceNamehash: namehash(input.serviceName),
          evidenceHash: input.evidenceHash,
          decisionHash: input.decisionHash,
          hederaPaymentReference: input.hederaPaymentReference,
          status: receiptStatus(input.status),
          recordedAt: 0n,
        },
      ],
    });
    await this.#publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }
}

function receiptStatus(status: ReceiptStatus): 0 | 1 | 2 | 3 {
  switch (status) {
    case "COMPLETED":
      return 0;
    case "REQUIRES_APPROVAL":
      return 1;
    case "FAILED":
      return 2;
    case "EXPIRED":
      return 3;
  }
}
