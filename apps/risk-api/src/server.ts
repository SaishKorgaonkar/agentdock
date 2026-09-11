import { buildApp } from "./app.js";
import { Ed25519ReportGenerator, JsonRpcEvmBalanceSource } from "./report.js";
import { SqliteReportStore } from "./report-store.js";

const x402 = process.env.HEDERA_X402_RECIPIENT_ID
  ? {
      facilitatorUrl:
        process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator",
      payTo: process.env.HEDERA_X402_RECIPIENT_ID,
      priceTinybars: process.env.HEDERA_X402_PRICE_TINYBARS ?? "10000",
    }
  : undefined;
const reportGenerator =
  process.env.RISK_DATA_RPC_URL && process.env.REPORT_SIGNING_PRIVATE_KEY
    ? new Ed25519ReportGenerator({
        balanceSource: new JsonRpcEvmBalanceSource(
          process.env.RISK_DATA_RPC_URL,
        ),
        privateKeyPem: process.env.REPORT_SIGNING_PRIVATE_KEY,
      })
    : undefined;
const reportStore = process.env.DATABASE_URL
  ? new SqliteReportStore(sqlitePathFromDatabaseUrl(process.env.DATABASE_URL))
  : undefined;
const app = buildApp({ reportGenerator, reportStore, x402 });
const port = Number.parseInt(process.env.PORT ?? "4001", 10);

function sqlitePathFromDatabaseUrl(databaseUrl: string): string {
  if (
    !databaseUrl.startsWith("file:") ||
    databaseUrl.length === "file:".length
  ) {
    throw new Error("DATABASE_URL must be a SQLite file: URL");
  }

  return databaseUrl.slice("file:".length);
}

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
