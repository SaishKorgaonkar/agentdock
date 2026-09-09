# AgentDock build phases

**Principle:** every milestone uses real integrations and testnet transactions. No mocked payments, risk reports, ENS records, or confidential-workflow results. Testnet configuration must use the same interfaces as production configuration.

## Product slice

Ship one production-shaped workflow first: **Private Treasury Risk Assessment**.

An organization delegates a time-bounded risk agent to discover and pay a specialist risk-report API, evaluates the report against a private policy in a Chainlink CRE Confidential Workflow, and receives a public, verifiable workflow receipt. The user can then approve, reject, or revoke the agent.

## Phase 0 — Feasibility and accounts

**Objective:** verify each partner dependency before building product UI.

- Create Hedera testnet account and fund it with test HBAR.
- Create Sepolia wallet and fund it with test ETH.
- Establish ENSv2 Sepolia parent namespace/resolver path.
- Install and run Chainlink CRE CLI; execute the official confidential-workflow example.
- Create a deployed staging environment, secret store, and CI pipeline.

**Done when:** a script proves a Hedera testnet transfer, an ENSv2 Sepolia resolver write, a CRE confidential workflow simulation, and a staging deployment.

**No-go rule:** do not start feature work until every proof succeeds. Replace or de-risk an unavailable sponsor dependency immediately.

## Phase 1 — Foundation and workflow domain

**Objective:** make workflow execution deterministic and auditable before connecting external services.

Create the monorepo:

```text
apps/web                 Next.js dashboard
apps/api                 API and workflow orchestrator
apps/risk-api            x402-gated risk-report service
packages/domain          policy engine and workflow state machine
packages/ens             ENS identity adapter
packages/hedera          x402 payment adapter
packages/chainlink-cre   CRE confidential workflow
packages/contracts       receipt registry contract
```

Implement a persisted state machine:

```text
DRAFT → ACTIVE → SERVICE_DISCOVERED → PAYMENT_QUOTED
→ PAYMENT_AUTHORIZED → PAYMENT_SETTLED → REPORT_RECEIVED
→ PRIVATE_EVALUATION_RUNNING → COMPLETED | REQUIRES_APPROVAL | FAILED | EXPIRED
```

Each transition requires an idempotency key and produces an immutable event.

**Done when:** unit tests prove valid transitions succeed and invalid/skipped transitions fail.

## Phase 2 — ENSv2 agent authority

**Objective:** establish real, scoped, revocable agent identity on Sepolia.

- Create an organization namespace.
- Create `risk-agent.<org>.eth` and `risk-api.<org>.eth` subnames.
- Use ENSv2 Permissioned Resolvers and Enhanced Access Control.
- Store public role, allowed capabilities, expiry, endpoint, x402 network, and policy hash.
- Implement revoke/expire checks in the API orchestrator.

**Done when:** a real Sepolia transaction grants a risk agent access, another revokes it, and a subsequent workflow request is rejected.

## Phase 3 — Hedera x402 Risk API

**Objective:** sell a useful, independently consumable service for real testnet payment.

- Implement `POST /v1/risk-reports`.
- Return a genuine HTTP 402 quote before unpaid work runs.
- Verify a Hedera x402 payment before generating a report.
- Derive report data from actual configured-chain addresses/RPC data; calculate deterministic exposure and concentration metrics.
- Sign the report and return an evidence hash.
- Enforce payment replay prevention, request idempotency, rate limits, and service budget checks.

**Done when:** an external script receives 402, pays on Hedera testnet, receives a signed report, and verifies both payment and report signature without the dashboard.

## Phase 4 — Chainlink CRE confidential decision

**Objective:** evaluate private inputs inside a meaningful TEE-backed workflow.

- Implement a CRE `handlerInTee` flow.
- Process a paid report, private risk threshold, private policy version, and protected inputs inside the confidential handler.
- Return only a minimal decision and decision hash: `COMPLETED` or `REQUIRES_HUMAN_APPROVAL`.
- Capture CRE execution evidence and error states.

**Done when:** CRE CLI simulation or CRE network execution proves the confidential handler ran and no sensitive input appears in public output/logs.

## Phase 5 — End-to-end orchestration and receipt registry

**Objective:** connect all partner integrations in one real execution path.

- Deploy the Workflow Receipt Registry to Sepolia.
- Record workflow ID, ENS name hashes, Hedera payment reference, evidence hash, CRE decision hash, status, and timestamp.
- Implement the orchestrator sequence: ENS authorization → service discovery → x402 quote/payment → report → confidential evaluation → receipt.
- Add retries only where they are idempotent; never automatically repeat an unverified payment.

**Done when:** one API call completes the entire path on real testnets and creates a browser-verifiable receipt.

## Phase 6 — Usable dashboard and approval controls

**Objective:** let a non-developer execute and understand the workflow.

- Wallet sign-in and organization onboarding.
- Workflow creation form: identity, service cap, expiry, and approval threshold.
- Live event timeline sourced from real execution events.
- Receipt, report evidence, CRE evidence, and transaction links.
- Approve/reject follow-up action and revoke-agent controls.

**Done when:** a new tester can run the workflow from the hosted UI without developer intervention.

## Phase 7 — Hardening and submission

**Objective:** prepare a reliable public testnet product and bounty-verifiable submission.

- Add API authentication/rate limits, secret management, health checks, alerts, and structured logs.
- Add integration and end-to-end tests against testnet accounts.
- Test retries, expired permissions, insufficient budget, duplicate requests, invalid payment, and CRE failure.
- Publish architecture diagram, README, threat model, setup guide, and 3-minute demo video.
- Create a bounty evidence section for Hedera, ENS, and Chainlink with exact transaction/execution links.

**Done when:** a clean-environment deployment passes the end-to-end test and every bounty requirement has a direct proof link.

## Phase 8 — Production launch preparation

**Objective:** move safely from testnet to limited mainnet operation.

- Replace testnet credentials and RPC URLs with production configuration; do not change domain interfaces.
- Deploy and monitor the paid Risk API with a low real price and strict caps.
- Use production secret management and a bounded execution/signing model; never give model processes unrestricted private keys.
- Start with read-only reports and human-approved next actions.
- Conduct contract/API security review before autonomous value movement.
- Move ENS identity to ENS mainnet or ENSv2 mainnet when ENSv2 production deployment is available.

**Done when:** a limited-production user can purchase a report and receive a confidentially evaluated recommendation under explicit spending limits.

## Mainnet compatibility note

ENSv2 is a Sepolia beta track. Its mainnet availability is an external dependency, so this is not guaranteed to be a one-line network switch. The ENS adapter must isolate resolver/registry calls and support a production-compatible ENS fallback until ENSv2 is deployed on mainnet.
