#!/usr/bin/env bash
set -euo pipefail
TWENTY_DIR=${TWENTY_DIR:-../twentycrm}
if [ ! -d "$TWENTY_DIR" ]; then
  echo "Missing $TWENTY_DIR. Run scripts/twenty/clone.sh first."
  exit 1
fi
export DATABASE_URL=${DATABASE_URL:-postgresql://nyra:nyra@localhost:5432/twenty}
cd "$TWENTY_DIR"
docker compose up -d
