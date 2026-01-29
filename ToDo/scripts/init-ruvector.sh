#!/usr/bin/env bash
set -euo pipefail
# Usage: POSTGRES_PASSWORD=... ./scripts/init-ruvector.sh

docker exec -e PGPASSWORD="${POSTGRES_PASSWORD:-}" -it postgres \
  psql -U postgres -d nyra_ai -c "CREATE EXTENSION IF NOT EXISTS ruvector;"
