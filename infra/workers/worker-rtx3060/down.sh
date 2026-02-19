#!/bin/bash
set -e

echo "--- Stopping Ollama Worker (RTX 3060) ---"
docker compose down --remove-orphans
echo "--- Services stopped. ---"
