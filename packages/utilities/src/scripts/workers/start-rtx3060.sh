#!/bin/bash
# Start RTX 3060 Worker - Ollama
set -e

echo "🚀 Starting RTX 3060 Worker (Ollama)..."
echo "Location: worker-rtx3060 (100.64.0.11:11434)"

cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/worker-rtx3060

# Check if NVIDIA GPU is accessible
nvidia-smi > /dev/null || (echo "❌ NVIDIA GPU not found" && exit 1)

# Start services
docker compose -f docker-compose.gpu.yml --profile gpu up -d

echo "✅ RTX 3060 Worker services started"
docker ps --filter "name=nyra-worker-rtx3060"
