#!/usr/bin/env bash
set -euo pipefail

ORACLE_SSH_TARGET="${ORACLE_SSH_TARGET:-nyra-dev}"
LOCAL_HOST="${LLXPRT_TUNNEL_LOCAL_HOST:-127.0.0.1}"
LOCAL_PORT="${LLXPRT_TUNNEL_LOCAL_PORT:-8090}"
REMOTE_HOST="${LLXPRT_TUNNEL_REMOTE_HOST:-127.0.0.1}"
REMOTE_PORT="${LLXPRT_TUNNEL_REMOTE_PORT:-8090}"
LOG_DIR="${NYRA_LOG_DIR:-${HOME}/.nyra/logs}"
PID_FILE="${NYRA_LLXPRT_TUNNEL_PID_FILE:-${HOME}/.nyra/llxprt-oracle-tunnel.pid}"

mkdir -p "${LOG_DIR}" "$(dirname "${PID_FILE}")"

if [[ -f "${PID_FILE}" ]] && kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "llxprt oracle tunnel already running with PID $(cat "${PID_FILE}")"
  exit 0
fi

if ! curl -fsS -m 5 "http://${LOCAL_HOST}:${LOCAL_PORT}/health" >/dev/null; then
  echo "llxprt bridge is not reachable at http://${LOCAL_HOST}:${LOCAL_PORT}/health" >&2
  exit 1
fi

setsid ssh \
  -N \
  -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -R "${REMOTE_HOST}:${REMOTE_PORT}:${LOCAL_HOST}:${LOCAL_PORT}" \
  "${ORACLE_SSH_TARGET}" \
  >"${LOG_DIR}/llxprt-oracle-tunnel.log" 2>&1 < /dev/null &

echo "$!" >"${PID_FILE}"
sleep 1

if ! kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
  echo "llxprt oracle tunnel failed to start" >&2
  cat "${LOG_DIR}/llxprt-oracle-tunnel.log" >&2 || true
  rm -f "${PID_FILE}"
  exit 1
fi

echo "llxprt oracle tunnel started with PID $(cat "${PID_FILE}")"
