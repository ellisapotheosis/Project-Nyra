#!/usr/bin/env bash
set -euo pipefail
PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$PKG_DIR/scripts/_common.sh"

ROLE="worker-rtx5090"
STACK="vllm-lmcache"
ROOT="$HOME/nyra-workers/worker-rtx5090"

mkdir -p "$ROOT/docker"
cp -f "$PKG_DIR/docker/worker-rtx5090/docker-compose.yml" "$ROOT/docker/docker-compose.yml"
if [[ -f "$PKG_DIR/docker/worker-rtx5090/.env.example" ]]; then
  cp -n "$PKG_DIR/docker/worker-rtx5090/.env.example" "$ROOT/docker/.env" || true
fi

if [[ "$STACK" == "vllm-lmcache" ]]; then
  mkdir -p "$HOME/nyra-workers/worker-vllm"
  cp -f "$PKG_DIR/docker/worker-vllm/Dockerfile" "$HOME/nyra-workers/worker-vllm/Dockerfile"
  cp -n "$PKG_DIR/docker/worker-vllm/.env.example" "$ROOT/docker/.env" || true
fi

if [[ ! -d "$HOME/repos/project-nyra/.git" ]]; then
  mkdir -p "$HOME/repos"
  git clone https://github.com/ellisapotheosis/project-nyra.git "$HOME/repos/project-nyra" || true
fi

echo ""
read -r -p "Write Claude YOLO config (auto-approve, unrestricted)? [y/N] " ans || true
if [[ "${ans:-N}" =~ ^[Yy]$ ]]; then
  "$PKG_DIR/scripts/write-claude-yolo-config.sh" || true
fi

echo ""
echo "✅ Worker bootstrap complete: worker-rtx5090"
echo "GPU test:  $PKG_DIR/gpu-smoke-test.sh"
echo "Zsh snippet (optional): source ~/nyra-workers/snippets/zshrc_nyra_worker_snippet.zsh"
echo ""

if [[ "$STACK" == "vllm-lmcache" ]]; then
  echo "Start vLLM (recommended via Infisical):"
  echo "  export INFISICAL_ENV=prod"
  echo "  export NYRA_MACHINE_PATH=/machines/worker-rtx5090"
  echo "  cd ~/nyra-workers/worker-rtx5090/docker"
  echo "  infisical run --env=\"$INFISICAL_ENV\" --path=\"$NYRA_MACHINE_PATH\" -- docker compose up -d --build"
else
  echo "Start Ollama:"
  echo "  cd ~/nyra-workers/worker-rtx5090/docker"
  echo "  docker compose up -d"
fi
