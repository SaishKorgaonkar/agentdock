# 2026-09-13 — CRE TEE simulation

**Goal.** Establish CRE CLI access and execute the AgentDock private-policy handler through `handlerInTee`.

**Landed.**

- Installed and authenticated CRE CLI `v1.33.0`.
- Scaffolded `~/code/agentdock-cre` with a Chainlink-hosted private registry.
- Pinning generated `@chainlink/cre-sdk` to `1.20.0` avoids the invalid `workspace:*` dependency in `1.21.0`.
- Added the AgentDock TEE wrapper in `packages/chainlink-cre/src/tee-workflow.ts`.
- Ran `cre workflow simulate agentdock-policy --target staging-settings`.
- CLI selected AWS Nitro in `us-west-2` and returned `COMPLETED` for the synthetic threshold-policy input.

**Limit.**

- The CRE CLI explicitly identifies this as a simulator, not a real TEE. The account reports deployment access as disabled; real enclave evidence requires `cre account access` approval and deployment.
