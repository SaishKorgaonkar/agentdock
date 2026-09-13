import { EnsAuthorityAdapter } from "@agentdock/ens";

import { buildApp } from "./app.js";
import { createHederaPaidRiskReportClient } from "./risk-client.js";
import { SepoliaReceiptWriter } from "./receipt-writer.js";
import { InMemoryServiceStore } from "./service-store.js";

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required`);
  return value;
};

const rpcUrl = required("SEPOLIA_RPC_URL");
const serviceStore = new InMemoryServiceStore();
const service = serviceStore.create({
  id: "agentdock-risk-api-live",
  providerName: "AgentDock Risk API",
  ensName: "risk-api.agentdock.eth",
  capability: "treasury-risk-report",
  description: "Signed EVM treasury risk report",
  endpoint: required("RISK_API_URL"),
  priceTinybars: "10000",
  createdAt: new Date().toISOString(),
});
const app = buildApp({
  authorityReader: new EnsAuthorityAdapter({
    rpcUrl,
    resolverAddress: required("ENS_RESOLVER_ADDRESS"),
  }),
  receiptWriter: new SepoliaReceiptWriter({
    rpcUrl,
    privateKey: required("SEPOLIA_OPERATOR_PRIVATE_KEY") as `0x${string}`,
    registryAddress: required(
      "WORKFLOW_RECEIPT_REGISTRY_ADDRESS",
    ) as `0x${string}`,
  }),
  riskReportRequester: createHederaPaidRiskReportClient({
    baseUrl: required("RISK_API_URL"),
    operatorId: required("HEDERA_OPERATOR_ID"),
    operatorPrivateKey: required("HEDERA_OPERATOR_KEY"),
  }),
  serviceStore,
});

const workflowId = `production-proof-${Date.now()}`;
const request = async (
  method: "GET" | "POST",
  url: string,
  payload?: object,
) => {
  const response = await app.inject({ method, url, payload });
  if (response.statusCode >= 400) {
    throw new Error(
      `${method} ${url} failed (${response.statusCode}): ${response.body}`,
    );
  }
  return response.json();
};

try {
  await request("POST", "/v1/workflows", { id: workflowId });
  await request("POST", `/v1/workflows/${workflowId}/select-service`, {
    serviceId: service.id,
  });
  const authorized = await request(
    "POST",
    `/v1/workflows/${workflowId}/authorize-ens`,
    {
      agentName: "agentdock.eth",
      idempotencyKey: `ens-${workflowId}`,
    },
  );
  const purchased = await request(
    "POST",
    `/v1/workflows/${workflowId}/purchase-risk-report`,
    {
      requestId: `report-${workflowId}`,
      addresses: ["0xA6CFC222852f77E48FD22201DBcf205ECC16eE31"],
      paymentConfirmed: true,
    },
  );
  const evaluated = await request(
    "POST",
    `/v1/workflows/${workflowId}/evaluate-policy`,
    {
      agentName: "agentdock.eth",
      maximumWei: "1000000000000000000",
      policyVersion: "agentdock-policy-v1",
    },
  );
  console.log(
    JSON.stringify({ workflowId, authorized, purchased, evaluated }, null, 2),
  );
} finally {
  await app.close();
}
