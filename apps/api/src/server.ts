import { EnsAuthorityAdapter } from "@agentdock/ens";

import { buildApp } from "./app.js";
import { createPrivyAuthVerifier } from "./auth.js";
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
const workflowStore = process.env.DATABASE_URL
  ? new SqliteWorkflowStore(sqlitePathFromDatabaseUrl(process.env.DATABASE_URL))
  : undefined;
const serviceStore = process.env.DATABASE_URL
  ? new SqliteServiceStore(sqlitePathFromDatabaseUrl(process.env.DATABASE_URL))
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
const app = buildApp({
  authVerifier,
  authorityReader,
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
