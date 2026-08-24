#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
REMOVE_ORPHANS=true
SKIP_UI=false

usage() {
  cat <<USAGE
Usage: $0 [--keep-orphans] [--skip-ui]
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep-orphans)
      REMOVE_ORPHANS=false
      shift
      ;;
    --skip-ui)
      SKIP_UI=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2
      usage
      exit 1
      ;;
  esac
done

command -v docker >/dev/null 2>&1 || { echo "docker missing" >&2; exit 1; }

BASE=(-f "$ROOT_DIR/infra/docker-compose.yml")
CORE=(-f "$ROOT_DIR/infra/compose/openclaw.compose.yml")
UI=(-f "$ROOT_DIR/infra/compose/openclaw.ui.compose.yml")

DOWN_ARGS=(down)
if [[ "$REMOVE_ORPHANS" == "true" ]]; then
  DOWN_ARGS+=(--remove-orphans)
fi

docker compose "${BASE[@]}" "${CORE[@]}" --profile openclaw "${DOWN_ARGS[@]}" || true

if [[ "$SKIP_UI" != "true" ]]; then
  docker compose "${BASE[@]}" "${CORE[@]}" "${UI[@]}" --profile openclaw --profile openclaw-ui "${DOWN_ARGS[@]}" || true
fi

echo "OpenClaw overlays stopped."
