# ============================================================================
# Project Nyra - Unified Infrastructure Makefile
# ============================================================================
# Consolidated from 274 docker-compose files
# Manages 40+ services across all layers
#
# Quick Start:
#   make help          - Show all commands
#   make up            - Start all services
#   make ps            - List running services
#   make logs          - View all logs
#   make health        - Check health status
#
# ============================================================================

.PHONY: help

# Default target
.DEFAULT_GOAL := help

# Environment
ENV ?= dev
COMPOSE_FILE := -f docker-compose.yml
ifeq ($(ENV),dev)
	COMPOSE_FILE += -f docker-compose.dev.yml
else ifeq ($(ENV),prod)
	COMPOSE_FILE += -f docker-compose.prod.yml
endif

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# ============================================================================
# Help
# ============================================================================

help: ## Show this help message
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║        Project Nyra - Infrastructure Management          ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC) make [target] ENV=[dev|prod]"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-30s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Service Groups:$(NC)"
	@echo "  $(YELLOW)core$(NC)         - PostgreSQL, Redis, MongoDB"
	@echo "  $(YELLOW)ai$(NC)           - Claude Flow, Archon, Graphiti, Mem0, Letta"
	@echo "  $(YELLOW)gateway$(NC)      - Nexus, LiteLLM"
	@echo "  $(YELLOW)apps$(NC)         - Dify, Twenty CRM, Quote API, Campaign Engine"
	@echo "  $(YELLOW)devtools$(NC)     - Gitea, n8n, Activepieces"
	@echo "  $(YELLOW)monitoring$(NC)   - Prometheus, Grafana, Loki, cAdvisor, Langfuse"
	@echo "  $(YELLOW)storage$(NC)      - MinIO"
	@echo "  $(YELLOW)admin$(NC)        - pgAdmin"
	@echo ""

# ============================================================================
# Core Commands
# ============================================================================

build: ## Build all Docker images
	@echo "$(BLUE)Building all images...$(NC)"
	docker-compose $(COMPOSE_FILE) build

build-nocache: ## Build all Docker images without cache
	@echo "$(BLUE)Building all images (no cache)...$(NC)"
	docker-compose $(COMPOSE_FILE) build --no-cache

up: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✓ All services started$(NC)"
	@$(MAKE) ps

up-build: ## Build and start all services
	@echo "$(BLUE)Building and starting all services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d --build
	@$(MAKE) ps

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose $(COMPOSE_FILE) down
	@echo "$(GREEN)✓ All services stopped$(NC)"

down-volumes: ## Stop all services and remove volumes (WARNING: data loss!)
	@echo "$(RED)WARNING: This will remove all volumes and data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v; \
	fi

restart: down up ## Restart all services

# ============================================================================
# Service Groups
# ============================================================================

up-core: ## Start core infrastructure (postgres, redis, mongo)
	@echo "$(BLUE)Starting core services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d postgres redis mongo

up-ai: up-core ## Start AI/MCP services (claude-flow, archon, graphiti, mem0, letta)
	@echo "$(BLUE)Starting AI services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d infisical agent-claude-flow agent-archon claude-flow archon graphiti-mcp mem0-mcp letta letta_postgres neo4j falkordb

up-gateway: up-core ## Start API gateway services (nexus, litellm)
	@echo "$(BLUE)Starting gateway services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d nexus litellm

up-apps: up-core ## Start application services (dify, twenty-crm, quote-api, campaign-engine)
	@echo "$(BLUE)Starting application services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d dify dify-api dify-sandbox dify_postgres twenty-crm twenty_postgres quote-api campaign-engine

up-devtools: up-core ## Start development tools (gitea, n8n, activepieces)
	@echo "$(BLUE)Starting development tools...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d gitea gitea-runner n8n activepieces

up-monitoring: ## Start monitoring stack (prometheus, grafana, loki, cadvisor, langfuse)
	@echo "$(BLUE)Starting monitoring services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d prometheus grafana loki alertmanager cadvisor langfuse

up-storage: ## Start storage services (minio)
	@echo "$(BLUE)Starting storage services...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d minio

up-admin: up-core ## Start admin tools (pgadmin)
	@echo "$(BLUE)Starting admin tools...$(NC)"
	docker-compose $(COMPOSE_FILE) up -d pgadmin

# ============================================================================
# Monitoring & Logs
# ============================================================================

logs: ## View logs from all services
	docker-compose $(COMPOSE_FILE) logs -f

logs-%: ## View logs from specific service (e.g., make logs-claude-flow)
	docker-compose $(COMPOSE_FILE) logs -f $*

