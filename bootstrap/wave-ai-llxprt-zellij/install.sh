#!/usr/bin/env bash
set -euo pipefail

pkg_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "${pkg_dir}/../.." && pwd)"

mode="all"
case "${1:-}" in
  --repo-only) mode="repo" ;;
  --home-only) mode="home" ;;
  --check) mode="check" ;;
  "") ;;
  *)
    printf 'usage: %s [--repo-only|--home-only|--check]\n' "$0" >&2
    exit 2
    ;;
esac

copy_tree() {
  local src="$1"
  local dst="$2"
  mkdir -p "$dst"
  rsync -a "$src"/ "$dst"/
}

install_repo_files() {
  copy_tree "${pkg_dir}/repo-files" "$repo_root"
}

install_home_files() {
  mkdir -p "$HOME/.config/waveterm" "$HOME/.llxprt" "$HOME/.zsh"

  copy_tree "${pkg_dir}/home-config/waveterm" "$HOME/.config/waveterm"
  copy_tree "${pkg_dir}/home-config/llxprt" "$HOME/.llxprt"
  copy_tree "${pkg_dir}/dotfiles/zsh" "$HOME/.zsh"

  if [[ -f "$HOME/.zshrc" ]]; then
    cp "$HOME/.zshrc" "$HOME/.zshrc.before-nyra-wave-$(date +%Y%m%d%H%M%S)"
  fi
  cp "${pkg_dir}/dotfiles/.zshrc" "$HOME/.zshrc"
}

run_checks() {
  (
    cd "$repo_root"
    node -e 'for (const f of process.argv.slice(1)) JSON.parse(require("fs").readFileSync(f, "utf8"))' \
      config/agents/letta-stack-orchestrator.json \
      config/agents/llxprt-settings.project-nyra.json \
      config/agents/llxprt-profiles.json \
      config/agents/llxprt-profiles/*.json \
      infra/configs/waveterm/*.json

    bash -n \
      scripts/setup-wave-configs.sh \
      scripts/setup-wave-llxprt-bootstrap.sh \
      scripts/bootstrap-llxprt-stack.sh \
      scripts/llxprt-common.sh \
      scripts/run-llxprt-code.sh \
      scripts/run-llxprt-jefe.sh \
      scripts/nyra-wave-zellij.sh \
      scripts/nyra-zellij-pane.sh

    if command -v zellij >/dev/null 2>&1; then
      zellij setup --check >/dev/null
      zellij setup --dump-layout infra/configs/zellij/nyra-wave-ai.kdl >/dev/null
      zellij setup --dump-layout infra/configs/zellij/nyra-wave-ai-3060.kdl >/dev/null
      zellij setup --dump-layout infra/configs/zellij/nyra-orchestrator-mcp.kdl >/dev/null
      zellij setup --dump-layout infra/configs/zellij/nyra-swarm.kdl >/dev/null
    fi
  )
}

case "$mode" in
  all)
    install_repo_files
    install_home_files
    run_checks
    ;;
  repo)
    install_repo_files
    run_checks
    ;;
  home)
    install_home_files
    ;;
  check)
    run_checks
    ;;
esac

printf 'Wave AI / Zellij / LLxprt bootstrap package %s complete\n' "$mode"
