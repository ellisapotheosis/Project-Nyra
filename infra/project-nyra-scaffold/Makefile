.PHONY: help init up down logs status health bootstrap oracle-up orchestrator-up workers-up clean vault-init

SHELL := /bin/bash
PROJECT_NAME := project-nyra
DOCKER_COMPOSE := docker-compose
MACHINE_TYPE ?= orchestrator

# Color output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help:
	@echo "$(GREEN)Project Nyra — Complete Makefile$(NC)"
	@echo ""
	@echo "$(YELLOW)Initialization:$(NC)"
	@echo "  make init              — Setup repo structure, .env, and configs"
	@echo "  make bootstrap         — One-click: init + up (oracle, orchestrator, workers)"
	@echo ""
	@echo "$(YELLOW)Orchestrator (Minisforum):$(NC)"
	@echo "  make orchestrator-up   — Start Nexus Router + LiteLLM + Claude-Flow + OpenClaw"
	@echo "  make orchestrator-down — Stop orchestrator stack"
	@echo ""
	@echo "$(YELLOW)Workers (GPU PCs):$(NC)"
	@echo "  make workers-up        — Start vLLM + Ollama on all workers"
	@echo "  make workers-down      — Stop all worker services"
	@echo ""
	@echo "$(YELLOW)Oracle Cloud:$(NC)"
	@echo "  make oracle-up         — Start TwentyCRM + Postgres + Activepieces (Oracle VPS)"
	@echo "  make oracle-down       — Stop oracle stack"
	@echo ""
	@echo "$(YELLOW)Full Stack:$(NC)"
	@echo "  make up                — Start all (oracle + orchestrator + workers)"
	@echo "  make down              — Stop all services"
	@echo ""
	@echo "$(YELLOW)Monitoring:$(NC)"
	@echo "  make logs              — Tail all docker-compose logs"
	@echo "  make status            — Show all running containers"
	@echo "  make health            — Run comprehensive health checks"
	@echo ""
	@echo "$(YELLOW)Secrets & Config:$(NC)"
	@echo "  make vault-init        — Initialize Infisical vault (requires INFISICAL_TOKEN)"
	@echo "  make secrets           — Pull secrets from Infisical into .env"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make clean             — Remove all containers, volumes, and orphans"
	@echo "  make prune             — Aggressive cleanup (docker system prune)"
	@echo ""

init:
	@echo "$(YELLOW)Initializing Project Nyra...$(NC)"
	@mkdir -p infra/{config,scripts,volumes} services/{quote-engine,nexus-router,gitea-webhook-agent} apps/{claude-flow,openclaw,archon-os} src/{agents,schemas,utils,types} docs
	@cp .env.example .env || echo "$(YELLOW).env not found, creating placeholder$(NC)"
	@echo "$(GREEN)✓ Directory structure created$(NC)"
	@echo "$(YELLOW)Next: Review .env and run 'make bootstrap'$(NC)"

oracle-up:
	@echo "$(YELLOW)Starting Oracle Cloud Stack (TwentyCRM, Postgres, Activepieces)...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-oracle docker-compose -f infra/docker-compose.oracle.yml up -d
	@echo "$(GREEN)✓ Oracle stack online$(NC)"
	@sleep 10
	@$(MAKE) health-oracle

orchestrator-up:
	@echo "$(YELLOW)Starting Orchestrator Stack (Nexus, LiteLLM, Claude-Flow, OpenClaw)...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-orch docker-compose -f infra/docker-compose.orchestrator.yml up -d
	@echo "$(GREEN)✓ Orchestrator stack online$(NC)"
	@sleep 15
	@$(MAKE) health-orchestrator

workers-up:
	@echo "$(YELLOW)Starting Worker Stack (vLLM, Ollama on GPU PCs)...$(NC)"
	@echo "$(YELLOW)Note: Run this on EACH worker PC (worker-rtx5090, worker-rtx3090ti, worker-rtx3060)$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-worker docker-compose -f infra/docker-compose.workers.yml up -d
	@echo "$(GREEN)✓ Worker stack online$(NC)"
	@sleep 10
	@$(MAKE) health-workers

up: oracle-up orchestrator-up workers-up
	@echo "$(GREEN)✓ All stacks deployed$(NC)"
	@$(MAKE) health

down: oracle-down orchestrator-down workers-down
	@echo "$(GREEN)✓ All stacks stopped$(NC)"

oracle-down:
	@echo "$(YELLOW)Stopping Oracle stack...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-oracle docker-compose -f infra/docker-compose.oracle.yml down
	@echo "$(GREEN)✓ Oracle stack stopped$(NC)"

orchestrator-down:
	@echo "$(YELLOW)Stopping Orchestrator stack...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-orch docker-compose -f infra/docker-compose.orchestrator.yml down
	@echo "$(GREEN)✓ Orchestrator stack stopped$(NC)"

