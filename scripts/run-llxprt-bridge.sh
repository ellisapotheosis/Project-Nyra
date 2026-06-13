#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

export LLXPRT_BRIDGE_HOST="${LLXPRT_BRIDGE_HOST:-0.0.0.0}"
export LLXPRT_BRIDGE_PORT="${LLXPRT_BRIDGE_PORT:-8090}"
export LLXPRT_BRIDGE_WORKDIR="${LLXPRT_BRIDGE_WORKDIR:-${PROJECT_ROOT}}"
export LLXPRT_CODEX_BACKEND="${LLXPRT_CODEX_BACKEND:-codex-cli}"
export LLXPRT_CODEX_PROVIDER="${LLXPRT_CODEX_PROVIDER:-codex}"
export LLXPRT_CODEX_MODEL="${LLXPRT_CODEX_MODEL:-}"

exec node "${PROJECT_ROOT}/services/llxprt-bridge/server.mjs"
