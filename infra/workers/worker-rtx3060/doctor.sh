#!/bin/bash
set -e

echo "--- Ollama Worker (RTX 3060) Health Check ---"
echo ""

echo "1. Checking Docker container status:"
# The 'docker compose ps' command will exit with a non-zero code if services are not running.
# Grep for 'up' state to be sure.
if ! docker compose ps | grep -q 'Up'; then
    echo "❌ Container is not running or not healthy."
    docker compose ps
    exit 1
fi
docker compose ps
echo ""

echo "2. Checking Ollama API endpoint:"
if curl -s --fail http://localhost:11434/ > /dev/null; then
    echo "✅ Ollama API is responsive."
else
    echo "❌ Ollama API is NOT responsive."
    exit 1
fi
echo ""

echo "3. Listing local models via API:"
curl -s http://localhost:11434/api/tags
echo ""
echo ""

echo "--- Health check seems OK ---"
