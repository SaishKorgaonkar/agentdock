# AgentDock progress

**Updated:** 2026-09-11
**Current phase:** Phase 0 — proof runners ready; testnet credentials and CRE setup pending

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

## In progress

- [ ] Execute Phase 0 proofs with funded testnet accounts and a configured CRE starter project

## Next

- [ ] Create partner testnet accounts and securely record only non-secret account metadata — done when Hedera and Sepolia wallets have test funds.
- [ ] Execute `pnpm phase-zero:hedera` from a funded Hedera testnet account — done when its transaction ID and balance query are recorded.
- [ ] Execute `pnpm phase-zero:ens` through a writable ENSv2-compatible Sepolia resolver — done when transaction and resolver read are recorded.
- [ ] Run Chainlink CRE Confidential Workflow starter example — done when CLI output proves `handlerInTee` executed.
- [ ] Deploy the staging services — done when a public deployment URL and health response are recorded.

## Risks / decisions needed

- ENSv2 is presently a Sepolia beta; mainnet identity must be behind an adapter with an ENS mainnet compatibility path.
- Confirm availability and onboarding requirements for live Chainlink CRE network execution. The track accepts CRE CLI simulation, but live deployment is preferable.
- Confirm the current ETHOnline submission dashboard rule for the maximum number of partner organizations/tracks.
- Decide the production signing/custody model before allowing any mainnet automated payment. Testnet agent keys must never become the production model.

## Evidence log

| Date       | Item                     | Evidence                                                                                                         |
| ---------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 2026-09-07 | Planning baseline        | `phases.md`, `.project/SCOPE.md`                                                                                 |
| 2026-09-07 | Monorepo scaffold        | `pnpm check`: lint passed, 2 tests passed, 3 production builds passed                                            |
| 2026-09-07 | Local runtime smoke test | Web returned AgentDock title; orchestrator and risk API returned HTTP 200 health payloads on ports 4000 and 4001 |
| 2026-09-07 | Public repository        | `SaishKorgaonkar/agentdock`, initial commit `cc22c62` pushed to `main`                                           |
| 2026-09-11 | Phase 0 proof runners    | `pnpm check` passed; real network commands are documented but not executed because no testnet credentials exist |

## Update convention

After every completed slice:

1. Move its checkbox to **Completed** only after verification.
2. Add a dated evidence-log row with the command, transaction, deployment, or test proving it.
3. Add a short session log under `.project/sessions/`.
4. Update `.project/TASKS.md` so the next task is unambiguous.
