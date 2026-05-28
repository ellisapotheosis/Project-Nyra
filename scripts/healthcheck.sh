#!/usr/bin/env bash
set -euo pipefail

HOST="${1:-${HOST:-local}}"

if [[ "$HOST" == "local" ]]; then
  bash scripts/health-check.sh
  exit 0
fi

if docker context inspect "$HOST" >/dev/null 2>&1; then
  docker --context "$HOST" ps
else
  echo "Docker context not found: $HOST" >&2
  exit 1
fi

