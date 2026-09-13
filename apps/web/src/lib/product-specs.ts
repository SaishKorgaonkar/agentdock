export type ProductSpec = {
  id: string;
  navLabel: string;
  name: string;
  tagline: string;
  description: string;
  specs: string[];
  spotlight?: "violet" | "magenta" | "orange" | "coral";
};

export const productSpecs: ProductSpec[] = [
  {
    id: "ens-authority",
    navLabel: "ENS authority",
    name: "ENS authority",
    tagline: "Scoped identity with expiry and revocation.",
    description:
      "Agents operate under ENSv2 resolver records on Sepolia. Each grant carries role, allowed capabilities, expiry, endpoint, x402 network, and policy hash — enforced before any payment or service call.",
    specs: [
      "Sepolia subnames with Permissioned Resolvers",
      "Capability-scoped grants and revocations",
      "Expiry and revoke checks in the orchestrator",
    ],
    spotlight: "violet",
  },
  {
    id: "hedera-x402",
    navLabel: "Hedera x402",
    name: "Hedera x402",
    tagline: "Pay per request. Settle before delivery.",
    description:
      "Specialist APIs return HTTP 402 until Hedera testnet settlement is verified. Providers set tinybar prices per request; customers pay only when the orchestrator authorizes spend.",
    specs: [
      "Standards-based x402 quote and payment flow",
      "Transfer verification before report generation",
      "Replay prevention and idempotent request IDs",
    ],
  },
  {
    id: "signed-evidence",
    navLabel: "Signed evidence",
    name: "Signed evidence",
    tagline: "Ed25519 reports with deterministic hashes.",
    description:
      "Risk and action outputs are signed and hashed from real RPC-derived data. Customers receive verifiable evidence instead of opaque model text — every delivery is auditable.",
    specs: [
      "Ed25519 signatures on every report",
      "Deterministic evidence hashes from chain data",
      "Exposure and concentration metrics from live RPC",
    ],
    spotlight: "magenta",
  },
  {
    id: "cre-policy",
    navLabel: "CRE policy",
    name: "CRE policy",
    tagline: "Private thresholds. Public receipts only.",
    description:
      "Private risk thresholds and policy versions evaluate inside a Chainlink CRE confidential workflow. Only a minimal decision and decision hash appear in public output.",
    specs: [
      "TEE-backed handlerInTee evaluation",
      "Private inputs never leak to public logs",
      "COMPLETED or REQUIRES_HUMAN_APPROVAL decisions",
    ],
  },
  {
    id: "workflow-control",
    navLabel: "Workflow control",
    name: "Workflow control",
    tagline: "Idempotent state machine. Immutable events.",
    description:
      "Every workflow run follows a deterministic state machine from draft through payment, report, and private evaluation. Transitions require idempotency keys and produce immutable audit events.",
    specs: [
      "DRAFT → ACTIVE → PAYMENT_SETTLED → COMPLETED",
      "Idempotency keys on every transition",
      "Immutable event log per workflow run",
    ],
  },
  {
    id: "agent-marketplace",
    navLabel: "Marketplace",
    name: "Agent marketplace",
    tagline: "Discover providers. Launch governed runs.",
    description:
      "Providers publish ENS-identified services with capability tags, descriptions, and x402 prices. Customers browse the directory, select a service, and launch policy-bound workflows.",
    specs: [
      "ENS-identified provider directory",
      "Capability tags and per-request pricing",
      "Governed workflow launch from catalog",
    ],
    spotlight: "orange",
  },
];
