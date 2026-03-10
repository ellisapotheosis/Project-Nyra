#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INFRA_DIR="${REPO_ROOT}/infra"
ENV_FILE="${INFRA_DIR}/env/nyra.env"
docker compose --env-file "${ENV_FILE}" -f "${INFRA_DIR}/compose/nyra.compose.yaml" ps
