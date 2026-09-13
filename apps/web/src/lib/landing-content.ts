import type { ProductSpec } from "./product-specs";

export const navLinks = [
  { label: "Platform", href: "/#platform" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Integrations", href: "/#integrations" },
] as const;

export const hero = {
  eyebrow: "Policy-controlled agent commerce",
  headline: ["Govern agent spend.", "Verify every delivery."],
  subhead:
    "AgentDock is the control plane for AI agent services. Providers publish ENS-identified capabilities with x402 pricing. Customers launch policy-bound workflows and receive signed, auditable evidence.",
  primaryCta: { label: "Get started", href: "/workflow" },
  secondaryCta: { label: "Browse services", href: "/services" },
};

export const trustStrip = [
  "ENSv2 Sepolia",
  "Hedera testnet",
  "Chainlink CRE",
  "Real integrations only",
];

export const howItWorks = {
  eyebrow: "How it works",
  title: "From discovery to verifiable delivery.",
  steps: [
    {
      step: "01",
      title: "Discover & select",
      body: "Browse ENS-identified agent services with capability tags, descriptions, and per-request x402 pricing.",
    },
    {
      step: "02",
      title: "Authorize & pay",
      body: "Attach scoped ENS authority, settle on Hedera testnet, and trigger the orchestrator state machine.",
    },
    {
      step: "03",
      title: "Verify & approve",
      body: "Receive signed evidence, private CRE policy evaluation, and a public Sepolia workflow receipt.",
    },
  ],
};

export const platformSection = {
  eyebrow: "Platform",
  title: "Six pillars. One governed stack.",
  description:
    "Every layer is real testnet infrastructure — identity, payment, evidence, policy, orchestration, and marketplace.",
};

export const integrations = {
  eyebrow: "Integrations",
  title: "Built on partner infrastructure.",
  items: [
    {
      name: "ENSv2",
      status: "Sepolia verified",
      detail: "Scoped, expiring, revocable agent identity on resolver records.",
    },
    {
      name: "Hedera x402",
      status: "Testnet verified",
      detail: "Pay-per-request settlement before any specialist service runs.",
    },
    {
      name: "Chainlink CRE",
      status: "Simulator verified",
      detail: "Confidential policy evaluation with minimal public decision output.",
    },
    {
      name: "Sepolia receipts",
      status: "Contract ready",
      detail: "On-chain workflow receipts linking payment, evidence, and policy hash.",
    },
  ],
};

export const useCase = {
  eyebrow: "Launch workflow",
  title: "Private Treasury Risk Assessment",
  body: "An organization delegates a time-bounded risk agent to discover and pay a specialist risk-report API, evaluate the report against a private policy, and receive a verifiable workflow receipt — with approve, reject, or revoke controls.",
  cta: { label: "Launch on testnet", href: "/workflow" },
};

export const statement = {
  primary: "The model proposes.",
  secondary: "Deterministic systems authorize.",
};

export const faq = {
  eyebrow: "FAQ",
  title: "Common questions.",
  items: [
    {
      q: "What is AgentDock?",
      a: "A policy-controlled platform for AI agent services. Providers monetize ENS-identified APIs with x402 pricing. Customers run governed workflows with verifiable evidence at every step.",
    },
    {
      q: "Is this production-ready?",
      a: "AgentDock v0.1 runs on testnet with real ENS, Hedera, and Chainlink integrations. No mocked payments, reports, or identity records.",
    },
    {
      q: "Who is it for?",
      a: "Organizations that need bounded agent authority with audit trails — starting with private treasury risk assessment workflows.",
    },
    {
      q: "How do I get started?",
      a: "Sign in, create a workflow draft, select a service from the directory, attach ENS authority, and run the orchestrator on testnet.",
    },
  ],
};

export const finalCta = {
  title: "Ready to run governed agent workflows?",
  subhead: "Sign in and launch your first testnet workflow in minutes.",
  primary: { label: "Get started", href: "/workflow" },
  secondary: { label: "View services", href: "/services" },
};

export const footer = {
  tagline: "Policy-controlled agent commerce on testnet.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Platform", href: "/#platform" },
        { label: "How it works", href: "/#how-it-works" },
        { label: "Integrations", href: "/#integrations" },
        { label: "Services", href: "/services" },
      ],
    },
    {
      title: "Build",
      links: [
        { label: "Workflow console", href: "/workflow" },
        { label: "Provider program", href: "/providers" },
        { label: "Architecture", href: "/how-it-works" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Testnet only", href: "/#faq" },
        { label: "Real integrations", href: "/#integrations" },
      ],
    },
  ],
};

export type { ProductSpec };
