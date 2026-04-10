#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CF_APP_DIR="${NYRA_CF_APP_DIR:-${PROJECT_ROOT}/apps/landing/ratehunter-landing}"
CF_PROJECT_NAME="${NYRA_CF_PROJECT_NAME:-project-nyra}"
JEFE_DIR="${NYRA_LLXPRT_JEFE_DIR:-${PROJECT_ROOT}/external/llxprt-jefe}"
JEFE_REPO_URL="${NYRA_LLXPRT_JEFE_REPO_URL:-https://github.com/vybestack/llxprt-jefe.git}"
REMOTE_PROJECT_ROOT="${NYRA_REMOTE_PROJECT_ROOT:-/home/ellisapotheosis/repos/project-nyra}"
REMOTE_5090_ALIAS="${NYRA_HOST_5090:-5090}"

# shellcheck source=scripts/llxprt-common.sh
source "${SCRIPT_DIR}/llxprt-common.sh"

nyra_require_command git
nyra_require_command npm
nyra_require_command cargo
nyra_require_command ssh

cd "${PROJECT_ROOT}"
nyra_export_llxprt_env "${CF_APP_DIR}" "${CF_PROJECT_NAME}"

if [[ ! -d "${JEFE_DIR}" ]]; then
  git clone "${JEFE_REPO_URL}" "${JEFE_DIR}"
fi

npm exec --yes --prefix "${NYRA_LLXPRT_NPM_PREFIX:-${HOME}/.cache/nyra-llxprt-code}" --package "${NYRA_LLXPRT_PACKAGE:-@vybestack/llxprt-code}" -- llxprt --help >/dev/null
cargo build --release --manifest-path "${JEFE_DIR}/Cargo.toml" >/dev/null

remote_cmd="$(cat <<EOF
set -euo pipefail
cd "${REMOTE_PROJECT_ROOT}"
export NYRA_CF_PROJECT_NAME="${CF_PROJECT_NAME}"
export NYRA_CF_COMPATIBILITY_DATE="${NYRA_CF_COMPATIBILITY_DATE}"
export NEXT_PUBLIC_SITE_NAME="${NEXT_PUBLIC_SITE_NAME}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED}"
export NODE_ENV="${NODE_ENV}"
export NODE_VERSION="${NODE_VERSION}"
export SOURCEGIT_CMD="${SOURCEGIT_CMD}"
export LLXPRT_SOURCEGIT="${LLXPRT_SOURCEGIT}"
export NYRA_NEXUS_BASE_URL="${NYRA_NEXUS_BASE_URL}"
export NYRA_REMOTE_OPENAI_MODEL="${NYRA_REMOTE_OPENAI_MODEL}"
export NYRA_REMOTE_GEMINI_MODEL="${NYRA_REMOTE_GEMINI_MODEL}"
./scripts/run-llxprt-code.sh --help >/dev/null
EOF
)"

if ssh -A -o BatchMode=yes -o ConnectTimeout=8 "${REMOTE_5090_ALIAS}" "bash -lc $(printf '%q' "${remote_cmd}")"; then
  printf 'llxprt-code verified on %s using alias %s\n' "${REMOTE_5090_ALIAS}" "${REMOTE_5090_ALIAS}"
else
  printf 'warning: could not verify llxprt-code on %s via ssh alias %s\n' "${REMOTE_5090_ALIAS}" "${REMOTE_5090_ALIAS}" >&2
fi

printf 'Cloudflare Pages project: %s\n' "${CF_PROJECT_NAME}"
printf 'Compatibility date: %s\n' "${NYRA_CF_COMPATIBILITY_DATE}"
printf 'Site URL: %s\n' "${NEXT_PUBLIC_SITE_URL}"
printf 'Jefe binary: %s\n' "${JEFE_DIR}/target/release/jefe"
