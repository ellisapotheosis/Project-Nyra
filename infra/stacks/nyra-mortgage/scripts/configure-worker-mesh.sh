#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${STACK_DIR}/.env"

if [ ! -f "${ENV_FILE}" ]; then
  cp "${STACK_DIR}/.env.example" "${ENV_FILE}"
fi

WORKER_5090_HOST="${WORKER_5090_HOST:-worker-5090.tailnet-name.ts.net}"
WORKER_3090_HOST="${WORKER_3090_HOST:-worker-3090.tailnet-name.ts.net}"
WORKER_3060_HOST="${WORKER_3060_HOST:-worker-3060.tailnet-name.ts.net}"

set_kv() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "${ENV_FILE}"; then
    sed -i "s#^${key}=.*#${key}=${value}#" "${ENV_FILE}"
  else
    echo "${key}=${value}" >> "${ENV_FILE}"
  fi
}

set_kv "LLXPERT_JEFE_BASE_URL" "http://${WORKER_5090_HOST}:8000/v1"
set_kv "LLXPERT_JEFE_API_KEY" "dummy"
set_kv "LLXPERT_CODER_BASE_URL" "http://${WORKER_3090_HOST}:8000/v1"
set_kv "LLXPERT_CODER_API_KEY" "dummy"
set_kv "LLXPERT_AUX_BASE_URL" "http://${WORKER_3060_HOST}:11434/v1"
set_kv "LLXPERT_AUX_API_KEY" "dummy"
set_kv "WORKER_1_HOST" "${WORKER_5090_HOST}"
set_kv "WORKER_2_HOST" "${WORKER_3090_HOST}"
set_kv "WORKER_3_HOST" "${WORKER_3060_HOST}"
set_kv "WORKER_1_ROLE" "llxpert-jefe"
set_kv "WORKER_2_ROLE" "llxpert-coder"
set_kv "WORKER_3_ROLE" "llxpert-aux"

echo "Updated ${ENV_FILE} with worker mesh defaults:"
echo "  llxpert-jefe -> ${WORKER_5090_HOST}:8000/v1"
echo "  llxpert-coder -> ${WORKER_3090_HOST}:8000/v1"
echo "  llxpert-aux   -> ${WORKER_3060_HOST}:11434/v1"
