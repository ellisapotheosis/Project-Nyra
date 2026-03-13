#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd -P)"

CANONICAL_ARCHIVE_ROOT="$REPO_ROOT/docs/archive/repo-history"
DEPRECATED_DIRS=(
  "$REPO_ROOT/archive"
  "$REPO_ROOT/_archived"
  "$REPO_ROOT/scripts/_archive"
)

violations=0

echo "[archive-guard] Canonical archive root: docs/archive/repo-history"

for dir in "${DEPRECATED_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    rel="${dir#$REPO_ROOT/}"
    echo "[archive-guard] ERROR: deprecated archive path exists: $rel"
    violations=$((violations + 1))
  fi
done

if [[ ! -d "$CANONICAL_ARCHIVE_ROOT" ]]; then
  echo "[archive-guard] ERROR: canonical archive root missing: docs/archive/repo-history"
  violations=$((violations + 1))
fi

if (( violations > 0 )); then
  echo "[archive-guard] FAIL ($violations issue(s))"
  exit 1
fi

echo "[archive-guard] OK"
