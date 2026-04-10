# ==============================================================================
# PROJECT NYRA - MASTER MAKEFILE
# ==============================================================================
# Central build automation for all 4-PC distributed stack
# Usage: make <target>
# ==============================================================================

.PHONY: help init bootstrap up down logs health-check clean restart tunnel-setup port-discovery verify-connectivity db-init secrets-setup

# Colors for output
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Defaults
DOCKER_COMPOSE := docker-compose
WORKER := all
SERVICE := all
PROFILE := all

# ==============================================================================
# HELP TARGET
# ==============================================================================

help:
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo "$(BLUE)PROJECT NYRA - MASTER MAKEFILE$(NC)"
	@echo "$(BLUE)═══════════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)INITIALIZATION:$(NC)"
	@echo "  make init                 - Initialize project (first-time setup)"
	@echo "  make bootstrap            - Full system bootstrap (all services)"
	@echo "  make secrets-setup        - Initialize Infisical secrets"
	@echo ""
	@echo "$(YELLOW)ORCHESTRATOR (Control Plane):$(NC)"
	@echo "  make orchestrator-up      - Start Nexus, Claude Flow, databases"
	@echo "  make orchestrator-logs    - View orchestrator logs"
	@echo "  make orchestrator-restart - Restart orchestrator services"
	@echo ""
	@echo "$(YELLOW)WORKERS (GPU Inference):$(NC)"
	@echo "  make workers-up           - Start all GPU workers"
	@echo "  make workers-up WORKER=rtx-5090 - Start specific worker"
	@echo "  make workers-down         - Stop all workers"
	@echo "  make workers-logs WORKER=rtx-5090 - View worker logs"
	@echo ""
	@echo "$(YELLOW)ORACLE CLOUD (Always-On Services):$(NC)"
	@echo "  make oracle-up            - Start Oracle Cloud stack (TwentyCRM, n8n, etc)"
	@echo "  make oracle-down          - Stop Oracle services"
	@echo "  make oracle-logs          - View Oracle logs"
	@echo ""
	@echo "$(YELLOW)NETWORKING:$(NC)"
	@echo "  make tunnel-setup         - Configure Cloudflared tunnel"
	@echo "  make tunnel-start         - Start Cloudflared tunnel"
	@echo "  make tunnel-stop          - Stop Cloudflared tunnel"
	@echo "  make port-discovery       - Auto-discover all open ports & services"
	@echo ""
	@echo "$(YELLOW)MONITORING & HEALTH:$(NC)"
	@echo "  make health-check         - Full system health check"
	@echo "  make health-check SERVICE=postgres - Check specific service"
	@echo "  make logs SERVICE=nexus-router    - View service logs"
	@echo "  make metrics              - Show Prometheus metrics"
	@echo "  make grafana              - Open Grafana dashboard (http://localhost:3005)"
	@echo ""
	@echo "$(YELLOW)DATABASE:$(NC)"
	@echo "  make db-init              - Initialize PostgreSQL databases"
	@echo "  make db-backup            - Backup all databases"
	@echo "  make db-restore           - Restore from latest backup"
	@echo ""
	@echo "$(YELLOW)DEVELOPMENT:$(NC)"
	@echo "  make dev                  - Start in development mode (hot-reload)"
	@echo "  make test                 - Run test suite"
	@echo "  make lint                 - Lint code"
	@echo "  make format               - Format code"
	@echo ""
	@echo "$(YELLOW)CLEANUP:$(NC)"
	@echo "  make clean                - Stop all services"
	@echo "  make clean-volumes        - Stop & remove volumes (⚠️  DATA LOSS!)"
	@echo "  make clean-all            - Hard reset (volumes + images)"
	@echo ""
	@echo "$(YELLOW)DEPLOYMENT:$(NC)"
	@echo "  make deploy               - Deploy to production"
	@echo "  make rollback             - Rollback to previous version"
	@echo ""

# ==============================================================================
# INITIALIZATION
# ==============================================================================

init:
	@echo "$(GREEN)▶ Initializing Project Nyra...$(NC)"
	@echo "  1. Checking prerequisites..."
	@docker --version || (echo "$(RED)✗ Docker not installed$(NC)" && exit 1)
	@docker-compose --version || (echo "$(RED)✗ Docker Compose not installed$(NC)" && exit 1)
	@node --version || (echo "$(RED)✗ Node.js not installed$(NC)" && exit 1)
	@npm --version || (echo "$(RED)✗ npm not installed$(NC)" && exit 1)
	@echo "  2. Creating directory structure..."
	@mkdir -p infra/docker/{orchestrator,workers,oracle,services}
	@mkdir -p src/{orchestrator,agents,services,mcp-servers,workflows}
	@mkdir -p packages/{types,db,utils,mcp}
	@mkdir -p apps/{landing,admin-ui,crm-ui,borrower-portal}
	@mkdir -p config/{orchestrator,oracle,secrets}
	@mkdir -p docs tests logs
	@echo "  3. Copying example configs..."
	@test -f .env.example || cp .env.example.master .env.example
	@test -f config/orchestrator/.env || cp config/orchestrator/.env.example config/orchestrator/.env
	@echo "  4. Installing npm dependencies..."
	@npm install --workspaces
	@echo "$(GREEN)✓ Initialization complete$(NC)"
	@echo "$(YELLOW)Next: make bootstrap$(NC)"