logs-core: ## View logs from core services
	docker-compose $(COMPOSE_FILE) logs -f postgres redis mongo

logs-ai: ## View logs from AI services
	docker-compose $(COMPOSE_FILE) logs -f claude-flow archon graphiti-mcp mem0-mcp letta

ps: ## List all running containers
	@docker-compose $(COMPOSE_FILE) ps

status: ps ## Alias for ps

health: ## Check health status of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@docker-compose $(COMPOSE_FILE) ps --format json 2>/dev/null | jq -r '.[] | "\(.Service): \(.Health)"' || docker-compose $(COMPOSE_FILE) ps

health-check: ## Run comprehensive health checks
	@echo "$(BLUE)Running comprehensive health checks...$(NC)"
	@bash scripts/health-check.sh

# ============================================================================
# Service Management
# ============================================================================

start-%: ## Start specific service (e.g., make start-postgres)
	@echo "$(BLUE)Starting $*...$(NC)"
	docker-compose $(COMPOSE_FILE) start $*

stop-%: ## Stop specific service (e.g., make stop-postgres)
	@echo "$(YELLOW)Stopping $*...$(NC)"
	docker-compose $(COMPOSE_FILE) stop $*

restart-%: ## Restart specific service (e.g., make restart-claude-flow)
	@echo "$(BLUE)Restarting $*...$(NC)"
	docker-compose $(COMPOSE_FILE) restart $*

exec-%: ## Execute shell in specific service (e.g., make exec-postgres)
	docker-compose $(COMPOSE_FILE) exec $* sh

# ============================================================================
# Database Operations
# ============================================================================

db-backup: ## Backup main PostgreSQL database
	@mkdir -p ../backups
	@echo "$(BLUE)Backing up main database...$(NC)"
	docker-compose $(COMPOSE_FILE) exec -T postgres pg_dump -U nyra nyra > ../backups/postgres_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Backup created: ../backups/postgres_$$(date +%Y%m%d_%H%M%S).sql$(NC)"

db-backup-all: ## Backup all PostgreSQL databases
	@mkdir -p ../backups
	@echo "$(BLUE)Backing up all databases...$(NC)"
	@$(MAKE) db-backup
	docker-compose $(COMPOSE_FILE) exec -T letta_postgres pg_dump -U letta letta > ../backups/letta_postgres_$$(date +%Y%m%d_%H%M%S).sql
	docker-compose $(COMPOSE_FILE) exec -T twenty_postgres pg_dump -U twenty twenty > ../backups/twenty_postgres_$$(date +%Y%m%d_%H%M%S).sql
	docker-compose $(COMPOSE_FILE) exec -T dify_postgres pg_dump -U dify dify > ../backups/dify_postgres_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ All databases backed up$(NC)"

db-restore: ## Restore main PostgreSQL database (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "$(RED)Usage: make db-restore FILE=backup.sql$(NC)"; exit 1; fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	docker-compose $(COMPOSE_FILE) exec -T postgres psql -U nyra -d nyra < $(FILE)
	@echo "$(GREEN)✓ Database restored$(NC)"

db-shell: ## Open main PostgreSQL shell
	docker-compose $(COMPOSE_FILE) exec postgres psql -U nyra -d nyra

db-shell-letta: ## Open Letta PostgreSQL shell
	docker-compose $(COMPOSE_FILE) exec letta_postgres psql -U letta -d letta

db-shell-twenty: ## Open Twenty PostgreSQL shell
	docker-compose $(COMPOSE_FILE) exec twenty_postgres psql -U twenty -d twenty

db-shell-dify: ## Open Dify PostgreSQL shell
	docker-compose $(COMPOSE_FILE) exec dify_postgres psql -U dify -d dify

redis-cli: ## Open Redis CLI
	docker-compose $(COMPOSE_FILE) exec redis redis-cli -a $${REDIS_PASSWORD:-dev-only-password}

mongo-shell: ## Open MongoDB shell
	docker-compose $(COMPOSE_FILE) exec mongo mongosh -u admin -p $${MONGO_ROOT_PASSWORD}

neo4j-shell: ## Open Neo4j Cypher shell
	docker-compose $(COMPOSE_FILE) exec neo4j cypher-shell -u neo4j -p $${NEO4J_PASSWORD}

# ============================================================================
# Service Shells
# ============================================================================

shell-claude-flow: ## Open shell in claude-flow container
	docker-compose $(COMPOSE_FILE) exec claude-flow sh

shell-archon: ## Open shell in archon container
	docker-compose $(COMPOSE_FILE) exec archon bash

