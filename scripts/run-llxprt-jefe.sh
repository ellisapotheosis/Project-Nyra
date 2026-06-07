#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CF_APP_DIR="${NYRA_CF_APP_DIR:-${PROJECT_ROOT}/apps/ratehunter}"
CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-project-nyra}"
JEFE_DIR="${NYRA_LLXPRT_JEFE_DIR:-${PROJECT_ROOT}/external/llxprt-jefe}"
JEFE_BIN="${JEFE_DIR}/target/release/jefe"

# shellcheck source=scripts/llxprt-common.sh
source "${SCRIPT_DIR}/llxprt-common.sh"

nyra_require_command cargo

if [[ ! -d "${JEFE_DIR}" ]]; then
  echo "Missing LLxprt Jefe checkout at ${JEFE_DIR}." >&2
  echo "Run ./scripts/bootstrap-llxprt-stack.sh first." >&2
  exit 1
fi

cd "${PROJECT_ROOT}"
nyra_export_llxprt_env "${CF_APP_DIR}" "${CF_PROJECT_NAME}"

if [[ ! -x "${JEFE_BIN}" ]]; then
  cargo build --release --manifest-path "${JEFE_DIR}/Cargo.toml"
fi

exec "${JEFE_BIN}" "$@"
