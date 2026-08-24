#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="$ROOT_DIR/infra/cloudflare/apply-results"
mkdir -p "$RESULTS_DIR"

clean() {
  printf '%s' "${1:-}" | tr -d "'\""
}

ACCOUNT_ID="$(clean "${CF_ACCOUNT_ID:-${CLOUDFLARE_ACCOUNT_ID:-}}")"
EMAIL="$(clean "${CLOUDFLARE_EMAIL:-${CF_EMAIL:-}}")"
API_KEY="$(clean "${CLOUDFLARE_API_KEY:-${CF_API_KEY:-}}")"

: "${ACCOUNT_ID:?missing CF_ACCOUNT_ID/CLOUDFLARE_ACCOUNT_ID}"
: "${EMAIL:?missing CLOUDFLARE_EMAIL/CF_EMAIL}"
: "${API_KEY:?missing CLOUDFLARE_API_KEY/CF_API_KEY}"

api() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4${url}" \
      -H "X-Auth-Email: ${EMAIL}" \
      -H "X-Auth-Key: ${API_KEY}" \
      -H "Content-Type: application/json" \
      --data @"$data"
  else
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4${url}" \
      -H "X-Auth-Email: ${EMAIL}" \
      -H "X-Auth-Key: ${API_KEY}" \
      -H "Content-Type: application/json"
  fi
}

make_payload() {
  local name="$1"
  local domain="$2"
  local policy_name="$3"
  local profile="$4"

  if [[ "$profile" == "owner" ]]; then
    jq -n \
      --arg name "$name" \
      --arg domain "$domain" \
      --arg policy "$policy_name" \
      '{
        name: $name,
        domain: $domain,
        type: "self_hosted",
        session_duration: "24h",
        auto_redirect_to_identity: false,
        allowed_idps: [],
        policies: [{
          name: $policy,
          decision: "allow",
          precedence: 1,
          include: [
            {email: {email: "ellisandersen@ratehunter.com"}},
            {email: {email: "apotheosis@ratehunter.com"}},
            {email: {email: "edaneandersen@gmail.com"}},
            {email: {email: "andersenj949@gmail.com"}},
            {email_domain: {domain: "ratehunter.com"}},
            {email_domain: {domain: "ratehunter.net"}},
            {email_domain: {domain: "monitapu.com"}},
            {any_valid_service_token: {}}
          ],
          exclude: [],
          require: []
        }]
      }'
  else
    jq -n \
      --arg name "$name" \
      --arg domain "$domain" \
      --arg policy "$policy_name" \
      '{
        name: $name,
        domain: $domain,
        type: "self_hosted",
        session_duration: "24h",
        auto_redirect_to_identity: false,
        allowed_idps: [],
        policies: [{
          name: $policy,
          decision: "allow",
          precedence: 1,
          include: [
            {email_domain: {domain: "ratehunter.com"}},
            {email_domain: {domain: "ratehunter.net"}},
            {email_domain: {domain: "westcaplending.com"}},
            {email_domain: {domain: "westcapitallending.com"}},
            {email_domain: {domain: "monitapu.com"}},
            {email: {email: "edaneandersen@gmail.com"}},
            {email: {email: "andersenj949@gmail.com"}},
            {any_valid_service_token: {}}
          ],
          exclude: [],
          require: []
        }]
      }'
  fi
}

cat > "$RESULTS_DIR/access-desired.tsv" <<'EOF'
Nyra Twenty CRM	twenty.projectnyra.com	team
Nyra n8n	n8n.projectnyra.com	team
Nyra Activepieces	activepieces.projectnyra.com	team
Nyra Grafana	grafana.projectnyra.com	owner
Nyra Prometheus	prometheus.projectnyra.com	owner
Nyra cAdvisor	cadvisor.projectnyra.com	owner
Nyra Open WebUI	openwebui.projectnyra.com	team
Nyra Nexus UI	nexus.projectnyra.com	team
Nyra LiteLLM	litellm.projectnyra.com	owner
Nyra Paperclip	paperclip.projectnyra.com	team
Nyra ClawTeam	clawteam.projectnyra.com	team
Nyra Oracle Portainer	portainer-oracle.projectnyra.com	owner
Nyra Links	links.projectnyra.com	team
Nyra Linkwarden Alias	linkwarden.projectnyra.com	team
Nyra OpenClaw Gateway	openclaw-gateway.projectnyra.com	team
Nyra Agent Vault	infisical.projectnyra.com	team
Nyra Agent Vault	agent-vault.projectnyra.com	team
Nyra Letta Memory	letta.projectnyra.com	team
Nyra Composio	composio.projectnyra.com	team
EOF

current="$(api GET "/accounts/${ACCOUNT_ID}/access/apps?per_page=500")"
printf '%s' "$current" > "$RESULTS_DIR/access-apps-before-upsert.json"

: > "$RESULTS_DIR/access-upsert.ndjson"
while IFS=$'\t' read -r name domain profile; do
  [[ -z "${name:-}" ]] && continue
  case "$domain" in
    mcp-gateway.projectnyra.com|nexus-router.projectnyra.com)
      echo "refusing to manage MCP Portal/Nexus with generic self-hosted app automation: $domain" >&2
      exit 1
      ;;
  esac
  id="$(jq -r --arg domain "$domain" '.result[]? | select(.domain == $domain and .type == "self_hosted") | .id' <<<"$current" | head -n 1)"
  payload="$(mktemp)"
  make_payload "$name" "$domain" "Nyra ${profile} access" "$profile" > "$payload"
  if [[ -n "$id" ]]; then
    result="$(api PUT "/accounts/${ACCOUNT_ID}/access/apps/${id}" "$payload")"
    action="updated"
  else
    result="$(api POST "/accounts/${ACCOUNT_ID}/access/apps" "$payload")"
    action="created"
  fi
  rm -f "$payload"
  jq -c --arg action "$action" --arg domain "$domain" \
    '{domain: $domain, action: $action, success, errors}' <<<"$result" \
    >> "$RESULTS_DIR/access-upsert.ndjson"
done < "$RESULTS_DIR/access-desired.tsv"

jq -s '{access_total: length, access_successes: map(select(.success == true)) | length, access_failures: map(select(.success != true))}' "$RESULTS_DIR/access-upsert.ndjson"
