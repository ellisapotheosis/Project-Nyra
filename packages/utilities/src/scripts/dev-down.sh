#!/bin/bash
# scripts/dev-down.sh

echo "🛑 Stopping Project Nyra Foundation Stack..."

docker compose -f infra/hosts/orchestrator/docker-compose.yml down

echo "✅ Stack is down."
