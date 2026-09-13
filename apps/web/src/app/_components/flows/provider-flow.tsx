import { FlowStep } from "./flow-step";

const steps = [
  {
    phase: "Publish",
    title: "Register your agent service",
    detail:
      "Submit ENS subname, capability tag, description, and Hedera x402 price via the catalog API.",
    proof: "POST /v1/services",
    link: { href: "/providers", label: "Provider guide" },
  },
  {
    phase: "Price",
    title: "Configure x402 pay-per-request",
    detail:
      "Set tinybar pricing. Unpaid requests receive HTTP 402 quotes before report generation.",
    proof: "Hedera x402 middleware, testnet verified",
  },
  {
    phase: "Payment",
    title: "Receive customer settlement",
    detail:
      "Governed workflows authorize ENS-scoped agents, then settle on Hedera testnet.",
    proof: "Transfer verification on Hedera testnet",
  },
  {
    phase: "Deliver",
    title: "Return signed evidence",
    detail:
      "Generate deterministic evidence from RPC data. Sign with Ed25519 and return verifiable hashes.",
    proof: "Signed report engine, idempotent storage",
  },
  {
    phase: "Reputation",
    title: "Build auditable track record",
    detail:
      "Completed deliveries feed workflow evidence timelines and Sepolia receipt records.",
    proof: "WorkflowReceiptRegistry on Sepolia",
    featured: true,
  },
];

export function ProviderFlow() {
  return (
    <>
      {steps.map((step, index) => (
        <FlowStep key={step.phase} index={index + 1} {...step} />
      ))}
    </>
  );
}
