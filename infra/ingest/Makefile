# Project Nyra - AI-Powered Mortgage Platform
# Main orchestration commands

.PHONY: help init up down logs health build test oracle-up oracle-down apotheosis-up apotheosis-down

help:
	@echo "Project Nyra - Mortgage AI Platform"
	@echo "===================================="
	@echo ""
	@echo "🏠 Local Development:"
	@echo "  make init         - Initialize project (install deps, setup)"
	@echo "  make up           - Start all services via Docker Compose"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - View service logs"
	@echo "  make health       - Check service health"
	@echo "  make build        - Build all services"
	@echo "  make test         - Run all tests"
	@echo ""
	@echo "☁️  Cloud Deployments:"
	@echo "  make oracle-up    - Start Oracle Cloud deployment (Always Free)"
	@echo "  make oracle-down  - Stop Oracle Cloud deployment"
	@echo ""
	@echo "🚀 AI Development:"
	@echo "  make apotheosis-up   - Start Apotheosis AI stack (Gitea + Qdrant + AI tools)"
	@echo "  make apotheosis-down - Stop Apotheosis AI stack"
	@echo ""
	@echo "🔧 Maintenance:"
	@echo "  make clean        - Clean up containers and volumes"
	@echo "  make reset        - Complete reset (WARNING: destroys data)"
	@echo ""

init:
	@echo "🚀 Initializing Project Nyra..."
	@echo "Installing dependencies..."
	npm install
	@echo "Setting up environment..."
	cp infra/env/.env.template .env
	@echo "Building Docker images..."
	docker-compose -f infra/compose/docker-compose.main.yml build
	@echo "✅ Project initialized successfully!"

up:
	@echo "🔄 Starting Project Nyra services..."
	docker-compose -f infra/compose/docker-compose.main.yml up -d
	@echo "⏳ Waiting for services to be healthy..."
	sleep 10
	@./scripts/health-check.sh
	@echo "🎉 Project Nyra is running!"

down:
	@echo "🛑 Stopping Project Nyra services..."
	docker-compose -f infra/compose/docker-compose.main.yml down
	@echo "✅ Services stopped"

logs:
	@echo "📋 Viewing service logs..."
	docker-compose -f infra/compose/docker-compose.main.yml logs -f

health:
	@echo "🔍 Checking service health..."
	@./scripts/health-check.sh

build:
	@echo "🔨 Building all services..."
	turbo run build
	docker-compose -f infra/compose/docker-compose.main.yml build

test:
	@echo "🧪 Running all tests..."
	turbo run test

# Development commands
dev:
	@echo "🔧 Starting development environment..."
	turbo run dev

# Database commands
db-migrate:
	@echo "📊 Running database migrations..."
	cd src/services/ratehunter-api && npm run migration:run

db-seed:
	@echo "🌱 Seeding database..."
	cd src/services/ratehunter-api && npm run seed

# GPU Worker commands (infrastructure specific)
worker-up:
	@echo "🖥️ Starting GPU workers..."
	docker-compose -f infra/compose/docker-compose.workers.yml up -d

worker-down:
	@echo "🖥️ Stopping GPU workers..."
	docker-compose -f infra/compose/docker-compose.workers.yml down

# ============================================================
# Cloud Deployment Commands
# ============================================================

# Oracle Cloud Always Free deployment
oracle-up:
	@echo "☁️ Starting Oracle Cloud deployment..."
	@echo "📋 Choose graph database:"
	@echo "  1. FalkorDB (Redis-based, lighter)"
	@echo "  2. Neo4j (Full graph features)"
	@read -p "Enter choice (1/2): " choice; \
	if [ "$$choice" = "1" ]; then \
		echo "🚀 Deploying with FalkorDB..."; \
		docker-compose -f infra/compose/docker-compose.oracle-cloud.yml --profile graph_falkordb up -d; \
	else \
		echo "🚀 Deploying with Neo4j..."; \
		docker-compose -f infra/compose/docker-compose.oracle-cloud.yml --profile graph_neo4j up -d; \
	fi
	@echo "✅ Oracle Cloud deployment started!"
	@echo "🌐 Access: http://localhost:3100"

oracle-down:
	@echo "☁️ Stopping Oracle Cloud deployment..."
	docker-compose -f infra/compose/docker-compose.oracle-cloud.yml down
	@echo "✅ Oracle Cloud deployment stopped"

# Oracle Cloud with Cloudflare Tunnel
oracle-tunnel:
	@echo "☁️ Starting Oracle Cloud with Cloudflare Tunnel..."
	@if [ -z "$$CLOUDFLARE_TUNNEL_TOKEN" ]; then \
		echo "❌ Error: CLOUDFLARE_TUNNEL_TOKEN not set"; \
		echo "💡 Set your tunnel token: export CLOUDFLARE_TUNNEL_TOKEN=your_token"; \
		exit 1; \
	fi
	docker-compose -f infra/compose/docker-compose.oracle-cloud.yml --profile graph_falkordb --profile cloudflared up -d
	@echo "✅ Oracle Cloud with tunnel started!"

# ============================================================
# AI Development Stack Commands
# ============================================================

# Full Apotheosis AI stack
apotheosis-up:
	@echo "🚀 Starting Apotheosis AI Development Stack..."
	@echo "📋 Choose profile:"
	@echo "  1. Basic (Gitea + Qdrant + Flow Orchestrator)"
	@echo "  2. Quality (Basic + SonarQube code analysis)"
	@echo "  3. Full AI (Quality + Ollama + Open WebUI)"
	@read -p "Enter choice (1/2/3): " choice; \
	if [ "$$choice" = "2" ]; then \
		echo "🎯 Deploying with Quality tools..."; \
		docker-compose -f infra/compose/docker-compose.apotheosis.yml --profile quality up -d; \
	elif [ "$$choice" = "3" ]; then \
		echo "🤖 Deploying Full AI stack..."; \
		docker-compose -f infra/compose/docker-compose.apotheosis.yml --profile quality --profile ai-models up -d; \
	else \
		echo "📦 Deploying Basic stack..."; \
		docker-compose -f infra/compose/docker-compose.apotheosis.yml up -d; \
	fi
	@echo "✅ Apotheosis AI stack started!"
	@echo "🔗 Access points:"
	@echo "  • Gitea (Git):           http://localhost:3000"
	@echo "  • Qdrant (Vector DB):    http://localhost:6333"
	@echo "  • Flow Orchestrator:     http://localhost:8500"
	@echo "  • Qodo AI Review:        http://localhost:5600"

apotheosis-down:
	@echo "🚀 Stopping Apotheosis AI stack..."
	docker-compose -f infra/compose/docker-compose.apotheosis.yml down
	@echo "✅ Apotheosis AI stack stopped"

# ============================================================
# Maintenance Commands
# ============================================================

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ Cleanup complete"

reset:
	@echo "⚠️  WARNING: This will destroy ALL data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "🗑️ Removing all containers and volumes..."; \
		docker-compose -f infra/compose/docker-compose.main.yml down -v; \
		docker-compose -f infra/compose/docker-compose.oracle-cloud.yml down -v; \
		docker-compose -f infra/compose/docker-compose.apotheosis.yml down -v; \
		docker system prune -af; \
		echo "✅ Complete reset finished"; \
	else \
		echo "❌ Reset cancelled"; \
	fi