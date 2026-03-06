#!/usr/bin/env bash
set -euo pipefail

docker compose -f infra/oracle/docker-compose.oracle.yml up -d twenty

docker compose -f infra/oracle/docker-compose.oracle.yml logs -f --tail=100 twenty
