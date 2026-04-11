#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/hosts/oracle-vps/docker-compose.yml up -d twenty postgres

echo "Twenty dev stack started (twenty + postgres)."
