# 2026-09-11 — Hedera settlement verifier

**Goal.** Build the deterministic payment verification boundary needed by the paid Risk API.

**Landed.**

- Added `@agentdock/hedera` with a Hedera testnet transaction-record verifier.
- The verifier requires successful consensus and confirms the configured recipient received at least the quoted tinybar amount.
- Added pure verification tests for accepted and insufficient payment transfers.

**Open.**

- The Risk API still needs its HTTP 402 quote, request/payment replay protection, and report generation flow.
- A funded testnet account is required to verify against a real Hedera transaction record.
