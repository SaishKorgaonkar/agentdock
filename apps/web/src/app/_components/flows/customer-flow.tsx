import { FlowStep } from "./flow-step";

const steps = [
  {
    phase: "Discovery",
    title: "Browse the agent service directory",
    detail:
      "Explore ENS-identified providers with capability tags, descriptions, and x402 prices in tinybars.",
    link: { href: "/services", label: "Open directory" },
  },
  {
    phase: "Governance",
    title: "Create a governed workflow",
    detail:
      "Launch a policy-bound workflow, select a paid service, and attach ENS-scoped agent authority.",
    link: { href: "/workflow", label: "Launch workflow" },
  },
  {
    phase: "Authorization",
    title: "Verify ENSv2 authority",
    detail:
      "The orchestrator reads Sepolia resolver records for scoped capabilities, expiry, and revocation.",
    proof: "Live: agentdock.eth resolver on Sepolia",
  },
  {
    phase: "Payment",
    title: "Settle via Hedera x402",
    detail:
      "Risk API returns HTTP 402 with a quote. After Hedera settlement, provider generates signed report.",
    proof: "Hedera transfer verification, x402 middleware",
  },
  {
    phase: "Evaluation",
    title: "Private policy check in CRE",
    detail:
      "Paid report and private policy evaluated in Chainlink CRE handler. Simulator verified. Real TEE pending.",
    proof: "handlerInTee simulation, COMPLETED",
    featured: true,
  },
  {
    phase: "Receipt",
    title: "Record minimal public evidence",
    detail:
      "Sepolia receipt registry captures workflow ID, evidence hashes, decision hash, and status.",
    proof: "WorkflowReceiptRegistry 0x70fa…8c06",
  },
];

export function CustomerFlow() {
  return (
    <>
      {steps.map((step, index) => (
        <FlowStep key={step.phase} index={index + 1} {...step} />
      ))}
    </>
  );
}
