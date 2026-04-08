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
NON_CANONICAL_ALLOWLIST=(
  "$REPO_ROOT/docs/templates/claude-md-backups/root/_archive"
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

while IFS= read -r dir; do
  skip=0
  for allowed in "${NON_CANONICAL_ALLOWLIST[@]}"; do
    if [[ "$dir" == "$allowed" || "$dir" == "$allowed/"* ]]; then
      skip=1
      break
    fi
  done
  if [[ "$skip" -eq 1 ]]; then
    continue
  fi
  rel="${dir#$REPO_ROOT/}"
  echo "[archive-guard] ERROR: non-canonical archive-like directory found: $rel"
  violations=$((violations + 1))
done < <(
  find "$REPO_ROOT" \
    \( -path "$REPO_ROOT/.git" -o -path "$REPO_ROOT/node_modules" -o -path "$REPO_ROOT/infra/node_modules" -o -path "$REPO_ROOT/docs/archive" -o -path "$REPO_ROOT/docs/archive/*" \) -prune \
    -o -type d -iregex '.*archive.*' -print
)

if [[ ! -d "$CANONICAL_ARCHIVE_ROOT" ]]; then
  echo "[archive-guard] ERROR: canonical archive root missing: docs/archive/repo-history"
  violations=$((violations + 1))
fi

if (( violations > 0 )); then
  echo "[archive-guard] FAIL ($violations issue(s))"
  exit 1
fi

echo "[archive-guard] OK"
