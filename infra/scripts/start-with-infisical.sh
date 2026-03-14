#!/bin/bash
# Start Docker services with Infisical secret injection
# Usage: ./start-with-infisical.sh [environment] [service-group]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
COMPOSE_DIR="$PROJECT_ROOT/infra/docker-compose"
# shellcheck source=scripts/lib/infisical-token.sh
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"
ENVIRONMENT="${1:-dev}"
SERVICE_GROUP="${2:-base}"

echo "🚀 Starting Nyra services with Infisical secret injection"
echo "   Environment: $ENVIRONMENT"
echo "   Service Group: $SERVICE_GROUP"
echo ""

nyra_require_infisical_token
nyra_resolve_infisical_project_id

cd "$COMPOSE_DIR"

# Select compose files based on service group
case "$SERVICE_GROUP" in
    base)
        COMPOSE_FILES="-f docker-compose.base.yml"
        echo "📦 Starting base services (PostgreSQL, Redis)"
        ;;
    databases)
        COMPOSE_FILES="-f docker-compose.base.yml -f docker-compose.databases.yml"
        echo "📦 Starting database services (PostgreSQL, Redis, Qdrant, FalkorDB)"
        ;;
    ai)
        COMPOSE_FILES="-f docker-compose.base.yml -f docker-compose.databases.yml -f docker-compose.ai.yml"
        echo "📦 Starting AI services (Nexus, LiteLLM, Letta, Mem0)"
        ;;
    mcp)
        COMPOSE_FILES="-f docker-compose.base.yml -f docker-compose.databases.yml -f docker-compose.mcp-servers.yml"
        echo "📦 Starting MCP servers (Graphiti, Qdrant MCP, OpenMemory)"
        ;;
    all)
        COMPOSE_FILES="-f docker-compose.base.yml -f docker-compose.databases.yml -f docker-compose.ai.yml -f docker-compose.mcp-servers.yml"
        echo "📦 Starting all services"
        ;;
    *)
        echo "❌ Unknown service group: $SERVICE_GROUP"
        echo "Available: base, databases, ai, mcp, all"
        exit 1
        ;;
esac

# Start services with Infisical secret injection
echo ""
echo "🔐 Injecting secrets from Infisical..."
infisical run \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$ENVIRONMENT" \
    --path="/shared" \
    -- docker compose $COMPOSE_FILES up -d --remove-orphans

echo ""
echo "✅ Services started successfully!"
echo ""
echo "Check status:"
echo "  docker ps"
echo "  docker compose $COMPOSE_FILES ps"
echo ""
echo "View logs:"
echo "  docker compose $COMPOSE_FILES logs -f [service-name]"
