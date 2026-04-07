#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_FILE="${HOME}/.mcp.json"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: missing required command '$1'" >&2
    exit 1
  fi
}

require_cmd jq
require_cmd curl

cat > "$MCP_FILE" <<'JSON'
{
  "mcpServers": {
    "nexus": {
      "type": "sse",
      "url": "http://localhost:4001/mcp/sse"
    }
  }
}
JSON

echo "Wrote lean MCP config to $MCP_FILE"

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$ROOT_DIR/docker-compose.yml" up -d nexus litellm openmemory_mcp || {
    echo "ERROR: failed to bring up Nexus control-plane services" >&2
    exit 1
  }
  echo "Nexus control-plane services started"
else
  echo "WARN: docker not found; skipping compose startup"
fi

"$ROOT_DIR/scripts/audit-control-plane.sh"

if "$ROOT_DIR/scripts/check-tailnet-reachability.sh"; then
  echo "Control plane reachable over configured endpoints"
else
  echo "WARN: one or more endpoints are not currently reachable; inspect stack status and Tailscale connectivity"
fi
