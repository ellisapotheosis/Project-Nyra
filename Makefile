# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

# Core Paths — canonical compose is per-host under infra/hosts/
COMPOSE_FILE ?= infra/hosts/orchestrator/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)

# Cloudflared Tunnel Compose Files
CF_ORCH_COMPOSE  := infra/hosts/orchestrator/docker-compose.cloudflared.yml
ORACLE_APPS_COMPOSE := infra/hosts/oracle-vps/docker-compose.apps.yml

# Service Specific Compose Files
ARCHON_ENV_FILE ?= external/archon/nyra-configs/env/archon.env

# Host Specific Compose Files
ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.yml
WORKER_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.yml
WORKER_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.yml
ORACLE_COMPOSE := infra/hosts/oracle-vps/docker-compose.yml

# Voice Setup Compose Files
VOICE_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.voice.yml
VOICE_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.voice.yml
VOICE_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.voice.yml
VOICE_ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.voice.yml
HERMES_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.hermes.yml

# Distributed Voice Compose Files
DIST_VOICE_3060 := infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml
DIST_VOICE_5090 := infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml
DIST_VOICE_3090TI := infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector

.PHONY: help install test lint validate up down restart logs ps pull verify-paths dev-orchestrate dev-down dev-panels dev-status dev-llxprt-jefe dev-llxprt-code up-worker-3090ti up-worker-5090 up-worker-3060 up-all-workers down-all-workers paperclip-up paperclip-down paperclip-logs paperclip-status \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle \
  archon-up archon-down archon-logs archon-ps \
  cluster cluster-kill grid grid-kill \
  nexus-up nexus-down health stack-up stack-verify \
  gitea-up gitea-down gitea-ps twenty-crm-up twenty-crm-down \
  voice-3060 voice-5090 voice-3090ti voice-orch voice-distributed hermes-5090 \
  cf-orch-up cf-orch-down cf-orch-logs \
  oracle-apps-up oracle-apps-down oracle-quote-engine-up oracle-campaign-engine-up \
  up-all down-all cluster-status

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - Unified Control Plane"
	@echo
	@echo "--- INFRASTRUCTURE ---"
	@echo "make up-all             Start all services across all PC nodes"
	@echo "make down-all           Stop all services across all nodes"
	@echo "make cluster-status     Show running containers across the entire cluster"
	@echo "make up                 Start default local stack profiles"
	@echo "make down               Stop and remove local stack"
	@echo "make ps                 Show running containers"
	@echo "make health             Run system-wide health checks"
	@echo
	@echo "--- ARCHON OS ---"
	@echo "make archon-up          Start the multi-container Archon stack (on Oracle)"
	@echo "make archon-down        Stop Archon stack"
	@echo "make archon-logs        Tail Archon logs"
	@echo
	@echo "--- DISTRIBUTED CLUSTER (4-PC) ---"
	@echo "make cluster            Launch tmux session controlling all 4 PCs"
	@echo "make grid               Launch 4-node monitor grid (SSH mesh)"
	@echo "make up-workers         Bring up all remote worker nodes via contexts"
	@echo "make up-oracle          Start the full Oracle VPS stack including apps"
	@echo
	@echo "--- COMPONENT STACKS ---"
	@echo "make gitea-up           Start Gitea + Actions"
	@echo "make twenty-crm-up      Start Twenty CRM"
	@echo "make verify-paths       Verify Makefile path references exist"
	@echo
	@echo "--- VOICE SETUPS ---"
	@echo "make voice-3060         Start standalone Unmute on RTX 3060"
	@echo "make voice-5090         Start standalone Unmute on RTX 5090"
	@echo "make voice-3090ti       Start standalone Unmute on RTX 3090 Ti"
	@echo "make voice-orch         Start Kyutai Pocket TTS on Orchestrator"
	@echo "make voice-distributed  Start distributed 3-node voice setup"
	@echo "make hermes-5090        Start Hermes UI override on RTX 5090"
	@echo
	@echo "--- CLOUDFLARED TUNNELS ---"
	@echo "make cf-orch-up         Start orchestrator CF tunnel (separate from main stack)"
	@echo "make cf-orch-down       Stop orchestrator CF tunnel"
	@echo "make cf-orch-logs       Tail orchestrator tunnel logs"
	@echo
	@echo "--- ORACLE APP STACK ---"
	@echo "make oracle-apps-up     Start all oracle app-profile services"
	@echo "make oracle-apps-down   Stop all oracle app-profile services"
	@echo "make oracle-quote-engine-up Start quote_engine only"
	@echo "make oracle-campaign-engine-up Start campaign_engine only"

