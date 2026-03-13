#!/usr/bin/env bash
set -euo pipefail

SECRETS_DIR="/run/nyra-secrets"
INIT_MARK="${SECRETS_DIR}/.initialized"
FORCE="${NYRA_FORCE_SECRETS:-false}"
SECRET_UID="${NYRA_SECRETS_UID:-1000}"
SECRET_GID="${NYRA_SECRETS_GID:-1000}"

umask 077

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

log(){ echo "[secrets-init] $*"; }

need_write() {
  if [[ "$FORCE" == "true" ]]; then return 0; fi
  [[ ! -f "$INIT_MARK" ]]
}

rand_hex() { openssl rand -hex "${1:-32}"; }
rand_b64() { openssl rand -base64 "${1:-32}"; }

write_secret_file(){
  local path="$1"
  local value="$2"
  printf "%s" "$value" > "$path"
  chmod 600 "$path"
  if [[ "$(id -u)" -eq 0 ]]; then
    chown "${SECRET_UID}:${SECRET_GID}" "$path"
  fi
}

parse_dotenv_and_write(){
  local dotenv="$1"
  getv(){
    local k="$1"
    awk -v key="$k" -F'=' 'BEGIN{found=0} $1==key && found==0 {sub($1 FS,""); print; found=1}' "$dotenv" | head -n 1
  }

  local v
  v="$(getv GITEA_DB_PASS)";        [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_db_pass" "$v"
  v="$(getv GITEA_ADMIN_PASS)";     [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_admin_pass" "$v"
  v="$(getv WEBHOOK_AUTH_TOKEN)";   [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/webhook_auth_token" "$v"
  v="$(getv WEBHOOK_SECRET)";       [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/webhook_secret" "$v"
  v="$(getv GITEA_TOKEN)";          [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_pat_token" "$v"
  v="$(getv OPENAI_API_KEY)";   [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/openai_api_key" "$v"
  v="$(getv GITEA_RUNNER_TOKEN)";   [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_runner_token" "$v"
  v="$(getv GITEA_SECRET_KEY)";     [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_secret_key" "$v"
  v="$(getv GITEA_INTERNAL_TOKEN)"; [[ -n "$v" ]] && write_secret_file "$SECRETS_DIR/gitea_internal_token" "$v"
}

try_infisical_export(){
  local cid_file="/run/secrets/infisical-client-id"
  local csec_file="/run/secrets/infisical-client_secret"

  if [[ ! -f "$cid_file" ]] || [[ ! -f "$csec_file" ]] || [[ ! -s "$cid_file" ]] || [[ ! -s "$csec_file" ]]; then
    log "Infisical creds not present. Skipping pull."
    return 1
  fi
  if [[ -z "${INFISICAL_PROJECT_ID:-}" ]]; then
    log "INFISICAL_PROJECT_ID empty. Skipping pull."
    return 1
  fi

  export INFISICAL_API_URL="${INFISICAL_API_URL:-https://app.infisical.com}"
  local cid csec token
  cid="$(cat "$cid_file")"
  csec="$(cat "$csec_file")"
  token="$(infisical login --method=universal-auth --client-id="$cid" --client-secret="$csec" --silent --plain)"

  infisical export \
    --token="$token" \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="${INFISICAL_ENV:-prod}" \
    --path="${INFISICAL_PATH:-/nyra/gitea}" \
    --format=dotenv \
    --output-file="/tmp/nyra.infisical.env" >/dev/null

  [[ -s "/tmp/nyra.infisical.env" ]] || return 1
  parse_dotenv_and_write "/tmp/nyra.infisical.env"
  return 0
}

generate_missing(){
  [[ -f "$SECRETS_DIR/gitea_db_pass" ]]        || write_secret_file "$SECRETS_DIR/gitea_db_pass" "$(rand_hex 24)"
  [[ -f "$SECRETS_DIR/gitea_secret_key" ]]     || write_secret_file "$SECRETS_DIR/gitea_secret_key" "$(rand_hex 32)"
  [[ -f "$SECRETS_DIR/gitea_internal_token" ]] || write_secret_file "$SECRETS_DIR/gitea_internal_token" "$(rand_hex 32)"
  [[ -f "$SECRETS_DIR/gitea_admin_pass" ]]     || write_secret_file "$SECRETS_DIR/gitea_admin_pass" "$(rand_b64 24)"
  [[ -f "$SECRETS_DIR/webhook_auth_token" ]]   || write_secret_file "$SECRETS_DIR/webhook_auth_token" "$(rand_b64 24)"
  [[ -f "$SECRETS_DIR/webhook_secret" ]]       || write_secret_file "$SECRETS_DIR/webhook_secret" "$(rand_hex 32)"
  [[ -f "$SECRETS_DIR/gitea_pat_token" ]]      || write_secret_file "$SECRETS_DIR/gitea_pat_token" ""
  [[ -f "$SECRETS_DIR/openai_api_key" ]]   || write_secret_file "$SECRETS_DIR/openai_api_key" ""
  [[ -f "$SECRETS_DIR/gitea_runner_token" ]]   || write_secret_file "$SECRETS_DIR/gitea_runner_token" ""
}

main(){
  if [[ "$(id -u)" -eq 0 ]]; then
    chown "${SECRET_UID}:${SECRET_GID}" "$SECRETS_DIR"
  fi

  if ! need_write; then
    log "Secrets already initialized."
    exit 0
  fi

  if try_infisical_export; then
    log "Pulled secrets from Infisical."
  else
    log "Using local generated secrets (fallback)."
  fi

  generate_missing
  date -Iseconds > "$INIT_MARK"
  chmod 600 "$INIT_MARK"
  if [[ "$(id -u)" -eq 0 ]]; then
    chown "${SECRET_UID}:${SECRET_GID}" "$INIT_MARK"
  fi
}
main "$@"
