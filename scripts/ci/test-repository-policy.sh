#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

tmp_offender="infra/repository-policy-test-compose.yml"
tmp_host_offender="infra/hosts/repository-policy-test-compose.yml"
labels_file="$(mktemp)"
changed_files_file="$(mktemp)"
cleanup() {
  rm -f "$tmp_offender" "$tmp_host_offender" "$labels_file" "$changed_files_file"
}
trap cleanup EXIT

touch "$tmp_offender"
if bash scripts/infra/assert-compose-source-of-truth.sh >/dev/null 2>&1; then
  echo "repository policy test failed: Compose boundary accepted $tmp_offender" >&2
  exit 1
fi
rm -f "$tmp_offender"

touch "$tmp_host_offender"
if bash scripts/infra/assert-compose-source-of-truth.sh >/dev/null 2>&1; then
  echo "repository policy test failed: Compose boundary accepted $tmp_host_offender" >&2
  exit 1
fi
rm -f "$tmp_host_offender"

bash scripts/infra/assert-compose-source-of-truth.sh >/dev/null

printf '%s\n' dependencies github-actions javascript memory python >"$labels_file"
bash scripts/ci/validate-dependabot-labels.sh "$labels_file" >/dev/null

printf '%s\n' pnpm-lock.yaml >"$changed_files_file"
if DEPENDENCY_SCOPE_CHANGED_FILES_FILE="$changed_files_file" \
  bash scripts/ci/check-dependency-change-scope.sh >/dev/null 2>&1; then
  echo "repository policy test failed: lockfile-only change was accepted" >&2
  exit 1
fi

printf '%s\n' package.json pnpm-lock.yaml >"$changed_files_file"
DEPENDENCY_SCOPE_CHANGED_FILES_FILE="$changed_files_file" DEPENDENCY_SCOPE_LOCKFILE_LINES=200 \
  bash scripts/ci/check-dependency-change-scope.sh >/dev/null

if DEPENDENCY_SCOPE_CHANGED_FILES_FILE="$changed_files_file" DEPENDENCY_SCOPE_LOCKFILE_LINES=3000 \
  bash scripts/ci/check-dependency-change-scope.sh >/dev/null 2>&1; then
  echo "repository policy test failed: over-budget lockfile change was accepted" >&2
  exit 1
fi

if bash scripts/ci/check-dependency-change-scope.sh refs/heads/repository-policy-missing >/dev/null 2>&1; then
  echo "repository policy test failed: missing dependency base ref was accepted" >&2
  exit 1
fi

echo "repository policy tests passed"
