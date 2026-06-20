#!/usr/bin/env bash
# agent-vault-infisical-sync.sh
# Syncs agent-vault secrets into Infisical at /security/infisical/agent-vault
# across development, staging, and production environments.
#
# Usage:
#   ./agent-vault-infisical-sync.sh [--seed-only] [--dry-run]
#
#   --seed-only   Only write known env-file secrets; skip agent-vault API calls
#   --dry-run     Print what would be written without touching Infisical

set -euo pipefail

INFISICAL_HOST="${INFISICAL_HOST_URL:-https://app.infisical.com}"
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
DEST_PATH="/security/infisical/agent-vault"
ENVIRONMENTS=(dev staging prod)

AGENT_VAULT_TAILSCALE="https://agent-vault.trex-fiordland.ts.net"
AGENT_VAULT_PUBLIC="https://agent-vault.projectnyra.com"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../infra/hosts/oracle-vps/.env.agent-vault"

SEED_ONLY=false
DRY_RUN=false
for arg in "$@"; do
  [[ "$arg" == "--seed-only" ]] && SEED_ONLY=true
  [[ "$arg" == "--dry-run"   ]] && DRY_RUN=true
done

# ─── Auth ─────────────────────────────────────────────────────────────────────

get_token() {
  infisical login \
    --method=universal-auth \
    --client-id="${INFISICAL_UNIVERSAL_AUTH_CLIENT_ID:?}" \
    --client-secret="${INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET:?}" \
    --plain --silent 2>/dev/null
}

# ─── Write one key to all 3 environments ──────────────────────────────────────

write_secret() {
  local key="$1" value="$2" token="$3"
  for env in "${ENVIRONMENTS[@]}"; do
    if [[ "$DRY_RUN" == true ]]; then
      echo "  [dry-run] ${env} → ${DEST_PATH}/${key}"
      continue
    fi
    if infisical secrets set "${key}=${value}" \
        --projectId "$PROJECT_ID" \
        --env "$env" \
        --path "$DEST_PATH" \
        --token "$token" 2>/dev/null; then
      echo "  [ok]   ${env} → ${key}"
    else
      echo "  [fail] ${env} → ${key}"
    fi
  done
}

# ─── Phase 1: Seed from .env.agent-vault ──────────────────────────────────────

seed_from_env_file() {
  local token="$1"
  echo ""
  echo "── Phase 1: Seeding from $(basename "$ENV_FILE") ──"

  if [[ ! -f "$ENV_FILE" ]]; then
    echo "[warn] $ENV_FILE not found — skipping"
    return
  fi

  while IFS='=' read -r key rest; do
    # Skip blank lines and comments
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    # Strip inline comments from value
    local value="${rest%%#*}"
    value="${value%"${value##*[![:space:]]}"}"  # rtrim
    [[ -z "$value" ]] && continue

    echo "  $key"
    write_secret "$key" "$value" "$token"
  done < "$ENV_FILE"
}

# ─── Phase 2: Pull live secrets from agent-vault API ──────────────────────────

extract_from_vault() {
  local token="$1"
  echo ""
  echo "── Phase 2: Probing agent-vault API ──"

  local vault_url=""
  for url in "$AGENT_VAULT_TAILSCALE" "$AGENT_VAULT_PUBLIC"; do
    local code
    code=$(curl -sk -o /dev/null -w "%{http_code}" "${url}/health" 2>/dev/null || echo "000")
    if [[ "$code" == "200" ]]; then
      vault_url="$url"
      echo "  [reachable] $url"
      break
    else
      echo "  [${code}] $url — skipping"
    fi
  done

  if [[ -z "$vault_url" ]]; then
    echo ""
    echo "[warn] Agent-vault unreachable. API extraction skipped."
    echo "       Deploy the service first, then re-run without --seed-only."
    echo "       Command: ssh oracle-vps 'cd ~/project-nyra && make agent-vault-up'"
    return 0
  fi

  local master_pass
  master_pass=$(grep -E '^AGENT_VAULT_MASTER_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)

  echo "  Authenticating against $vault_url ..."
  local vault_token
  vault_token=$(curl -sk -X POST "${vault_url}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"${master_pass}\"}" 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)

  if [[ -z "$vault_token" ]]; then
    echo "[warn] Could not authenticate to agent-vault. Check AGENT_VAULT_MASTER_PASSWORD."
    return 0
  fi

  echo "  Auth OK. Fetching secrets..."

  # Write vault secrets to a temp file to avoid heredoc-in-pipe bash issues
  local tmp
  tmp=$(mktemp)
  trap 'rm -f "$tmp"' RETURN

  curl -sk -X GET "${vault_url}/api/v1/secrets" \
    -H "Authorization: Bearer ${vault_token}" 2>/dev/null \
    | python3 -c "
import sys, json

def flatten(obj, prefix=''):
    out = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = ('_'.join([prefix, k]) if prefix else k).upper()
            if isinstance(v, (dict, list)):
                out.update(flatten(v, key))
            else:
                out[key] = str(v)
    return out

data = json.load(sys.stdin)
flat = flatten(data if isinstance(data, dict) else {})
for k, v in flat.items():
    print(f'AV_{k}={v}')
" > "$tmp" 2>/dev/null || true

  if [[ ! -s "$tmp" ]]; then
    echo "[warn] No secrets returned from agent-vault."
    return 0
  fi

  echo "  Writing extracted secrets to Infisical..."
  while IFS='=' read -r key value; do
    [[ -z "$key" ]] && continue
    write_secret "$key" "$value" "$token"
  done < "$tmp"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  echo "═══════════════════════════════════════════════"
  echo " Agent Vault → Infisical Sync"
  echo " Project : $PROJECT_ID"
  echo " Dest    : $DEST_PATH"
  echo " Envs    : ${ENVIRONMENTS[*]}"
  echo " Mode    : $( [[ "$DRY_RUN" == true ]] && echo 'DRY RUN' || echo 'LIVE' )"
  echo "═══════════════════════════════════════════════"

  echo ""
  echo "── Authenticating with Infisical (Universal Auth) ──"
  local infisical_token
  infisical_token=$(get_token)
  echo "  [ok] Token obtained"

  seed_from_env_file "$infisical_token"

  if [[ "$SEED_ONLY" == false ]]; then
    extract_from_vault "$infisical_token"
  fi

  echo ""
  echo "═══════════════════════════════════════════════"
  echo " Done. Verify:"
  echo " ${INFISICAL_HOST}/project/${PROJECT_ID}/secrets${DEST_PATH//\//%2F}"
  echo "═══════════════════════════════════════════════"
}

main "$@"
