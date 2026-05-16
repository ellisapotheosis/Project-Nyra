#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd -P)"
REPORT_DIR="$REPO_ROOT/docs/reports/consolidation"
REPORT_PATH="${1:-$REPORT_DIR/REPO-STRUCTURE-AUDIT-$(date +%F).md}"

mkdir -p "$REPORT_DIR"

count_files() {
  local path="$1"
  if [[ -d "$path" ]]; then
    find "$path" -type f | wc -l | tr -d ' '
  else
    echo 0
  fi
}

disk_usage() {
  local path="$1"
  if [[ -d "$path" ]]; then
    du -sh "$path" 2>/dev/null | awk '{print $1}'
  else
    echo "0B"
  fi
}

docs_files="$(count_files "$REPO_ROOT/docs")"
scripts_files="$(count_files "$REPO_ROOT/scripts")"
infra_files="$(count_files "$REPO_ROOT/infra")"
apps_files="$(count_files "$REPO_ROOT/apps")"

archive_files="$(count_files "$REPO_ROOT/docs/archive/repo-history")"
archive_size="$(disk_usage "$REPO_ROOT/docs/archive/repo-history")"

{
  echo "# Repo Structure Audit"
  echo
  echo "- Generated: $(date -Iseconds)"
  echo "- Repo: $REPO_ROOT"
  echo
  echo "## Hotspot Counts"
  echo
  echo "| Area | File Count |"
  echo "|---|---:|"
  echo "| docs/ | $docs_files |"
  echo "| scripts/ | $scripts_files |"
  echo "| infra/ | $infra_files |"
  echo "| apps/ | $apps_files |"
  echo
  echo "## Archive State"
  echo
  echo "| Path | Files | Size |"
  echo "|---|---:|---:|"
  echo "| docs/archive/repo-history | $archive_files | $archive_size |"
  echo
  echo "## Deprecated Archive Path Check"
  echo
  for old in archive _archived scripts/_archive; do
    if [[ -d "$REPO_ROOT/$old" ]]; then
      echo "- FAIL: \`$old/\` still exists."
    else
      echo "- OK: \`$old/\` not present."
    fi
  done
  echo
  echo "## Infra Host Scaffolding Check"
  echo
  for host_dir in \
    infra/hosts/oracle-host \
    infra/hosts/orchestrator-host \
    infra/hosts/worker-pc-hosts \
    infra/hosts/homeassistant-host
  do
    if [[ -d "$REPO_ROOT/$host_dir" ]]; then
      echo "- OK: \`$host_dir\`"
    else
      echo "- MISSING: \`$host_dir\`"
    fi
  done
  echo
  echo "## Suggested Next Operations"
  echo
  echo "1. Run \`make archive-guard\` in CI to prevent path regression."
  echo "2. Consolidate docs taxonomy (merge duplicate themes like \`infra/\` vs \`infrastructure/\`)."
  echo "3. Merge script entrypoints under one operator CLI and keep old scripts as thin wrappers."
  echo "4. Normalize infra host ownership files under \`infra/hosts/*\`."
} > "$REPORT_PATH"

echo "[repo-structure-audit] Wrote $REPORT_PATH"
