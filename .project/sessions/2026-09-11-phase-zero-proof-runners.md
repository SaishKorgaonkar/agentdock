# 2026-09-11 — Phase 0 proof runners

**Goal.** Make the Hedera and ENSv2 feasibility checks executable without committing credentials.

**Landed.**

- Added `@agentdock/phase-zero`, with scripts that execute a signed Hedera testnet transfer and write/read a public ENS resolver text record on Sepolia.
- Added required testnet-only configuration fields and documented exact local commands in the README.
- Added environment validation tests and allowed the required `protobufjs` postinstall used by the Hedera SDK.
- Verified `pnpm check` successfully: lint, type checks, four test suites, and four production builds pass.

**Didn't land.**

- No Hedera or Sepolia proof was executed: this checkout has no local testnet credentials or resolver configuration.
- CRE and staging deployment proofs remain unstarted.

**Open.**

- Provision/fund the required testnet accounts, run the two proof commands, then record only public transaction IDs and resolver outputs.
