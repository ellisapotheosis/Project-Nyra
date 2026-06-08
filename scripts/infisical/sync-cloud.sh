#!/usr/bin/env bash
# Project Nyra - Infisical Cloud Status/Audit
#
# Cloud-only helper for app.infisical.com. It inspects the Cloud project and
# reports secret counts per path. Legacy sync aliases are retained as status
# shims so older calls do not target the retired local instance.
#
# Usage:
#   scripts/infisical/sync-cloud.sh status
#   scripts/infisical/sync-cloud.sh audit
#   scripts/infisical/sync-cloud.sh sync   # alias for status
#   scripts/infisical/sync-cloud.sh pull   # alias for status
#   scripts/infisical/sync-cloud.sh push   # alias for status

set -euo pipefail

INFISICAL_API_URL="${INFISICAL_API_URL:-https://app.infisical.com}"
INFISICAL_ENV_NAME="${INFISICAL_ENV:-prod}"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-}"

DEFAULT_PATHS=(
  "/security/infisical"
  "/machines/orchestrator"
  "/machines/oracle-vps"
  "/machines/worker-rtx5090"
  "/machines/worker-rtx3090ti"
  "/machines/worker-rtx3060"
  "/apps/projectnyra"
  "/apps/ratehunter"
  "/services/crm-api"
  "/services/lead-ingestion"
  "/services/campaign-service"
  "/services/communication-service"
  "/services/quote-service"
  "/services/assistant-service"
  "/providers/cloudflare"
  "/providers/twilio"
  "/providers/sendgrid"
  "/providers/llm"
  "/clients/paperclip"
  "/agent-vault/vaults"
)

if [[ -n "${SYNC_PATHS:-}" ]]; then
  IFS=',' read -r -a ACTIVE_PATHS <<< "$SYNC_PATHS"
else
  ACTIVE_PATHS=("${DEFAULT_PATHS[@]}")
fi

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
info() { echo "[$(date '+%H:%M:%S')] ℹ  $*"; }
warn() { echo "[$(date '+%H:%M:%S')] ⚠️  $*"; }

check_prereqs() {
  command -v infisical >/dev/null || { echo "ERROR: infisical CLI not installed." >&2; exit 1; }
  command -v jq >/dev/null || { echo "ERROR: jq not installed." >&2; exit 1; }
  command -v python3 >/dev/null || { echo "ERROR: python3 not installed." >&2; exit 1; }
}

resolve_token() {
  if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
    printf '%s' "$INFISICAL_TOKEN"
    return 0
  fi

  INFISICAL_API_URL="$INFISICAL_API_URL" scripts/infra/infisical-auth-token.sh
}

count_secrets() {
  local token="$1"
  local path="$2"

  infisical secrets \
    --token="$token" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --domain="$INFISICAL_API_URL" \
    --env="$INFISICAL_ENV_NAME" \
    --path="$path" \
    --output=json \
    --silent 2>/dev/null \
  | jq 'length' 2>/dev/null || echo "0"
}

status() {
  local token="$1"

  info "Cloud status: counts per path [env=$INFISICAL_ENV_NAME]"
  echo ""
  printf "%-45s  %8s\n" "PATH" "CLOUD"
  printf "%-45s  %8s\n" "----" "-----"
  for path in "${ACTIVE_PATHS[@]}"; do
    printf "%-45s  %8s\n" "$path" "$(count_secrets "$token" "$path")"
  done
  echo ""
}

audit() {
  local token="$1"
  info "Cloud audit: generating required-key inventory for app.infisical.com"
  python3 scripts/infra/inventory-infisical-secrets.py
  echo ""
  status "$token"
}

main() {
  check_prereqs

  local cmd="${1:-status}"
  shift || true

  local token
  token="$(resolve_token)"
  if [[ -z "$token" ]]; then
    echo "ERROR: set INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET, or INFISICAL_TOKEN." >&2
    exit 1
  fi

  if [[ -z "$INFISICAL_PROJECT_ID" ]]; then
    echo "ERROR: set INFISICAL_PROJECT_ID." >&2
    exit 1
  fi

  case "$cmd" in
    status|sync|pull|push)
      if [[ "$cmd" != "status" ]]; then
        warn "Legacy sync alias is retired; showing cloud status instead."
      fi
      status "$token"
      ;;
    audit)
      audit "$token"
      ;;
    help|-h|--help)
      cat <<'HELP'
Usage: scripts/infisical/sync-cloud.sh <status|audit>

Commands:
  status        show cloud secret counts per path
  audit         render the missing-secrets inventory and cloud counts

Legacy aliases:
  sync|pull|push  print a warning and show cloud status

Required env vars:
  INFISICAL_PROJECT_ID         cloud project id
  INFISICAL_UNIVERSAL_AUTH_CLIENT_ID/SECRET
                               preferred cloud auth
  INFISICAL_TOKEN              optional fallback access token

Optional env vars:
  INFISICAL_API_URL            defaults to https://app.infisical.com
  INFISICAL_ENV                defaults to prod
  SYNC_PATHS                   comma-separated list of paths
HELP
      ;;
    *)
      echo "Unknown command: $cmd" >&2
      exit 2
      ;;
  esac
}

main "$@"
