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

import { optionalEnv, requiredEnv } from "./env.js";

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

const rpcUrl = requiredEnv("SEPOLIA_RPC_URL");
const parentName = requiredEnv("ENS_PARENT_NAME");
const configuredResolver = requiredEnv("ENS_RESOLVER_ADDRESS");
const privateKey = requiredEnv("SEPOLIA_OPERATOR_PRIVATE_KEY");
const recordKey = optionalEnv("ENS_PROOF_RECORD_KEY", "agentdock.phase0");
const recordValue = optionalEnv(
  "ENS_PROOF_RECORD_VALUE",
  "agentdock-sepolia-proof-v1",
);

if (!isAddress(configuredResolver)) {
  throw new Error("ENS_RESOLVER_ADDRESS must be a valid Ethereum address");
}

if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
  throw new Error(
    "SEPOLIA_OPERATOR_PRIVATE_KEY must be a 32-byte 0x-prefixed key",
  );
}

const account = privateKeyToAccount(privateKey as Hex);
const resolver = configuredResolver as Address;
const node = namehash(parentName);
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
});

const transactionHash = await walletClient.writeContract({
  address: resolver,
  abi: resolverAbi,
  functionName: "setText",
  args: [node, recordKey, recordValue],
});
const receipt = await publicClient.waitForTransactionReceipt({
  hash: transactionHash,
});

if (receipt.status !== "success") {
  throw new Error(`ENS resolver write failed: ${transactionHash}`);
}

const resolvedValue = await publicClient.readContract({
  address: resolver,
  abi: resolverAbi,
  functionName: "text",
  args: [node, recordKey],
});

if (resolvedValue !== recordValue) {
  throw new Error(
    "ENS resolver read did not return the value that was written",
  );
}

console.log(
  JSON.stringify(
    {
      network: "sepolia",
      name: parentName,
      node,
      resolver,
      recordKey,
      transactionHash,
      blockNumber: receipt.blockNumber.toString(),
      resolvedValue,
    },
    null,
    2,
  ),
);
