# 2026-09-12 — durable report store

- Added SQLite storage for signed reports keyed by request ID.
- The Risk API now recovers and reuses reports after restart instead of generating duplicates.
- Verified store restart recovery with unit tests.

**Open:** connect paid reports to the workflow orchestrator and run real x402 settlement.
