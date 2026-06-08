#!/usr/bin/env bash
set -uo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"
failures=0
warnings=0

ok() { printf 'ok: %s\n' "$*"; }
warn() { warnings=$((warnings + 1)); printf 'warn: %s\n' "$*" >&2; }
fail() { failures=$((failures + 1)); printf 'fail: %s\n' "$*" >&2; }

need_cmd() {
  if command -v "$1" >/dev/null 2>&1; then
    ok "command available: $1"
  else
    warn "command missing: $1"
  fi
}

json_check() {
  if ! command -v node >/dev/null 2>&1; then
    warn "node missing; skipping JSON validation"
    return
  fi
  node -e 'for (const f of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(f, "utf8"))' "$@" \
    && ok "JSON parsed: $# files" \
    || fail "JSON parse failed"
}

shell_check() {
  bash -n "$@" && ok "bash syntax passed: $# files" || fail "bash syntax failed"
}

zsh_check() {
  if command -v zsh >/dev/null 2>&1; then
    zsh -n "$@" && ok "zsh syntax passed: $# files" || fail "zsh syntax failed"
  else
    warn "zsh missing; skipping zsh syntax"
  fi
}

zellij_check() {
  if ! command -v zellij >/dev/null 2>&1; then
    warn "zellij missing; skipping layout validation"
    return
  fi
  (
    cd "$repo_root" &&
      zellij setup --check >/dev/null &&
      zellij setup --dump-layout infra/configs/zellij/nyra-wave-ai.kdl >/dev/null &&
      zellij setup --dump-layout infra/configs/zellij/nyra-wave-ai-3060.kdl >/dev/null
  ) && ok "zellij config and Nyra layouts validated" || fail "zellij validation failed"
}

secret_presence_check() {
  local name
  for name in NEXUS_MASTER_KEY LETTA_API_KEY LLXPRT_BRIDGE_API_KEY NYRA_WORKER_API_KEY; do
    if [[ -n "${!name:-}" ]]; then
      ok "secret present: ${name}=<redacted>"
    else
      warn "secret missing or not exported: ${name}"
    fi
  done
}

endpoint_shape_check() {
  local name value
  for name in NEXUS_BASE_URL NEXUS_MCP_URL LETTA_BASE_URL LLXPRT_BRIDGE_BASE_URL; do
    value="${!name:-}"
    if [[ -z "$value" ]]; then
      warn "endpoint not exported: ${name}"
    elif [[ "$value" == http://* || "$value" == https://* ]]; then
      ok "endpoint shape valid: ${name}=${value}"
    else
      warn "endpoint shape suspicious: ${name}=${value}"
    fi
  done
}

profile_count_check() {
  local profile_count
  profile_count="$(find "${repo_root}/config/agents/llxprt-profiles" -maxdepth 1 -type f -name '*.json' 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "${profile_count:-0}" -ge 8 ]]; then
    ok "LLxprt profile count: ${profile_count}"
  else
    fail "LLxprt profile count too low: ${profile_count:-0}"
  fi
}

package_shape_check() {
  local path
  for path in \
    "${pkg_dir}/repo-files" \
    "${pkg_dir}/home-config/waveterm" \
    "${pkg_dir}/home-config/llxprt/profiles" \
    "${pkg_dir}/dotfiles/zsh/85-wave-llxprt.zsh" \
    "${pkg_dir}/external/llxprt-jefe" \
    "${pkg_dir}/install.sh"; do
    [[ -e "$path" ]] && ok "package path exists: ${path#$repo_root/}" || fail "missing package path: ${path#$repo_root/}"
  done
}

printf 'Nyra Wave Doctor\n'
printf 'repo: %s\n' "$repo_root"
printf 'package: %s\n\n' "$pkg_dir"

for cmd in node npm zsh zellij tmux rsync; do
  need_cmd "$cmd"
done
need_cmd wsh
need_cmd cargo

package_shape_check
profile_count_check

json_check \
  "${repo_root}/config/agents/llxprt-settings.project-nyra.json" \
  "${repo_root}/config/agents/llxprt-profiles.json" \
  "${repo_root}/config/agents/letta-stack-orchestrator.json" \
  "${repo_root}/config/agents/llxprt-profiles/"*.json \
  "${repo_root}/infra/configs/waveterm/"*.json

shell_check \
  "${repo_root}/scripts/setup-wave-configs.sh" \
  "${repo_root}/scripts/setup-wave-llxprt-bootstrap.sh" \
  "${repo_root}/scripts/bootstrap-llxprt-stack.sh" \
  "${repo_root}/scripts/llxprt-common.sh" \
  "${repo_root}/scripts/run-llxprt-code.sh" \
  "${repo_root}/scripts/run-llxprt-jefe.sh" \
  "${repo_root}/scripts/nyra-wave-zellij.sh" \
  "${repo_root}/scripts/nyra-zellij-pane.sh" \
  "${pkg_dir}/install.sh" \
  "${pkg_dir}/bin/"*.sh

zsh_check "${pkg_dir}/dotfiles/.zshrc" "${pkg_dir}/dotfiles/zsh/"*.zsh
zellij_check
secret_presence_check
endpoint_shape_check

printf '\nsummary: failures=%s warnings=%s\n' "$failures" "$warnings"
[[ "$failures" -eq 0 ]]
