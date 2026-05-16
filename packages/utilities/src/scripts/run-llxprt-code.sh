#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CF_APP_DIR="${NYRA_CF_APP_DIR:-${PROJECT_ROOT}/apps/landing/ratehunter-landing}"
CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-project-nyra}"

# shellcheck source=scripts/llxprt-common.sh
source "${SCRIPT_DIR}/llxprt-common.sh"

nyra_require_command npm

cd "${PROJECT_ROOT}"
nyra_export_llxprt_env "${CF_APP_DIR}" "${CF_PROJECT_NAME}"
nyra_run_llxprt "$@"
