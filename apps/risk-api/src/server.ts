import { buildApp } from "./app.js";

const x402 = process.env.HEDERA_X402_RECIPIENT_ID
  ? {
      facilitatorUrl:
        process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator",
      payTo: process.env.HEDERA_X402_RECIPIENT_ID,
      priceTinybars: process.env.HEDERA_X402_PRICE_TINYBARS ?? "10000",
    }
  : undefined;
const app = buildApp({ x402 });
const port = Number.parseInt(process.env.PORT ?? "4001", 10);

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
