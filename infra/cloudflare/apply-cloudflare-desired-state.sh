#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RESULTS_DIR="$ROOT_DIR/infra/cloudflare/apply-results"
BACKUP_DIR="$ROOT_DIR/infra/cloudflare/backups"
mkdir -p "$RESULTS_DIR" "$BACKUP_DIR"

clean() {
  printf '%s' "${1:-}" | tr -d "'\""
}

ACCOUNT_ID="$(clean "${CF_ACCOUNT_ID:-${CLOUDFLARE_ACCOUNT_ID:-}}")"
ZONE_ID="$(clean "${CF_ZONE_ID:-${CLOUDFLARE_ZONE_ID:-}}")"
EMAIL="$(clean "${CLOUDFLARE_EMAIL:-${CF_EMAIL:-}}")"
API_KEY="$(clean "${CLOUDFLARE_API_KEY:-${CF_API_KEY:-}}")"
API_TOKEN="$(clean "${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}")"
ORCHESTRATOR_TUNNEL_ID_CLEAN="$(clean "${ORCHESTRATOR_TUNNEL_ID:-}")"
ORACLE_TUNNEL_ID_CLEAN="$(clean "${ORACLE_TUNNEL_ID:-}")"

: "${ACCOUNT_ID:?missing CF_ACCOUNT_ID/CLOUDFLARE_ACCOUNT_ID}"
: "${ZONE_ID:?missing CF_ZONE_ID/CLOUDFLARE_ZONE_ID}"
if [[ -z "$API_TOKEN" ]]; then
  : "${EMAIL:?missing CLOUDFLARE_EMAIL/CF_EMAIL when CLOUDFLARE_API_TOKEN/CF_API_TOKEN is not set}"
  : "${API_KEY:?missing CLOUDFLARE_API_KEY/CF_API_KEY when CLOUDFLARE_API_TOKEN/CF_API_TOKEN is not set}"
fi
: "${ORCHESTRATOR_TUNNEL_ID_CLEAN:?missing ORCHESTRATOR_TUNNEL_ID}"
: "${ORACLE_TUNNEL_ID_CLEAN:?missing ORACLE_TUNNEL_ID}"

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

echo "Backing up current Cloudflare state..."
api GET "/accounts/${ACCOUNT_ID}/cfd_tunnel/${ORCHESTRATOR_TUNNEL_ID_CLEAN}/configurations" > "$BACKUP_DIR/orchestrator-current-config.json"
api GET "/accounts/${ACCOUNT_ID}/cfd_tunnel/${ORACLE_TUNNEL_ID_CLEAN}/configurations" > "$BACKUP_DIR/oracle-current-config.json"
api GET "/zones/${ZONE_ID}/dns_records?per_page=500" > "$BACKUP_DIR/dns-records-current.json"
api GET "/accounts/${ACCOUNT_ID}/access/apps?per_page=200" > "$BACKUP_DIR/access-apps-current.json" || true

echo "Applying tunnel configurations..."
api PUT "/accounts/${ACCOUNT_ID}/cfd_tunnel/${ORCHESTRATOR_TUNNEL_ID_CLEAN}/configurations" \
  "$ROOT_DIR/infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json" \
  > "$RESULTS_DIR/orchestrator-tunnel.apply.json"
api PUT "/accounts/${ACCOUNT_ID}/cfd_tunnel/${ORACLE_TUNNEL_ID_CLEAN}/configurations" \
  "$ROOT_DIR/infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json" \
  > "$RESULTS_DIR/oracle-tunnel.apply.json"

jq -e '.success == true' "$RESULTS_DIR/orchestrator-tunnel.apply.json" >/dev/null
jq -e '.success == true' "$RESULTS_DIR/oracle-tunnel.apply.json" >/dev/null

echo "Resolving DNS desired records..."
jq \
  --arg orch "$ORCHESTRATOR_TUNNEL_ID_CLEAN" \
  --arg oracle "$ORACLE_TUNNEL_ID_CLEAN" \
  '.records |= map(.content |= gsub("\\$\\{ORCHESTRATOR_TUNNEL_ID\\}"; $orch) | .content |= gsub("\\$\\{ORACLE_TUNNEL_ID\\}"; $oracle))' \
  "$ROOT_DIR/infra/cloudflare/generated-remote/dns-records.desired.json" \
  > "$RESULTS_DIR/dns-records.resolved.json"

echo "Upserting DNS records..."
: > "$RESULTS_DIR/dns-upsert.ndjson"
jq -c '.records[]' "$RESULTS_DIR/dns-records.resolved.json" | while IFS= read -r rec; do
  short="$(jq -r '.name' <<<"$rec")"
  if [[ "$short" == "@" ]]; then
    fqdn="projectnyra.com"
  else
    fqdn="${short}.projectnyra.com"
  fi
  existing="$(api GET "/zones/${ZONE_ID}/dns_records?name=${fqdn}&per_page=20")"
  id="$(jq -r '.result[0].id // empty' <<<"$existing")"
  payload="$(mktemp)"
  jq --arg name "$fqdn" '. + {name: $name, ttl: 1}' <<<"$rec" > "$payload"
  if [[ -n "$id" ]]; then
    result="$(api PUT "/zones/${ZONE_ID}/dns_records/${id}" "$payload")"
    action="updated"
  else
    result="$(api POST "/zones/${ZONE_ID}/dns_records" "$payload")"
    action="created"
  fi
  rm -f "$payload"
  jq -c --arg action "$action" --arg hostname "$fqdn" \
    '{hostname: $hostname, action: $action, success, errors}' <<<"$result" \
    >> "$RESULTS_DIR/dns-upsert.ndjson"
done

echo "Summary:"
jq -s '{dns_total: length, dns_successes: map(select(.success == true)) | length, dns_failures: map(select(.success != true))}' "$RESULTS_DIR/dns-upsert.ndjson"
