#!/usr/bin/env bash
set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"

copy_file() {
  local src="$1"
  local dst="$2"
  [[ -f "$src" ]] || return 0
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
}

copy_tree() {
  local src="$1"
  local dst="$2"
  [[ -d "$src" ]] || return 0
  mkdir -p "$dst"
  rsync -a --delete "$src"/ "$dst"/
}

copy_repo_assets() {
  mkdir -p \
    "${pkg_dir}/repo-files/config/agents" \
    "${pkg_dir}/repo-files/infra/configs/zellij" \
    "${pkg_dir}/repo-files/scripts" \
    "${pkg_dir}/repo-files/docs/infra"

  copy_file "${repo_root}/LLXPRT.md" "${pkg_dir}/repo-files/LLXPRT.md"
  copy_file "${repo_root}/Makefile" "${pkg_dir}/repo-files/Makefile"
  copy_file "${repo_root}/config/agents/llxprt-profiles.json" "${pkg_dir}/repo-files/config/agents/llxprt-profiles.json"
  copy_file "${repo_root}/config/agents/llxprt-env.example" "${pkg_dir}/repo-files/config/agents/llxprt-env.example"
  copy_file "${repo_root}/config/agents/llxprt-settings.project-nyra.json" "${pkg_dir}/repo-files/config/agents/llxprt-settings.project-nyra.json"
  copy_file "${repo_root}/config/agents/letta-stack-orchestrator.json" "${pkg_dir}/repo-files/config/agents/letta-stack-orchestrator.json"
  copy_tree "${repo_root}/config/agents/llxprt-profiles" "${pkg_dir}/repo-files/config/agents/llxprt-profiles"
  copy_tree "${repo_root}/infra/configs/waveterm" "${pkg_dir}/repo-files/infra/configs/waveterm"

  cp "${repo_root}/infra/configs/zellij/nyra-wave-ai.kdl" \
    "${repo_root}/infra/configs/zellij/nyra-wave-ai-3060.kdl" \
    "${repo_root}/infra/configs/zellij/nyra-orchestrator-mcp.kdl" \
    "${repo_root}/infra/configs/zellij/nyra-swarm.kdl" \
    "${pkg_dir}/repo-files/infra/configs/zellij/"

  cp \
    "${repo_root}/scripts/bootstrap-llxprt-stack.sh" \
    "${repo_root}/scripts/llxprt-common.sh" \
    "${repo_root}/scripts/run-llxprt-code.sh" \
    "${repo_root}/scripts/run-llxprt-jefe.sh" \
    "${repo_root}/scripts/setup-wave-configs.sh" \
    "${repo_root}/scripts/setup-wave-llxprt-bootstrap.sh" \
    "${repo_root}/scripts/nyra-wave-zellij.sh" \
    "${repo_root}/scripts/nyra-zellij-pane.sh" \
    "${repo_root}/scripts/start-llxprt-bridge.sh" \
    "${repo_root}/scripts/run-llxprt-bridge.sh" \
    "${repo_root}/scripts/stop-llxprt-bridge.sh" \
    "${repo_root}/scripts/start-llxprt-oracle-tunnel.sh" \
    "${repo_root}/scripts/stop-llxprt-oracle-tunnel.sh" \
    "${pkg_dir}/repo-files/scripts/"

  copy_file "${repo_root}/docs/infra/WAVE_LLXPRT_BOOTSTRAP_PACKAGE.md" "${pkg_dir}/repo-files/docs/infra/WAVE_LLXPRT_BOOTSTRAP_PACKAGE.md"
  copy_file "${repo_root}/docs/infra/WAVE_ZELLIJ_AGENT_STACK.md" "${pkg_dir}/repo-files/docs/infra/WAVE_ZELLIJ_AGENT_STACK.md"
}

copy_home_assets() {
  copy_file "$HOME/.zshrc" "${pkg_dir}/dotfiles/.zshrc"
  mkdir -p "${pkg_dir}/dotfiles/zsh"
  find "$HOME/.zsh" -maxdepth 1 -type f -name '*.zsh' ! -name '99-secrets.zsh' -print0 2>/dev/null |
    while IFS= read -r -d '' file; do
      copy_file "$file" "${pkg_dir}/dotfiles/zsh/$(basename "$file")"
    done

  copy_tree "$HOME/.config/waveterm" "${pkg_dir}/home-config/waveterm"
  mkdir -p "${pkg_dir}/home-config/llxprt/profiles"
  copy_file "$HOME/.llxprt/settings.json" "${pkg_dir}/home-config/llxprt/settings.json"
  copy_file "$HOME/.llxprt/settings.project-nyra.bootstrap.json" "${pkg_dir}/home-config/llxprt/settings.project-nyra.bootstrap.json"
  copy_file "$HOME/.llxprt/nyra-auth.todo" "${pkg_dir}/home-config/llxprt/nyra-auth.todo"
  find "$HOME/.llxprt/profiles" -maxdepth 1 -type f -name '*.json' -print0 2>/dev/null |
    while IFS= read -r -d '' file; do
      copy_file "$file" "${pkg_dir}/home-config/llxprt/profiles/$(basename "$file")"
    done
}

copy_jefe_source() {
  if [[ -d "${repo_root}/external/llxprt-jefe" ]]; then
    mkdir -p "${pkg_dir}/external/llxprt-jefe"
    rsync -a --delete \
      --exclude '.git' \
      --exclude 'target' \
      "${repo_root}/external/llxprt-jefe/" \
      "${pkg_dir}/external/llxprt-jefe/"
  fi
}

copy_repo_assets
copy_home_assets
copy_jefe_source

printf 'snapshot refreshed: %s\n' "$pkg_dir"
