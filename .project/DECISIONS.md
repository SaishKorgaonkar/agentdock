# Decision log

Append-only. Newest at the bottom. Never edit or delete a past entry — supersede it.

---

## D-001 — Build one private treasury-risk workflow before a general platform

**Date:** 2026-09-07
**Status:** accepted

**Context.** Agent-as-a-service and workflow-as-a-service are too broad to make a credible hackathon MVP or production launch claim.

**Options considered.**
- **General agent marketplace/workflow builder** — broad feature set but weak, hard-to-demo core value.
- **One vertical workflow** — a constrained product slice with real service payment, private policy evaluation, and clear evidence.

**Decision.** Build Private Treasury Risk Assessment as AgentDock's first workflow.

**Because.** It naturally requires paid specialist data, policy-controlled agent authority, confidential inputs, and a final audit receipt; each target sponsor integration changes essential product behavior.

**Consequence.** The first version does not support arbitrary user-defined workflows or autonomous mainnet trading.

---

## D-002 — Target Hedera, ENS, and Chainlink sponsor tracks

**Date:** 2026-09-07
**Status:** accepted

**Context.** The project needs no more than three primary sponsor organizations and each must be central rather than a cosmetic integration.

**Options considered.**
- **Hedera + Arc + ENS** — Arc provides agent settlement but its specific agent track payout is small and would add another execution rail.
- **Hedera + Ledger + ENS** — strong security story but Ledger's required Key Ring provisioning and fund confirmation require a hardware device.
- **Hedera + ENS + Chainlink** — combines paid services, revocable identity, and confidential policy evaluation on a MacBook-only setup.

**Decision.** Target Hedera AI & Agentic Payments, ENS Best Use of ENSv2, and Chainlink Best Confidential Workflow.

**Because.** Each aligns directly with the initial workflow and can be built and verified without a Ledger device.

**Consequence.** Chainlink CRE becomes a required early feasibility check; Arc and Ledger are not on the critical path.

---

## D-003 — Use real testnet integrations and production-shaped interfaces

**Date:** 2026-09-07
**Status:** accepted

**Context.** The goal is a credible testnet product that can progress to limited mainnet operation rather than a demo dependent on mocks.

**Options considered.**
- **Mock integrations for speed** — easy visual demo but no externally verifiable utility or credible mainnet path.
- **Real testnet integrations with adapters** — slower initial setup but produces verifiable evidence and avoids architectural replacement later.

**Decision.** Use real Hedera testnet x402 payments, ENSv2 Sepolia records, CRE confidential workflow execution/simulation, and Sepolia receipts. Isolate all network-specific calls behind adapters.

**Because.** Sponsor tracks require functional integrations and the product's trust claim depends on independently verifiable evidence.

**Consequence.** Partner accounts and reference flows must be proven before UI work; ENSv2 mainnet availability remains an external migration dependency.

---

## D-004 — Use a pnpm/Turborepo TypeScript monorepo with Next.js and Fastify

**Date:** 2026-09-07
**Status:** accepted

**Context.** AgentDock needs a web dashboard plus independently deployable orchestration and paid-service APIs, while keeping shared tooling manageable for one team.

**Options considered.**
- **Single Next.js application** — simplest deployment, but couples long-running workflow and x402 service boundaries to the frontend runtime.
- **Next.js plus separate services without a workspace** — clean runtime boundaries but duplicated dependency and build configuration.
- **pnpm/Turborepo monorepo with Next.js and Fastify** — separate deployment units with one lockfile and verification command.

**Decision.** Use Next.js App Router for `apps/web`, Fastify for `apps/api` and `apps/risk-api`, and pnpm/Turborepo at the repository root.

**Because.** It preserves straightforward frontend development while keeping payment verification and workflow orchestration independently deployable and testable.

**Consequence.** Deployment must operate three applications, and shared domain/adapter packages must avoid coupling themselves to any one runtime.
