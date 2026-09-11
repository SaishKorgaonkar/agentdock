# 2026-09-11 — Workflow state machine

**Goal.** Implement the deterministic workflow foundation while external Phase 0 accounts are provisioned.

**Landed.**

- Added `@agentdock/domain` with the workflow states required by the treasury-risk flow.
- Implemented immutable workflow events, strict legal transitions, terminal states, and idempotency-key replay handling.
- Added tests for the completed path, skipped transitions, terminal-state rejection, duplicate keys, and invalid input.
- Verified the domain package builds, type-checks, and passes its four tests.

**Open.**

- Persist events and idempotency history in the orchestrator before connecting real partner adapters.
- Phase 0 Hedera, ENS, CRE, and staging proof execution still requires external credentials/setup.
