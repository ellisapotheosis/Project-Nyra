#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NEXUS_CONFIG="$ROOT_DIR/configs/nexus/nexus.toml"
ROUTING_TABLE="$ROOT_DIR/configs/nexus/routing-table.json"
LANDING_PACKAGE="$(cd "$ROOT_DIR/../../.." && pwd)/apps/landing/ratehunter-landing/package.json"
MCP_FILE="${HOME}/.mcp.json"

if ! jq -e '.scripts["build:cf"] == "opennextjs-cloudflare build"' "$LANDING_PACKAGE" >/dev/null; then
  echo "ERROR: apps/landing/ratehunter-landing/package.json is missing expected build:cf script." >&2
  exit 1
fi

jq -e '.entrypoint == "http://localhost:4001/mcp/sse"' "$ROUTING_TABLE" >/dev/null

if [[ ! -f "$MCP_FILE" ]]; then
  echo "ERROR: $MCP_FILE not found. Run sync-mcp-config first." >&2
  exit 1
fi

jq -e '.mcpServers["nexus"].url == "http://localhost:4001/mcp/sse"' "$MCP_FILE" >/dev/null
jq -e '.servers[] | select(.id=="gitea") | .default == "http://gitea-vps.tailnet.ts.net:3100/mcp/sse"' "$ROUTING_TABLE" >/dev/null

if ! grep -q 'address = "0.0.0.0:4001"' "$NEXUS_CONFIG"; then
  echo "ERROR: Nexus server port is not set to 4001 in $NEXUS_CONFIG" >&2
  exit 1
fi

echo "Control plane audit passed: Nexus routing table and MCP config are synchronized."
