# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

# Core Paths
COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

# Service Specific Compose Files
ARCHON_BASE_COMPOSE ?= infra/compose/base.yml
ARCHON_COMPOSE  := infra/compose/docker-compose.archon.yml
ARCHON_OVERRIDE := infra/compose/docker-compose.archon.override.yml
ARCHON_ENV_FILE ?= external/archon/nyra-configs/env/archon.env
TWENTY_COMPOSE  := infra/docker-compose.twenty.yml
GITEA_COMPOSE   := infra/configs/gitea/docker-compose.gitea.yml
SUPABASE_COMPOSE := infra/compose/docker-compose.supabase.yml

# Host Specific Compose Files
ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.orchestrator.yml
WORKER_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.worker-3060.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.worker-3090.yml
WORKER_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.worker-5090.yml
ORACLE_COMPOSE := infra/hosts/oracle-vps/docker-compose.oracle.yml

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector

.PHONY: help install test lint validate up down restart logs ps pull verify-paths \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle \
  archon-up archon-down archon-logs archon-ps \
  cluster cluster-kill grid grid-kill \
  nexus-up nexus-down health stack-up stack-verify \
  gitea-up gitea-down gitea-ps twenty-crm-up twenty-crm-down

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - Unified Control Plane"
	@echo
	@echo "--- INFRASTRUCTURE ---"
	@echo "make up                 Start default local stack profiles"
	@echo "make down               Stop and remove local stack"
	@echo "make ps                 Show running containers"
	@echo "make health             Run system-wide health checks"
	@echo
	@echo "--- ARCHON OS ---"
	@echo "make archon-up          Start the multi-container Archon stack"
	@echo "make archon-down        Stop Archon stack"
	@echo "make archon-logs        Tail Archon logs"
	@echo
	@echo "--- DISTRIBUTED CLUSTER (4-PC) ---"
	@echo "make cluster            Launch tmux session controlling all 4 PCs"
	@echo "make grid               Launch 4-node monitor grid (SSH mesh)"
	@echo "make up-workers         Bring up all remote worker nodes via contexts"
	@echo "make up-oracle          Start Oracle VPS services"
	@echo
	@echo "--- COMPONENT STACKS ---"
	@echo "make gitea-up           Start Gitea + Actions"
	@echo "make twenty-crm-up      Start Twenty CRM"
	@echo "make supabase-up        Start local Supabase DB"
	@echo "make verify-paths       Verify Makefile path references exist"

verify-paths:
	@test -f $(COMPOSE_FILE) || (echo "Missing $(COMPOSE_FILE)" && exit 1)
	@test -f $(ARCHON_COMPOSE) || (echo "Missing $(ARCHON_COMPOSE)" && exit 1)
	@test -f $(TWENTY_COMPOSE) || (echo "Missing $(TWENTY_COMPOSE)" && exit 1)
	@test -f $(GITEA_COMPOSE) || (echo "Missing $(GITEA_COMPOSE)" && exit 1)
	@test -f $(SUPABASE_COMPOSE) || (echo "Missing $(SUPABASE_COMPOSE)" && exit 1)
	@test -f $(ORCHESTRATOR_COMPOSE) || (echo "Missing $(ORCHESTRATOR_COMPOSE)" && exit 1)
	@test -f $(WORKER_3060_COMPOSE) || (echo "Missing $(WORKER_3060_COMPOSE)" && exit 1)
	@test -f $(WORKER_3090TI_COMPOSE) || (echo "Missing $(WORKER_3090TI_COMPOSE)" && exit 1)
	@test -f $(WORKER_5090_COMPOSE) || (echo "Missing $(WORKER_5090_COMPOSE)" && exit 1)
	@test -f $(ORACLE_COMPOSE) || (echo "Missing $(ORACLE_COMPOSE)" && exit 1)
	@echo "All Makefile compose paths are valid."

# --- CORE TARGETS ---

