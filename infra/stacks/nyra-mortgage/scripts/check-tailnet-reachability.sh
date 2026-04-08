#!/usr/bin/env bash
set -euo pipefail

ROUTING_TABLE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/configs/nexus/routing-table.json"
NEXUS_BASE_URL="${NEXUS_BASE_URL:-http://localhost:4001}"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required." >&2
  exit 1
fi

entrypoint="$(jq -r '.entrypoint' "$ROUTING_TABLE")"

check_url() {
  local label="$1"
  local url="$2"
  if curl -fsS --max-time 4 "$url" >/dev/null; then
    echo "OK  - $label => $url"
  else
    echo "FAIL- $label => $url" >&2
    return 1
  fi
}

check_url "nexus-entrypoint" "$entrypoint"
check_url "nexus-metrics" "${NEXUS_BASE_URL}/mcp/metrics"

jq -r '.servers[] | "\(.id) \(.default)"' "$ROUTING_TABLE" | while read -r id url; do
  check_url "mcp-$id" "$url"
done

echo "Tailnet reachability checks passed."