bootstrap: init db-init secrets-setup orchestrator-up
	@echo "$(GREEN)✓ System bootstrap complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Wait 30 seconds for services to stabilize"
	@echo "  2. Run: make health-check"
	@echo "  3. Run: make port-discovery"
	@echo "  4. Run: make tunnel-setup"

# ==============================================================================
# ORCHESTRATOR (CONTROL PLANE)
# ==============================================================================

orchestrator-up:
	@echo "$(GREEN)▶ Starting Orchestrator (Control Plane)...$(NC)"
	$(DOCKER_COMPOSE) up -d \
		nexus-router \
		archon-os-orchestrator \
		postgres \
		redis \
		qdrant \
		letta \
		prometheus \
		grafana \
		loki
	@echo "  Waiting for services to be ready..."
	@sleep 10
	@echo "$(GREEN)✓ Orchestrator started$(NC)"
	@echo ""
	@echo "  Services:"
	@echo "    Nexus Router: http://localhost:6000"
	@echo "    Claude Flow: http://localhost:8000"
	@echo "    Grafana: http://localhost:3005"
	@echo "    Postgres: localhost:5432"
	@echo "    Redis: localhost:6379"

orchestrator-down:
	@echo "$(YELLOW)⏹ Stopping Orchestrator...$(NC)"
	$(DOCKER_COMPOSE) stop \
		nexus-router \
		archon-os-orchestrator \
		postgres \
		redis \
		qdrant \
		letta \
		prometheus \
		grafana \
		loki

orchestrator-restart: orchestrator-down orchestrator-up
	@echo "$(GREEN)✓ Orchestrator restarted$(NC)"

orchestrator-logs:
	$(DOCKER_COMPOSE) logs -f \
		nexus-router \
		archon-os-orchestrator

# ==============================================================================
# WORKERS (GPU INFERENCE)
# ==============================================================================

workers-up:
ifeq ($(WORKER),all)
	@echo "$(GREEN)▶ Starting all GPU workers...$(NC)"
	$(DOCKER_COMPOSE) --profile workers up -d
else
	@echo "$(GREEN)▶ Starting worker: $(WORKER)...$(NC)"
	$(DOCKER_COMPOSE) --profile $(WORKER) up -d
endif
	@echo "$(GREEN)✓ Workers started$(NC)"
	@sleep 5
	@make health-check

workers-down:
	@echo "$(YELLOW)⏹ Stopping workers...$(NC)"
	$(DOCKER_COMPOSE) --profile workers down

workers-logs:
ifdef WORKER
	$(DOCKER_COMPOSE) logs -f worker-$(WORKER)
else
	$(DOCKER_COMPOSE) logs -f worker-3060 worker-5090 worker-3090
endif

# ==============================================================================
# ORACLE CLOUD (ALWAYS-ON SERVICES)
# ==============================================================================

oracle-up:
	@echo "$(GREEN)▶ Starting Oracle Cloud stack...$(NC)"
	@echo "  Note: These services should run on Oracle Cloud, not locally"
	@echo "  This is a local preview only"
	$(DOCKER_COMPOSE) --profile oracle up -d \
		twentycrm \
		n8n \
		activepieces \
		quote-engine \
		landing-page \
	@echo "$(GREEN)✓ Oracle services started (local preview)$(NC)"

oracle-down:
	@echo "$(YELLOW)⏹ Stopping Oracle services...$(NC)"
	$(DOCKER_COMPOSE) --profile oracle down

oracle-logs:
	$(DOCKER_COMPOSE) logs -f twentycrm n8n activepieces

# ==============================================================================
# DATABASE
# ==============================================================================

db-init:
	@echo "$(GREEN)▶ Initializing databases...$(NC)"
	@sleep 5  # Wait for Postgres to start
	@docker-compose exec -T postgres psql \
		-U postgres \
		-f /docker-entrypoint-initdb.d/init-multiple-databases.sh
	@echo "$(GREEN)✓ Databases initialized$(NC)"

db-backup:
	@echo "$(GREEN)▶ Backing up databases...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump \
		-U postgres \
		nyra_main > backups/nyra_main-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup complete: backups/nyra_main-*.sql$(NC)"

db-restore:
	@echo "$(YELLOW)⚠ Restoring database...$(NC)"
	@ls -lt backups/nyra_main-*.sql | head -1
	@docker-compose exec -T postgres psql \
		-U postgres \
		nyra_main < $$(ls -t backups/nyra_main-*.sql | head -1)
	@echo "$(GREEN)✓ Restore complete$(NC)"

# ==============================================================================
# NETWORKING & TUNNELING
# ==============================================================================

port-discovery:
	@echo "$(GREEN)▶ Discovering all open ports...$(NC)"
	@bash ./infra/scripts/port-discovery.sh
	@echo ""
	@echo "$(YELLOW)Results saved to: PORT_DISCOVERY_REPORT.txt$(NC)"

