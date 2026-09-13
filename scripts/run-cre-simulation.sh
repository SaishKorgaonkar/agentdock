#!/usr/bin/env bash
set -euo pipefail

if command -v cre >/dev/null 2>&1; then
  cre_bin="$(command -v cre)"
elif [[ -x "${HOME}/.cre/cre" ]]; then
  cre_bin="${HOME}/.cre/cre"
else
  echo "Chainlink CRE CLI was not found. Install it and run 'cre login' first." >&2
  exit 127
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}/integrations/chainlink-cre"
exec "${cre_bin}" workflow simulate agentdock-policy --target staging-settings
