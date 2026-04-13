#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CF_DIR="$ROOT_DIR/infra/cloudflared"

validate_with_docker() {
  local cfg="$1"
  docker run --rm \
    -v "$CF_DIR":/etc/cloudflared:ro \
    cloudflare/cloudflared:2026.4.1 \
    tunnel ingress validate --config "/etc/cloudflared/${cfg}"
}

validate_rule_with_docker() {
  local cfg="$1"
  local url="$2"
  docker run --rm \
    -v "$CF_DIR":/etc/cloudflared:ro \
    cloudflare/cloudflared:2026.4.1 \
    tunnel ingress rule "$url" --config "/etc/cloudflared/${cfg}" >/dev/null
}

run_validate() {
  local cfg="$1"
  echo "Validating ${cfg}"
  if command -v cloudflared >/dev/null 2>&1; then
    cloudflared tunnel ingress validate --config "$CF_DIR/$cfg"
    cloudflared tunnel ingress rule https://nyra.ratehunter.net --config "$CF_DIR/$cfg" >/dev/null || true
  elif command -v docker >/dev/null 2>&1; then
    validate_with_docker "$cfg"
    validate_rule_with_docker "$cfg" "https://nyra.ratehunter.net" || true
  else
    echo "ERROR: neither cloudflared nor docker is available for validation." >&2
    exit 1
  fi
}

run_validate config.orchestrator.yml
run_validate config.oracle.yml

if command -v docker >/dev/null 2>&1; then
  docker compose -f "$CF_DIR/docker-compose.cloudflared.orchestrator.yml" --env-file "$CF_DIR/.env.cloudflared" config >/dev/null
  docker compose -f "$CF_DIR/docker-compose.cloudflared.oracle.yml" --env-file "$CF_DIR/.env.cloudflared" config >/dev/null
  echo "Compose validation passed."
else
  echo "WARNING: docker not available; skipped compose validation."
fi
