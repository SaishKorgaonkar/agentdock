# 2026-09-11 — durable workflow store

**Goal.** Make workflow events and idempotency survive orchestrator restarts.

**Landed.**

- Added a SQLite-backed workflow store using Node's built-in `node:sqlite` module.
- Created workflow and immutable event tables with per-workflow sequence and idempotency uniqueness constraints.
- Configured the server to use `DATABASE_URL=file:...` for durable storage, while preserving in-memory injection for isolated tests.
- Added a restart test that recovers the workflow and verifies a repeated idempotency key does not create another event.

**Open.**

- Provision managed persistence, migrations, backups, and monitoring for staging/production.
- Phase 0 external testnet proofs and partner adapters remain pending.
