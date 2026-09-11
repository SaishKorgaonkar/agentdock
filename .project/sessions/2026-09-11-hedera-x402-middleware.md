# 2026-09-11 — Hedera x402 middleware

**Goal.** Establish the standards-based payment gate for the paid Risk API.

**Landed.**

- Added `@x402/fastify`, `@x402/core`, and `@x402/hedera` to the Risk API.
- Configured `POST /v1/risk-reports` for the x402 v2 Hedera testnet `exact` scheme with HBAR denominated in tinybars.
- Made the facilitator URL, recipient, and quoted price environment-configurable.
- The endpoint refuses to serve reports when x402 is not configured.

**Open.**

- Add live facilitator configuration and test a real x402 client payment.
- Implement genuine configured-chain report generation, signing, request idempotency, and replay protection behind the payment gate.
