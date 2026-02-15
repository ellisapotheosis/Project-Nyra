# ==============================================================================
# Claude Flow CI/CD Container - Makefile
# ==============================================================================
# Convenient commands for managing the Claude Flow CI/CD container
# ==============================================================================

.PHONY: help setup start stop restart logs shell status clean backup restore doctor

# Default target
.DEFAULT_GOAL := help

# Docker Compose file path
COMPOSE_FILE := ../../docker-compose.claude-flow-cicd.yml
PROJECT_ROOT := ../../../..

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Claude Flow CI/CD Container Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

setup: ## Run initial setup (create config files)
	@echo "$(BLUE)Running setup...$(NC)"
	@bash ../../scripts/claude-flow-cicd-setup.sh

start: ## Start the Claude Flow CI/CD container
	@echo "$(BLUE)Starting Claude Flow CI/CD container...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Container started$(NC)"

stop: ## Stop the Claude Flow CI/CD container
	@echo "$(YELLOW)Stopping Claude Flow CI/CD container...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✅ Container stopped$(NC)"

restart: ## Restart the Claude Flow CI/CD container
	@echo "$(BLUE)Restarting Claude Flow CI/CD container...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Container restarted$(NC)"

logs: ## View container logs (follow)
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) logs -f claude-flow-cicd

shell: ## Access container shell
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd bash

status: ## Show Claude Flow status
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest status

doctor: ## Run system diagnostics
	@echo "$(BLUE)Running diagnostics...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest doctor

swarm-init: ## Initialize swarm coordination
	@echo "$(BLUE)Initializing swarm...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8

swarm-status: ## Check swarm status
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest swarm status

memory-list: ## List memory entries
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest memory list

memory-search: ## Search memory (usage: make memory-search QUERY="your query")
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest memory search --query "$(QUERY)"

daemon-start: ## Start Claude Flow daemon
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest daemon start

daemon-status: ## Check daemon status
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest daemon status

clean: ## Stop and remove container (keeps volumes)
	@echo "$(YELLOW)Cleaning up...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Container removed$(NC)"

clean-all: ## Stop, remove container and volumes (WARNING: deletes data)
	@echo "$(RED)⚠️  WARNING: This will delete all Claude Flow CI/CD data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) down -v; \
		echo "$(GREEN)✅ Container and volumes removed$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

backup: ## Backup AgentDB to backups directory
	@echo "$(BLUE)Backing up AgentDB...$(NC)"
	@mkdir -p ./backups
	@docker run --rm \
		-v claude_flow_cicd_agentdb:/data \
		-v $$(pwd)/backups:/backup \
		alpine tar czf /backup/agentdb-$$(date +%Y%m%d-%H%M%S).tar.gz /data
	@echo "$(GREEN)✅ Backup created in ./backups/$(NC)"

restore: ## Restore AgentDB from backup (usage: make restore BACKUP=agentdb-YYYYMMDD-HHMMSS.tar.gz)
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(RED)Error: BACKUP parameter required$(NC)"; \
		echo "Usage: make restore BACKUP=agentdb-YYYYMMDD-HHMMSS.tar.gz"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring AgentDB from $(BACKUP)...$(NC)"
	@docker run --rm \
		-v claude_flow_cicd_agentdb:/data \
		-v $$(pwd)/backups:/backup \
		alpine tar xzf /backup/$(BACKUP) -C /
	@echo "$(GREEN)✅ Backup restored$(NC)"

ps: ## Show container status
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) ps

config: ## Validate and view Docker Compose configuration
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) config

pull: ## Pull latest images
	@echo "$(BLUE)Pulling latest images...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) pull

update: pull restart ## Update images and restart container

install-deps: ## Install/update project dependencies inside container
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npm install --legacy-peer-deps

# ==============================================================================
# Advanced Commands
# ==============================================================================

exec: ## Execute command in container (usage: make exec CMD="command")
	@if [ -z "$(CMD)" ]; then \
		echo "$(RED)Error: CMD parameter required$(NC)"; \
		echo "Usage: make exec CMD=\"your command\""; \
		exit 1; \
	fi
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd $(CMD)

performance: ## Run performance benchmarks
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest performance benchmark --suite all

security-scan: ## Run security audit
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest security scan --depth full

neural-train: ## Train neural patterns
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd \
		npx @claude-flow/cli@latest neural train --pattern-type coordination --epochs 10

# ==============================================================================
# Examples
# ==============================================================================

example-workflow: ## Run example CI/CD workflow
	@echo "$(BLUE)Running example workflow...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd bash -c " \
		npx @claude-flow/cli@latest swarm init --topology mesh && \
		npx @claude-flow/cli@latest agent spawn -t coder --name example-coder && \
		npx @claude-flow/cli@latest swarm status \
	"

example-memory: ## Example memory operations
	@echo "$(BLUE)Running example memory operations...$(NC)"
	@cd $(PROJECT_ROOT) && docker compose -f $(COMPOSE_FILE) exec claude-flow-cicd bash -c " \
		npx @claude-flow/cli@latest memory store --key test-pattern --value 'Example pattern' --namespace cicd && \
		npx @claude-flow/cli@latest memory search --query 'example' --namespace cicd && \
		npx @claude-flow/cli@latest memory list --namespace cicd \
	"

# ==============================================================================
# Documentation
# ==============================================================================

docs: ## View README documentation
	@cat README.md | less

env-example: ## View environment variables example
	@cat .env.cicd.example | less
