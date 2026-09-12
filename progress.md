# AgentDock progress

**Updated:** 2026-09-12
**Current phase:** Phase 0 — Hedera, ENS, and CRE simulation proofs complete; staging proof pending

## Current objective

Validate that the three required sponsor integrations can run end to end on a MacBook Pro using real testnet infrastructure:

- Hedera — AI & Agentic Payments on Hedera
- ENS — Best Use of ENSv2
- Chainlink — Best Confidential Workflow

## Completed

- [x] Defined AgentDock's initial workflow: Private Treasury Risk Assessment — 2026-09-07
- [x] Chosen three target tracks: Hedera x402, ENSv2, Chainlink CRE Confidential Workflows — 2026-09-07
- [x] Excluded Ledger because device-backed Key Ring provisioning requires a Ledger device — 2026-09-07
- [x] Documented production-shaped architecture and phased plan in `phases.md` — 2026-09-07
- [x] Scaffolded pnpm/Turborepo monorepo with Next.js 16, Fastify APIs, shared CI, environment template, and branded landing page — 2026-09-07
- [x] Verified lint, type checking, service tests, and production builds with `pnpm check` — 2026-09-07
- [x] Created and pushed the public GitHub repository at `https://github.com/SaishKorgaonkar/agentdock` — 2026-09-07
- [x] Added Hedera transfer and ENS resolver write/read proof runners; local unit, type, build, and workspace checks pass — 2026-09-11
- [x] Defined the immutable shared workflow state machine with idempotency and invalid-transition coverage — 2026-09-11
- [x] Added tested orchestrator endpoints to create, retrieve, and transition in-memory workflows — 2026-09-11
- [x] Added durable SQLite event persistence; workflow state and idempotency history survive restarts — 2026-09-11
- [x] Added an ENS authority adapter for scoped resolver records and local expiry/revocation checks — 2026-09-11
- [x] Required a configured active ENS authority and capability before the orchestrator activates a workflow — 2026-09-11
- [x] Added a Hedera testnet settlement verifier for successful recipient payment amounts — 2026-09-11
- [x] Configured standards-based Hedera x402 middleware for the paid Risk API route — 2026-09-11
- [x] Added configured-RPC EVM balance reports with deterministic evidence hashes and Ed25519 signatures — 2026-09-11
- [x] Added durable SQLite report-idempotency storage; reports survive restarts without duplicate generation — 2026-09-12
- [x] Ran a signed Hedera testnet transfer and recipient balance query — 2026-09-12
- [x] Wrote and read an `agentdock.phase0` text record on `agentdock.eth` through the ETHOnline ENSv2 resolver — 2026-09-12
- [x] Simulated the AgentDock private-policy handler through CRE `handlerInTee` targeting AWS Nitro `us-west-2` — 2026-09-13

## In progress

- [ ] Execute Phase 0 proofs with funded testnet accounts and a configured CRE starter project

## Next

- [ ] Create partner testnet accounts and securely record only non-secret account metadata — done when Hedera and Sepolia wallets have test funds.
- [ ] Request CRE deployment access and execute the confidential workflow in a real enclave — done when deployment/execution evidence is recorded.
- [ ] Deploy the staging services — done when a public deployment URL and health response are recorded.

## Risks / decisions needed

- ENSv2 is presently a Sepolia beta; mainnet identity must be behind an adapter with an ENS mainnet compatibility path.
- Confirm availability and onboarding requirements for live Chainlink CRE network execution. The track accepts CRE CLI simulation, but live deployment is preferable.
- Confirm the current ETHOnline submission dashboard rule for the maximum number of partner organizations/tracks.
- Decide the production signing/custody model before allowing any mainnet automated payment. Testnet agent keys must never become the production model.

## Evidence log

| Date       | Item                       | Evidence                                                                                                                        |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-07 | Planning baseline          | `phases.md`, `.project/SCOPE.md`                                                                                                |
| 2026-09-07 | Monorepo scaffold          | `pnpm check`: lint passed, 2 tests passed, 3 production builds passed                                                           |
| 2026-09-07 | Local runtime smoke test   | Web returned AgentDock title; orchestrator and risk API returned HTTP 200 health payloads on ports 4000 and 4001                |
| 2026-09-07 | Public repository          | `SaishKorgaonkar/agentdock`, initial commit `cc22c62` pushed to `main`                                                          |
| 2026-09-11 | Phase 0 proof runners      | `pnpm check` passed; real network commands are documented but not executed because no testnet credentials exist                 |
| 2026-09-11 | Workflow state machine     | Valid, skipped, terminal, and idempotent transitions are covered by `@agentdock/domain` unit tests                              |
| 2026-09-11 | Orchestrator workflow API  | `POST`/`GET` workflow and transition endpoints are tested with durable SQLite restart recovery                                  |
| 2026-09-11 | ENS authority adapter      | Scoped authority parsing and active/expired/revoked policy checks are covered by unit tests                                     |
| 2026-09-11 | ENS-gated activation       | API test proves only an active authority with the required capability moves a workflow to `ACTIVE`                              |
| 2026-09-11 | Hedera settlement verifier | Unit tests cover accepted and insufficient recipient payments; live testnet transaction remains pending                         |
| 2026-09-11 | Hedera x402 middleware     | Risk API config registers `@x402/fastify` and `@x402/hedera`; real facilitator settlement remains pending                       |
| 2026-09-12 | Hedera transfer proof      | Transaction `0.0.8318923@1789236627.481853640` transferred 10,000 tinybars to `0.0.8318774`; status `SUCCESS`                   |
| 2026-09-12 | ENSv2 resolver proof       | `agentdock.eth` wrote/read `agentdock.phase0`; transaction `0x5c69c7c0cdcaedd711b095124cddfbfd8d895abf6b76956090915abf7e1894c3` |
| 2026-09-13 | CRE TEE simulation          | CLI compiled and simulated AgentDock `handlerInTee` for AWS Nitro `us-west-2`; policy result `COMPLETED` (simulator, not a real enclave) |
| 2026-09-13 | Sepolia receipt registry    | `WorkflowReceiptRegistry` deployed at `0x70fa78b86d6e1992989c98ddcbf61162a80a8c06`; transaction `0x8733614706e161c14f00f937ff537e55b70a6b588f7d43dbb1b2a3d267df7d1d` |
| 2026-09-11 | Signed risk-report engine  | RPC balance aggregation, evidence hashing, and Ed25519 signing are covered by unit tests                                        |

## Update convention

After every completed slice:

1. Move its checkbox to **Completed** only after verification.
2. Add a dated evidence-log row with the command, transaction, deployment, or test proving it.
3. Add a short session log under `.project/sessions/`.
4. Update `.project/TASKS.md` so the next task is unambiguous.
