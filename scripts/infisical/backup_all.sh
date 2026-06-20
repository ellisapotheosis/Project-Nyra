#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

ENVIRONMENTS=("dev" "staging" "prod")
OUTPUT_ROOT="./infisical_backup/$(date +%Y%m%dT%H%M%SZ)"

# Ensure backups never reach git
grep -qxF 'infisical_backup/' .gitignore 2>/dev/null || echo 'infisical_backup/' >> .gitignore

# BFS: returns newline-delimited list of all folder paths under $2 in env $1
discover_paths() {
  local env="$1"
  local start="${2:-/}"
  local queue=("$start")
  local all=("$start")

  while [ ${#queue[@]} -gt 0 ]; do
    local current="${queue[0]}"
    queue=("${queue[@]:1}")

    # Parse folder names from CLI table output
    local children
    children=$(infisical secrets folders get --env="${env}" --path="${current}" 2>/dev/null \
      | grep "│" \
      | grep -v "FOLDER NAME\|─\|═" \
      | awk -F'│' '{gsub(/^[[:space:]]+|[[:space:]]+$/,"",$2); if($2!="" && $2!="FOLDER NAME") print $2}' \
      | grep -v '^$') || true

    for name in $children; do
      local child_path
      if [ "$current" = "/" ]; then
        child_path="/${name}"
      else
        child_path="${current}/${name}"
      fi
      queue+=("$child_path")
      all+=("$child_path")
    done
  done

  printf '%s\n' "${all[@]}"
}

echo "Tri-environment recursive export -> ${OUTPUT_ROOT}"

for ENV in "${ENVIRONMENTS[@]}"; do
  echo ""
  echo "===== ${ENV} ====="
  echo "  Discovering folder tree..."

  # Discover all paths via BFS
  mapfile -t PATHS < <(discover_paths "${ENV}" "/")
  echo "  Found ${#PATHS[@]} paths"

  for P in "${PATHS[@]}"; do
    DIR="${OUTPUT_ROOT}/${ENV}${P}"
    mkdir -p "${DIR}"

    # Un-hydrated = preserves ${...} reference templates (safe to commit structure)
    infisical export --env="${ENV}" --path="${P}" --format=dotenv --expand=false \
      --output-file="${DIR}/.env.template" --silent 2>/dev/null || true

    # Hydrated copy for value-level dedup (stays out of git via .gitignore)
    infisical export --env="${ENV}" --path="${P}" --format=dotenv \
      --output-file="${DIR}/.env.resolved" --silent 2>/dev/null || true

    # Remove empty files
    [ -s "${DIR}/.env.template" ] || rm -f "${DIR}/.env.template"
    [ -s "${DIR}/.env.resolved" ] || rm -f "${DIR}/.env.resolved"

    if [ -s "${DIR}/.env.template" ] || [ -s "${DIR}/.env.resolved" ]; then
      echo "  [ok] ${ENV}:${P}"
    fi
  done
done

echo ""
echo "Snapshot complete: ${OUTPUT_ROOT}"
FILE_COUNT=$(find "${OUTPUT_ROOT}" -type f 2>/dev/null | wc -l)
echo "Files written: ${FILE_COUNT}"
echo "Rollback pointer: ${OUTPUT_ROOT}"
