#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/hosts/oracle-vps/docker-compose.yml up -d twenty

docker compose -f infra/hosts/oracle-vps/docker-compose.yml logs -f --tail=100 twenty
