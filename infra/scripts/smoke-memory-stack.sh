#!/usr/bin/env bash

set -euo pipefail

HOST="${1:-127.0.0.1}"

docker_health() {
  local container="$1"
  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi
  local status
  status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container" 2>/dev/null || true)"
  [[ "$status" == "healthy" || "$status" == "running" ]]
}

tcp_check() {
  local host="$1"
  local port="$2"
  timeout 8 bash -c "</dev/tcp/${host}/${port}" 2>/dev/null
}

checks=(
  "Letta API|http://${HOST}:8283/v1/health/"
  "mem0 REST|http://${HOST}:5001/health"
  "MemOS API|http://${HOST}:8001/health"
  "OpenMemory MCP docs|http://${HOST}:8765/docs"
)

failed=0

for item in "${checks[@]}"; do
  name="${item%%|*}"
  url="${item##*|}"
  printf "Checking %-20s %s ... " "$name" "$url"
  if curl -fsSL --max-time 8 "$url" >/dev/null; then
    printf "PASS\n"
  else
    printf "FAIL\n"
    failed=$((failed + 1))
  fi
done

printf "Checking %-20s %s ... " "FalkorDB" "${HOST}:6379"
if tcp_check "$HOST" "6379" || docker_health nyra-memory-falkordb; then
  printf "PASS\n"
else
  printf "FAIL\n"
  failed=$((failed + 1))
fi

printf "Checking %-20s %s ... " "Qdrant" "${HOST}:6333"
if curl -fsSL --max-time 8 "http://${HOST}:6333/healthz" >/dev/null 2>&1 || docker_health nyra-memory-qdrant-memory; then
  printf "PASS\n"
else
  printf "FAIL\n"
  failed=$((failed + 1))
fi

printf "Checking %-20s %s ... " "Letta MCP" "http://${HOST}:8284/mcp"
status="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 "http://${HOST}:8284/mcp" || true)"
if [[ "$status" =~ ^(200|400|405)$ ]]; then
  printf "PASS (%s)\n" "$status"
else
  printf "FAIL (%s)\n" "${status:-curl-error}"
  failed=$((failed + 1))
fi

printf "Checking %-20s %s ... " "MemOS MCP" "${HOST}:8095"
if tcp_check "$HOST" "8095" || docker_health nyra-memory-memos-mcp; then
  printf "PASS\n"
else
  printf "FAIL\n"
  failed=$((failed + 1))
fi

printf "Checking %-20s %s ... " "MemPalace MCP" "container health"
if docker_health nyra-memory-mempalace-mcp || tcp_check "$HOST" "8002"; then
  printf "PASS\n"
else
  printf "FAIL\n"
  failed=$((failed + 1))
fi

if [ "$failed" -gt 0 ]; then
  printf "\n%d memory stack checks failed.\n" "$failed" >&2
  exit 1
fi

printf "\nMemory stack checks passed.\n"