tunnel-setup:
	@echo "$(GREEN)▶ Setting up Cloudflared tunnel...$(NC)"
	@test -f ~/.cloudflared/64fe03f2-9859-44ca-b0ab-e499d8464104.json || \
		(echo "$(RED)✗ Tunnel credentials not found at ~/.cloudflared/$(NC)" && \
		 echo "  Get credentials from: https://dash.cloudflare.com/?to=/:account/access/tunnels" && \
		 exit 1)
	@bash ./infra/scripts/tunnel-setup.sh
	@echo "$(GREEN)✓ Tunnel configured$(NC)"
	@echo "$(YELLOW)Next: make tunnel-start$(NC)"

tunnel-start:
	@echo "$(GREEN)▶ Starting Cloudflared tunnel...$(NC)"
	cloudflared tunnel --config infra/cloudflared/config.yml run

tunnel-stop:
	@echo "$(YELLOW)⏹ Stopping tunnel...$(NC)"
	@pkill -f "cloudflared tunnel"

verify-connectivity:
	@echo "$(GREEN)▶ Verifying system connectivity...$(NC)"
	@bash ./infra/scripts/verify-connectivity.sh

# ==============================================================================
# SECRETS MANAGEMENT
# ==============================================================================

secrets-setup:
	@echo "$(GREEN)▶ Setting up Infisical secrets...$(NC)"
	@bash ./config/infisical/setup-secrets.sh || echo "$(YELLOW)⚠ Skipping Infisical (not configured yet)$(NC)"

# ==============================================================================
# MONITORING & HEALTH
# ==============================================================================

health-check:
	@echo "$(GREEN)▶ Running system health check...$(NC)"
	@bash ./infra/scripts/health-check.sh
	@echo ""
	@make -s services-summary

services-summary:
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)SERVICE STATUS SUMMARY$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@docker-compose ps --services | while read service; do \
		status=$$(docker-compose ps --filter "name=$$service" --format "{{.Status}}" | head -1); \
		if [[ "$$status" == *"Up"* ]]; then \
			echo "$(GREEN)✓$(NC) $$service: Up"; \
		else \
			echo "$(RED)✗$(NC) $$service: $$status"; \
		fi; \
	done
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"

logs:
	@echo "$(GREEN)▶ Viewing logs for: $(SERVICE)$(NC)"
ifdef SERVICE
	docker-compose logs -f $(SERVICE)
else
	docker-compose logs -f
endif

metrics:
	@echo "$(YELLOW)Opening Prometheus metrics: http://localhost:9090$(NC)"
	@which xdg-open && xdg-open http://localhost:9090 || \
	 which open && open http://localhost:9090 || \
	 echo "Visit: http://localhost:9090"

grafana:
	@echo "$(YELLOW)Opening Grafana: http://localhost:3005$(NC)"
	@which xdg-open && xdg-open http://localhost:3005 || \
	 which open && open http://localhost:3005 || \
	 echo "Visit: http://localhost:3005"

# ==============================================================================
# DEVELOPMENT
# ==============================================================================

dev:
	@echo "$(GREEN)▶ Starting in development mode (hot-reload)...$(NC)"
	@npm run dev --workspaces

test:
	@echo "$(GREEN)▶ Running tests...$(NC)"
	@npm run test --workspaces

lint:
	@echo "$(GREEN)▶ Linting code...$(NC)"
	@npm run lint --workspaces

format:
	@echo "$(GREEN)▶ Formatting code...$(NC)"
	@npm run format --workspaces

# ==============================================================================
# CLEANUP
# ==============================================================================

clean:
	@echo "$(YELLOW)⏹ Stopping all services...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ All services stopped$(NC)"

clean-volumes: clean
	@echo "$(RED)⚠ Removing volumes (DATA LOSS!)...$(NC)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Volumes removed$(NC)"

clean-all: clean-volumes
	@echo "$(RED)⚠ Removing images...$(NC)"
	docker-compose rmi -a
	@echo "$(GREEN)✓ All cleaned$(NC)"

# ==============================================================================
# DEPLOYMENT
# ==============================================================================

deploy:
	@echo "$(GREEN)▶ Deploying to production...$(NC)"
	@echo "  1. Building images..."
	docker-compose build --pull
	@echo "  2. Running migrations..."
	@make db-init
	@echo "  3. Starting services..."
	@make bootstrap
	@echo "$(GREEN)✓ Deployment complete$(NC)"

rollback:
	@echo "$(YELLOW)⏮ Rolling back to previous version...$(NC)"
	@echo "$(RED)⚠ Not yet implemented$(NC)"

# ==============================================================================
# UTILITY TARGETS
# ==============================================================================

.DEFAULT_GOAL := help

# Display make version
version:
	@echo "Make version: $$(make --version | head -1)"

# Run any command in a container
run-%:
	docker-compose exec -T $(firstword $(subst -, ,$*)) $(subst $(firstword $(subst -, ,$*))-, ,$*)

# ==============================================================================
# END OF MAKEFILE
# ==============================================================================
