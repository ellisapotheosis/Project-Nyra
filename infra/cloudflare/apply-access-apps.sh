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
API_TOKEN="$(clean "${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}")"

: "${ACCOUNT_ID:?missing CF_ACCOUNT_ID/CLOUDFLARE_ACCOUNT_ID}"
if [[ -z "$API_TOKEN" ]]; then
  : "${EMAIL:?missing CLOUDFLARE_EMAIL/CF_EMAIL when CLOUDFLARE_API_TOKEN/CF_API_TOKEN is not set}"
  : "${API_KEY:?missing CLOUDFLARE_API_KEY/CF_KEY when CLOUDFLARE_API_TOKEN/CF_API_TOKEN is not set}"
fi

api() {
  local method="$1"
  local url="$2"
  local data="${3:-}"
  local auth_headers
  if [[ -n "$API_TOKEN" ]]; then
    auth_headers=(-H "Authorization: Bearer ${API_TOKEN}")
  else
    auth_headers=(-H "X-Auth-Email: ${EMAIL}" -H "X-Auth-Key: ${API_KEY}")
  fi
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4${url}" \
      "${auth_headers[@]}" \
      -H "Content-Type: application/json" \
      --data @"$data"
  else
    curl -sS -X "$method" "https://api.cloudflare.com/client/v4${url}" \
      "${auth_headers[@]}" \
      -H "Content-Type: application/json"
  fi
}

make_payload() {
  local name="$1"
  local domain="$2"
  local profile="$3"
  local group_id

  if [[ "$profile" == "owner" ]]; then
    group_id="6290c676-cb4b-4482-a87e-fe048d4cab8a"
  elif [[ "$profile" == "agent" ]]; then
    group_id="04f027b4-5377-4a95-821c-fc76ed97e177"
  else
    group_id="0e6f3dd6-61ac-4bc1-aa94-044d21215128"
  fi

  jq -n \
    --arg name "$name" \
    --arg domain "$domain" \
    --arg gid "$group_id" \
    --arg policy "Nyra ${profile} access policy" \
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
          {group: {id: $gid}}
        ],
        exclude: [],
        require: []
      }]
    }'
}

# Mapping: Subdomain, Hostname, Access Group Role (CSV)
# roles: owner (Group 1), agent (Group 2), family (Group 3)
cat > "$RESULTS_DIR/access-desired.csv" <<'EOF'
Nyra Unified WebApp,app.projectnyra.com,family
Nyra CRM Gateway,crm.projectnyra.com,family
Nyra Nexus UI,nexus-ui.projectnyra.com,owner
Nyra Gitea,gitea.projectnyra.com,owner
Nyra Activepieces,activepieces.projectnyra.com,owner
Nyra OpenLit,openlit.projectnyra.com,owner
Nyra PicoClaw 3060,picoclaw-3060.projectnyra.com,owner
Nyra Linkwarden,linkwarden.projectnyra.com,family
Nyra Composio Gateway,composio.projectnyra.com,agent
EOF

current="$(api GET "/accounts/${ACCOUNT_ID}/access/apps?per_page=500")"
printf '%s' "$current" > "$RESULTS_DIR/access-apps-before-upsert.json"

: > "$RESULTS_DIR/access-upsert.ndjson"
while IFS=',' read -r name domain profile; do
  [[ -z "${name:-}" ]] && continue
  id="$(jq -r --arg domain "$domain" '.result[]? | select(.domain == $domain and .type == "self_hosted") | .id' <<<"$current" | head -n 1)"
  payload="$(mktemp)"
  make_payload "$name" "$domain" "$profile" > "$payload"
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
done < "$RESULTS_DIR/access-desired.csv"

jq -s '{access_total: length, access_successes: map(select(.success == true)) | length, access_failures: map(select(.success != true))}' "$RESULTS_DIR/access-upsert.ndjson"