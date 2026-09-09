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
packages/      Domain and partner adapters added after Phase 0 feasibility
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

## Security

Never commit private keys or funded credentials. Testnet and production use separate accounts and secret stores. LLM processes will propose actions, while deterministic policy code authorizes them. See `phases.md` for the testnet-to-production gates.
