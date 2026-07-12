#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

base_ref="${1:-${DEPENDENCY_SCOPE_BASE:-origin/main}}"
max_lockfile_lines="${DEPENDENCY_SCOPE_MAX_LOCKFILE_LINES:-2500}"
changed_files_file="${DEPENDENCY_SCOPE_CHANGED_FILES_FILE:-}"

# This is deliberately a review-budget gate. It catches orphaned or unusually
# broad lockfile churn; package-level semantic review remains the reviewer's job.

if [[ -z "$changed_files_file" ]] && ! git rev-parse --verify "$base_ref" >/dev/null 2>&1; then
  echo "dependency scope violation: base ref '$base_ref' does not exist" >&2
  echo "Fetch the pull request base branch before running this check." >&2
  exit 1
fi

if [[ -n "$changed_files_file" ]]; then
  mapfile -t changed_files <"$changed_files_file"
else
  mapfile -t changed_files < <(git diff --name-only "${base_ref}...HEAD")
fi

lockfile_changed=false
manifest_changed=false
for file in "${changed_files[@]}"; do
  case "$file" in
    pnpm-lock.yaml) lockfile_changed=true ;;
    package.json|*/package.json|pnpm-workspace.yaml) manifest_changed=true ;;
  esac
done

if [[ "$lockfile_changed" != true ]]; then
  echo "dependency scope: pnpm-lock.yaml unchanged"
  exit 0
fi

if [[ "$manifest_changed" != true ]]; then
  echo "dependency scope violation: pnpm-lock.yaml changed without a package manifest or workspace change" >&2
  exit 1
fi

if [[ -n "${DEPENDENCY_SCOPE_LOCKFILE_LINES:-}" ]]; then
  lockfile_lines="$DEPENDENCY_SCOPE_LOCKFILE_LINES"
else
  lockfile_lines="$({ git diff --numstat "${base_ref}...HEAD" -- pnpm-lock.yaml || true; } | awk '{ added += $1; deleted += $2 } END { print added + deleted + 0 }')"
fi
if ((lockfile_lines > max_lockfile_lines)); then
  echo "dependency scope violation: pnpm-lock.yaml changes ${lockfile_lines} lines (limit: ${max_lockfile_lines})" >&2
  echo "Split unrelated dependency updates or set DEPENDENCY_SCOPE_MAX_LOCKFILE_LINES with an explicit review rationale." >&2
  exit 1
fi

echo "dependency scope: lockfile change is paired with a manifest and within the ${max_lockfile_lines}-line review budget"
