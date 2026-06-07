#!/usr/bin/env bash
set -euo pipefail

PID_FILE="${NYRA_LLXPRT_BRIDGE_PID_FILE:-${HOME}/.nyra/llxprt-bridge.pid}"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "llxprt-bridge is not running"
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if kill -0 "${PID}" 2>/dev/null; then
  kill "${PID}"
  echo "llxprt-bridge stopped PID ${PID}"
else
  echo "llxprt-bridge PID ${PID} is not active"
fi
rm -f "${PID_FILE}"
