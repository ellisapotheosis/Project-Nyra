#!/usr/bin/env bash
set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"
stamp="$(date +%Y%m%d-%H%M%S)"
out_dir="${pkg_dir}/blackbox/${stamp}"
archive="${pkg_dir}/blackbox/nyra-wave-blackbox-${stamp}.tar.gz"

mkdir -p "$out_dir"

redact() {
  sed -E \
    -e 's/(sk-[A-Za-z0-9_-]{8,})/<redacted>/g' \
    -e 's/((API|TOKEN|SECRET|PASSWORD|KEY)[A-Z0-9_]*=)[^[:space:]]+/\1<redacted>/g' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1<redacted>/g'
}

capture_cmd() {
  local name="$1"
  shift
  local cmd=("$@")
  {
    printf '$'
    for arg in "${cmd[@]}"; do printf ' %q' "$arg"; done
    printf '\n\n'
    "${cmd[@]}" 2>&1 || true
  } | redact >"${out_dir}/${name}.txt"
}

copy_safe() {
  local src="$1"
  local dst="$2"
  [[ -e "$src" ]] || return 0
  mkdir -p "$(dirname "$dst")"
  if [[ -d "$src" ]]; then
    rsync -a --exclude 'oauth' --exclude '*.sock' --exclude '*.log' "$src"/ "$dst"/
  else
    redact <"$src" >"$dst"
  fi
}

capture_cmd git-status git -C "$repo_root" status --short
capture_cmd git-branch git -C "$repo_root" branch --show-current
capture_cmd versions bash -lc 'for c in node npm zsh zellij tmux wsh cargo; do if command -v "$c" >/dev/null 2>&1; then printf "%s: " "$c"; "$c" --version 2>&1 | head -n 1; else printf "%s: missing\n" "$c"; fi; done'
capture_cmd doctor bash "${pkg_dir}/bin/nyra-wave-doctor.sh"
capture_cmd profile-matrix bash "${pkg_dir}/bin/llxprt-profile-matrix.sh"

copy_safe "${repo_root}/LLXPRT.md" "${out_dir}/repo/LLXPRT.md"
copy_safe "${repo_root}/config/agents/llxprt-profiles.json" "${out_dir}/repo/config/agents/llxprt-profiles.json"
copy_safe "${repo_root}/config/agents/llxprt-settings.project-nyra.json" "${out_dir}/repo/config/agents/llxprt-settings.project-nyra.json"
copy_safe "${repo_root}/config/agents/letta-stack-orchestrator.json" "${out_dir}/repo/config/agents/letta-stack-orchestrator.json"
copy_safe "${repo_root}/infra/configs/waveterm" "${out_dir}/repo/infra/configs/waveterm"
copy_safe "${repo_root}/infra/configs/zellij" "${out_dir}/repo/infra/configs/zellij"
copy_safe "$HOME/.config/waveterm" "${out_dir}/home/waveterm"
copy_safe "$HOME/.llxprt/settings.json" "${out_dir}/home/llxprt/settings.json"
copy_safe "$HOME/.llxprt/settings.project-nyra.bootstrap.json" "${out_dir}/home/llxprt/settings.project-nyra.bootstrap.json"
copy_safe "$HOME/.llxprt/profiles" "${out_dir}/home/llxprt/profiles"
copy_safe "$HOME/.zshrc" "${out_dir}/home/dotfiles/.zshrc"
copy_safe "$HOME/.zsh/85-wave-llxprt.zsh" "${out_dir}/home/dotfiles/zsh/85-wave-llxprt.zsh"

tar -czf "$archive" -C "${pkg_dir}/blackbox" "$stamp"
printf 'blackbox archive: %s\n' "$archive"
