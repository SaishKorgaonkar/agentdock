# Tasks

**Updated:** 2026-09-07

## In progress

- [ ] Validate Phase 0 sponsor feasibility — owner of attention: project setup
      Done when Hedera transfer, ENSv2 write/read, CRE confidential handler, and staging deploy each have reproducible evidence.

## Next

- [ ] Provision Hedera testnet account and run a signed transfer — done when transaction ID and balance query are recorded.
- [ ] Provision Sepolia wallet and deploy/write an ENSv2 resolver record — done when transaction and resolver read are recorded.
- [ ] Install CRE CLI and run the Confidential Workflows starter — done when `handlerInTee` execution evidence is recorded.
- [ ] Define workflow event schema and state-machine tests — done when invalid state transitions are rejected.

## Backlog

- Implement ENSv2 subname lifecycle and revocation flow after Phase 0 passes.
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