cluster-status:
	@echo "=== [ORCHESTRATOR] ==="
	@docker compose -f $(ORCHESTRATOR_COMPOSE) ps
	@echo -e "\n=== [ORACLE-VPS] ==="
	@docker --context oracle compose -f $(ORACLE_COMPOSE) ps
	@echo -e "\n=== [WORKER-5090] ==="
	@docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) ps
	@echo -e "\n=== [WORKER-3090TI] ==="
	@docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) ps
	@echo -e "\n=== [WORKER-3060] ==="
	@docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) ps

up-all: up up-workers up-oracle

down-all: down
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps down
	docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) down
	docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) down
	docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) down

verify-paths:
	@test -f $(COMPOSE_FILE) || (echo "Missing $(COMPOSE_FILE)" && exit 1)
	@test -f $(ORCHESTRATOR_COMPOSE) || (echo "Missing $(ORCHESTRATOR_COMPOSE)" && exit 1)
	@test -f $(WORKER_3060_COMPOSE) || (echo "Missing $(WORKER_3060_COMPOSE)" && exit 1)
	@test -f $(WORKER_3090TI_COMPOSE) || (echo "Missing $(WORKER_3090TI_COMPOSE)" && exit 1)
	@test -f $(WORKER_5090_COMPOSE) || (echo "Missing $(WORKER_5090_COMPOSE)" && exit 1)
	@test -f $(ORACLE_COMPOSE) || (echo "Missing $(ORACLE_COMPOSE)" && exit 1)
	@test -f $(ORACLE_APPS_COMPOSE) || (echo "Missing $(ORACLE_APPS_COMPOSE)" && exit 1)
	@test -f $(VOICE_3060_COMPOSE) || (echo "Missing $(VOICE_3060_COMPOSE)" && exit 1)
	@test -f $(VOICE_5090_COMPOSE) || (echo "Missing $(VOICE_5090_COMPOSE)" && exit 1)
	@test -f $(VOICE_3090TI_COMPOSE) || (echo "Missing $(VOICE_3090TI_COMPOSE)" && exit 1)
	@test -f $(VOICE_ORCHESTRATOR_COMPOSE) || (echo "Missing $(VOICE_ORCHESTRATOR_COMPOSE)" && exit 1)
	@test -f $(HERMES_5090_COMPOSE) || (echo "Missing $(HERMES_5090_COMPOSE)" && exit 1)
	@test -f $(DIST_VOICE_3060) || (echo "Missing $(DIST_VOICE_3060)" && exit 1)
	@test -f $(DIST_VOICE_5090) || (echo "Missing $(DIST_VOICE_5090)" && exit 1)
	@test -f $(DIST_VOICE_3090TI) || (echo "Missing $(DIST_VOICE_3090TI)" && exit 1)
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
	@docker --context oracle compose -f $(ORACLE_COMPOSE) ps archon

# --- ARCHON TARGETS ---

archon-up:
	docker --context oracle compose --env-file $(ARCHON_ENV_FILE) -f $(ORACLE_COMPOSE) up -d archon

archon-build-user:
	docker --context oracle compose --env-file $(ARCHON_ENV_FILE) -f $(ORACLE_COMPOSE) build archon


archon-down:
	docker --context oracle compose --env-file $(ARCHON_ENV_FILE) -f $(ORACLE_COMPOSE) stop archon

archon-logs:
	docker --context oracle compose --env-file $(ARCHON_ENV_FILE) -f $(ORACLE_COMPOSE) logs -f --tail=100 archon

archon-ps:
	docker --context oracle compose --env-file $(ARCHON_ENV_FILE) -f $(ORACLE_COMPOSE) ps archon

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
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps up -d

# --- COMPONENT TARGETS ---

gitea-up:
	docker --context oracle compose -f $(ORACLE_COMPOSE) up -d gitea gitea-runner github-mirror-sync gitea-mcp

gitea-down:
	docker --context oracle compose -f $(ORACLE_COMPOSE) stop gitea gitea-runner github-mirror-sync gitea-mcp

gitea-ps:
	docker --context oracle compose -f $(ORACLE_COMPOSE) ps gitea gitea-runner github-mirror-sync gitea-mcp

twenty-crm-up:
	docker --context oracle compose -f $(ORACLE_COMPOSE) up -d twenty

mempalace-init:
	docker --context oracle compose -f $(ORACLE_COMPOSE) exec mempalace-mcp mempalace init

mempalace-mine:
	docker --context oracle compose -f $(ORACLE_COMPOSE) exec mempalace-mcp mempalace mine

health:
	bash scripts/verify-stack.sh

.PHONY: secrets-init secrets-build secrets-up check-host

check-host:
	@if [ -z "$(HOST)" ]; then echo "🚨 Error: HOST is required."; exit 1; fi

