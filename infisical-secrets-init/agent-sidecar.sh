#!/usr/bin/env bash
set -euo pipefail

SECRETS_DIR="/run/nyra-secrets"
CID_FILE="/run/secrets/infisical-client-id"
CSEC_FILE="/run/secrets/infisical-client_secret"

log(){ echo "[infisical-agent] $*"; }

build_agent_files(){
  mkdir -p /tmp/agent/templates
  chmod 700 /tmp/agent/templates

  local pid="${INFISICAL_PROJECT_ID:-}"
  local env="${INFISICAL_ENV:-prod}"
  local path="${INFISICAL_PATH:-/nyra/gitea}"
  local interval="${INFISICAL_POLL_INTERVAL:-60s}"

  for pair in \
    "GITEA_DB_PASS:gitea_db_pass" \
    "GITEA_ADMIN_PASS:gitea_admin_pass" \
    "WEBHOOK_AUTH_TOKEN:webhook_auth_token" \
    "WEBHOOK_SECRET:webhook_secret" \
    "GITEA_TOKEN:gitea_pat_token" \
    "OPENAI_API_KEY:openai_api_key" \
    "GITEA_RUNNER_TOKEN:gitea_runner_token" \
    "GITEA_SECRET_KEY:gitea_secret_key" \
    "GITEA_INTERNAL_TOKEN:gitea_internal_token"
  do
    k="${pair%%:*}"
    f="${pair#*:}"
    cat > "/tmp/agent/templates/${f}.tmpl" <<TPL
{{- with secret "${pid}" "${env}" "${path}" -}}
{{- range . -}}
{{- if eq .Key "${k}" -}}{{ .Value }}{{- end -}}
{{- end -}}
{{- end -}}
TPL
  done

  cat > /tmp/agent/agent.yml <<CFG
infisical:
  address: "${INFISICAL_API_URL:-https://app.infisical.com}"
auth:
  type: "universal-auth"
  config:
    client-id: "${CID_FILE}"
    client-secret: "${CSEC_FILE}"
    remove_client_secret_on_read: false
templates:
CFG

  for f in \
    gitea_db_pass \
    gitea_admin_pass \
    webhook_auth_token \
    webhook_secret \
    gitea_pat_token \
    openai_api_key \
    gitea_runner_token \
    gitea_secret_key \
    gitea_internal_token
  do
    cat >> /tmp/agent/agent.yml <<CFG2
  - source-path: "/tmp/agent/templates/${f}.tmpl"
    destination-path: "${SECRETS_DIR}/${f}"
    config:
      polling-interval: "${interval}"
CFG2
  done
}

main(){
  mkdir -p "$SECRETS_DIR"
  chmod 700 "$SECRETS_DIR"

  if [[ ! -s "$CID_FILE" ]] || [[ ! -s "$CSEC_FILE" ]] || [[ -z "${INFISICAL_PROJECT_ID:-}" ]]; then
    log "Infisical creds or project id missing. Idling."
    while true; do sleep 300; done
  fi

  build_agent_files
  exec infisical agent --config /tmp/agent/agent.yml
}
main "$@"
