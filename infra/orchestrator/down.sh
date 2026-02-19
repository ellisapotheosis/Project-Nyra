#!/bin/bash
set -e

echo "--- Stopping Orchestrator Stack ---"
docker compose down --remove-orphans
echo "--- Services stopped. ---"
