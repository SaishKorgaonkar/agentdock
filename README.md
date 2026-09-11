# AgentDock

AgentDock is a policy-controlled workflow platform for AI agents that purchase specialist services and evaluate private organizational policies without receiving unrestricted credentials or spending authority.

The first production-shaped workflow is a **Private Treasury Risk Assessment** using:

- **ENSv2 on Sepolia** for scoped, expiring, revocable agent identity;
- **Hedera x402** for real pay-per-request risk reports;
- **Chainlink CRE Confidential Workflows** for private policy evaluation;
- a public receipt registry containing hashes and transaction references, never private inputs.

## Repository

```text
apps/web       Next.js dashboard
apps/api       Fastify workflow orchestrator
apps/risk-api  Fastify paid risk-report service
packages/domain      Workflow state machine and domain events
packages/phase-zero  Executable Hedera and ENS feasibility proofs
packages/             Partner adapters and contracts
```

Planning and status:

- [`phases.md`](./phases.md) — end-to-end delivery phases
- [`progress.md`](./progress.md) — current progress and evidence
- [`.project/TASKS.md`](./.project/TASKS.md) — live task board
- [`.project/SCOPE.md`](./.project/SCOPE.md) — current product scope

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 11.25.0

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Default development ports:

- Web: `http://localhost:3000`
- Orchestrator: `http://localhost:4000/health`
- Risk API: `http://localhost:4001/health`

Run all verification:

```bash
pnpm check
```

## Phase 0 testnet proofs

Phase 1 feature work is intentionally blocked until the required real integrations are proven. Copy the environment template locally, fill it with funded **testnet-only** credentials, then load it into your shell without committing it:

```bash
cp .env.example .env.local
set -a; source .env.local; set +a
pnpm phase-zero:hedera
pnpm phase-zero:ens
```

The Hedera command sends the configured small HBAR transfer to `HEDERA_X402_RECIPIENT_ID`, waits for consensus, and prints its transaction ID and recipient balance. The ENS command writes then reads the configured public proof text record through `ENS_RESOLVER_ADDRESS` and prints the Sepolia transaction hash. Save only those public outputs as evidence.

The CRE proof remains account- and starter-project-specific: install the official CRE CLI, run its confidential workflow simulation from `CRE_PROJECT_DIRECTORY`, and save the output that proves `handlerInTee` ran. Never put private policy values or private keys in evidence logs.

## Security

Never commit private keys or funded credentials. Testnet and production use separate accounts and secret stores. LLM processes will propose actions, while deterministic policy code authorizes them. See `phases.md` for the testnet-to-production gates.
