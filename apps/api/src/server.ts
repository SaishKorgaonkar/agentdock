import { EnsAuthorityAdapter } from "@agentdock/ens";

import { buildApp } from "./app.js";
import { SqliteArtifactStore } from "./artifact-store.js";
import { createPrivyAuthVerifier } from "./auth.js";
import { SepoliaReceiptWriter } from "./receipt-writer.js";
import { createHederaPaidRiskReportClient } from "./risk-client.js";
import { SqliteServiceStore } from "./service-store.js";
import {
  SqliteWorkflowStore,
  sqlitePathFromDatabaseUrl,
} from "./workflow-store.js";

const authVerifier =
  process.env.PRIVY_APP_ID && process.env.PRIVY_APP_SECRET
    ? createPrivyAuthVerifier(
        process.env.PRIVY_APP_ID,
        process.env.PRIVY_APP_SECRET,
      )
    : undefined;
const databasePath = process.env.DATABASE_URL
  ? sqlitePathFromDatabaseUrl(process.env.DATABASE_URL)
  : undefined;
const artifactStore = databasePath
  ? new SqliteArtifactStore(databasePath)
  : undefined;
const workflowStore = databasePath
  ? new SqliteWorkflowStore(databasePath)
  : undefined;
const serviceStore = databasePath
  ? new SqliteServiceStore(databasePath)
  : undefined;
const authorityReader =
  process.env.SEPOLIA_RPC_URL && process.env.ENS_RESOLVER_ADDRESS
    ? new EnsAuthorityAdapter({
        rpcUrl: process.env.SEPOLIA_RPC_URL,
        resolverAddress: process.env.ENS_RESOLVER_ADDRESS,
      })
    : undefined;
const riskReportRequester =
  process.env.RISK_API_URL &&
  process.env.HEDERA_OPERATOR_ID &&
  process.env.HEDERA_OPERATOR_KEY
    ? createHederaPaidRiskReportClient({
        baseUrl: process.env.RISK_API_URL,
        operatorId: process.env.HEDERA_OPERATOR_ID,
        operatorPrivateKey: process.env.HEDERA_OPERATOR_KEY,
      })
    : undefined;
const receiptWriter =
  process.env.SEPOLIA_RPC_URL &&
  process.env.SEPOLIA_OPERATOR_PRIVATE_KEY &&
  process.env.WORKFLOW_RECEIPT_REGISTRY_ADDRESS
    ? new SepoliaReceiptWriter({
        rpcUrl: process.env.SEPOLIA_RPC_URL,
        privateKey: process.env.SEPOLIA_OPERATOR_PRIVATE_KEY as `0x${string}`,
        registryAddress: process.env
          .WORKFLOW_RECEIPT_REGISTRY_ADDRESS as `0x${string}`,
      })
    : undefined;
const app = buildApp({
  artifactStore,
  authVerifier,
  authorityReader,
  receiptWriter,
  riskReportRequester,
  serviceStore,
  workflowStore,
});
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
