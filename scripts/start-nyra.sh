#!/bin/bash
# Start Project Nyra stack.

set -e

echo "🚀 Starting Project Nyra..."

# Ensure environment file exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Copy .env.example to .env and configure it."
  exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Create network if not exists
docker network create nyra-network 2>/dev/null || true

# Determine if infisical is available
if command -v infisical &> /dev/null; then
  echo "📦 Starting with Infisical secrets injection..."
  infisical run \
    --projectId="${INFISICAL_PROJECT_ID}" \
    --env="dev" \
    --path="/shared" \
    -- docker compose -f infra/docker-compose.yml up -d
else
  echo "📦 Starting with local .env secrets..."
  docker compose -f infra/docker-compose.yml up -d
fi

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 URLs:"
echo "  Nexus Router:       http://localhost:6000"
echo "  LiteLLM:            http://localhost:4000"
echo "  Claude Flow UI:     http://localhost:3003"
echo "  Gitea:              http://localhost:3100"
echo "  Prometheus Metrics: http://localhost:6011/metrics"
echo ""
echo "Run './scripts/test-stack.sh' to verify everything works!"