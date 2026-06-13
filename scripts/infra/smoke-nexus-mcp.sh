#!/usr/bin/env bash
# Smoke-check Nexus Router and the MCP downstreams declared in nexus.toml.
#
# The script uses safe reachability checks by default. Set MCP_INITIALIZE=true
# to attempt JSON-RPC initialize probes against HTTP/SSE endpoints that support
# direct initialize requests.

set -euo pipefail

NEXUS_URL="${NEXUS_URL:-http://127.0.0.1:6000}"
NEXUS_CONFIG="${NEXUS_CONFIG:-infra/hosts/oracle-vps/nexus.toml}"
TIMEOUT="${SMOKE_TIMEOUT:-5}"
MCP_INITIALIZE="${MCP_INITIALIZE:-false}"
DOCKER_NETWORK="${DOCKER_NETWORK:-nyra-network_nyra_net}"

failures=0

check_http() {
  local name="$1"
  local url="$2"
  local code
  if [[ "$url" == http://*mcp:* || "$url" == http://memos-* || "$url" == http://openmemory-* || "$url" == http://shadcn-* ]] \
    && command -v docker >/dev/null \
    && docker network inspect "$DOCKER_NETWORK" >/dev/null 2>&1; then
    code="$(docker run --rm --network "$DOCKER_NETWORK" curlimages/curl:latest \
      -ksS --max-time "$TIMEOUT" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
  else
    code="$(curl -ksS --max-time "$TIMEOUT" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
  fi
  if [[ "$code" =~ ^[23]|^(401|403|405)$ ]]; then
    echo "OK: $name reachable ($code)"
  else
    echo "FAIL: $name unreachable at $url (HTTP ${code:-000})" >&2
    failures=$((failures + 1))
  fi
}

check_initialize() {
  local name="$1"
  local url="$2"
  local body
  body='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"nyra-smoke","version":"1.0.0"}}}'
  local code
  code="$(curl -ksS --max-time "$TIMEOUT" -o /tmp/nyra-mcp-init.json -w '%{http_code}' \
    -H 'content-type: application/json' \
    --data "$body" "$url" 2>/dev/null || true)"
  if [[ "$code" =~ ^2 ]] && jq -e '.result.protocolVersion or .result.capabilities' /tmp/nyra-mcp-init.json >/dev/null 2>&1; then
    echo "OK: $name initialize"
  else
    echo "WARN: $name initialize not confirmed (HTTP ${code:-000}); endpoint may be SSE-only"
  fi
  rm -f /tmp/nyra-mcp-init.json
}

check_http "nexus health" "$NEXUS_URL/health"
check_http "nexus mcp endpoint" "$NEXUS_URL/mcp"

PYTHON_BIN="${PYTHON_BIN:-python3}"
command -v "$PYTHON_BIN" >/dev/null || PYTHON_BIN="python"

"$PYTHON_BIN" - "$NEXUS_CONFIG" <<'PY' > /tmp/nyra-mcp-downstreams.tsv
import sys, tomllib
from pathlib import Path

data = tomllib.loads(Path(sys.argv[1]).read_text())
servers = data.get("mcp", {}).get("servers", {})
for name, cfg in sorted(servers.items()):
    url = cfg.get("url")
    if url:
        print(f"{name}\t{url}")
PY

while IFS=$'\t' read -r name url; do
  [[ -z "$name" || -z "$url" ]] && continue
  check_http "mcp downstream $name" "$url"
  if [[ "$MCP_INITIALIZE" == "true" ]]; then
    check_initialize "$name" "$url"
  fi
done < /tmp/nyra-mcp-downstreams.tsv
rm -f /tmp/nyra-mcp-downstreams.tsv

if (( failures > 0 )); then
  echo "Nexus MCP smoke failed: $failures check(s)" >&2
  exit 1
fi

echo "Nexus MCP smoke OK"
