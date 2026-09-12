import { readFile } from "node:fs/promises";

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const rpcUrl = process.env.SEPOLIA_RPC_URL;
const privateKey = process.env.SEPOLIA_OPERATOR_PRIVATE_KEY;

if (!rpcUrl || !privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error(
    "SEPOLIA_RPC_URL and a 32-byte 0x-prefixed SEPOLIA_OPERATOR_PRIVATE_KEY are required",
  );
}

const artifact = JSON.parse(
  await readFile(
    new URL(
      "../artifacts/contracts/WorkflowReceiptRegistry.sol/WorkflowReceiptRegistry.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as { abi: unknown; bytecode: `0x${string}` };
const account = privateKeyToAccount(privateKey);
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
});
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: [account.address],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });

console.log(
  JSON.stringify(
    {
      network: "sepolia",
      writer: account.address,
      contractAddress: receipt.contractAddress,
      transactionHash: hash,
      blockNumber: receipt.blockNumber.toString(),
    },
    null,
    2,
  ),
);
