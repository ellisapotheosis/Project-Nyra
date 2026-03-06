#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/infra/env/nyra.env}"
OPENCLAW_HOME="${OPENCLAW_HOME_VOLUME:-$ROOT_DIR/infra/data/openclaw/config}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a; source "$ENV_FILE"; set +a
fi

mkdir -p "$OPENCLAW_HOME" "$ROOT_DIR/infra/data/openclaw/workspace"

if [[ -z "${OPENCLAW_GATEWAY_TOKEN:-}" ]]; then
  OPENCLAW_GATEWAY_TOKEN="$(openssl rand -hex 32)"
  echo "Generated OPENCLAW_GATEWAY_TOKEN for this shell session. Persist it in infra/env/nyra.env."
fi

cat > "$OPENCLAW_HOME/config.json" <<JSON
{
  "secretRefMode": true,
  "sandbox": { "enabled": true },
  "model": {
    "provider": "openai-compatible",
    "baseUrl": "http://litellm:4000/v1",
    "apiKeyRef": "env:LITELLM_MASTER_KEY"
  },
  "gateway": {
    "url": "http://openclaw-gateway:3400",
    "tokenRef": "env:OPENCLAW_GATEWAY_TOKEN"
  },
  "mcp": {
    "primary": "http://nexus-router:8080/mcp",
    "fallback": "http://nyra-mcp:3333/mcp"
  }
}
JSON

echo "Wrote $OPENCLAW_HOME/config.json"
echo "Next: docker compose -f $ROOT_DIR/infra/compose/nyra.compose.yaml --profile openclaw up -d openclaw-gateway openclaw-cli"
