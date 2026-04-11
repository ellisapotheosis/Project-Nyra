# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

# Core Paths
COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

# Service Specific Compose Files
ARCHON_COMPOSE  := infra/compose/docker-compose.archon.yml
ARCHON_OVERRIDE := infra/compose/docker-compose.archon.override.yml
TWENTY_COMPOSE  := infra/docker-compose.twenty.yml
GITEA_COMPOSE   := infra/configs/gitea/docker-compose.gitea.yml
SUPABASE_COMPOSE := infra/compose/docker-compose.supabase.yml

# Host Specific Compose Files (corrected to actual filenames on disk)
ORCHESTRATOR_COMPOSE  := infra/hosts/orchestrator/docker-compose.orchestrator.yml
WORKER_3060_COMPOSE   := infra/hosts/worker-rtx3060/docker-compose.worker.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.worker.yml
WORKER_5090_COMPOSE   := infra/hosts/worker-rtx5090/docker-compose.worker.yml
ORACLE_COMPOSE        := infra/hosts/oracle-vps/docker-compose.oracle.yml

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector
ARCHON_PROFILES  ?= archon,with-db

# LLxprt paths (can be overridden via env)
LLXPRT_NPM_PREFIX ?= $(HOME)/.cache/nyra-llxprt-code
LLXPRT_PACKAGE    ?= @vybestack/llxprt-code
JEFE_DIR          ?= external/llxprt-jefe

.PHONY: help install test lint validate up down restart logs ps pull \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle \
  archon-up archon-down archon-logs archon-ps archon-build-user \
  standup-orchestrator \
  cluster cluster-kill grid grid-kill ai-grid ai-grid-kill \
  nexus-up nexus-down health stack-up stack-verify \
  gitea-up gitea-down gitea-ps \
  twenty-crm-up twenty-crm-down \
  supabase-up \
  mempalace-init mempalace-mine \
  llxprt-bootstrap llxprt-code llxprt-jefe llxprt-kill

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - Unified Control Plane"
	@echo
	@echo "--- INFRASTRUCTURE ---"
	@echo "make standup-orchestrator  Start full local stack (Open-WebUI -> Core -> Archon)"
	@echo "make up                    Start default local stack profiles"
	@echo "make down                  Stop and remove local stack"
	@echo "make ps                    Show running containers"
	@echo "make health                Run system-wide health checks"
	@echo
	@echo "--- ARCHON OS ---"
	@echo "make archon-up             Start Archon stack (default: archon,with-db)"
	@echo "                           ARCHON_PROFILES=archon,with-db,cloud,auth for full stack"
	@echo "make archon-build-user     Build Archon using Dockerfile.user override"
	@echo "make archon-down           Stop Archon stack"
	@echo "make archon-logs           Tail Archon logs"
	@echo
	@echo "--- DISTRIBUTED CLUSTER (4-PC) ---"
	@echo "make cluster               Launch tmux session controlling all 4 PCs"
	@echo "make cluster-kill          Kill the NYRA-CLUSTER tmux session"
	@echo "make grid                  Launch 5-pane monitor grid (SSH mesh)"
	@echo "make grid-kill             Kill the NYRA-GRID tmux session"
	@echo "make ai-grid               Launch AI CLI grid (Claude, Codex, Gemini, Workers)"
	@echo "make ai-grid-kill          Kill the NYRA-AI-GRID tmux session"
	@echo "make up-workers            Bring up all remote worker nodes via Docker contexts"
	@echo "make up-oracle             Start Oracle VPS services"
	@echo
	@echo "--- LLXPRT AI TOOLS ---"
	@echo "make llxprt-bootstrap      Clone jefe + cache llxprt-code + build Rust binary"
	@echo "make llxprt-code           Launch llxprt-code CLI (uses Nexus Router)"
	@echo "make llxprt-jefe           Launch llxprt-jefe (Rust PM agent)"
	@echo "make llxprt-kill           Kill both llxprt panes in NYRA-CLUSTER"
	@echo
	@echo "--- MEMPALACE MEMORY ---"
	@echo "make mempalace-init        Initialize MemPalace DB on Oracle"
	@echo "make mempalace-mine        Mine documents into MemPalace on Oracle"
	@echo
	@echo "--- COMPONENT STACKS ---"
	@echo "make gitea-up              Start Gitea + Actions runner"
	@echo "make gitea-down            Stop Gitea"
	@echo "make gitea-ps              Show Gitea container status"
	@echo "make twenty-crm-up         Start Twenty CRM"
	@echo "make twenty-crm-down       Stop Twenty CRM"
	@echo "make supabase-up           Start local Supabase DB"

# --- CORE TARGETS ---

standup-orchestrator:
	bash infra/scripts/standup-orchestrator.sh

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
	@profiles=$$(echo "$(ARCHON_PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	if [ -f external/archon/Dockerfile.user ]; then \
		docker compose -f $(ARCHON_COMPOSE) -f $(ARCHON_OVERRIDE) $$args up -d; \
	else \
		docker compose -f $(ARCHON_COMPOSE) $$args up -d; \
	fi

archon-build-user:
	@if [ ! -f external/archon/Dockerfile.user ]; then \
		echo "Creating external/archon/Dockerfile.user from example..."; \
		cp external/archon/Dockerfile.user.example external/archon/Dockerfile.user; \
	fi
	docker compose -f $(ARCHON_COMPOSE) -f $(ARCHON_OVERRIDE) build archon

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
	tmux kill-session -t NYRA-CLUSTER 2>/dev/null || true

grid:
	bash scripts/nyra-grid.sh

grid-kill:
	tmux kill-session -t NYRA-GRID 2>/dev/null || true

ai-grid:
	bash infra/scripts/ai-grid.sh

ai-grid-kill:
	tmux kill-session -t NYRA-AI-GRID 2>/dev/null || true

up-workers:
	docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) up -d
	docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) up -d
	docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) up -d

up-oracle:
	docker --context oracle compose -f $(ORACLE_COMPOSE) up -d

# --- LLXPRT TARGETS ---

llxprt-bootstrap:
	bash scripts/bootstrap-llxprt-stack.sh

llxprt-code:
	bash scripts/run-llxprt-code.sh

llxprt-jefe:
	bash scripts/run-llxprt-jefe.sh

llxprt-kill:
	@# Kill llxprt panes inside NYRA-CLUSTER (panes 0 and 1 = jefe and code)
	tmux send-keys -t NYRA-CLUSTER:0.0 C-c 2>/dev/null || true
	tmux send-keys -t NYRA-CLUSTER:0.1 C-c 2>/dev/null || true

# --- COMPONENT TARGETS ---

gitea-up:
	docker compose -f $(GITEA_COMPOSE) --env-file .env.gitea up -d

gitea-down:
	docker compose -f $(GITEA_COMPOSE) down

gitea-ps:
	docker compose -f $(GITEA_COMPOSE) ps

twenty-crm-up:
	docker compose -f $(TWENTY_COMPOSE) up -d

twenty-crm-down:
	docker compose -f $(TWENTY_COMPOSE) down

supabase-up:
	docker compose -f $(SUPABASE_COMPOSE) up -d

mempalace-init:
	docker --context oracle exec -it nyra-mempalace mempalace init

mempalace-mine:
	docker --context oracle exec -it nyra-mempalace mempalace mine

health:
	bash scripts/verify-stack.sh
