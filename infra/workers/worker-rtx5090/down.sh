#!/bin/bash
set -e

echo "--- Stopping VLLM + LMCache Worker (RTX 5090) ---"
docker compose down --remove-orphans
echo "--- Services stopped. ---"
