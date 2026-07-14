#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

failures=0

pass() { printf '  OK  %s\n' "$1"; }
fail() { printf '  ERR %s\n' "$1" >&2; failures=$((failures + 1)); }

printf 'Project Nyra developer readiness\n'

for command in git node pnpm docker openssl; do
  if command -v "$command" >/dev/null 2>&1; then
    pass "$command is installed"
  else
    fail "$command is required"
  fi
done

if command -v node >/dev/null 2>&1; then
  node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
  if ((node_major >= 20)); then
    pass "Node.js major version is supported (>=20)"
  else
    fail "Node.js 20 or newer is required"
  fi
fi

if command -v node >/dev/null 2>&1 && command -v pnpm >/dev/null 2>&1; then
  expected_pnpm="$(node -p "require('./package.json').packageManager.split('@')[1]")"
  actual_pnpm="$(pnpm --version)"
  if [[ "$actual_pnpm" == "$expected_pnpm" ]]; then
    pass "pnpm matches package.json ($expected_pnpm)"
  else
    fail "pnpm $expected_pnpm is required by package.json (found $actual_pnpm)"
  fi
fi

if command -v git >/dev/null 2>&1 && git lfs version >/dev/null 2>&1; then
  if git lfs fsck >/dev/null; then
    pass "Git LFS objects and pointers are valid"
  else
    fail "Git LFS integrity failed; run 'git lfs pull' and retry"
  fi
else
  fail "Git LFS is required"
fi

if [[ -d node_modules ]]; then
  pass "workspace dependencies are installed"
else
  fail "workspace dependencies are missing; run 'pnpm install --frozen-lockfile'"
fi

if bash scripts/infra/assert-compose-source-of-truth.sh >/dev/null; then
  pass "active Compose sources are confined to infra/hosts/*"
else
  fail "Compose source-of-truth boundary is invalid"
fi

if command -v docker >/dev/null 2>&1 && bash scripts/ci/validate-infra.sh >/dev/null; then
  pass "host Compose manifests and infrastructure scripts validate"
else
  fail "infrastructure validation failed; run 'bash scripts/ci/validate-infra.sh' for details"
fi

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if bash scripts/ci/validate-dependabot-labels.sh >/dev/null; then
    pass "Dependabot labels exist in the repository"
  else
    fail "Dependabot references missing repository labels"
  fi
else
  printf '  SKIP Dependabot label check (gh is not authenticated)\n'
fi

if ((failures)); then
  printf '\nDeveloper readiness failed with %d issue(s).\n' "$failures" >&2
  exit 1
fi

printf '\nReady for development. Start the workspace with: pnpm dev\n'
