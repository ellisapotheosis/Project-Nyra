#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${LITELLM_BASE_URL:-http://127.0.0.1:4000}"
MASTER_KEY="${LITELLM_MASTER_KEY:?export LITELLM_MASTER_KEY or source the secure gateway env file}"
OUT="${LITELLM_KEY_OUTPUT:-/etc/projectnyra/secrets/generated/litellm-faststart-keys.env}"

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
if [[ -e "$OUT" ]]; then
  echo "$OUT already exists; refusing to generate duplicate unmanaged keys." >&2
  exit 1
fi
install -d -m 0700 "$(dirname "$OUT")"
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT

api() {
  curl -fsS "$BASE_URL$1" -H "Authorization: Bearer $MASTER_KEY" -H 'Content-Type: application/json' --data "$2"
}

create_team_and_key() {
  local var="$1" alias="$2" models_json="$3" rpm="$4" parallel="$5"
  local team key team_id token
  team="$(api /team/new "$(jq -nc --arg a "$alias" '{team_alias:$a}')")"
  team_id="$(jq -r '.team_id // .team_alias // empty' <<<"$team")"
  [[ -n "$team_id" ]] || { echo "Failed to create team $alias: $team" >&2; exit 1; }
  key="$(api /key/generate "$(jq -nc --arg tid "$team_id" --argjson models "$models_json" --argjson rpm "$rpm" --argjson parallel "$parallel" '{team_id:$tid,models:$models,rpm_limit:$rpm,max_parallel_requests:$parallel}')")"
  token="$(jq -r '.key // empty' <<<"$key")"
  [[ "$token" == sk-* ]] || { echo "Failed to create key for $alias: $key" >&2; exit 1; }
  printf '%s=%q\n' "$var" "$token" >>"$TMP"
}

create_team_and_key LITELLM_DEV_AGENT_KEY nyra-dev-agents '["nyra/dev-premium","nyra/dev-review","nyra/dev-local","nyra/research-free","local/rtx5090","local/rtx3090ti"]' 120 8
create_team_and_key LITELLM_HERMES_PRODUCT_KEY nyra-product-assistant '["nyra/product-assistant"]' 90 4
create_team_and_key LITELLM_MEMORY_WORKER_KEY nyra-memory-workers '["nyra/memory-chat","nyra/embeddings"]' 240 12

install -m 0600 "$TMP" "$OUT"
echo "Generated scoped keys at $OUT"
echo "Import these into Infisical, then remove the local generated file after verification."
