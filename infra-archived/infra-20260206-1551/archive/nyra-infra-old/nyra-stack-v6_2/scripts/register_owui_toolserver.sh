#!/usr/bin/env bash
set -euo pipefail
OWUI="${1:-http://localhost:3000}"
BASE="${2:-http://localhost:12008/metamcp/openwebui-api/api}"
APIKEY="${3:-}"
SPEC="$BASE/openapi.json"
DATA='{"name":"MetaMCP","baseUrl":"'"'"'"'"'"'"'"'$BASE'"'"'"'"'"'"'"'","openapiUrl":"'"'"'"'"'"'"'"'$SPEC'"'"'"'"'"'"'"'","authType":"bearer","token":"'"'"'"'"'"'"'"'$APIKEY'"'"'"'"'"'"'"'"}'
for p in /api/tools/servers /api/plugins/openapi /api/openapi-servers; do
  curl -fsS -X POST -H "Content-Type: application/json" -d "$DATA" "$OWUI$p" && { echo "Registered via $p"; exit 0; } || true
done
echo "Could not auto-register Open WebUI tool; please add manually."
