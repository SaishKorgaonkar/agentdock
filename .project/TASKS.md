# Tasks

**Updated:** 2026-09-12

## In progress

- [ ] Validate Phase 0 sponsor feasibility — owner of attention: project setup
      Done when Hedera transfer, ENSv2 write/read, CRE confidential handler, and staging deploy each have reproducible evidence.

## Next

- [ ] Build the provider-service catalog, service publishing, workflow launch, and evidence APIs — done when real service records and user-owned workflow records are available through staging APIs.
- [ ] Add authentication and ownership enforcement for public users — done when protected workflow/provider routes verify identity.
- [ ] Build the Fluence-style public landing page, catalog, dashboard, and workflow evidence UI — done when the Vercel app is usable against staging APIs.
- [ ] Deploy the CRE confidential workflow after Chainlink enables deployment access — done when a real enclave execution is recorded.
- [ ] Add production database deployment/migration operations — done when workflow-event storage is provisioned in staging with backups and health monitoring.

## Backlog

- Deploy the ENS authority adapter against the provisioned writable ENSv2-compatible resolver; prove grant, authorization, and revocation on Sepolia.
- Implement real Hedera x402 Risk API after ENS authority layer is designed.
- Implement CRE private policy evaluation after paid report schema is stable.
- Connect full orchestration to the deployed Sepolia receipt registry (`0x70fa78b86d6e1992989c98ddcbf61162a80a8c06`).
- Build hosted dashboard, observability, threat model, and submission materials.
- Plan limited-production launch only after complete testnet E2E proof and security review.

## Done

- [x] Created public `SaishKorgaonkar/agentdock` repository and pushed `main` — 2026-09-07
- [x] Created pnpm/Turborepo TypeScript monorepo with Next.js web, Fastify service scaffolds, CI, and passing `pnpm check` — 2026-09-07
- [x] Created project ledger, phase plan, and progress log — 2026-09-07
- [x] Selected Hedera, ENS, and Chainlink as the three primary sponsor organizations — 2026-09-07
- [x] Added tested Hedera transfer and ENS resolver proof runners, without embedding credentials — 2026-09-11
- [x] Defined the shared workflow state machine; valid paths, skipped states, terminal states, and duplicate idempotency keys are tested — 2026-09-11
- [x] Exposed in-memory workflow create, retrieve, and transition endpoints in the orchestrator — 2026-09-11
- [x] Added durable SQLite workflow-event persistence; transitions and idempotency history survive an orchestrator restart — 2026-09-11
- [x] Added the ENS authority adapter with scoped text records plus expiry/revocation policy checks — 2026-09-11
- [x] Required a configured active ENS authority and capability before a workflow can become active — 2026-09-11
- [x] Added a Hedera testnet settlement verifier that checks successful recipient transfer amount from transaction records — 2026-09-11
- [x] Configured standards-based Hedera x402 middleware for the paid risk-report endpoint — 2026-09-11
- [x] Added configured-RPC EVM balance reports with deterministic evidence hashes and Ed25519 signatures — 2026-09-11
- [x] Added durable SQLite report-idempotency storage; reports survive restarts without duplicate generation — 2026-09-12
- [x] Verified a signed Hedera testnet transfer from `0.0.8318923` to `0.0.8318774` — 2026-09-12
- [x] Wrote and read the `agentdock.phase0` record on `agentdock.eth` through the ETHOnline ENSv2 resolver — 2026-09-12
- [x] Ran an AWS Nitro `us-west-2` `handlerInTee` simulation with an AgentDock policy decision — 2026-09-13
- [x] Deployed `WorkflowReceiptRegistry` to Sepolia — 2026-09-13
