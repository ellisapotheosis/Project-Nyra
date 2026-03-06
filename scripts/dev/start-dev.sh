#!/bin/bash
set -e

echo "🚀 Starting Project Nyra Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
    echo "✅ Loaded environment variables from .env"
else
    echo "⚠️  No .env file found. Using .env.example as template..."
    cp .env.example .env
    echo "❌ Please edit .env with your actual credentials and run again."
    exit 1
fi

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
docker compose -f infra/docker-compose.yml up -d \
    nexus litellm \
    letta_postgres letta \
    neo4j falkordb \
    twenty_postgres twenty_crm \
    redis \
    prometheus grafana loki alertmanager

echo "⏳ Waiting for services to be healthy..."
sleep 30

# Start business services
echo "💼 Starting business services..."
docker compose -f infra/docker-compose.yml up -d \
    quote_engine campaign_engine nyra_orchestrator mem0

# Start workflow automation
echo "🔄 Starting workflow automation..."
docker compose -f infra/docker-compose.yml up -d n8n openwebui moltbot-web

echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "   Nexus Router:      http://localhost:6000"
echo "   Quote Engine:      http://localhost:8001"
echo "   Campaign Engine:   http://localhost:8002"
echo "   Orchestrator:      http://localhost:8010"
echo "   Mem0 REST API:     http://localhost:4321"
echo "   Letta:             http://localhost:8283"
echo "   Twenty CRM:        http://localhost:3000"
echo "   n8n:               http://localhost:5678"
echo "   OpenWebUI:         http://localhost:8088"
echo "   Grafana:           http://localhost:3005"
echo "   Prometheus:        http://localhost:9090"
echo ""
echo "🔍 Check status: docker compose -f infra/docker-compose.yml ps"
echo "📋 View logs:    docker compose -f infra/docker-compose.yml logs -f [service]"