shell-dify: ## Open shell in dify-api container
	docker-compose $(COMPOSE_FILE) exec dify-api sh

shell-twenty: ## Open shell in twenty-crm container
	docker-compose $(COMPOSE_FILE) exec twenty-crm sh

# ============================================================================
# Development
# ============================================================================

dev: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	ENV=dev $(MAKE) up
	@echo ""
	@echo "$(GREEN)Development environment ready!$(NC)"
	@echo ""
	@echo "$(YELLOW)Web UIs:$(NC)"
	@echo "  Claude Flow:    http://localhost:3000"
	@echo "  Archon OS:      http://localhost:8000"
	@echo "  Gitea:          http://localhost:3001"
	@echo "  n8n:            http://localhost:5678"
	@echo "  Activepieces:   http://localhost:8082"
	@echo "  Grafana:        http://localhost:3003"
	@echo "  Prometheus:     http://localhost:9090"
	@echo "  pgAdmin:        http://localhost:5050"
	@echo "  Infisical:      http://localhost:8080"
	@echo "  MinIO Console:  http://localhost:9001"
	@echo "  Dify:           http://localhost:3002"
	@echo "  Twenty CRM:     http://localhost:3020"
	@echo "  Langfuse:       http://localhost:3004"
	@echo ""

dev-logs: ## View development logs
	ENV=dev $(MAKE) logs

prod: ## Start production environment
	@echo "$(GREEN)Starting production environment...$(NC)"
	ENV=prod $(MAKE) up

prod-logs: ## View production logs
	ENV=prod $(MAKE) logs

# ============================================================================
# Testing
# ============================================================================

test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	@bash scripts/test-all.sh

test-health: ## Run health check tests only
	@bash scripts/test-health.sh

test-integration: ## Run integration tests only
	@bash scripts/test-integration.sh

test-security: ## Run security tests only
	@bash scripts/test-security.sh

validate: ## Validate docker-compose.yml syntax
	@echo "$(BLUE)Validating docker-compose.yml...$(NC)"
	docker-compose $(COMPOSE_FILE) config > /dev/null
	@echo "$(GREEN)✓ Configuration valid$(NC)"

# ============================================================================
# Security
# ============================================================================

security: ## Run security scan on all images
	@echo "$(BLUE)Scanning Docker images for vulnerabilities...$(NC)"
	@docker images --format "{{.Repository}}:{{.Tag}}" | grep nyra | xargs -I {} sh -c 'echo "Scanning: {}" && docker scan {} || true'

security-audit: ## Run comprehensive security audit
	@echo "$(BLUE)Running security audit...$(NC)"
	@bash scripts/security-audit.sh

secrets-check: ## Check for exposed secrets in configs
	@echo "$(BLUE)Checking for exposed secrets...$(NC)"
	@docker-compose $(COMPOSE_FILE) config | grep -i "password\|secret\|key" || echo "$(GREEN)✓ No exposed secrets found$(NC)"

# ============================================================================
# Maintenance
# ============================================================================

clean: ## Remove all stopped containers, unused networks, and dangling images
	@echo "$(BLUE)Cleaning up Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

clean-all: ## Remove all containers, networks, volumes, and images (WARNING!)
	@echo "$(RED)WARNING: This will remove ALL Docker resources!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v --rmi all; \
		docker system prune -af --volumes; \
		echo "$(GREEN)✓ All resources removed$(NC)"; \
	fi

clean-volumes: ## Remove all volumes (WARNING: data loss!)
	@echo "$(RED)WARNING: This will remove ALL volumes and data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v; \
		echo "$(GREEN)✓ All volumes removed$(NC)"; \
	fi

update: ## Pull latest images and rebuild
	@echo "$(BLUE)Updating all images...$(NC)"
	docker-compose $(COMPOSE_FILE) pull
	docker-compose $(COMPOSE_FILE) build --pull
	$(MAKE) up

# ============================================================================
# Initialization
# ============================================================================

init: ## Initialize infrastructure (first time setup)
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║          Project Nyra - Infrastructure Setup             ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Step 1:$(NC) Checking prerequisites..."
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)✗ Docker not found$(NC)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)✗ Docker Compose not found$(NC)"; exit 1; }
	@echo "$(GREEN)✓ Docker found$(NC)"
	@echo ""
	@echo "$(GREEN)Step 2:$(NC) Creating .env file..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ Created .env file$(NC)"; \
		echo "$(YELLOW)⚠ Please edit .env and add your secrets!$(NC)"; \
	else \
		echo "$(YELLOW)⚠ .env already exists$(NC)"; \
	fi
	@echo ""
	@echo "$(GREEN)Step 3:$(NC) Building images..."
	$(MAKE) build-nocache
	@echo ""
	@echo "$(GREEN)Step 4:$(NC) Starting core services..."
	$(MAKE) up-core
	@echo ""
	@echo "$(GREEN)✓ Infrastructure initialized!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Edit .env and add your API keys and passwords"
	@echo "  2. Run: make dev (to start all services)"
	@echo "  3. Run: make health (to check service health)"
	@echo ""

