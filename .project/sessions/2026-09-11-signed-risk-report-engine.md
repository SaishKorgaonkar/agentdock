# 2026-09-11 — signed risk-report engine

**Goal.** Produce real configured-chain evidence behind the paid Risk API.

**Landed.**

- Added a JSON-RPC EVM balance source using `eth_getBalance` against the configured RPC URL.
- Added deterministic address normalization, balance aggregation, SHA-256 evidence hashes, and Ed25519 report signatures.
- Added input validation and in-process request-id response reuse.
- Added unit coverage for signed report generation and invalid addresses.

**Open.**

- The deployed endpoint needs both x402 facilitator configuration and risk-data/signing secrets before it can serve a paid report.
- Persist report idempotency/replay data and connect paid reports to the orchestrator workflow.
