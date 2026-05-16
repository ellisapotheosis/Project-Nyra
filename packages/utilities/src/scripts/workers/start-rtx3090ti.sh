#!/bin/bash
# Start RTX 3090Ti Worker - vLLM + LMCache
set -e

echo "🚀 Starting RTX 3090Ti Worker (vLLM + LMCache)..."
echo "Location: worker-rtx3090ti (100.64.0.12:8000)"

cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx3090ti

# Check if NVIDIA GPU is accessible
nvidia-smi > /dev/null || (echo "❌ NVIDIA GPU not found" && exit 1)

# Start services
docker compose -f docker-compose.gpu.yml --profile gpu up -d

echo "✅ RTX 3090Ti Worker services started"
docker ps --filter "name=nyra-worker-rtx3090ti"
