import { buildApp } from "./app.js";
import {
  SqliteWorkflowStore,
  sqlitePathFromDatabaseUrl,
} from "./workflow-store.js";

const workflowStore = process.env.DATABASE_URL
  ? new SqliteWorkflowStore(sqlitePathFromDatabaseUrl(process.env.DATABASE_URL))
  : undefined;
const app = buildApp({ workflowStore });
const port = Number.parseInt(process.env.PORT ?? "4000", 10);

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
