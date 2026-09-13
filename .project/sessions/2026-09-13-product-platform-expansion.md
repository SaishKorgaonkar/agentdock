# 2026-09-13 — Product platform expansion

**Direction.** User expanded AgentDock from a single treasury workflow into a public agent-service marketplace/control plane: providers publish ENS-identified, x402-priced services; users discover services, launch policy-bound workflows, and inspect evidence/earnings. UI remains Fluence-inspired dark/neon.

**Landed.**

- Scope/task board updated and committed as `5b30331`.
- Added persistent provider-service stores (`apps/api/src/service-store.ts`) and catalog endpoints (`GET/POST /v1/services`), committed as `645d2d6`.
- Created Fly apps under the user's personal account: `agentdock-api-staging-sai`, `agentdock-risk-api-staging-sai`, with encrypted 1GB `sjc` volumes. API initial deploy built/started but Fly public DNS/IP allocation needs stabilization before calling it public.

**Auth decision.** Use Privy email + wallet authentication for Vercel UI and API JWT enforcement. Do not implement a fake/demo auth mode.

**Completed.**

1. Privy login, JWT verification, user-owned workflows, provider-owned listings, and provider earnings summary.
2. Stable Fly APIs with persistent volumes and Vercel product UI.
3. Guided ENS authorization, capped Hedera x402 purchase, signed evidence, shared CRE policy evaluation, and Sepolia receipt display.
4. One complete real testnet proof: workflow `production-proof-1789310883504`, Hedera transaction `0.0.9185802@1789310877.433059891`, Sepolia receipt `0x466d5ec559b09d626db5d0d2b39195765b74739fd52b49069b9030666286bdfe`.
5. README architecture, customer/provider onboarding, evidence table, and recording script.

**Real evidence to preserve.**

- ENS name `agentdock.eth`; proof tx `0x5c69c7c0cdcaedd711b095124cddfbfd8d895abf6b76956090915abf7e1894c3`.
- Receipt registry `0x70fa78b86d6e1992989c98ddcbf61162a80a8c06`; deploy tx `0x8733614706e161c14f00f937ff537e55b70a6b588f7d43dbb1b2a3d267df7d1d`.
- CRE local AWS Nitro `handlerInTee` simulation is valid evidence but never label it a real enclave; Chainlink access request is waitlisted.
- Fly auth must remain personal `saishkorgaonkar14@gmail.com`, never `itsupport@notyouridea.com`.
