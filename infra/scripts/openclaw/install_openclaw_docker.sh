#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
IMAGE_TAG="${OPENCLAW_CUSTOM_IMAGE_TAG:-nyra/openclaw-mvp:local}"

docker build \
  -f "$ROOT_DIR/infra/openclaw/Dockerfile" \
  --build-arg OPENCLAW_INSTALL_BROWSER="${OPENCLAW_INSTALL_BROWSER:-1}" \
  --build-arg OPENCLAW_DOCKER_APT_PACKAGES="${OPENCLAW_DOCKER_APT_PACKAGES:-git curl jq python3 python3-pip build-essential ffmpeg}" \
  -t "$IMAGE_TAG" \
  "$ROOT_DIR"

echo "Built $IMAGE_TAG"
echo "Set OPENCLAW_MVP_IMAGE=$IMAGE_TAG in infra/env/openclaw.env to use this image."
