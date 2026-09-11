# Tasks

**Updated:** 2026-09-11

## In progress

- [ ] Validate Phase 0 sponsor feasibility — owner of attention: project setup
      Done when Hedera transfer, ENSv2 write/read, CRE confidential handler, and staging deploy each have reproducible evidence.

## Next

- [ ] Provision Hedera testnet account and run `pnpm phase-zero:hedera` — done when transaction ID and balance query are recorded.
- [ ] Provision Sepolia wallet and run `pnpm phase-zero:ens` through a writable ENSv2-compatible resolver — done when transaction and resolver read are recorded.
- [ ] Install CRE CLI and run the Confidential Workflows starter — done when `handlerInTee` execution evidence is recorded.
- [ ] Add production database deployment/migration operations — done when workflow-event storage is provisioned in staging with backups and health monitoring.

## Backlog

- Deploy the ENS authority adapter against the provisioned writable ENSv2-compatible resolver; prove grant, authorization, and revocation on Sepolia.
- Implement real Hedera x402 Risk API after ENS authority layer is designed.
- Implement CRE private policy evaluation after paid report schema is stable.
- Deploy receipt registry and connect full orchestration.
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
