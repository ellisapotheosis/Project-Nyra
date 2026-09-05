#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ENV_NAME="${INFISICAL_ENV:-dev}"
INFISICAL_BIN="${INFISICAL_BIN:-/usr/bin/infisical}"
JQ_BIN="${JQ_BIN:-/usr/bin/jq}"
SHA256SUM_BIN="${SHA256SUM_BIN:-/usr/bin/sha256sum}"
MKTEMP_BIN="${MKTEMP_BIN:-/usr/bin/mktemp}"
RM_BIN="${RM_BIN:-/bin/rm}"
CUT_BIN="${CUT_BIN:-/usr/bin/cut}"
DESTINATIONS=(
  /hosts/orchestrator
  /hosts/oracle-vps
 /hosts/
  /hosts/worker-rtx3090ti
  /hosts/worker-rtx5090
  /hosts/homeassistant
  /apps/projectnyra
  /apps/ratehunter
  /apps/projectnyra-landing
)

usage() { printf '%s\n' 'Usage: scripts/infisical/apply-provider-references.sh [plan|apply] [--env dev|staging|prod]'; }
MODE="${1:-plan}"
ONLY_DESTINATION=""
FORCE_KNOWN=0
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_NAME="${2:?missing --env value}"; shift 2 ;;
    --destination) ONLY_DESTINATION="${2:?missing --destination value}"; shift 2 ;;
    --force-known) FORCE_KNOWN=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done
[[ "$MODE" == plan || "$MODE" == apply ]] || { usage >&2; exit 2; }

MAPPINGS=(
  'LITELLM_API_KEY|/providers/litellm|LITELLM_API_KEY'
  'LITELLM_MASTER_KEY|/providers/litellm|LITELLM_MASTER_KEY'
  'LITELLM_BASE_URL|/providers/litellm|LITELLM_BASE_URL'
  'LITELLM_API_BASE|/providers/litellm|LITELLM_API_BASE'
  'LITELLM_DATABASE_URL|/providers/litellm|LITELLM_DATABASE_URL'
  'LITELLM_INTERNAL_BASE_URL|/providers/litellm|LITELLM_INTERNAL_BASE_URL'
  'OPENAI_API_KEY|/providers/openai|OPENAI_API_KEY'
  'ANTHROPIC_API_KEY|/providers/anthropic|ANTHROPIC_API_KEY'
  'ANTHROPIC_BASE_URL|/providers/anthropic|ANTHROPIC_BASE_URL'
  'GOOGLE_API_KEY|/providers/google|GOOGLE_API_KEY'
  'OPENROUTER_API_KEY|/providers/openrouter|OPENROUTER_API_KEY'
  'OPENROUTER_BASE_URL|/providers/openrouter|OPENROUTER_BASE_URL'
  'TWILIO_ACCOUNT_SID|/providers/twilio|TWILIO_ACCOUNT_SID'
  'TWILIO_AUTH_TOKEN|/providers/twilio|TWILIO_AUTH_TOKEN'
  'TWILIO_PHONE_NUMBER|/providers/twilio|TWILIO_PHONE_NUMBER'
  'SENDGRID_API_KEY|/providers/sendgrid|SENDGRID_API_KEY'
  'SENDGRID_FROM_EMAIL|/providers/sendgrid|SENDGRID_FROM_EMAIL'
  'SENDGRID_FROM_NAME|/providers/sendgrid|SENDGRID_FROM_NAME'
  'SMTP_HOST|/providers/sendgrid|SMTP_HOST'
  'SMTP_PASSWORD|/providers/sendgrid|SMTP_PASSWORD'
  'SMTP_PORT|/providers/sendgrid|SMTP_PORT'
  'SMTP_USERNAME|/providers/sendgrid|SMTP_USERNAME'
  'CLOUDFLARE_ACCOUNT_ID|/providers/cloudflare|CLOUDFLARE_ACCOUNT_ID'
  'CLOUDFLARE_API_TOKEN|/providers/cloudflare|CLOUDFLARE_API_TOKEN'
  'CLOUDFLARE_ZONE_ID|/providers/cloudflare|CLOUDFLARE_ZONE_ID'
  'GITHUB_TOKEN|/providers/github|GITHUB_TOKEN'
  'HF_TOKEN|/providers/huggingface|HF_TOKEN'
  'FIRECRAWL_API_KEY|/providers/firecrawl|FIRECRAWL_API_KEY'
  'TAVILY_API_KEY|/providers/tavily|TAVILY_API_KEY'
  'SENTRY_DSN|/providers/sentry|SENTRY_DSN'
  'SENTRY_AUTH_TOKEN|/providers/sentry|SENTRY_AUTH_TOKEN'
  'SENTRY_API|/providers/sentry|SENTRY_API'
  'LETTA_API_KEY|/providers/letta|LETTA_API_KEY'
  'LETTA_DB_PASSWORD|/providers/letta|LETTA_DB_PASSWORD'
  'LETTA_SERVER_PASSWORD|/providers/letta|LETTA_SERVER_PASSWORD'
  'NEXUS_ADMIN_TOKEN|/providers/nexus|NEXUS_ADMIN_TOKEN'
  'NEXUS_API_KEY|/providers/nexus|NEXUS_API_KEY'
  'NEXUS_ROUTER_API_KEY|/providers/nexus|NEXUS_ROUTER_API_KEY'
  'NEXUS_JWT_SECRET|/providers/nexus|NEXUS_JWT_SECRET'
)

