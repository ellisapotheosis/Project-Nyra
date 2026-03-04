#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.stack}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker-compose.yml}"

scripts/verify-stack.sh "$ENV_FILE"
