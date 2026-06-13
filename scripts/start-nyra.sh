#!/bin/bash
# Start Project Nyra stack.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/infisical-token.sh
source "$SCRIPT_DIR/lib/infisical-token.sh"

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

command -v infisical >/dev/null 2>&1 || {
  echo "❌ infisical CLI not found." >&2
  exit 1
}

nyra_require_infisical_token
nyra_resolve_infisical_project_id

echo "📦 Starting with Infisical secrets injection..."
nyra_infisical_run "dev" "/shared" docker compose -f infra/docker-compose.yml up -d

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
