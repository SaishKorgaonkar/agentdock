# AgentDock demo script

Target length: 3–4 minutes. Keep the browser zoom near 90%, close unrelated tabs, and open the links below before recording.

## Tabs to prepare

1. https://agentdock-web-pi.vercel.app
2. https://agentdock-web-pi.vercel.app/services
3. https://agentdock-web-pi.vercel.app/workflow
4. https://agentdock-web-pi.vercel.app/providers
5. [Hedera transaction](https://hashscan.io/testnet/transaction/0.0.9185802@1789310877.433059891)
6. [Sepolia receipt](https://sepolia.etherscan.io/tx/0x466d5ec559b09d626db5d0d2b39195765b74739fd52b49069b9030666286bdfe)
7. A terminal opened at the AgentDock repository root, with `cre login` completed

## 0:00–0:30 — Problem and product

**Show:** Landing-page hero and integration strip.

**Say:**

> AI agents can discover services, but organizations cannot safely give them unrestricted identity, credentials, or spending authority. AgentDock is a policy-controlled marketplace and execution layer. Providers publish ENS-identified, x402-priced services. Users run governed workflows and receive cryptographic evidence for every step.

## 0:30–0:55 — Marketplace and provider model

**Show:** `/services`, then `/providers`.

**Say:**

> This catalog is loaded from the live orchestrator API. Each listing has an ENS identity, capability, endpoint, and Hedera tinybar price. A provider signs in with Privy, publishes a service, and AgentDock verifies its live ENS authority before listing it. Their dashboard tracks owned services, verified deliveries, and earnings.

## 0:55–1:20 — Authentication and workflow isolation

**Show:** Sign in using email OTP. Open `/workflow` and create a workflow.

**Say:**

> Privy provides email and wallet authentication. The API verifies the JWT server-side, and every workflow is owned by that Privy user. A second account cannot list or mutate this workflow. Users can create and revisit multiple durable executions.

## 1:20–1:50 — ENS authorization

**Show:** Select AgentDock Risk API, attach it, leave `agentdock.eth`, then click **Verify authority**.

**Say:**

> Before spend is enabled, the orchestrator reads scoped ENSv2 text records from Sepolia. It checks capability, expiry, revocation, endpoint, x402 network, and policy hash. The real resolver moves this workflow from draft to active.

## 1:50–2:20 — Real x402 payment and signed delivery

**Show:** The payment consent section, then switch to the verified HashScan transaction. Do not trigger another paid request unless another 10,000-tinybar test payment is intentionally approved.

**Say:**

> Payment is never automatic. The user sees the exact charge and must explicitly consent. In our verified production run, x402 transferred exactly 10,000 tinybars from the AgentDock payer to the provider. HashScan reports success. Only after settlement did the Risk API query the Sepolia balance, calculate this evidence hash, and sign the report with Ed25519.

Point out:

```text
Workflow: production-proof-1789310883504
Hedera: 0.0.9185802@1789310877.433059891
Evidence: 0xf84c076e05b0e593ec2d563f259c4a4618737c57c51e66ec0c5cbc4a0ea0f3cc
```

## 2:20–2:50 — Chainlink CRE policy

**Show:** Run `pnpm cre:simulate` from the repository root. Point out `handlerInTee`, Nitro, `us-west-2`, and `COMPLETED` in the result.

**Say:**

> The signed evidence feeds a deterministic policy evaluator. I am now triggering the committed Chainlink CRE workflow locally through the official simulator. It wraps the same evaluator with handlerInTee, targeting AWS Nitro in us-west-2. The simulator returns COMPLETED for the verified report and threshold. We label it simulator verified and do not claim a live confidential deployment while access remains gated.

## 2:50–3:15 — Sepolia receipt

**Show:** Etherscan receipt transaction and emitted event.

**Say:**

> The terminal decision is anchored in our Sepolia receipt registry. This transaction succeeded and emitted the workflow ID hash, agent namehash, evidence hash, decision status, and Hedera payment reference. Raw report data and private policy inputs never go onchain.

Point out:

```text
Decision: COMPLETED
Decision hash: 0xe3d8223209e131997922cdccc67ca08819c01af73805bbac363911b32eee92cb
Receipt: 0x466d5ec559b09d626db5d0d2b39195765b74739fd52b49069b9030666286bdfe
```

## 3:15–3:35 — Close

**Show:** Workflow timeline or landing-page final CTA.

**Say:**

> AgentDock turns agent commerce into a bounded, inspectable process: ENS controls who may act, Hedera x402 controls what may be purchased, signed evidence proves delivery, CRE evaluates policy, and Sepolia preserves the final receipt. The complete product is publicly available on testnet.

## Recording checklist

- Never display `.env.local`, Fly secrets, wallet private keys, seed phrases, or PEM contents.
- Clearly say **testnet**.
- Run `cre login` before recording so `pnpm cre:simulate` does not pause for authentication.
- Clearly say **CRE simulator verified**, not live TEE deployed.
- Show both explorer transaction statuses.
- Show the explicit payment checkbox.
- Demonstrate login and workflow ownership with a clean user account.
- Keep the final recording under the event limit.
