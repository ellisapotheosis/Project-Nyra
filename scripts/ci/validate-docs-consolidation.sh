#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BASE_REF="${DOCS_CONSOLIDATION_BASE_REF:-origin/main}"
TARGET_REF="${DOCS_CONSOLIDATION_TARGET_REF:-HEAD}"

if ! command -v rg >/dev/null 2>&1; then
  echo "[FAIL] ripgrep is required for docs consolidation validation." >&2
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[FAIL] docs consolidation validation must run inside a git worktree." >&2
  exit 1
fi

if git rev-parse --verify "${BASE_REF}^{commit}" >/dev/null 2>&1; then
  BASE_COMMIT="$(git merge-base "$BASE_REF" "$TARGET_REF")"
elif git rev-parse --verify "${TARGET_REF}^" >/dev/null 2>&1; then
  BASE_COMMIT="$(git rev-parse "${TARGET_REF}^")"
  echo "[WARN] ${BASE_REF} was not found; using ${TARGET_REF}^ as the validation base." >&2
else
  echo "[FAIL] Could not resolve a validation base. Set DOCS_CONSOLIDATION_BASE_REF." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

banned_terms='(ruflo|claude-flow|ruvector|flow-nexus|ruv-swarm|agentic-flow|agentdb|agent booster|epic sdk|sona)'
allowed_legacy_pathspecs=(
  ':(exclude)docs/archive/**'
  ':(exclude)docs/ACTIVE-ToDo/claude-flow-purge-guide.md'
)

write_docs_diff() {
  git diff --unified=0 --no-ext-diff "$BASE_COMMIT" "$TARGET_REF" -- docs "${allowed_legacy_pathspecs[@]}"
  git diff --cached --unified=0 --no-ext-diff -- docs "${allowed_legacy_pathspecs[@]}"
  git diff --unified=0 --no-ext-diff -- docs "${allowed_legacy_pathspecs[@]}"
}

docs_diff="$tmp_dir/docs.diff"
write_docs_diff >"$docs_diff"

if rg -n -i "^\\+[^+].*\\b${banned_terms}\\b" "$docs_diff" >"$tmp_dir/deprecated-docs-hits.txt"; then
  echo "[FAIL] New deprecated stack references were added to docs:"
  cat "$tmp_dir/deprecated-docs-hits.txt"
  exit 1
fi

name_status="$tmp_dir/name-status.txt"
{
  git diff --name-status --diff-filter=AR "$BASE_COMMIT" "$TARGET_REF"
  git diff --cached --name-status --diff-filter=AR
  git diff --name-status --diff-filter=AR
} >"$name_status"

awk -F '\t' '
  BEGIN { fail = 0 }
  /^R/ { path = $3; check(path); next }
  { path = $2; check(path) }
  function check(path) {
    lower = tolower(path)
    if (lower ~ /^docs\// && lower ~ /n8n/ && lower ~ /\.json$/ &&
        lower !~ /^docs\/n8n-consolidation\// &&
        lower !~ /^docs\/workflows\/n8n\// &&
        lower !~ /^docs\/archive\//) {
      print path
      fail = 1
    }
  }
  END { exit fail }
' "$name_status" >"$tmp_dir/n8n-json-outside.txt" || {
  echo "[FAIL] New or renamed n8n JSON docs must stay under docs/n8n-consolidation/, docs/workflows/n8n/, or docs/archive/:"
  cat "$tmp_dir/n8n-json-outside.txt"
  exit 1
}

echo "[PASS] Docs consolidation guardrails passed."