init-prod: ## Initialize production environment with secure passwords
	@echo "$(BLUE)Generating secure production passwords...$(NC)"
	@bash scripts/generate-secrets.sh
	@$(MAKE) init

# ============================================================================
# Info & Stats
# ============================================================================

info: ## Show infrastructure information
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║         Project Nyra - Infrastructure Info               ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Services:$(NC)         40+ services"
	@echo "$(GREEN)Containers:$(NC)       $(shell docker-compose $(COMPOSE_FILE) ps -q | wc -l) running"
	@echo "$(GREEN)Networks:$(NC)         $(shell docker network ls | grep nyra | wc -l) networks"
	@echo "$(GREEN)Volumes:$(NC)          $(shell docker volume ls | grep nyra | wc -l) volumes"
	@echo "$(GREEN)Images:$(NC)           $(shell docker images | grep nyra | wc -l) images"
	@echo ""
	@echo "$(YELLOW)Architecture:$(NC)     4-PC Distributed AI Mortgage Platform"
	@echo "$(YELLOW)Orchestrator:$(NC)    Area51 (192.168.1.10)"
	@echo "$(YELLOW)GPU Workers:$(NC)     3 workers (RTX 5090, 3090 Ti, 3060)"
	@echo ""

stats: ## Show resource usage statistics
	@echo "$(BLUE)Container Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

urls: ## Show all service URLs
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║              Service URLs (Local Access)                 ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)AI/MCP Services:$(NC)"
	@echo "  Claude Flow MCP:      http://localhost:3000"
	@echo "  Archon OS:            http://localhost:8000"
	@echo "  Graphiti MCP:         http://localhost:8001"
	@echo "  Mem0 MCP:             http://localhost:8002"
	@echo "  Letta:                http://localhost:8283"
	@echo ""
	@echo "$(GREEN)Gateway Services:$(NC)"
	@echo "  Nexus Router:         http://localhost:6000"
	@echo "  LiteLLM Proxy:        http://localhost:4000"
	@echo ""
	@echo "$(GREEN)Applications:$(NC)"
	@echo "  Dify:                 http://localhost:3002"
	@echo "  Twenty CRM:           http://localhost:3020"
	@echo "  Quote API:            http://localhost:8089"
	@echo "  Campaign Engine:      http://localhost:8020"
	@echo ""
	@echo "$(GREEN)Development Tools:$(NC)"
	@echo "  Gitea:                http://localhost:3001"
	@echo "  n8n:                  http://localhost:5678"
	@echo "  Activepieces:         http://localhost:8082"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  Grafana:              http://localhost:3003"
	@echo "  Prometheus:           http://localhost:9090"
	@echo "  AlertManager:         http://localhost:9093"
	@echo "  cAdvisor:             http://localhost:8081"
	@echo "  Langfuse:             http://localhost:3004"
	@echo ""
	@echo "$(GREEN)Admin Tools:$(NC)"
	@echo "  pgAdmin:              http://localhost:5050"
	@echo "  Infisical:            http://localhost:8080"
	@echo "  MinIO Console:        http://localhost:9001"
	@echo ""
	@echo "$(GREEN)Databases:$(NC)"
	@echo "  PostgreSQL:           localhost:5432"
	@echo "  Redis:                localhost:6379"
	@echo "  MongoDB:              localhost:27017"
	@echo "  Neo4j Browser:        http://localhost:7474"
	@echo "  Neo4j Bolt:           localhost:7687"
	@echo ""

# ============================================================================
# Quick Actions
# ============================================================================

quick-start: init up ## Quick start for new users (init + up)

quick-restart: down up ## Quick restart all services

quick-logs: ## Quick view of important service logs
	docker-compose $(COMPOSE_FILE) logs -f --tail=20 claude-flow archon postgres redis

quick-health: ## Quick health check of critical services
	@echo "$(BLUE)Checking critical services...$(NC)"
	@docker-compose $(COMPOSE_FILE) ps postgres redis mongo claude-flow archon infisical

# ============================================================================
# END OF MAKEFILE
# ============================================================================
