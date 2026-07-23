#!/usr/bin/env bash
set -euo pipefail

# Convert verified shared provider/client duplicates into Infisical references.
# This intentionally leaves host identity, GPU, tunnel, database, and app-owned
# credentials alone because those are trust-boundary values, not shared aliases.

PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ENVIRONMENTS=(dev staging prod)
MODE=plan
DELETE_DUPLICATES=0
ONLY_KEYS=""
INFISICAL_BIN="${INFISICAL_BIN:-/usr/bin/infisical}"
JQ_BIN="${JQ_BIN:-/usr/bin/jq}"
SORT_BIN="${SORT_BIN:-/usr/bin/sort}"
GREP_BIN="${GREP_BIN:-/usr/bin/grep}"
SHA256SUM_BIN="${SHA256SUM_BIN:-/usr/bin/sha256sum}"
MKTEMP_BIN="${MKTEMP_BIN:-/usr/bin/mktemp}"
RM_BIN="${RM_BIN:-/bin/rm}"
CUT_BIN="${CUT_BIN:-/usr/bin/cut}"

usage() {
  printf '%s\n' \
    'Usage: scripts/infisical/canonicalize-references.sh [plan|apply] [--env dev|staging|prod] [--delete-duplicates]'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    plan|apply) MODE="$1"; shift ;;
    --env) ENVIRONMENTS=("${2:?missing --env value}"); shift 2 ;;
    --delete-duplicates) DELETE_DUPLICATES=1; shift ;;
    --only) ONLY_KEYS="${2:?missing --only value}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

command -v "$INFISICAL_BIN" >/dev/null || { printf '%s\n' 'infisical CLI is required' >&2; exit 1; }
command -v "$JQ_BIN" >/dev/null || { printf '%s\n' 'jq is required' >&2; exit 1; }

# key|canonical path|canonical key
MAPPINGS=(
  'LITELLM_API_KEY|/providers/litellm|LITELLM_API_KEY'
  'LITELLM_MASTER_KEY|/providers/litellm|LITELLM_MASTER_KEY'
  'LITELLM_BASE_URL|/providers/litellm|LITELLM_BASE_URL'
  'LITELLM_API_BASE|/providers/litellm|LITELLM_API_BASE'
  'LITELLM_DATABASE_URL|/providers/litellm|LITELLM_DATABASE_URL'
  'LITELLM_INTERNAL_BASE_URL|/providers/litellm|LITELLM_INTERNAL_BASE_URL'
  'OPENAI_API_KEY|/providers/openai|OPENAI_API_KEY'
  'OPENAI_BASE_URL|/providers/openai|OPENAI_BASE_URL'
  'ANTHROPIC_API_KEY|/providers/anthropic|ANTHROPIC_API_KEY'
  'ANTHROPIC_BASE_URL|/providers/anthropic|ANTHROPIC_BASE_URL'
  'GOOGLE_API_KEY|/providers/google|GOOGLE_API_KEY'
  'GEMINI_API_KEY|/providers/google|GEMINI_API_KEY'
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

tmpdir="$("$MKTEMP_BIN" -d)"
trap '"$RM_BIN" -rf "$tmpdir"' EXIT

login() {
  if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
    INFISICAL_TOKEN="$("$INFISICAL_BIN" login --method=universal-auth \
      --client-id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?missing INFISICAL_UNIVERSAL_AUTH_CLIENT_ID}" \
      --client-secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?missing INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET}" \
      --plain 2>/dev/null)"
    export INFISICAL_TOKEN
  fi
}

export_json() {
  local env="$1" path="$2" out="$3"
  "$INFISICAL_BIN" export --projectId "$PROJECT_ID" --env "$env" --path "$path" \
    --format=json --expand=false --silent >"$out" 2>/dev/null
}

has_key() {
  local file="$1" key="$2"
  "$JQ_BIN" -e --arg key "$key" 'any(.[]; .key == $key)' "$file" >/dev/null
}

