# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

# Core Paths
COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

# Service Specific Compose Files
ARCHON_COMPOSE := infra/compose/docker-compose.archon.yml
TWENTY_COMPOSE := infra/compose/docker-compose.twenty.yml
GITEA_COMPOSE := infra/compose/docker-compose.gitea.yml
SUPABASE_COMPOSE := infra/compose/docker-compose.supabase.yml

# Host Specific Compose Files
ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.orchestrator.yml
WORKER_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.yml
WORKER_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.yml
ORACLE_COMPOSE := infra/hosts/oracle-vps/docker-compose.yml

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector

.PHONY: help install test lint validate up down restart logs ps pull \
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
	docker compose -f $(ARCHON_COMPOSE) --profile archon up -d

archon-down:
	docker compose -f $(ARCHON_COMPOSE) down --remove-orphans

archon-logs:
	docker compose -f $(ARCHON_COMPOSE) logs -f --tail=100

archon-ps:
	docker compose -f $(ARCHON_COMPOSE) ps

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
	./scripts/verify-stack.sh
