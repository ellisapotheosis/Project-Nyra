#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${LITELLM_BASE_URL:-http://127.0.0.1:4000}"
KEY="${LITELLM_TEST_KEY:-${LITELLM_MASTER_KEY:-}}"
[[ -n "$KEY" ]] || { echo "Set LITELLM_TEST_KEY or LITELLM_MASTER_KEY" >&2; exit 1; }
AUTH=(-H "Authorization: Bearer $KEY")

printf 'health: '
curl -fsS "$BASE_URL/health" >/dev/null && echo OK
printf 'models: '
curl -fsS "${AUTH[@]}" "$BASE_URL/v1/models" | jq -e '.data | length > 0' >/dev/null && echo OK
printf 'mcp tools endpoint: '
curl -fsS "${AUTH[@]}" -H 'Content-Type: application/json' -X POST "$BASE_URL/mcp-rest/tools/list" -d '{}' >/dev/null && echo OK

for agent in hermes-product openharness-dev; do
  printf 'a2a card %-18s: ' "$agent"
  if curl -fsS "${AUTH[@]}" "$BASE_URL/a2a/$agent/.well-known/agent-card.json" >/dev/null; then echo OK; else echo UNAVAILABLE; fi
done
