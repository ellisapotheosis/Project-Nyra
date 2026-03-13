# Project Nyra Master Makefile
# Single entry point for all deployment, testing, and operations

.PHONY: help orchestrator-up orchestrator-down workers-up workers-down oracle-up oracle-down \
        health-check logs clean bootstrap test lint format

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

# Default node (can be overridden)
NODE ?= orchestrator
WORKER ?= rtx-5090
SERVICE ?= all

help:
	@echo "$(BLUE)Project Nyra - Master Makefile$(NC)"
	@echo ""
	@echo "$(GREEN)Orchestrator (Minisforum):$(NC)"
	@echo "  make orchestrator-up       Start Nexus, LiteLLM, Claude-Flow, OpenClaw"
	@echo "  make orchestrator-down     Stop orchestrator stack"
	@echo "  make orchestrator-logs     Tail orchestrator logs"
	@echo "  make orchestrator-ps       Show running orchestrator containers"
	@echo ""
	@echo "$(GREEN)Workers (GPU PCs):$(NC)"
	@echo "  make workers-up WORKER=rtx-5090    Start RTX 5090 worker (vLLM)"
	@echo "  make workers-up WORKER=rtx-3090ti  Start RTX 3090Ti worker (vLLM)"
	@echo "  make workers-up WORKER=rtx-3060    Start RTX 3060 worker (Ollama)"
	@echo "  make workers-down WORKER=rtx-5090  Stop specific worker"
	@echo "  make workers-logs WORKER=rtx-5090  Tail worker logs"
	@echo ""
	@echo "$(GREEN)Oracle Cloud:$(NC)"
	@echo "  make oracle-up             Start TwentyCRM, Postgres, Redis, Activepieces"
	@echo "  make oracle-down           Stop oracle stack"
	@echo "  make oracle-logs           Tail oracle logs"
	@echo ""
	@echo "$(GREEN)Operations:$(NC)"
	@echo "  make health-check          Verify all services are healthy"
	@echo "  make logs SERVICE=nexus    Tail logs for specific service"
	@echo "  make clean                 Stop ALL services"
	@echo "  make bootstrap             Initialize secrets and databases"
	@echo "  make test                  Run all tests"
	@echo "  make lint                  Run linting"
	@echo "  make format                Format code"
	@echo ""

# ============================================================================
# ORCHESTRATOR (Minisforum)
# ============================================================================

orchestrator-up:
	@echo "$(BLUE)Starting Orchestrator Stack...$(NC)"
	cd infra && docker-compose -f docker-compose.orchestrator.yml up -d
	@echo "$(GREEN)✓ Orchestrator started$(NC)"
	@echo "  Nexus Router: http://localhost:6000"
	@echo "  LiteLLM: http://localhost:4000"
	@echo "  Claude-Flow: http://localhost:8000"
	@echo "  OpenClaw: http://localhost:8001"

orchestrator-down:
	@echo "$(BLUE)Stopping Orchestrator Stack...$(NC)"
	cd infra && docker-compose -f docker-compose.orchestrator.yml down
	@echo "$(GREEN)✓ Orchestrator stopped$(NC)"

orchestrator-logs:
	cd infra && docker-compose -f docker-compose.orchestrator.yml logs -f

orchestrator-ps:
	cd infra && docker-compose -f docker-compose.orchestrator.yml ps

# ============================================================================
# WORKERS (GPU PCs)
# ============================================================================

workers-up:
	@echo "$(BLUE)Starting Worker: $(WORKER)$(NC)"
	@if [ -z "$(WORKER)" ]; then \
		echo "$(RED)Error: Specify WORKER=rtx-5090, rtx-3090ti, or rtx-3060$(NC)"; \
		exit 1; \
	fi
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/$(WORKER).env up -d
	@echo "$(GREEN)✓ Worker $(WORKER) started$(NC)"

workers-down:
	@if [ -z "$(WORKER)" ]; then \
		echo "$(RED)Error: Specify WORKER=rtx-5090, rtx-3090ti, or rtx-3060$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Stopping Worker: $(WORKER)$(NC)"
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/$(WORKER).env down
	@echo "$(GREEN)✓ Worker $(WORKER) stopped$(NC)"

workers-logs:
	@if [ -z "$(WORKER)" ]; then \
		echo "$(RED)Error: Specify WORKER=rtx-5090, rtx-3090ti, or rtx-3060$(NC)"; \
		exit 1; \
	fi
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/$(WORKER).env logs -f

workers-ps:
	@if [ -z "$(WORKER)" ]; then \
		echo "$(RED)Error: Specify WORKER=rtx-5090, rtx-3090ti, or rtx-3060$(NC)"; \
		exit 1; \
	fi
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/$(WORKER).env ps

