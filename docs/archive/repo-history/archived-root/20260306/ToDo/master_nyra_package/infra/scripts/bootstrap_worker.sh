#!/usr/bin/env bash
# bootstrap_worker.sh – convenience script to build and start a worker.
#
# Usage:
#   ./bootstrap_worker.sh rtx5090
#   ./bootstrap_worker.sh rtx3090ti
#   ./bootstrap_worker.sh rtx3060
#
# The script expects to be run from the `infra/scripts` directory.  It
# builds the Docker image (if necessary), starts the docker‑compose
# stack for the specified worker, and prints a health check command.

set -euo pipefail

WORKER="$1"
if [[ -z "$WORKER" ]]; then
  echo "Usage: $0 {rtx5090|rtx3090ti|rtx3060}"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKER_DIR="$ROOT_DIR/worker-$WORKER"

if [[ ! -d "$WORKER_DIR" ]]; then
  echo "ERROR: Unknown worker: $WORKER_DIR"
  exit 1
fi

cd "$WORKER_DIR"
echo "[+] Working directory: $(pwd)"

# Copy environment file if missing
if [[ ! -f .env ]]; then
  echo "[!] .env not found.  Copying .env.example…"
  cp .env.example .env
  echo "[!] Please edit .env to set MODEL_NAME and other variables before continuing."
  exit 0
fi

echo "[+] Building images (if needed)…"
docker compose build

echo "[+] Starting containers…"
docker compose up -d

echo "[+] Containers started.  Current status:"
docker compose ps

case "$WORKER" in
  rtx3060)
    PORT_VAR="OLLAMA_PORT"
    DEFAULT_PORT=11434
    ;;
  *)
    PORT_VAR="VLLM_PORT"
    DEFAULT_PORT=8000
    ;;
esac

PORT=$(grep -E "^${PORT_VAR}=" .env | cut -d= -f2 || true)
PORT="${PORT:-$DEFAULT_PORT}"
echo "[+] Health check suggestion:"
if [[ "$WORKER" == "rtx3060" ]]; then
  echo "curl http://localhost:${PORT}/api/tags"
else
  echo "curl http://localhost:${PORT}/v1/models"
fi