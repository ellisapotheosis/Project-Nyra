# ============================================================================
# Project Nyra - Docker Management Makefile
# ============================================================================

.PHONY: help build up down restart logs ps clean test security health backup restore

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

# ============================================================================
# Help
# ============================================================================

help: ## Show this help message
	@echo "Project Nyra - Docker Management"
	@echo ""
	@echo "Usage: make [target] ENV=[dev|prod]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ============================================================================
# Core Commands
# ============================================================================

build: ## Build all Docker images
	docker-compose $(COMPOSE_FILE) build

build-nocache: ## Build all Docker images without cache
	docker-compose $(COMPOSE_FILE) build --no-cache

up: ## Start all services
	docker-compose $(COMPOSE_FILE) up -d

up-build: ## Build and start all services
	docker-compose $(COMPOSE_FILE) up -d --build

down: ## Stop all services
	docker-compose $(COMPOSE_FILE) down

down-volumes: ## Stop all services and remove volumes
	docker-compose $(COMPOSE_FILE) down -v

restart: down up ## Restart all services

# ============================================================================
# Monitoring
# ============================================================================

logs: ## View logs from all services
	docker-compose $(COMPOSE_FILE) logs -f

logs-%: ## View logs from specific service (e.g., make logs-claude-flow)
	docker-compose $(COMPOSE_FILE) logs -f $*

ps: ## List all running containers
	docker-compose $(COMPOSE_FILE) ps

status: ps ## Alias for ps

health: ## Check health status of all services
	@echo "Checking service health..."
	@docker-compose $(COMPOSE_FILE) ps --format json | jq -r '.[] | "\(.Service): \(.Health)"'

# ============================================================================
# Service Management
# ============================================================================

start-%: ## Start specific service (e.g., make start-postgres)
	docker-compose $(COMPOSE_FILE) start $*

stop-%: ## Stop specific service (e.g., make stop-postgres)
	docker-compose $(COMPOSE_FILE) stop $*

restart-%: ## Restart specific service (e.g., make restart-claude-flow)
	docker-compose $(COMPOSE_FILE) restart $*

exec-%: ## Execute shell in specific service (e.g., make exec-postgres)
	docker-compose $(COMPOSE_FILE) exec $* sh

# ============================================================================
# Database Operations
# ============================================================================

db-backup: ## Backup PostgreSQL database
	@mkdir -p backups
	docker-compose $(COMPOSE_FILE) exec -T postgres pg_dump -U nyra nyra > backups/postgres_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created: backups/postgres_$$(date +%Y%m%d_%H%M%S).sql"

db-restore: ## Restore PostgreSQL database (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=backup.sql"; exit 1; fi
	docker-compose $(COMPOSE_FILE) exec -T postgres psql -U nyra -d nyra < $(FILE)
	@echo "Database restored from $(FILE)"

db-shell: ## Open PostgreSQL shell
	docker-compose $(COMPOSE_FILE) exec postgres psql -U nyra -d nyra

redis-cli: ## Open Redis CLI
	docker-compose $(COMPOSE_FILE) exec redis redis-cli -a $${REDIS_PASSWORD:-dev-only-password}

mongo-shell: ## Open MongoDB shell
	docker-compose $(COMPOSE_FILE) exec mongo mongosh -u admin -p $${MONGO_ROOT_PASSWORD}

# ============================================================================
# Testing
# ============================================================================

test: ## Run all tests
	@echo "Running health checks..."
	@bash tests/health-check-tests.sh
	@echo "Running integration tests..."
	@bash tests/integration-tests.sh
	@echo "Running security tests..."
	@bash tests/security-tests.sh

test-health: ## Run health check tests only
	@bash tests/health-check-tests.sh

test-integration: ## Run integration tests only
	@bash tests/integration-tests.sh

test-security: ## Run security tests only
	@bash tests/security-tests.sh

# ============================================================================
# Security
# ============================================================================

security: ## Run security scan on all images
	@echo "Scanning Docker images for vulnerabilities..."
	@docker images --format "{{.Repository}}:{{.Tag}}" | grep nyra | xargs -I {} sh -c 'echo "Scanning: {}" && docker scan {} || true'

security-audit: ## Run comprehensive security audit
	@echo "Running security audit..."
	@bash tests/security-tests.sh
	@echo "Checking for exposed secrets..."
	@docker-compose $(COMPOSE_FILE) config | grep -i "password\|secret\|key" || echo "No exposed secrets found"

# ============================================================================
# Maintenance
# ============================================================================

clean: ## Remove all stopped containers, unused networks, and dangling images
	docker system prune -f

clean-all: ## Remove all containers, networks, volumes, and images
	@echo "WARNING: This will remove ALL Docker resources!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v --rmi all; \
		docker system prune -af --volumes; \
	fi

clean-volumes: ## Remove all volumes (WARNING: data loss!)
	@echo "WARNING: This will remove ALL volumes and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose $(COMPOSE_FILE) down -v; \
	fi

update: ## Pull latest images and rebuild
	docker-compose $(COMPOSE_FILE) pull
	docker-compose $(COMPOSE_FILE) build --pull
	$(MAKE) up

# ============================================================================
# Development
# ============================================================================

dev: ## Start development environment
	ENV=dev $(MAKE) up

dev-logs: ## View development logs
	ENV=dev $(MAKE) logs

prod: ## Start production environment
	ENV=prod $(MAKE) up

prod-logs: ## View production logs
	ENV=prod $(MAKE) logs

shell-claude-flow: ## Open shell in claude-flow container
	docker-compose $(COMPOSE_FILE) exec claude-flow sh

shell-archon: ## Open shell in archon container
	docker-compose $(COMPOSE_FILE) exec archon bash

# ============================================================================
# Initialization
# ============================================================================

init: ## Initialize environment and create .env file
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file. Please edit it with your configuration."; \
	else \
		echo ".env file already exists."; \
	fi

init-prod: init ## Initialize production environment
	@echo "Generating secure passwords..."
	@echo "POSTGRES_PASSWORD=$$(openssl rand -base64 32)" >> .env
	@echo "REDIS_PASSWORD=$$(openssl rand -base64 32)" >> .env
	@echo "MONGO_ROOT_PASSWORD=$$(openssl rand -base64 32)" >> .env
	@echo "N8N_BASIC_AUTH_PASSWORD=$$(openssl rand -base64 32)" >> .env
	@echo "INFISICAL_ENCRYPTION_KEY=$$(openssl rand -hex 32)" >> .env
	@echo "INFISICAL_JWT_SECRET=$$(openssl rand -hex 32)" >> .env
	@echo "GRAFANA_ADMIN_PASSWORD=$$(openssl rand -base64 32)" >> .env
	@echo "Secure passwords generated and added to .env"

setup: init build ## Full setup: init, build, and start
	$(MAKE) up
	@echo "Setup complete! Services are starting..."
	@echo "Run 'make health' to check service status"

# ============================================================================
# Utility
# ============================================================================

validate: ## Validate docker-compose configuration
	docker-compose $(COMPOSE_FILE) config --quiet

version: ## Show Docker and docker-compose versions
	@echo "Docker version:"
	@docker --version
	@echo ""
	@echo "Docker Compose version:"
	@docker-compose --version

stats: ## Show container resource usage
	docker stats --no-stream

size: ## Show Docker disk usage
	docker system df -v
