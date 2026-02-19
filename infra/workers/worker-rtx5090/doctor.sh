#!/bin/bash
set -e

echo "--- VLLM + LMCache Worker (RTX 5090) Health Check ---"
echo ""

echo "1. Checking Docker container status:"
if ! docker compose ps 2>/dev/null | grep -q 'Up'; then
    echo "❌ One or more containers are not running or not healthy."
    docker compose ps
    exit 1
fi
docker compose ps
echo ""

# Source .env to get ports
if [ ! -f .env ]; then
    echo "❌ .env file not found."
    exit 1
fi
source .env

echo "2. Checking VLLM API endpoint:"
if curl -s --fail "http://localhost:${VLLM_PORT}/health" > /dev/null; then
    echo "✅ VLLM API is responsive."
else
    echo "❌ VLLM API is NOT responsive. It might still be loading the model. Check logs: 'docker compose logs vllm'"
    exit 1
fi
echo ""

echo "3. Checking LMCache API endpoint:"
if curl -s --fail "http://localhost:${LMCACHE_PORT}/" > /dev/null; then
    echo "✅ LMCache API is responsive."
else
    echo "❌ LMCache API is NOT responsive. Check logs: 'docker compose logs lmcache'"
    exit 1
fi
echo ""

echo "4. Checking VLLM model metadata:"
curl -s "http://localhost:${VLLM_PORT}/v1/models"
echo ""
echo ""

echo "--- Health check seems OK ---"
