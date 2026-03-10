#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/oracle/docker-compose.oracle.yml up -d twenty postgres

echo "Twenty dev stack started (twenty + postgres)."