if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
  INFISICAL_TOKEN="$("$INFISICAL_BIN" login --method=universal-auth \
    --client-id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?missing INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}" \
    --client-secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?missing INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}" \
    --plain 2>/dev/null)"
  export INFISICAL_TOKEN
fi

if [[ -n "$ONLY_DESTINATION" ]]; then
  DESTINATIONS=("$ONLY_DESTINATION")
fi

tmpdir="$("$MKTEMP_BIN" -d)"
trap '"$RM_BIN" -rf "$tmpdir"' EXIT
declare -A source_files

source_file() {
  local path="$1" out="$tmpdir/source-$(printf '%s' "$path" | "$SHA256SUM_BIN" | "$CUT_BIN" -d' ' -f1).json"
  if [[ ! -f "$out" ]]; then
    "$INFISICAL_BIN" export --projectId "$PROJECT_ID" --env "$ENV_NAME" --path "$path" \
      --format=json --expand=false --silent >"$out" 2>/dev/null || return 1
  fi
  printf '%s' "$out"
}

printf 'mode=%s project=%s env=%s\n' "$MODE" "$PROJECT_ID" "$ENV_NAME"
for destination in "${DESTINATIONS[@]}"; do
  [[ -z "$ONLY_DESTINATION" || "$destination" == "$ONLY_DESTINATION" ]] || continue
  destination_file="$tmpdir/destination-$(printf '%s' "$destination" | "$SHA256SUM_BIN" | "$CUT_BIN" -d' ' -f1).json"
  if [[ "$FORCE_KNOWN" -eq 0 ]]; then
    "$INFISICAL_BIN" export --projectId "$PROJECT_ID" --env "$ENV_NAME" --path "$destination" \
      --format=json --expand=false --silent >"$destination_file" 2>/dev/null || continue
  else
    printf '[]\n' >"$destination_file"
  fi
  args=()
  names=()
  for mapping in "${MAPPINGS[@]}"; do
    IFS='|' read -r key source_path source_key <<<"$mapping"
    source_json="${source_files[$source_path]:-}"
    if [[ -z "$source_json" ]]; then
      source_json="$(source_file "$source_path" 2>/dev/null || true)"
      source_files[$source_path]="$source_json"
    fi
    if [[ "$FORCE_KNOWN" -eq 0 ]]; then
      [[ -n "$source_json" ]] || continue
      "$JQ_BIN" -e --arg k "$source_key" 'any(.[]; .key == $k)' "$source_json" >/dev/null || continue
    fi
    if [[ "$FORCE_KNOWN" -eq 0 ]]; then
      "$JQ_BIN" -e --arg k "$key" 'any(.[]; .key == $k)' "$destination_file" >/dev/null || continue
    fi
    reference="\${${ENV_NAME}.${source_path#/}.${source_key}}"
    args+=("$key=$reference")
    names+=("$key")
  done
  ((${#args[@]})) || continue
  printf 'destination=%s references=%s\n' "$destination" "${#args[@]}"
  if [[ "$MODE" == apply ]]; then
    "$INFISICAL_BIN" secrets set --projectId "$PROJECT_ID" --env "$ENV_NAME" --path "$destination" \
      --type shared --silent "${args[@]}" >/dev/null
  fi
done
