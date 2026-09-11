# 2026-09-11 — ENS authority adapter

**Goal.** Implement scoped, expiring, revocable agent authority before connecting it to live ENS infrastructure.

**Landed.**

- Added `@agentdock/ens`, which reads and writes ENS resolver text records on Sepolia through viem.
- Defined public authority records for role, capabilities, expiry, endpoint, Hedera x402 network, policy hash, and revocation time.
- Added local policy enforcement that rejects expired or revoked authority and malformed records.
- Added tests for active, expired, revoked, malformed, and incomplete authority records.

**Open.**

- The configured account must own/delegate writes to the target ENSv2-compatible resolver; prove live grant and revocation once the resolver is provisioned.
- Wire live authority checks into the orchestrator before payment execution.