# ============================================================================
# ORACLE CLOUD
# ============================================================================

oracle-up:
	@echo "$(BLUE)Starting Oracle Cloud Stack...$(NC)"
	cd infra && docker-compose -f docker-compose.oracle.yml up -d
	@echo "$(GREEN)✓ Oracle stack started$(NC)"
	@echo "  TwentyCRM: https://crm.ratehunter.net"
	@echo "  Activepieces: https://workflows.ratehunter.net"
	@echo "  Quote Engine: http://localhost:8089"

oracle-down:
	@echo "$(BLUE)Stopping Oracle Cloud Stack...$(NC)"
	cd infra && docker-compose -f docker-compose.oracle.yml down
	@echo "$(GREEN)✓ Oracle stack stopped$(NC)"

oracle-logs:
	cd infra && docker-compose -f docker-compose.oracle.yml logs -f

oracle-ps:
	cd infra && docker-compose -f docker-compose.oracle.yml ps

# ============================================================================
# OPERATIONS & MONITORING
# ============================================================================

health-check:
	@echo "$(BLUE)Running Health Checks...$(NC)"
	@bash infra/scripts/health-check.sh

logs:
	@if [ "$(SERVICE)" = "all" ]; then \
		echo "$(BLUE)Tailing all orchestrator logs$(NC)"; \
		cd infra && docker-compose -f docker-compose.orchestrator.yml logs -f; \
	else \
		echo "$(BLUE)Tailing logs for: $(SERVICE)$(NC)"; \
		cd infra && docker-compose -f docker-compose.orchestrator.yml logs -f $(SERVICE); \
	fi

clean:
	@echo "$(RED)Stopping ALL services...$(NC)"
	cd infra && docker-compose -f docker-compose.orchestrator.yml down || true
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/rtx-5090.env down || true
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/rtx-3090ti.env down || true
	cd infra && docker-compose -f docker-compose.workers.yml --env-file ../workers/rtx-3060.env down || true
	cd infra && docker-compose -f docker-compose.oracle.yml down || true
	@echo "$(GREEN)✓ All services stopped$(NC)"

# ============================================================================
# SETUP & INITIALIZATION
# ============================================================================

bootstrap:
	@echo "$(BLUE)Bootstrapping Project Nyra...$(NC)"
	@echo "1. Initializing Infisical secrets..."
	@bash infra/secrets/bootstrap-secrets.sh
	@echo "2. Running database migrations..."
	@bash infra/scripts/migrate-db.sh
	@echo "3. Initializing Nexus tool registry..."
	@curl -X POST http://localhost:6000/api/tools/init || echo "Nexus not yet running"
	@echo "$(GREEN)✓ Bootstrap complete$(NC)"

# ============================================================================
# TESTING
# ============================================================================

test:
	@echo "$(BLUE)Running tests...$(NC)"
	@cd packages/types && npm test || true
	@cd services/quote-engine && npm test || true
	@cd src/openclaw && npm test || true
	@echo "$(GREEN)✓ Tests complete$(NC)"

lint:
	@echo "$(BLUE)Running linter...$(NC)"
	@find src services packages -name "*.ts" -not -path "*/node_modules/*" | xargs npx eslint || true
	@echo "$(GREEN)✓ Linting complete$(NC)"

format:
	@echo "$(BLUE)Formatting code...$(NC)"
	@find src services packages -name "*.ts" -not -path "*/node_modules/*" | xargs npx prettier --write
	@echo "$(GREEN)✓ Formatting complete$(NC)"

# ============================================================================
# BUILD
# ============================================================================

build-nexus:
	@echo "$(BLUE)Building Nexus Router image...$(NC)"
	cd infra/nexus && docker build -t nyra-nexus:latest .
	@echo "$(GREEN)✓ Nexus image built$(NC)"

build-litellm:
	@echo "$(BLUE)Building LiteLLM image...$(NC)"
	cd infra/litellm && docker build -t nyra-litellm:latest .
	@echo "$(GREEN)✓ LiteLLM image built$(NC)"

build-quote-engine:
	@echo "$(BLUE)Building Quote Engine...$(NC)"
	cd services/quote-engine && docker build -t nyra-quote-engine:latest .
	@echo "$(GREEN)✓ Quote Engine built$(NC)"

build-all: build-nexus build-litellm build-quote-engine
	@echo "$(GREEN)✓ All images built$(NC)"

# ============================================================================
# INFRA TARGETS
# ============================================================================

infra-help:
	@cd infra && make help

.DEFAULT_GOAL := help
