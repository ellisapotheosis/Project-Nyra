#!/usr/bin/env bash
set -euo pipefail

PID_FILE="${NYRA_LLXPRT_TUNNEL_PID_FILE:-${HOME}/.nyra/llxprt-oracle-tunnel.pid}"

if [[ ! -f "${PID_FILE}" ]]; then
  echo "llxprt oracle tunnel is not running"
  exit 0
fi

PID="$(cat "${PID_FILE}")"
if kill -0 "${PID}" 2>/dev/null; then
  kill "${PID}"
  echo "llxprt oracle tunnel stopped PID ${PID}"
else
  echo "llxprt oracle tunnel PID ${PID} is not running"
fi

rm -f "${PID_FILE}"
