#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/infra/env/nyra.env"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f "$ROOT/infra/env/nyra.env.example" ]]; then
    cp "$ROOT/infra/env/nyra.env.example" "$ENV_FILE"
  elif [[ -f "$ROOT/infra/environments/templates/root/.env.stack.example" ]]; then
    cp "$ROOT/infra/environments/templates/root/.env.stack.example" "$ENV_FILE"
  else
    echo "Missing env template: infra/env/nyra.env.example or infra/environments/templates/root/.env.stack.example"
    exit 1
  fi
  echo "Created $ENV_FILE from example"
fi

python3 "$ROOT/infra/scripts/gen_secrets.py"

set -a
source "$ENV_FILE"
set +a

"$ROOT/infra/scripts/ultimate-bootstrap.sh" orchestrator validate || true
"$ROOT/infra/scripts/ultimate-bootstrap.sh" orchestrator up
"$ROOT/infra/scripts/ultimate-bootstrap.sh" oracle up

if [[ "${BOOT_OPENCLAW:-false}" == "true" ]]; then
  docker compose -f "$ROOT/infra/compose/nyra.compose.yaml" --profile openclaw up -d openclaw-gateway openclaw-cli
  echo "OpenClaw profile started (BOOT_OPENCLAW=true)."
fi

echo "Bootstrap complete. Run: make health"
