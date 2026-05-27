#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

allowed_top_level_dirs=(
  ".agents"
  ".circleci"
  ".claude"
  ".codex"
  ".cortex"
  ".factory"
  ".gemini"
  ".git"
  ".gitea"
  ".githooks"
  ".github"
  ".goose"
  ".husky"
  ".letta"
  ".llxprt"
  ".omc"
  ".omx"
  ".playwright-mcp"
  ".pytest_cache"
  ".rtk"
  ".serena"
  ".turbo"
  ".vscode"
  "apps"
  "bootstrap"
  "config"
  "conductor"
  "data"
  "dist"
  "docs"
  "external"
  "infra"
  "node_modules"
  "packages"
  "playwright-report"
  "reports"
  "scripts"
  "security-reports"
  "services"
  "skills"
  "src"
  "test-results"
  "tests"
  "workflows"
)

allowed_file="$(mktemp)"
actual_file="$(mktemp)"
root_compose_file="$(mktemp)"
cleanup() {
  rm -f "$allowed_file" "$actual_file" "$root_compose_file"
}
trap cleanup EXIT

printf '%s\n' "${allowed_top_level_dirs[@]}" | sort >"$allowed_file"
find . -maxdepth 1 -mindepth 1 -type d -printf '%f\n' | sort >"$actual_file"

if ! diff -u "$allowed_file" "$actual_file" >/tmp/nyra-top-level-dir-diff.txt; then
  cat >&2 <<'MSG'
Repo policy violation: top-level directory set changed.

Add an owning ADR or decision note before creating a new top-level directory,
then update scripts/infra/validate-repo-policy.sh with that approved directory.
Diff:
MSG
  cat /tmp/nyra-top-level-dir-diff.txt >&2
  exit 1
fi

find . -maxdepth 1 -type f \
  \( -name 'docker-compose*.yml' -o -name 'docker-compose*.yaml' \) \
  -printf '%f\n' \
  | sort >"$root_compose_file"

if [ -s "$root_compose_file" ]; then
  cat >&2 <<'MSG'
Repo policy violation: root-level docker-compose files are not allowed.

Runtime compose files must live under infra/hosts/<host>/.
Offending files:
MSG
  cat "$root_compose_file" >&2
  exit 1
fi

bash scripts/infra/assert-compose-source-of-truth.sh >/dev/null

echo "repo policy validation passed"
