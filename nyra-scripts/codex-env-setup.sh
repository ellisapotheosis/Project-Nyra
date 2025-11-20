#!/usr/bin/env bash
set -euo pipefail

# Codex-friendly environment bootstrap for Project Nyra on WSL/Linux.
# Usage: ./codex-env-setup.sh [--devcontainer] [--ai-runner] [--no-node] [--no-python]

DEVCONTAINER=false
AIRUNNER=false
NONODE=false
NOPython=false

for arg in "$@"; do
  case "$arg" in
    --devcontainer) DEVCONTAINER=true ;;
    --ai-runner) AIRUNNER=true ;;
    --no-node) NONODE=true ;;
    --no-python) NOPython=true ;;
  esac
done

log() { printf "[codex] %s\n" "$*"; }
warn() { printf "[warn] %s\n" "$*" >&2; }

ensure_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    warn "$1 missing -> $2"; return 1; fi
}

log "Starting Project Nyra Linux bootstrap"

if command -v apt-get >/dev/null 2>&1; then
  if ! sudo -v >/dev/null 2>&1; then
    warn "Sudo privileges are required to run apt-get commands. Please run as a user with sudo access."
    exit 1
  fi
  sudo apt-get update -y
  sudo apt-get install -y git curl unzip ca-certificates build-essential
else
  warn "Non-APT distro detected. Install git/curl/unzip manually.";
fi

if [ "$NONODE" = false ]; then
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
  if ! command -v pnpm >/dev/null 2>&1; then
    npm install -g pnpm
  fi
fi

if [ "$NOPython" = false ]; then
  sudo apt-get install -y python3 python3-venv python3-pip
  if ! command -v uv >/dev/null 2>&1; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
  fi
fi

if [ "$DEVCONTAINER" = true ] || [ "$AIRUNNER" = true ]; then
  if ! command -v docker >/dev/null 2>&1; then
    warn "Docker not found. Install Docker Engine (WSL recommended) before continuing.";
  fi
fi

if [ "$DEVCONTAINER" = true ]; then
  warn "For VS Code: install 'ms-vscode-remote.remote-containers' and copy nyra-scripts/devcontainer into .devcontainer/."
fi

if [ "$AIRUNNER" = true ]; then
  log "Headless automation: prefer running inside WSL2/Docker with ./nyra-scripts/devcontainer Dockerfile as base image."
fi

log "Bootstrap complete. Run 'uv sync' and 'pnpm install' inside the repo to finalize dependencies."
