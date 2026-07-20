#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ENV_NAME="${INFISICAL_ENV:-dev}"
INCLUDE_EXAMPLES=0
usage() { printf '%s\n' 'Usage: scripts/infisical/boundary-import.sh <plan|dry-run|import> [--env dev|staging|prod] [--include-examples]'; }
COMMAND="${1:-}"
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_NAME="${2:?missing --env value}"; shift 2 ;;
    --include-examples) INCLUDE_EXAMPLES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done
[[ -n "$COMMAND" ]] || { usage >&2; exit 2; }
manifest() {
  cat <<'EOF'
/hosts/oracle-vps|infra/hosts/oracle-vps/.env.agent-vault
/hosts/oracle-vps|infra/hosts/oracle-vps/.env.oracle
/hosts/orchestrator|infra/hosts/orchestrator/.env
/hosts/worker-rtx5090|infra/hosts/worker-rtx5090/.env
/hosts/worker-rtx3090ti|infra/hosts/worker-rtx3090ti/.env
/apps/projectnyra|apps/projectnyra/.env.local
/apps/projectnyra|apps/projectnyra/.env.production
/apps/projectnyra|apps/projectnyra/.env.example
/apps/ratehunter|apps/ratehunter/.env.local
/apps/ratehunter|apps/ratehunter/.env.production
/apps/ratehunter|apps/ratehunter/.env.example
/apps/projectnyra-landing|apps/projectnyra-landing/.env.local
/apps/projectnyra-landing|apps/projectnyra-landing/.env.production
EOF
}
keys() { sed -nE 's/^([A-Za-z_][A-Za-z0-9_]*)=.*/\1/p' "$1" | sort -u; }
ensure_folder() {
  local path="$1" parent=/ part current
  IFS=/ read -ra parts <<< "${path#/}"
  for part in "${parts[@]}"; do
    [[ -n "$part" ]] || continue
    current="${parent%/}/$part"
    infisical secrets folders create --projectId "$PROJECT_ID" --env "$ENV_NAME" --path "$parent" --name "$part" --silent >/dev/null 2>&1 || true
    parent="$current"
  done
}
case "$COMMAND" in
  plan) printf 'project_id=%s env=%s\n' "$PROJECT_ID" "$ENV_NAME"; manifest ;;
  dry-run)
    printf 'project_id=%s env=%s\n' "$PROJECT_ID" "$ENV_NAME"
    while IFS='|' read -r path file; do
      [[ "$INCLUDE_EXAMPLES" -eq 1 || "$file" != *.example ]] || continue
      [[ -f "$file" ]] || { printf 'missing %s %s\n' "$path" "$file"; continue; }
      printf 'source %s %s keys=%s\n' "$path" "$file" "$(keys "$file" | wc -l | tr -d ' ')"
    done < <(manifest)
    ;;
  import)
    infisical secrets folders get --projectId "$PROJECT_ID" --env "$ENV_NAME" --path / --output json --silent >/dev/null
    while IFS='|' read -r path file; do
      [[ "$INCLUDE_EXAMPLES" -eq 1 || "$file" != *.example ]] || continue
      [[ -f "$file" ]] || { printf 'skip %s missing %s\n' "$path" "$file"; continue; }
      count="$(keys "$file" | wc -l | tr -d ' ')"
      [[ "$count" -gt 0 ]] || continue
      ensure_folder "$path"
      infisical secrets set --projectId "$PROJECT_ID" --env "$ENV_NAME" --path "$path" --file "$file" --silent >/dev/null
      printf 'imported %s %s keys=%s\n' "$path" "$file" "$count"
    done < <(manifest)
    ;;
  *) usage >&2; exit 2 ;;
esac