# --- VOICE TARGETS ---

voice-3060:
	docker --context worker-rtx3060 compose -f $(VOICE_3060_COMPOSE) up -d

voice-5090:
	docker --context worker-rtx5090 compose -f $(VOICE_5090_COMPOSE) up -d

voice-3090ti:
	docker --context worker-rtx3090ti compose -f $(VOICE_3090TI_COMPOSE) up -d

voice-orch:
	docker compose -f $(VOICE_ORCHESTRATOR_COMPOSE) up -d

voice-distributed:
	docker --context worker-rtx3060 compose -f $(DIST_VOICE_3060) up -d
	docker --context worker-rtx5090 compose -f $(DIST_VOICE_5090) up -d
	docker --context worker-rtx3090ti compose -f $(DIST_VOICE_3090TI) up -d

hermes-5090:
	docker --context worker-rtx5090 compose -f $(HERMES_5090_COMPOSE) up -d

# --- CLOUDFLARED TUNNEL TARGETS ---

cf-orch-up:
	docker compose -f $(CF_ORCH_COMPOSE) up -d

cf-orch-down:
	docker compose -f $(CF_ORCH_COMPOSE) down

cf-orch-logs:
	docker compose -f $(CF_ORCH_COMPOSE) logs -f --tail=100

# --- ORACLE APP STACK TARGETS ---
# Apps run on Oracle VPS. They use profile \"apps\" so they don't start
# with make up-oracle. Only app-only services from the mortgage stack live
# in the overlay; infra services already defined in the canonical Oracle
# compose stay there.

oracle-apps-up:
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps up -d

oracle-apps-down:
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps down

oracle-quote-engine-up:
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps up -d quote_engine

oracle-campaign-engine-up:
	docker --context oracle compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) --profile apps up -d campaign_engine

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

# ════════════════════════════════════════════════════════════════════════════
# DEVELOPMENT ORCHESTRATION: ghostty + zellij + distributed inference
# ════════════════════════════════════════════════════════════════════════════

.PHONY: dev-orchestrate dev-down

dev-orchestrate:
	@echo "🚀 Launching Development Orchestration (ghostty + zellij)..."
	@echo "   Panels: llxprt-jefe | llxprt-code | RTX3090Ti | RTX5090 | RTX3060 | PAPERCLIP"
	@ghostty \
		--command "zellij --layout compact" \
		--title "Project Nyra - Distributed AI Development" &
	@sleep 2
	@zellij action new-pane -f -d right
	@zellij action new-pane -f -d down
	@zellij action new-pane -f -d right
	@zellij action new-pane -f -d down
	@zellij action new-pane -f -d right

dev-panels:
	@echo "Configuring zellij panels..."
	@zellij action write-chars "# [1] llxprt-jefe (CLI Subscription)" && Enter
	@zellij action write-chars "cd /home/ellisapotheosis/repos/project-nyra/external/llxprt-jefe && jefe" && Enter
	@sleep 1
	@zellij action move-focus right
	@zellij action write-chars "# [2] llxprt-code (gemini-cli | codex-cli | claude-code)" && Enter
	@zellij action write-chars "cd /home/ellisapotheosis/repos/project-nyra/external/llxprt-code && code" && Enter
	@sleep 1
	@zellij action move-focus down
	@zellij action write-chars "# [3] RTX3090Ti (openclaw + gemma4)" && Enter
	@zellij action write-chars "ssh worker-rtx3090ti-win 'docker --context orchestrator ps | grep -E vllm|openclaw'" && Enter
	@sleep 1
	@zellij action move-focus right
	@zellij action write-chars "# [4] RTX5090 (claude-code + qwen3.6)" && Enter
	@zellij action write-chars "ssh worker-rtx5090-win 'docker --context worker-rtx5090 ps | grep vllm'" && Enter
	@sleep 1
	@zellij action move-focus down
	@zellij action write-chars "# [5] RTX3060 (embeddings + lightweight LLM + voice)" && Enter
	@zellij action write-chars "ssh worker-rtx3060-win 'docker ps | grep -E embed|voice|inference'" && Enter
	@sleep 1
	@zellij action move-focus right
	@zellij action write-chars "# [6] PAPERCLIP (Oracle VPS)" && Enter
	@zellij action write-chars "ssh oracle-vps 'docker ps | grep paperclip'" && Enter

