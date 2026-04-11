#!/bin/bash
# Start RTX 5090 Worker - vLLM + LMCache
set -e

echo "🚀 Starting RTX 5090 Worker (vLLM + LMCache)..."
echo "Location: worker-rtx5090 (100.64.0.10:8000)"

cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx5090

# Check if NVIDIA GPU is accessible
nvidia-smi > /dev/null || (echo "❌ NVIDIA GPU not found" && exit 1)

# Start services
docker compose -f docker-compose.gpu.yml --profile gpu up -d

echo "✅ RTX 5090 Worker services started"
docker ps --filter "name=nyra-worker-rtx5090"