folders_under() {
  local env="$1" parent="$2" file child
  file="$tmpdir/folders-${env//\//_}-$(printf '%s' "$parent" | "$SHA256SUM_BIN" | "$CUT_BIN" -d' ' -f1).json"
  "$INFISICAL_BIN" secrets folders get --projectId "$PROJECT_ID" --env "$env" --path "$parent" \
    --output json --silent >"$file" 2>/dev/null || return 0
  while IFS= read -r child; do
    printf '%s\n' "$child"
    folders_under "$env" "$child"
  done < <("$JQ_BIN" -r '.[] | (.folderPath + "/" + .folderName)' "$file" 2>/dev/null | "$SORT_BIN" -u)
}

canonical_file() {
  local env="$1" path="$2" key="$3" out="$tmpdir/canonical-${env}-${key}.json"
  if [[ ! -f "$out" ]]; then
    export_json "$env" "$path" "$out" || return 1
  fi
  has_key "$out" "$key"
}

set_reference() {
  local env="$1" path="$2" key="$3" source_path="$4" source_key="$5"
  local reference="\${${env}.${source_path#/}.${source_key}}"
  infisical secrets set --projectId "$PROJECT_ID" --env "$env" --path "$path" \
    --type shared --silent "$key=$reference" >/dev/null
}

delete_key() {
  local env="$1" path="$2" key="$3"
  infisical secrets delete "$key" --projectId "$PROJECT_ID" --env "$env" --path "$path" \
    --type shared --silent >/dev/null
}

login
printf 'mode=%s delete_duplicates=%s project=%s environments=%s\n' "$MODE" \
  "$DELETE_DUPLICATES" "$PROJECT_ID" "${ENVIRONMENTS[*]}"

for env in "${ENVIRONMENTS[@]}"; do
  printf 'environment=%s\n' "$env"
  destination_list="$tmpdir/destinations-${env}.txt"
  {
    printf '%s\n' /hosts/orchestrator /hosts/oracle-vps /hosts/worker-rtx3060 \
      /hosts/worker-rtx3090ti /hosts/worker-rtx5090 /hosts/homeassistant \
      /apps/projectnyra /apps/ratehunter /apps/projectnyra-landing \
      /clients/letta
    folders_under "$env" /hosts
    folders_under "$env" /apps
    folders_under "$env" /clients
  } | "$SORT_BIN" -u >"$destination_list"
  for mapping in "${MAPPINGS[@]}"; do
    IFS='|' read -r key source_path source_key <<<"$mapping"
    if [[ -n "$ONLY_KEYS" ]] && ! printf '%s\n' ",${ONLY_KEYS}," | "$GREP_BIN" -q ",$key,"; then
      continue
    fi
    if ! canonical_file "$env" "$source_path" "$source_key"; then
      printf 'missing-canonical env=%s path=%s key=%s\n' "$env" "$source_path" "$source_key"
      continue
    fi

    while IFS= read -r destination; do
      [[ "$destination" == /hosts/* || "$destination" == /apps/* ]] || continue
      [[ "$destination" != "$source_path" ]] || continue
      destination_file="$tmpdir/destination-${env}-$(printf '%s' "$destination" | "$SHA256SUM_BIN" | "$CUT_BIN" -d' ' -f1).json"
      export_json "$env" "$destination" "$destination_file" || continue
      has_key "$destination_file" "$key" || continue
      printf 'reference env=%s path=%s key=%s source=%s/%s\n' \
        "$env" "$destination" "$key" "$source_path" "$source_key"
      [[ "$MODE" == apply ]] || continue
      set_reference "$env" "$destination" "$key" "$source_path" "$source_key"
      verify_file="$tmpdir/verify-${env}-$(printf '%s' "$destination" | "$SHA256SUM_BIN" | "$CUT_BIN" -d' ' -f1).json"
      export_json "$env" "$destination" "$verify_file"
      expected="\${${env}.${source_path#/}.${source_key}}"
      actual="$("$JQ_BIN" -r --arg key "$key" '.[] | select(.key == $key) | .value' "$verify_file")"
      [[ "$actual" == "$expected" ]] || { printf 'verification-failed env=%s path=%s key=%s\n' "$env" "$destination" "$key" >&2; exit 1; }
      if [[ "$DELETE_DUPLICATES" -eq 1 ]]; then
        delete_key "$env" "$destination" "$key"
        # Recreate the reference after deletion: delete removes the destination key.
        set_reference "$env" "$destination" "$key" "$source_path" "$source_key"
      fi
    done <"$destination_list"
  done
done
