#!/usr/bin/env bash
set -euo pipefail

# Synchronize only the Oracle host boundary. Values are never printed.
# Bootstrap credentials are deliberately excluded: they must remain outside the
# path they unlock to avoid recursive secret delivery.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
TOKEN="${INFISICAL_TOKEN:?INFISICAL_TOKEN is required}"
HOST_PATH="/hosts/oracle-vps"
PROVIDER_PATH="/providers/omniroute"
ENVIRONMENTS="${INFISICAL_ENVS:-dev,staging,prod}"

usage() {
  printf '%s\n' 'Usage: INFISICAL_TOKEN=... scripts/infisical/sync-oracle-vps-secrets.sh [--envs dev,staging,prod]'
}

if [[ "${1:-}" == "--envs" ]]; then
  ENVIRONMENTS="${2:?missing environment list}"
  shift 2
fi
[[ $# -eq 0 ]] || { usage >&2; exit 2; }

rand_b64url() {
  openssl rand -base64 "${1:-48}" | tr '+/' '-_' | tr -d '=\n'
}

is_placeholder() {
  local value="$1"
  [[ -z "$value" || "$value" == *'${'* || "$value" == change-me* || "$value" == replace-me* || "$value" == replace-* || "$value" == your-* || "$value" == '<'*'>' ]]
}

is_bootstrap_key() {
  [[ "$1" == INFISICAL_TOKEN || "$1" == INFISICAL_UNIVERSAL_AUTH_CLIENT_ID || "$1" == INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET ]]
}

requires_external_credential() {
  [[ "$1" =~ ^(ANTHROPIC|OPENAI|OPENROUTER|CLOUDFLARE|CLERK|TAVILY|TWILIO|FIRECRAWL|COMPOSIO|GITHUB|HOMEASSISTANT|ORACLE_TUNNEL)_ ]]
}

is_generated_secret() {
  [[ "$1" =~ (_API_KEY|_TOKEN|_SECRET|_PASSWORD|_ENCRYPTION_KEY|_JWT|_AUTH_KEY|_PRIVATE_KEY)$ ]]
}

ensure_folder() {
  local env_name="$1" path="$2" parent=/ part current
  IFS=/ read -ra parts <<<"${path#/}"
  for part in "${parts[@]}"; do
    [[ -n "$part" ]] || continue
    current="${parent%/}/$part"
    infisical secrets folders create --token "$TOKEN" --projectId "$PROJECT_ID" --env "$env_name" --path "$parent" --name "$part" --silent >/dev/null 2>&1 || true
    parent="$current"
  done
}

secret_present() {
  infisical secrets get "$3" --token "$TOKEN" --projectId "$PROJECT_ID" --env "$1" --path "$2" --plain --silent >/dev/null 2>&1
}

set_secret() {
  infisical secrets set "$3=$4" --token "$TOKEN" --projectId "$PROJECT_ID" --env "$1" --path "$2" --silent >/dev/null
}

declare -A declared=()
declare -A defaults=()
declare -a real_sources=()

for file in ./.env ./.env.oracle infra/hosts/oracle-vps/.env.oracle infra/hosts/oracle-vps/.env.agent-vault; do
  [[ -f "$file" ]] && real_sources+=("$file")
done

while IFS= read -r -d '' file; do
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]] || continue
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]%$'\r'}"
    declared["$key"]=1
    if [[ "$value" =~ ^\"(.*)\"$ ]]; then value="${BASH_REMATCH[1]}"; fi
    if [[ "$value" =~ ^\'(.*)\'$ ]]; then value="${BASH_REMATCH[1]}"; fi
    if ! is_placeholder "$value"; then defaults["$key"]="$value"; fi
  done <"$file"
done < <(find infra/hosts/oracle-vps -maxdepth 1 -type f -name '.env*' -print0)

for env_name in ${ENVIRONMENTS//,/ }; do
  ensure_folder "$env_name" "$HOST_PATH"
  ensure_folder "$env_name" "$PROVIDER_PATH"

  for file in "${real_sources[@]}"; do
    infisical secrets set --token "$TOKEN" --projectId "$PROJECT_ID" --env "$env_name" --path "$HOST_PATH" --file "$file" --silent >/dev/null
  done

  set_count=0
  external_missing=0
  for key in "${!declared[@]}"; do
    is_bootstrap_key "$key" && continue
    secret_present "$env_name" "$HOST_PATH" "$key" && continue
    if [[ -n "${defaults[$key]:-}" ]]; then
      set_secret "$env_name" "$HOST_PATH" "$key" "${defaults[$key]}"
      set_count=$((set_count + 1))
    elif requires_external_credential "$key"; then
      external_missing=$((external_missing + 1))
    elif is_generated_secret "$key"; then
      set_secret "$env_name" "$HOST_PATH" "$key" "$(rand_b64url 48)"
      set_count=$((set_count + 1))
    fi
  done

  for key in OMNIROUTE_INITIAL_PASSWORD OMNIROUTE_JWT_SECRET OMNIROUTE_API_KEY_SECRET OMNIROUTE_API_KEY; do
    if ! secret_present "$env_name" "$PROVIDER_PATH" "$key"; then
      value="$(rand_b64url 48)"
      [[ "$key" == OMNIROUTE_API_KEY ]] && value="or_$(rand_b64url 36)"
      set_secret "$env_name" "$PROVIDER_PATH" "$key" "$value"
    fi
    value="$(infisical secrets get "$key" --token "$TOKEN" --projectId "$PROJECT_ID" --env "$env_name" --path "$PROVIDER_PATH" --plain --silent)"
    set_secret "$env_name" "$HOST_PATH" "$key" "$value"
  done

  printf '%s: Oracle boundary synchronized (new generated/default keys=%s; external credentials still require provider values=%s).\n' "$env_name" "$set_count" "$external_missing"
done
