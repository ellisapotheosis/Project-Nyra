#!/usr/bin/env bash
set -euo pipefail

docker context ls

for context in orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti worker-rtx3060; do
  if docker context inspect "$context" >/dev/null 2>&1; then
    echo "context ok: $context"
  else
    echo "context missing: $context"
  fi
done

