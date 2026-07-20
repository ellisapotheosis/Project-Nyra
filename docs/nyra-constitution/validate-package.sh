#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"

required=(
  "README.md"
  "PROJECT_NYRA_MASTER_CONSTITUTION_WHITEPAPER.md"
  "AI_CONTROL_PLANE_AND_PR_RECONCILIATION_2026-07-19.md"
  "ARCHITECTURE_GOVERNANCE_AND_ROADMAP.md"
  "REPO_TRUTH_CONFLICT_REGISTER_AND_ADRS.md"
  "MASTER_AGENT_HANDOFF_PROMPT.md"
)

for path in "${required[@]}"; do
  test -s "$ROOT/$path" || {
    echo "Missing required constitution file: $path" >&2
    exit 1
  }
done

if grep -RInE '(sk-(proj|live|test)-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|AKIA[0-9A-Z]{16})' "$ROOT" --exclude='validate-package.sh'; then
  echo "Potential secret material detected in constitution package" >&2
  exit 1
fi

for path in "${required[@]}"; do
  if grep -qE '(^|[^A-Za-z])(TODO|TBD|FIXME)([^A-Za-z]|$)' "$ROOT/$path"; then
    echo "Warning: unresolved marker found in $path" >&2
  fi
done

if ! grep -q 'LiteLLM is the canonical' "$ROOT/AI_CONTROL_PLANE_AND_PR_RECONCILIATION_2026-07-19.md"; then
  echo "AI control-plane gateway decision is missing" >&2
  exit 1
fi

if ! grep -q 'A2A 1.0' "$ROOT/AI_CONTROL_PLANE_AND_PR_RECONCILIATION_2026-07-19.md"; then
  echo "A2A migration target is missing" >&2
  exit 1
fi

echo "Project Nyra constitution package validation passed."