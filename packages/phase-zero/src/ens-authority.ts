import { createPublicClient, createWalletClient, http, namehash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const resolverAbi = [{ type: "function", name: "setText", stateMutability: "nonpayable", inputs: [{ name: "node", type: "bytes32" }, { name: "key", type: "string" }, { name: "value", type: "string" }], outputs: [] }] as const;
const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_OPERATOR_PRIVATE_KEY;
const name = process.env.ENS_PARENT_NAME;
const resolver = process.env.ENS_RESOLVER_ADDRESS as `0x${string}` | undefined;
const endpoint = process.env.RISK_API_URL;

if (!rpcUrl || !privateKey || !name || !resolver || !endpoint) throw new Error("SEPOLIA_RPC_URL, SEPOLIA_OPERATOR_PRIVATE_KEY, ENS_PARENT_NAME, ENS_RESOLVER_ADDRESS, and RISK_API_URL are required");
if (!/^0x[\da-fA-F]{64}$/.test(privateKey)) throw new Error("SEPOLIA_OPERATOR_PRIVATE_KEY must be a 32-byte 0x-prefixed key");

const account = privateKeyToAccount(privateKey as `0x${string}`);
const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });
const publicClient = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });
const values = {
  "agentdock.role": "risk-report-agent",
  "agentdock.capabilities": JSON.stringify(["purchase-risk-report"]),
  "agentdock.expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  "agentdock.endpoint": endpoint,
  "agentdock.x402Network": "hedera:testnet",
  "agentdock.policyHash": "0x0000000000000000000000000000000000000000000000000000000000000001",
};
const transactions: string[] = [];
for (const [key, value] of Object.entries(values)) {
  const hash = await wallet.writeContract({ address: resolver, abi: resolverAbi, functionName: "setText", args: [namehash(name), key, value] });
  await publicClient.waitForTransactionReceipt({ hash });
  transactions.push(hash);
}
console.log(JSON.stringify({ network: "sepolia", name, resolver, authority: values, transactions }, null, 2));
