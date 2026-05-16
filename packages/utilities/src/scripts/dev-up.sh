#!/bin/bash
# scripts/dev-up.sh

echo "🚀 Starting Project Nyra Foundation Stack..."

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Start core databases and local model routing
docker compose -f infra/hosts/orchestrator/docker-compose.yml up -d

echo "✅ Stack is coming up. Run 'scripts/healthcheck.sh' in a moment to verify."