workers-down:
	@echo "$(YELLOW)Stopping Worker stacks...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-worker docker-compose -f infra/docker-compose.workers.yml down
	@echo "$(GREEN)✓ Worker stacks stopped$(NC)"

logs:
	@echo "$(YELLOW)Tailing all logs (Ctrl+C to exit)...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-oracle docker-compose -f infra/docker-compose.oracle.yml logs -f &
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-orch docker-compose -f infra/docker-compose.orchestrator.yml logs -f &
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-worker docker-compose -f infra/docker-compose.workers.yml logs -f &
	wait

status:
	@echo "$(YELLOW)Oracle Stack:$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-oracle docker-compose -f infra/docker-compose.oracle.yml ps
	@echo ""
	@echo "$(YELLOW)Orchestrator Stack:$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-orch docker-compose -f infra/docker-compose.orchestrator.yml ps
	@echo ""
	@echo "$(YELLOW)Worker Stack:$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-worker docker-compose -f infra/docker-compose.workers.yml ps

health: health-oracle health-orchestrator health-workers

health-oracle:
	@echo "$(YELLOW)Oracle Health Checks:$(NC)"
	@echo "Postgres: $$(docker exec postgres-nyra pg_isready -h localhost || echo 'DOWN')"
	@echo "Redis: $$(docker exec redis-nyra redis-cli ping || echo 'DOWN')"
	@echo "TwentyCRM: $$(curl -s http://localhost:3000/health || echo 'DOWN')"
	@echo "Activepieces: $$(curl -s http://localhost:3002/health || echo 'DOWN')"

health-orchestrator:
	@echo "$(YELLOW)Orchestrator Health Checks:$(NC)"
	@echo "Nexus Router: $$(curl -s http://localhost:6000/health || echo 'DOWN')"
	@echo "LiteLLM: $$(curl -s http://localhost:4000/health || echo 'DOWN')"
	@echo "Claude-Flow: $$(curl -s http://localhost:8080/health || echo 'DOWN')"

health-workers:
	@echo "$(YELLOW)Worker Health Checks:$(NC)"
	@echo "vLLM (RTX 5090): $$(curl -s http://100.x.x.1:8000/health || echo 'CHECK MANUALLY')"
	@echo "vLLM (RTX 3090Ti): $$(curl -s http://100.x.x.2:8000/health || echo 'CHECK MANUALLY')"
	@echo "Ollama (RTX 3060): $$(curl -s http://100.x.x.3:11434/api/tags | jq '.models | length' || echo 'CHECK MANUALLY')"

bootstrap: init secrets oracle-up orchestrator-up workers-up health
	@echo "$(GREEN)╔════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║  Project Nyra Bootstrap Complete! 🚀   ║$(NC)"
	@echo "$(GREEN)╚════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Next Steps:$(NC)"
	@echo "1. Oracle:       https://crm.ratehunter.net (via Cloudflared tunnel)"
	@echo "2. Orchestrator: http://localhost:6000 (Nexus Router)"
	@echo "3. LiteLLM:      http://localhost:4000/docs (API docs)"
	@echo "4. Claude-Flow:  http://localhost:8080 (dev orchestrator)"
	@echo ""
	@echo "Test the mesh:"
	@echo "  curl -X POST http://localhost:4000/v1/chat/completions \\"
	@echo "    -H 'Content-Type: application/json' \\"
	@echo "    -d '{\"model\":\"vllm-mistral-area51\",\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}'"
	@echo ""

vault-init:
	@echo "$(YELLOW)Initializing Infisical Vault...$(NC)"
	@if [ -z "$(INFISICAL_TOKEN)" ]; then \
		echo "$(RED)ERROR: INFISICAL_TOKEN not set. Export it first:$(NC)"; \
		echo "export INFISICAL_TOKEN=your-token-here"; \
		exit 1; \
	fi
	docker run --rm -e INFISICAL_TOKEN=$(INFISICAL_TOKEN) infisical/infisical-agent:latest infisical export --path /machines/orchestrator > .env.infisical
	@echo "$(GREEN)✓ Secrets exported to .env.infisical$(NC)"

secrets: vault-init
	@echo "$(YELLOW)Loading secrets from Infisical...$(NC)"
	@cat .env.infisical >> .env
	@echo "$(GREEN)✓ Secrets loaded$(NC)"

clean:
	@echo "$(RED)⚠️  Removing ALL containers, volumes, and orphans...$(NC)"
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-oracle docker-compose -f infra/docker-compose.oracle.yml down -v
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-orch docker-compose -f infra/docker-compose.orchestrator.yml down -v
	COMPOSE_PROJECT_NAME=$(PROJECT_NAME)-worker docker-compose -f infra/docker-compose.workers.yml down -v
	docker container prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

prune: clean
	@echo "$(RED)⚠️  Running aggressive Docker cleanup...$(NC)"
	docker system prune -af --volumes
	@echo "$(GREEN)✓ System pruned$(NC)"

.DEFAULT_GOAL := help
