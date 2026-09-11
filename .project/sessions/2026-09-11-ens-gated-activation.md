# 2026-09-11 — ENS-gated activation

**Goal.** Make real ENS authority a required gate before the workflow can progress.

**Landed.**

- Added `POST /v1/workflows/:workflowId/authorize-ens`.
- The endpoint reads configured ENS authority, checks expiry, revocation, and the requested capability, then transitions only authorized workflows from `DRAFT` to `ACTIVE`.
- The server initializes a read-only ENS adapter only when Sepolia RPC and resolver configuration are present.
- Added API coverage for authorized activation and denied agents.

**Open.**

- Live authority records and a writable resolver are still needed to run this path on Sepolia.
- The next product integration is the x402-gated Hedera risk-report service.
