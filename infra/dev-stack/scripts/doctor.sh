#!/usr/bin/env bash
set -euo pipefail

STACK_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$STACK_DIR"

echo "[doctor] Docker compose config check"
docker compose config >/dev/null

echo "[doctor] Running service status"
docker compose ps

echo "[doctor] Checking endpoints"
check() {
  local name="$1" url="$2"
  if curl -fsS "$url" >/dev/null; then
    echo "  OK   $name -> $url"
  else
    echo "  FAIL $name -> $url"
  fi
}

if docker compose ps --status running --services | grep -qx "claude-flow-brain"; then
  echo "  OK   claude-flow-brain container is running"
else
  echo "  FAIL claude-flow-brain container is not running"
fi

check "event-server" "http://localhost:${EVENT_SERVER_HTTP_PORT:-3005}/health"
check "dashboard" "http://localhost:${CLAUDE_FLOW_DASHBOARD_PORT:-3003}"
