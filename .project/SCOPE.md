# AgentDock

**Status:** in progress
**Last reviewed:** 2026-09-07

## What this is

AgentDock is a policy-controlled workflow platform for organizations that need AI agents to purchase specialist services and produce trustworthy recommendations without receiving unrestricted credentials, spending authority, or access to private policy data. Its first workflow is a private treasury risk assessment executed with real testnet integrations.

## Why it exists

Autonomous agents need to use external paid services, but API keys, wallet keys, portfolio allocations, and organizational risk rules should not be handed to a model process. AgentDock separates agent reasoning from deterministic authorization and confidential policy evaluation, producing an auditable receipt for each workflow.

## In scope

- ENSv2 Sepolia agent and service subnames with scoped, expiring, revocable authority.
- A real Hedera x402-gated risk-report API and agent payment flow.
- A Chainlink CRE Confidential Workflow that evaluates private report and policy inputs.
- A Sepolia receipt registry containing only verifiable hashes, references, and status.
- A hosted dashboard to create, execute, inspect, approve, and revoke the initial workflow.
- A public directory where providers publish ENS-identified, x402-priced agent services and users discover and launch governed workflows.
- Provider workflow evidence and earnings history derived from completed testnet requests.
- Testnet end-to-end operation using real payment, resolver, confidential-workflow, and contract interactions.

## Out of scope

- Arbitrary unbounded agent execution; provider services and workflows remain typed, policy-bound templates with explicit capabilities.
- Autonomous mainnet trading or unrestricted treasury access; production starts with bounded, human-approved actions.
- Mock payment, mock risk reports, mock ENS records, or mock confidential-workflow results.
- Ledger integration; no compatible Ledger device is currently available.
- A dependence on ENSv2 mainnet availability; an adapter will support a production-compatible ENS fallback if needed.

## Success looks like

- A new user completes the full treasury-risk workflow from the public staging UI without developer intervention.
- The workflow performs and verifies a real Hedera testnet x402 payment, writes/reads real ENSv2 Sepolia authority, runs a real CRE confidential handler, and writes a real Sepolia receipt.
- Every target bounty requirement has a reproducible verification path and evidence link.
- The testnet implementation reaches mainnet through configuration, deployment, operational hardening, and security review—not a replacement architecture.

## Constraints

- Development device is an Apple Silicon MacBook Pro M4 Pro.
- Target ETHOnline 2026 tracks are Hedera AI & Agentic Payments, ENS Best Use of ENSv2, and Chainlink Best Confidential Workflow.
- No hardware Ledger device is available.
- Secrets must remain outside source control and model-visible prompts.
