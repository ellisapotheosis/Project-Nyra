#!/usr/bin/env bash
set -Eeuo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${script_dir}/.." && pwd)"

require_optional() {
  local name="$1"
  local install_hint="$2"

  if command -v "$name" >/dev/null 2>&1; then
    printf 'ok: %s -> %s\n' "$name" "$(command -v "$name")"
  else
    printf 'warn: missing %s (%s)\n' "$name" "$install_hint" >&2
  fi
}

cd "$repo_root"

require_optional node "required to validate JSON"
require_optional npm "required for @vybestack/llxprt-code via npm exec"
require_optional zellij "required for durable cockpit sessions"
require_optional tmux "required by llxprt-jefe runtime sessions"
require_optional wsh "WaveTerm shell helper; install/open WaveTerm if absent"
require_optional cargo "required to build local llxprt-jefe checkout"

"${script_dir}/setup-wave-configs.sh"

if command -v npm >/dev/null 2>&1; then
  mkdir -p "${NYRA_LLXPRT_NPM_PREFIX:-${HOME}/.cache/nyra-llxprt-code}"
  npm exec --yes \
    --prefix "${NYRA_LLXPRT_NPM_PREFIX:-${HOME}/.cache/nyra-llxprt-code}" \
    --package "${NYRA_LLXPRT_PACKAGE:-@vybestack/llxprt-code}" \
    -- llxprt --help >/dev/null
  printf 'ok: @vybestack/llxprt-code is runnable through npm exec\n'
fi

if [[ -d "${NYRA_LLXPRT_JEFE_DIR:-${repo_root}/external/llxprt-jefe}" ]] && command -v cargo >/dev/null 2>&1; then
  cargo build --release --manifest-path "${NYRA_LLXPRT_JEFE_DIR:-${repo_root}/external/llxprt-jefe}/Cargo.toml"
  printf 'ok: llxprt-jefe build verified\n'
fi

printf '\nNext launch commands:\n'
printf '  scripts/run-llxprt-code.sh --profile-load nyra-subscription-ha\n'
printf '  scripts/run-llxprt-jefe.sh\n'
printf '  NYRA_INCLUDE_3060=1 scripts/nyra-wave-zellij.sh\n'
