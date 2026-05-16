#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${NYRA_LOG_DIR:-${HOME}/.nyra/logs}"
PID_FILE="${NYRA_LLXPRT_BRIDGE_PID_FILE:-${HOME}/.nyra/llxprt-bridge.pid}"

mkdir -p "${LOG_DIR}" "$(dirname "${PID_FILE}")"

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "llxprt-bridge already running with PID $(cat "${PID_FILE}")"
  exit 0
fi

setsid "${PROJECT_ROOT}/scripts/run-llxprt-bridge.sh" >"${LOG_DIR}/llxprt-bridge.log" 2>&1 < /dev/null &
echo "$!" >"${PID_FILE}"
echo "llxprt-bridge started with PID $(cat "${PID_FILE}")"
