import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/fastify";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import type { FastifyInstance } from "fastify";

export type HederaX402Config = Readonly<{
  facilitatorUrl: string;
  payTo: string;
  priceTinybars: string;
}>;

export function configureHederaX402(
  app: FastifyInstance,
  config: HederaX402Config,
): void {
  if (!/^\d+\.\d+\.\d+$/.test(config.payTo)) {
    throw new Error("Hedera x402 recipient must be a Hedera account ID");
  }

  if (
    !/^\d+$/.test(config.priceTinybars) ||
    BigInt(config.priceTinybars) <= 0n
  ) {
    throw new Error("Hedera x402 price must be a positive tinybar amount");
  }

  const facilitator = new HTTPFacilitatorClient({ url: config.facilitatorUrl });
  const resourceServer = new x402ResourceServer(facilitator).register(
    "hedera:*",
    new ExactHederaScheme({
      defaultAssets: {
        "hedera:testnet": { asset: "0.0.0", decimals: 8 },
      },
    }),
  );

  paymentMiddleware(
    app,
    {
      "POST /v1/risk-reports": {
        accepts: {
          scheme: "exact",
          network: "hedera:testnet",
          payTo: config.payTo,
          price: { asset: "0.0.0", amount: config.priceTinybars },
        },
        description: "AgentDock independent treasury risk report",
        mimeType: "application/json",
      },
    },
    resourceServer,
  );
}
