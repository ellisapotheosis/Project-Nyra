#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT/infra/env/nyra.env"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT/infra/env/nyra.env.example" "$ENV_FILE"
  echo "Created $ENV_FILE from example"
fi

python3 "$ROOT/infra/scripts/gen_secrets.py"

set -a
source "$ENV_FILE"
set +a

"$ROOT/infra/scripts/ultimate-bootstrap.sh" orchestrator validate || true
"$ROOT/infra/scripts/ultimate-bootstrap.sh" orchestrator up
"$ROOT/infra/scripts/ultimate-bootstrap.sh" oracle up

echo "Bootstrap complete. Run: make health"
