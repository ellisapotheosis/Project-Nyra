#!/bin/bash
set -e

echo "--- Orchestrator Stack Health Check ---"
echo ""

echo "1. Checking Docker container status:"
docker compose ps
echo ""

# Source .env to get IPs and ports
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run './up.sh' first or create the file from the example."
    exit 1
fi
source .env

echo "2. Checking Gitea Service:"
if curl -s --fail "http://${GITEA_HOST_IP}:${GITEA_HOST_HTTP_PORT}" > /dev/null; then
    echo "✅ Gitea UI is responsive."
else
    echo "❌ Gitea UI is NOT responsive. Check 'docker compose logs gitea'."
fi
echo ""

echo "3. Checking Worker Connections:"
echo "--- Pinging Worker RTX 5090 (VLLM)..."
if nc -zw1 ${WORKER_5090_HOST} ${WORKER_5090_PORT}; then
    echo "✅ Connection to ${WORKER_5090_HOST}:${WORKER_5090_PORT} successful."
else
    echo "❌ Failed to connect to ${WORKER_5090_HOST}:${WORKER_5090_PORT}."
fi

echo "--- Pinging Worker RTX 3090Ti (VLLM)..."
if nc -zw1 ${WORKER_3090TI_HOST} ${WORKER_3090TI_PORT}; then
    echo "✅ Connection to ${WORKER_3090TI_HOST}:${WORKER_3090TI_PORT} successful."
else
    echo "❌ Failed to connect to ${WORKER_3090TI_HOST}:${WORKER_3090TI_PORT}."
fi

echo "--- Pinging Worker RTX 3060 (Ollama)..."
if nc -zw1 ${WORKER_3060_HOST} ${WORKER_3060_PORT}; then
    echo "✅ Connection to ${WORKER_3060_HOST}:${WORKER_3060_PORT} successful."
else
    echo "❌ Failed to connect to ${WORKER_3060_HOST}:${WORKER_3060_PORT}."
fi
echo ""

# TODO: Add more checks for other services like Claude-Flow, Archon, Nexus, etc.

echo "--- Basic health check complete ---"
