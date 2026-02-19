#!/bin/bash
set -e

echo "--- Stopping VLLM + LMCache Worker (RTX 3090Ti) ---"
docker compose down --remove-orphans
echo "--- Services stopped. ---"
