# 2026-09-11 — orchestrator workflow API

**Goal.** Connect the shared state machine to a usable orchestrator API.

**Landed.**

- Added `POST /v1/workflows`, `GET /v1/workflows/:workflowId`, and `POST /v1/workflows/:workflowId/transitions`.
- Added an injectable in-memory workflow store around the shared domain state machine.
- Returned explicit 400, 404, and 409 responses for invalid input, missing workflows, and illegal transitions.
- Added API tests for creation, retrieval, transition idempotency, missing workflows, and skipped states.

**Open.**

- The in-memory store deliberately does not survive a restart; replace it with durable event persistence and idempotency storage next.