up:
	@profiles=$$(echo "$(DEFAULT_PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	$(COMPOSE) $$args up -d

down:
	$(COMPOSE) down --remove-orphans

ps:
	$(COMPOSE) ps
	@echo "--- Archon Stack ---"
	@docker compose -f $(ARCHON_COMPOSE) ps

# --- ARCHON TARGETS ---

archon-up:
	@if [ ! -f /usr/local/bin/llxprt ]; then \
		echo -e "\033[33mWARNING: llxprt binary not found on host! Archon codex routing will fail.\033[0m"; \
	fi
	@if [ ! -d "$${HOME}/.config/llxprt" ]; then \
		echo -e "\033[33mWARNING: $${HOME}/.config/llxprt not found on host! Archon llxprt config mount will be empty.\033[0m"; \
	fi
	@if [ ! -d "$${HOME}/.codex" ]; then \
		echo -e "\033[33mWARNING: $${HOME}/.codex not found on host! Official Codex auth/config fallback will be unavailable in the Archon container.\033[0m"; \
	fi
	@profiles=$$(echo "$(ARCHON_PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	if [ -f external/archon/Dockerfile.user ]; then \
		docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) -f $(ARCHON_OVERRIDE) $$args up -d; \
	else \
		docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) $$args up -d; \
	fi

archon-build-user:
	@if [ ! -f external/archon/Dockerfile.user ]; then \
		echo "Creating external/archon/Dockerfile.user from example..."; \
		cp external/archon/Dockerfile.user.example external/archon/Dockerfile.user; \
	fi
	docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) -f $(ARCHON_OVERRIDE) build archon


archon-down:
	docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) down --remove-orphans

archon-logs:
	docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) logs -f --tail=100

archon-ps:
	docker compose --env-file $(ARCHON_ENV_FILE) -f $(ARCHON_BASE_COMPOSE) -f $(ARCHON_COMPOSE) ps

# --- DISTRIBUTED TARGETS ---

cluster:
	bash scripts/nyra-cluster.sh

cluster-kill:
	tmux kill-session -t nyra-cluster 2>/dev/null || true

grid:
	bash scripts/nyra-grid.sh

grid-kill:
	tmux kill-session -t nyra-grid 2>/dev/null || true

up-workers:
	docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) up -d
	docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) up -d
	docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) up -d

up-oracle:
	docker --context oracle compose -f $(ORACLE_COMPOSE) up -d

# --- COMPONENT TARGETS ---

gitea-up:
	docker compose -f $(GITEA_COMPOSE) --env-file .env.gitea up -d

gitea-down:
	docker compose -f $(GITEA_COMPOSE) down

twenty-crm-up:
	docker compose -f $(TWENTY_COMPOSE) up -d

supabase-up:
	docker compose -f $(SUPABASE_COMPOSE) up -d

mempalace-init:
	docker compose exec mempalace-mcp mempalace init

mempalace-mine:
	docker compose exec mempalace-mcp mempalace mine

health:
	bash scripts/verify-stack.sh

.PHONY: secrets-init secrets-build secrets-up check-host

check-host:
	@if [ -z "$(HOST)" ]; then echo "🚨 Error: HOST is required."; exit 1; fi

secrets-init: check-host
	@if [ -z "$(TOKEN)" ]; then echo "🚨 Error: TOKEN is required."; exit 1; fi
	@mkdir -p infra/hosts/$(HOST)
	@echo "INFISICAL_TOKEN=$(TOKEN)" > infra/hosts/$(HOST)/.env.host
	@echo "INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef" >> infra/hosts/$(HOST)/.env.host
	@echo "INFISICAL_ENV=prod" >> infra/hosts/$(HOST)/.env.host
	@echo "INFISICAL_PATH=/workers/$(HOST)" >> infra/hosts/$(HOST)/.env.host
	@if [ "$(HOST)" = "homeassistant" ]; then echo "INFISICAL_PATH=/homeassistant" >> infra/hosts/$(HOST)/.env.host; fi
	@echo "INFISICAL_API_URL=https://app.infisical.com" >> infra/hosts/$(HOST)/.env.host
	@echo "NYRA_FORCE_SECRETS=false" >> infra/hosts/$(HOST)/.env.host
	@echo "🐾 ✅ Successfully generated infra/hosts/$(HOST)/.env.host"

secrets-build: check-host
	@echo "🐾 🛠️  Building secrets sidecar for $(HOST)..."
	docker compose -f infra/hosts/$(HOST)/docker-compose.yml --profile secrets build

secrets-up: check-host
	@echo "🐾 🚀 Starting secrets sidecar for $(HOST)..."
	docker compose -f infra/hosts/$(HOST)/docker-compose.yml --env-file infra/hosts/$(HOST)/.env.host --profile secrets up -d

