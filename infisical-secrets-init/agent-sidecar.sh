#!/usr/bin/env bash
set -euo pipefail

SECRETS_DIR="/run/nyra-secrets"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

log(){ echo "[infisical-agent] $*"; }

write_secret_file(){
  local path="$1"
  local value="$2"
  printf "%s" "$value" > "$path"
  chmod 600 "$path"
}

sync_secret_file(){
  local dotenv="$1"
  local source_key="$2"
  local target_file="$3"
  local value

  value="$(awk -v key="$source_key" -F'=' 'BEGIN{found=0} $1==key && found==0 {sub($1 FS,""); print; found=1}' "$dotenv" | head -n 1)"
  if [[ -n "$value" ]]; then
    write_secret_file "${SECRETS_DIR}/${target_file}" "$value"
  fi
}

poll_infisical(){
  local tmp_file
  tmp_file="$(mktemp)"
  trap 'rm -f "$tmp_file"' RETURN

  infisical export \
    --token="${INFISICAL_TOKEN}" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="${INFISICAL_ENV:-prod}" \
    --path="${INFISICAL_PATH:-/nyra/gitea}" \
    --format=dotenv \
    > "$tmp_file"

  sync_secret_file "$tmp_file" "GITEA_DB_PASS" "gitea_db_pass"
  sync_secret_file "$tmp_file" "GITEA_ADMIN_PASS" "gitea_admin_pass"
  sync_secret_file "$tmp_file" "WEBHOOK_AUTH_TOKEN" "webhook_auth_token"
  sync_secret_file "$tmp_file" "WEBHOOK_SECRET" "webhook_secret"
  sync_secret_file "$tmp_file" "GITEA_TOKEN" "gitea_pat_token"
  sync_secret_file "$tmp_file" "OPENAI_API_KEY" "openai_api_key"
  sync_secret_file "$tmp_file" "GITEA_SECRET_KEY" "gitea_secret_key"
  sync_secret_file "$tmp_file" "GITEA_INTERNAL_TOKEN" "gitea_internal_token"
}

main(){
  mkdir -p "$SECRETS_DIR"
  chmod 700 "$SECRETS_DIR"

  if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
    log "INFISICAL_TOKEN is required."
    exit 1
  fi

  while true; do
    if poll_infisical; then
      log "Secrets synced from Infisical."
    else
      log "Infisical sync failed; retrying."
    fi
    sleep "${INFISICAL_POLL_INTERVAL:-60}"
  done
}
main "$@"