dev-status:
	@echo "=== Development Orchestration Status ==="
	@echo ""
	@echo "📝 Local Development Environments:"
	@echo "  [1] llxprt-jefe:"
	@test -d ./external/llxprt-jefe && echo "     ✓ $(ls -1 ./external/llxprt-jefe | wc -l) files" || echo "     ✗ Not found"
	@echo "  [2] llxprt-code:"
	@test -d ./external/llxprt-code && echo "     ✓ $(ls -1 ./external/llxprt-code | wc -l) files" || echo "     ✗ Not found"
	@echo ""
	@echo "🔌 Remote Workers (via SSH contexts):"
	@echo "  [3] RTX3090Ti (openclaw + gemma4):"
	@docker --context worker-rtx3090ti ps 2>/dev/null | grep -E "vllm|openclaw" || echo "     ℹ Not running (use 'make up-workers')"
	@echo "  [4] RTX5090 (claude-code + qwen3.6):"
	@docker --context worker-rtx5090 ps 2>/dev/null | grep vllm || echo "     ℹ Not running (use 'make up-workers')"
	@echo "  [5] RTX3060 (embeddings + lightweight LLM + voice):"
	@docker --context worker-rtx3060 ps 2>/dev/null | grep -E "embed|voice|inference" || echo "     ℹ Not running (use 'make up-workers')"
	@echo ""
	@echo "🗄️ PAPERCLIP (Oracle VPS):"
	@docker compose -f $(ORACLE_COMPOSE) ps 2>/dev/null | grep paperclip || echo "     ℹ Not running (use 'make oracle-apps-up')"

dev-down:
	@echo "Shutting down Development Orchestration..."
	@pkill -f "ghostty.*zellij" || echo "No ghostty session found"
	@zellij kill-session || echo "No zellij session found"

dev-llxprt-jefe:
	@echo "Starting llxprt-jefe (CLI subscription mode)..."
	@cd ./external/llxprt-jefe && jefe


# DEV ORCHESTRATION: ghostty + zellij + distributed inference
.PHONY: dev-orchestrate dev-status dev-down

dev-orchestrate:
	@echo "Launching Development Orchestration..."
	@ghostty --command "zellij" --title "Nyra - Distributed AI Dev" &

dev-status:
	@echo "=== Development Orchestration Status ==="
	@echo "[1] llxprt-jefe: $(test -d ./external/llxprt-jefe && echo OK || echo MISSING)"
	@echo "[2] llxprt-code: $(test -d ./external/llxprt-code && echo OK || echo MISSING)"
	@echo "[3] RTX3090Ti (openclaw+gemma4): $(docker --context orchestrator ps 2>/dev/null | grep -q vllm && echo RUNNING || echo CHECK)"
	@echo "[4] RTX5090 (claude-code+qwen3.6): $(docker --context worker-rtx5090 ps 2>/dev/null | grep -q vllm && echo RUNNING || echo CHECK)"
	@echo "[5] RTX3060 (embeddings+lm+voice): $(docker --context worker-rtx3060 ps 2>/dev/null && echo RUNNING || echo CHECK)"
	@echo "[6] PAPERCLIP (Oracle): $(docker compose -f $(ORACLE_COMPOSE) ps 2>/dev/null | grep -q paperclip && echo RUNNING || echo CHECK)"

dev-down:
	pkill -f ghostty || true
	pkill -f zellij || true

# WORKER ORCHESTRATION
.PHONY: up-worker-3090ti up-worker-5090 up-worker-3060 up-all-workers down-all-workers

up-worker-3090ti:
	@echo "Starting RTX3090Ti (openclaw + gemma4)..."
	@docker compose -f $(WORKER_3090TI_COMPOSE) up -d

up-worker-5090:
	@echo "Starting RTX5090 (claude-code + qwen3.6)..."
	@docker compose -f $(WORKER_5090_COMPOSE) up -d

up-worker-3060:
	@echo "Starting RTX3060 (embeddings + LLM + voice)..."
	@docker compose -f $(WORKER_3060_COMPOSE) up -d

up-all-workers: up-worker-3090ti up-worker-5090 up-worker-3060
	@echo "All workers started"

down-all-workers:
	@docker compose -f $(WORKER_3090TI_COMPOSE) down
	@docker compose -f $(WORKER_5090_COMPOSE) down
	@docker compose -f $(WORKER_3060_COMPOSE) down

# PAPERCLIP (Oracle VPS)
.PHONY: paperclip-up paperclip-down paperclip-logs paperclip-status

paperclip-up:
	@echo "Starting PAPERCLIP..."
	@docker compose -f $(ORACLE_COMPOSE) up -d paperclip paperclip-mcp
	@echo "PAPERCLIP: http://paperclip.ratehunter.net"

paperclip-down:
	@docker compose -f $(ORACLE_COMPOSE) down

paperclip-logs:
	@docker compose -f $(ORACLE_COMPOSE) logs -f paperclip

paperclip-status:
	@docker compose -f $(ORACLE_COMPOSE) ps paperclip paperclip-mcp

