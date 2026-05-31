#!/usr/bin/env bash
# Smoke-check Project Nyra memory services without printing secret values.

set -euo pipefail

# Defaults match infra/hosts/oracle-vps/docker-compose.memory*.yml host ports.
MEM0_URL="${MEM0_URL:-http://127.0.0.1:5001}"
OPENMEMORY_URL="${OPENMEMORY_URL:-http://127.0.0.1:8765}"
MEMOS_URL="${MEMOS_URL:-http://127.0.0.1:8001}"
QDRANT_URL="${QDRANT_URL:-http://127.0.0.1:6333}"
FALKORDB_HOST="${FALKORDB_HOST:-127.0.0.1}"
FALKORDB_PORT="${FALKORDB_PORT:-6379}"
QDRANT_CONTAINER="${QDRANT_CONTAINER:-nyra-memory-qdrant-memory}"
FALKORDB_CONTAINER="${FALKORDB_CONTAINER:-nyra-memory-falkordb}"
TIMEOUT="${SMOKE_TIMEOUT:-5}"

failures=0

check_http_json() {
  local name="$1"
  local url="$2"
  local jq_expr="$3"
  local body
  body="$(mktemp)"
  if curl -fsS --max-time "$TIMEOUT" "$url" -o "$body" >/dev/null 2>&1; then
    if jq -e "$jq_expr" "$body" >/dev/null 2>&1; then
      echo "OK: $name"
    else
      echo "FAIL: $name returned unexpected JSON shape" >&2
      failures=$((failures + 1))
    fi
  elif [[ "$name" == "qdrant collections" ]] \
    && command -v docker >/dev/null \
    && docker inspect "$QDRANT_CONTAINER" >/dev/null 2>&1 \
    && docker exec "$QDRANT_CONTAINER" bash -lc '</dev/tcp/127.0.0.1/6333' >/dev/null 2>&1; then
    echo "OK: $name via container $QDRANT_CONTAINER"
  else
    echo "FAIL: $name is unreachable at $url" >&2
    failures=$((failures + 1))
  fi
  rm -f "$body"
}

check_http_status() {
  local name="$1"
  local url="$2"
  local code
  code="$(curl -ksS --max-time "$TIMEOUT" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
  if [[ "$code" =~ ^[23] ]]; then
    echo "OK: $name ($code)"
  else
    echo "FAIL: $name returned HTTP ${code:-000} at $url" >&2
    failures=$((failures + 1))
  fi
}

check_tcp() {
  local name="$1"
  local host="$2"
  local port="$3"
  if timeout "$TIMEOUT" bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
    echo "OK: $name TCP $host:$port"
  elif [[ "$name" == "falkordb" ]] \
    && command -v docker >/dev/null \
    && docker inspect "$FALKORDB_CONTAINER" >/dev/null 2>&1 \
    && docker exec "$FALKORDB_CONTAINER" redis-cli -h 127.0.0.1 -p 6379 PING >/dev/null 2>&1; then
    echo "OK: $name via container $FALKORDB_CONTAINER"
  else
    echo "FAIL: $name TCP $host:$port unreachable" >&2
    failures=$((failures + 1))
  fi
}

check_http_json "mem0 health" "$MEM0_URL/health" '.status == "ok"'
check_http_json "qdrant collections" "$QDRANT_URL/collections" '.result.collections | type == "array"'
check_tcp "falkordb" "$FALKORDB_HOST" "$FALKORDB_PORT"
check_http_status "openmemory docs" "$OPENMEMORY_URL/docs"
check_http_status "memOS health" "$MEMOS_URL/health"

if (( failures > 0 )); then
  echo "Memory stack smoke failed: $failures check(s)" >&2
  exit 1
fi

echo "Memory stack smoke OK"
