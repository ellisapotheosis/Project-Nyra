#!/bin/bash
# Start RTX Worker with a specific model
# Usage: ./start-worker.sh <5090|3090ti> <gemma|qwen>

WORKER_TYPE=$1
MODEL_TYPE=$2

if [[ "$WORKER_TYPE" == "5090" ]]; then
    DIR="worker-rtx5090"
    IP="100.64.0.11"
elif [[ "$WORKER_TYPE" == "3090ti" ]]; then
    DIR="worker-rtx3090ti"
    IP="100.64.0.13"
else
    echo "❌ Usage: ./start-worker.sh <5090|3090ti> <gemma|qwen>"
    exit 1
fi

if [[ "$MODEL_TYPE" == "gemma" ]]; then
    MODEL="google/gemma-3-27b-it"
elif [[ "$MODEL_TYPE" == "qwen" ]]; then
    MODEL="Qwen/Qwen2.5-Coder-32B-Instruct"
else
    echo "❌ Usage: ./start-worker.sh <5090|3090ti> <gemma|qwen>"
    exit 1
fi

echo "🚀 Starting RTX $WORKER_TYPE Worker with $MODEL..."
cd /home/ellisapotheosis/repos/project-nyra/infra/hosts/$DIR

# Export environment variables for Docker Compose
export VLLM_MODEL=$MODEL
export VLLM_GPU_MEMORY_UTILIZATION=0.80
export VLLM_MAX_MODEL_LEN=4096

docker compose -f docker-compose.gpu.yml --profile gpu up -d

echo "✅ Worker started on $IP:8000"
