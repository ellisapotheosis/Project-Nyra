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
  ".temp_templates"
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

# Only validate directories that are tracked or visible to git. Local ignored
# work dirs such as secrets/ must stay out of commits, but should not break CI.
{
  git ls-files | awk -F/ 'NF > 1 { print $1 }'
  git ls-files --others --exclude-standard | awk -F/ 'NF > 1 { print $1 }'
  [ -d .git ] && printf '.git\n'
} | sort -u >"$actual_file"

if comm -13 "$allowed_file" "$actual_file" >/tmp/nyra-top-level-dir-diff.txt && [ -s /tmp/nyra-top-level-dir-diff.txt ]; then
  cat >&2 <<'MSG'
Repo policy violation: top-level directory set changed.

Add an owning ADR or decision note before creating a new top-level directory,
then update scripts/infra/validate-repo-policy.sh with that approved directory.
Extra git-visible top-level directories:
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
