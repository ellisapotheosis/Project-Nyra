#!/usr/bin/env bash
set -euo pipefail

ROLE="${1:-orchestrator}" # orchestrator|oracle|worker-3060|worker-3090ti|worker-5090
ACTION="${2:-up}"          # up|down|status|validate

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/infra/docker-compose.yml"

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

profiles_for_role() {
  case "$ROLE" in
    orchestrator) echo "core gateway workflow crm archon dev" ;;
    oracle) echo "oracle apps observability edge" ;;
    worker-3060) echo "worker-3060" ;;
    worker-3090ti) echo "worker-3090ti" ;;
    worker-5090) echo "worker-5090" ;;
    *) echo "Unknown role: $ROLE"; exit 1 ;;
  esac
}

ensure_docker() {
  command -v docker >/dev/null || { echo "docker is required"; exit 1; }
}

run_compose_role() {
  local args=()
  for p in $(profiles_for_role); do
    args+=(--profile "$p")
  done

  case "$ACTION" in
    up)
      compose "${args[@]}" up -d
      ;;
    down)
      compose "${args[@]}" down --remove-orphans
      ;;
    status)
      compose ps
      ;;
    validate)
      compose config >/dev/null
      echo "compose config valid"
      ;;
    *)
      echo "Unknown action: $ACTION"
      exit 1
      ;;
  esac
}

health_summary() {
  echo "=== Nyra Health Summary ==="
  curl -fsS "http://localhost:${NEXUS_ROUTER_PORT:-7000}/health" >/dev/null && echo "nexus-router: ok" || echo "nexus-router: down"
  curl -fsS "http://localhost:${LITELLM_PORT:-4000}/health" >/dev/null && echo "litellm: ok" || echo "litellm: down"
  curl -fsS "http://localhost:${N8N_PORT:-5678}/healthz" >/dev/null && echo "n8n: ok" || echo "n8n: down"
}

ensure_docker
run_compose_role
if [[ "$ACTION" == "up" || "$ACTION" == "status" ]]; then
  health_summary || true
fi
