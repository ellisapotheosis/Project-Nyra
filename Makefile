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
ORACLE_AGENT_UTILS_COMPOSE := infra/hosts/oracle-vps/docker-compose.oracle.yml
ORACLE_MEMORY_COMPOSE := infra/hosts/oracle-vps/docker-compose.memory.yml
AGENT_INFRA_ENV ?= prod

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
KYUTAI_BASE_3060_COMPOSE := infra/workers/worker-rtx3060/docker-compose.voice.yml
KYUTAI_MESH_3060_COMPOSE := infra/workers/worker-rtx3060/docker-compose.kyutai-mesh.yml
KYUTAI_MESH_3090TI_COMPOSE := infra/workers/worker-rtx3090ti/docker-compose.kyutai-mesh.yml
KYUTAI_MESH_5090_COMPOSE := infra/workers/worker-rtx5090/docker-compose.kyutai-mesh.yml

DEFAULT_PROFILES ?= core,gateway,workflow,crm,apps,observability,vector

.PHONY: help install test lint validate up down restart logs ps pull verify-paths dev-orchestrate dev-down dev-panels dev-status dev-llxprt-jefe dev-llxprt-code up-worker-3090ti up-worker-5090 up-worker-3060 up-all-workers down-all-workers paperclip-up paperclip-down paperclip-logs paperclip-status \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle \
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
	@echo
	@echo "--- AGENT INFRA ---"
	@echo "make agent-infra-validate Validate new agent infra compose files"
	@echo "make agent-secrets-audit  Audit required Infisical secrets"
	@echo "make oracle-agent-utils-up Start Paperclip, SearXNG, Browserless"
	@echo "make oracle-memory-up     Start Letta, mem0, FalkorDB, Qdrant"
	@echo "make kyutai-base-3060-up  Start base Unmute on RTX 3060"
	@echo "make kyutai-mesh-up       Start 3-node Kyutai voice mesh"

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
# Apps run on Oracle VPS. They use profile "apps" so they don't start
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

# --- AGENT INFRA TARGETS ---

.PHONY: agent-infra-validate agent-secrets-generate agent-secrets-audit oracle-agent-utils-up oracle-agent-utils-down oracle-memory-up oracle-memory-down kyutai-base-3060-up kyutai-mesh-up kyutai-mesh-down kyutai-mesh-check

agent-infra-validate:
	bash scripts/validate-agent-infra.sh

agent-secrets-generate:
	INFISICAL_ENV=$(AGENT_INFRA_ENV) scripts/infisical/agent-infra-secrets.sh generate

agent-secrets-audit:
	INFISICAL_ENV=$(AGENT_INFRA_ENV) scripts/infisical/agent-infra-secrets.sh audit

oracle-agent-utils-up:
	docker --context oracle compose -f $(ORACLE_AGENT_UTILS_COMPOSE) up -d

oracle-agent-utils-down:
	docker --context oracle compose -f $(ORACLE_AGENT_UTILS_COMPOSE) down

oracle-memory-up:
	docker --context oracle compose -f $(ORACLE_MEMORY_COMPOSE) up -d

oracle-memory-down:
	docker --context oracle compose -f $(ORACLE_MEMORY_COMPOSE) down

kyutai-base-3060-up:
	docker --context worker-rtx3060 compose -f $(KYUTAI_BASE_3060_COMPOSE) up -d

kyutai-mesh-up:
	docker --context worker-rtx3060 compose -f $(KYUTAI_MESH_3060_COMPOSE) up -d
	docker --context worker-rtx3090ti compose -f $(KYUTAI_MESH_3090TI_COMPOSE) up -d
	docker --context worker-rtx5090 compose -f $(KYUTAI_MESH_5090_COMPOSE) up -d

kyutai-mesh-down:
	docker --context worker-rtx3060 compose -f $(KYUTAI_MESH_3060_COMPOSE) down
	docker --context worker-rtx3090ti compose -f $(KYUTAI_MESH_3090TI_COMPOSE) down
	docker --context worker-rtx5090 compose -f $(KYUTAI_MESH_5090_COMPOSE) down

kyutai-mesh-check:
	bash scripts/check-voice-mesh.sh

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
# MAXIMALIST SWARM ORCHESTRATION: WAVE + ZELLIJ + INFISICAL
# ════════════════════════════════════════════════════════════════════════════

.PHONY: swarm-setup swarm-up swarm-oracle swarm-utility swarm-down swarm-logs swarm-ghost swarm-grid nerve-ui-3090ti nerve-ui-5090 claw-team-up

# Infisical integration: export secrets to .env.swarm
.env.swarm:
	@echo "🔐 Pulling secrets from Infisical CLI..."
	@infisical export --env=prod --path=/workers/orchestrator --format=dotenv > .env.swarm || \
		(echo "⚠️ Failed to pull Infisical secrets. Creating empty .env.swarm..." && touch .env.swarm)

swarm-setup:
	@echo "🌊 Bootstrapping Maximalist Wave AI (Waveterm) & Zellij Swarm..."
	@curl -fsSL https://dl.waveterm.dev/get-waveterm.sh | sh
	@chmod +x scripts/setup-waveterm-cyberpunk.sh
	@./scripts/setup-waveterm-cyberpunk.sh
	@echo "✅ Configuration written. Restart WaveTerm to apply."

swarm-up: .env.swarm
	@echo "🌊 Booting Maximalist Zellij Swarm..."
	@if zellij list-sessions 2>/dev/null | grep -q "nyra-swarm"; then \
		echo "⚡ Swarm already active. Attaching via WaveTerm..."; \
	else \
		echo "🚀 Spawning detached Zellij Swarm (nyra-swarm)..."; \
		set -a; source .env.swarm; set +a; \
		zellij --layout infra/zellij/nyra-swarm.kdl --session nyra-swarm -d; \
		echo "⏳ Waiting 3s for Ghost Layer (llxprt) proxy to stabilize on :8080..."; \
		sleep 3; \
	fi
	@echo "🖥️  Launching WaveTerm Cockpit..."
	@waveterm &
	@echo "👉 Tip: Use Cmd+Shift+S in WaveTerm to attach to the Cockpit."

swarm-oracle:
	@echo "☁️  Deploying Asynchronous Heavy State to Oracle VPS..."
	@docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.oracle.yml up -d
	@echo "✅ Oracle Stack (Paperclip, SearXNG, Browserless) is LIVE."

swarm-utility:
	@echo "🛠️  Deploying Utility Node to RTX 3060..."
	@docker --context worker-rtx3060 compose -f infra/hosts/worker-rtx3060/docker-compose.utility.yml up -d
	@echo "✅ Utility Stack (Embeddings, TTS Voice) is LIVE."

swarm-down:
	@echo "🛑 Terminating local Zellij Swarm..."
	@zellij kill-session nyra-swarm 2>/dev/null || echo "Local swarm already down."
	@echo "🛑 Terminating remote stacks..."
	@docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.oracle.yml down
	@docker --context worker-rtx3060 compose -f infra/hosts/worker-rtx3060/docker-compose.utility.yml down
	@rm -f .env.swarm
	@echo "✅ Entire Swarm (Local + Oracle + Utility) terminated."

swarm-logs:
	@echo "📜 Fetching recent logs from Ghost Layer (Proxy & Daemon)..."
	@zellij action -s nyra-swarm go-to-tab 1 2>/dev/null || echo "Swarm not running. Use 'make swarm-up'."
	@echo "Ghost Layer tab focused. Check WaveTerm."

swarm-ghost:
	@echo "👻 Toggling Ghost Layer Visibility..."
	@zellij action -s nyra-swarm go-to-tab 1 2>/dev/null || echo "Swarm not running."
	@echo "Ghost Layer tab focused. Use Cmd+Shift+S to return to Cockpit."

swarm-grid:
	@echo "📊 Launching NYRA-GRID Dashboard..."
	@wsh app:newTab --preset nyra-grid 2>/dev/null || echo "WaveTerm not running or wsh not in path. Launch WaveTerm and use Cmd+Shift+R."

nerve-ui-3090ti:
	@echo "🧠 Starting Nerve UI on RTX3090Ti..."
	@docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) up -d openclaw
	@echo "Nerve UI (3090Ti): http://worker-rtx3090ti.trex-fiordland.ts.net:8001"

nerve-ui-5090:
	@echo "🧠 Starting Nerve UI on RTX5090..."
	@docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) up -d openclaw
	@echo "Nerve UI (5090): http://worker-rtx5090.trex-fiordland.ts.net:8001"

claw-team-up:
	@echo "🦞 Starting ClawTeam Orchestration (Distributed Nerve)..."
	@make up-worker-3090ti
	@make up-worker-5090
	@make nerve-ui-3090ti
	@make nerve-ui-5090
	@echo "ClawTeam is active across the cluster."

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

# WORKER ORCHESTRATION
.PHONY: up-worker-3090ti up-worker-5090 up-worker-3060 up-all-workers down-all-workers

up-worker-3090ti:
	@echo "Starting RTX3090Ti (openclaw + gemma4)..."
	@docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) up -d

up-worker-5090:
	@echo "Starting RTX5090 (claude-code + qwen3.6)..."
	@docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) up -d

up-worker-3060:
	@echo "Starting RTX3060 (embeddings + LLM + voice)..."
	@docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) up -d

up-all-workers: up-worker-3090ti up-worker-5090 up-worker-3060
	@echo "All workers started"

down-all-workers:
	@docker --context worker-rtx3090ti compose -f $(WORKER_3090TI_COMPOSE) down
	@docker --context worker-rtx5090 compose -f $(WORKER_5090_COMPOSE) down
	@docker --context worker-rtx3060 compose -f $(WORKER_3060_COMPOSE) down

# PAPERCLIP (Oracle VPS)
.PHONY: paperclip-up paperclip-down paperclip-logs paperclip-status

paperclip-up:
	@echo "Starting PAPERCLIP..."
	@docker --context oracle compose -f $(ORACLE_COMPOSE) up -d paperclip paperclip-mcp
	@echo "PAPERCLIP: http://paperclip.ratehunter.net"

paperclip-down:
	@docker --context oracle compose -f $(ORACLE_COMPOSE) down

paperclip-logs:
	@docker --context oracle compose -f $(ORACLE_COMPOSE) logs -f paperclip

paperclip-status:
	@docker --context oracle compose -f $(ORACLE_COMPOSE) ps paperclip paperclip-mcp

# ════════════════════════════════════════════════════════════════════════════
# 🌊 ULTIMATE ORCHESTRATOR: Letta-MCP + Composio + Full Multi-CLI Cockpit
# Auto-compilation, daemon health checks, unified WaveTerm launch
# ════════════════════════════════════════════════════════════════════════════

.PHONY: orchestrator-setup orchestrator-compile-letta orchestrator-daemon-health \
  orchestrator-secrets orchestrator-wave-launch orchestrator-full \
  orchestrator-daemon-logs orchestrator-down orchestrator-status

# Pull secrets from Infisical, verify paths, prepare daemon environment
orchestrator-setup:
	@echo "🔐 [1/4] Pulling Infisical secrets for orchestrator..."
	@mkdir -p ~/.nyra
	@if command -v infisical &>/dev/null; then \
		infisical export --env=prod --path=/workers/orchestrator --format=dotenv > ~/.nyra/.env.orchestrator 2>/dev/null || \
		(echo "⚠️  Infisical offline. Creating minimal .env..." && echo "LLXPRT_DUMMY_KEY=local_dev" > ~/.nyra/.env.orchestrator); \
	else \
		echo "⚠️  Infisical CLI not installed. Skipping secret pull."; \
	fi
	@echo "✅ Secrets staged at ~/.nyra/.env.orchestrator"
	@echo ""
	@echo "📍 [2/4] Verifying critical paths..."
	@test -d external/llxprt-jefe || (echo "❌ external/llxprt-jefe missing" && exit 1)
	@test -d external/llxprt-code || (echo "❌ external/llxprt-code missing" && exit 1)
	@test -f infra/zellij/nyra-orchestrator-mcp.kdl || (echo "❌ infra/zellij/nyra-orchestrator-mcp.kdl missing" && exit 1)
	@echo "✅ All critical paths verified"
	@echo ""

# Compile Rust Letta-MCP server if not already built
orchestrator-compile-letta:
	@echo "🦀 [3/4] Building Rust Letta-MCP Server..."
	@if [ ! -f ./target/release/letta-mcp-server ] && [ -d mcp-servers/letta-mcp ]; then \
		echo "  → Compiling from mcp-servers/letta-mcp/Cargo.toml..."; \
		cargo build --release --manifest-path mcp-servers/letta-mcp/Cargo.toml 2>&1 | tail -20; \
		echo "✅ Letta-MCP compiled to ./target/release/letta-mcp-server"; \
	elif [ -f ./target/release/letta-mcp-server ]; then \
		echo "✅ Letta-MCP already built"; \
	else \
		echo "⚠️  Letta-MCP source not found. Skipping compilation. (Will fallback to stdio stubs)"; \
	fi
	@echo ""

# Health check: Verify daemon will boot correctly
orchestrator-daemon-health:
	@echo "🏥 [4/4] Pre-flight daemon health check..."
	@echo "  → llxprt-jefe: " && (cd external/llxprt-jefe && ./jefe --help >/dev/null 2>&1 && echo "✅" || echo "⚠️  Check manually")
	@echo "  → llxprt-code: " && (cd external/llxprt-code && ./code --help >/dev/null 2>&1 && echo "✅" || echo "⚠️  Check manually")
	@echo "  → Zellij layout: " && (zellij --layout infra/zellij/nyra-orchestrator-mcp.kdl --check >/dev/null 2>&1 && echo "✅" || echo "⚠️  Syntax check: infra/zellij/nyra-orchestrator-mcp.kdl")
	@echo ""

# Full orchestrator bootstrap: secrets → compile → health → launch
orchestrator-full: orchestrator-setup orchestrator-compile-letta orchestrator-daemon-health
	@echo "🚀 [FINAL] Launching Ultimate Orchestrator Cockpit..."
	@set -a; source ~/.nyra/.env.orchestrator 2>/dev/null; set +a; \
	if zellij list-sessions 2>/dev/null | grep -q "nyra-orchestrator"; then \
		echo "⚡ Orchestrator session already active. Attaching..."; \
	else \
		echo "🌊 Spawning detached Zellij (nyra-orchestrator) with Letta-MCP daemon..."; \
		zellij --layout infra/zellij/nyra-orchestrator-mcp.kdl --session nyra-orchestrator -d; \
		sleep 2; \
		echo "⏳ Waiting 3s for daemon layer (llxprt + Letta-MCP) to stabilize..."; \
		sleep 3; \
	fi
	@echo "🖥️  Launching WaveTerm Cockpit UI..."
	@waveterm &
	@echo ""
	@echo "✅ ORCHESTRATOR ACTIVE"
	@echo ""
	@echo "Next steps:"
	@echo "  1. In WaveTerm: Cmd+Shift+O → Load 'multi-cli-cockpit' preset"
	@echo "  2. Watch daemon health: make orchestrator-daemon-logs"
	@echo "  3. Check worker status: make orchestrator-status"
	@echo ""

# Show daemon logs (tail all 3 daemon streams)
orchestrator-daemon-logs:
	@echo "📜 Daemon Layer Logs (live tail)..."
	@mkdir -p ~/.nyra
	@echo "---"
	@tmux new-session -d -s nyra-logs \
		"(echo '=== JEFE ==='; tail -f ~/.nyra/jefe.log)" \; \
		split-window -h "(echo '=== CODE PROXY ==='; tail -f ~/.nyra/code-proxy.log)" \; \
		split-window -h "(echo '=== LETTA-MCP ==='; tail -f ~/.nyra/letta-mcp.log)" \; \
		attach
	@tmux attach-session -t nyra-logs || true

# Shutdown orchestrator session cleanly
orchestrator-down:
	@echo "🛑 Shutting down Orchestrator..."
	@zellij kill-session nyra-orchestrator 2>/dev/null || echo "Session not running."
	@pkill -f "waveterm" 2>/dev/null || echo "WaveTerm not running."
	@pkill -f "llxprt-jefe" 2>/dev/null || echo "Jefe cleanup."
	@pkill -f "llxprt-code" 2>/dev/null || echo "Code proxy cleanup."
	@pkill -f "letta-mcp-server" 2>/dev/null || echo "Letta-MCP cleanup."
	@rm -f ~/.nyra/.env.orchestrator
	@echo "✅ Orchestrator shutdown complete."

# Live status: orchestrator + workers + oracle
orchestrator-status:
	@echo "=== 🌊 ORCHESTRATOR STATUS ==="
	@echo ""
	@echo "[DAEMON] Zellij Session:"
	@zellij list-sessions 2>/dev/null | grep nyra-orchestrator || echo "  ℹ Not running"
	@echo ""
	@echo "[DAEMON] Process Health:"
	@pgrep -f "llxprt-jefe" >/dev/null && echo "  ✅ llxprt-jefe running (PID: $(pgrep -f 'llxprt-jefe'))" || echo "  ❌ llxprt-jefe down"
	@pgrep -f "llxprt-code" >/dev/null && echo "  ✅ llxprt-code running (PID: $(pgrep -f 'llxprt-code'))" || echo "  ❌ llxprt-code down"
	@pgrep -f "letta-mcp-server" >/dev/null && echo "  ✅ letta-mcp-server running (PID: $(pgrep -f 'letta-mcp-server'))" || echo "  ❌ letta-mcp-server down"
	@echo ""
	@echo "[WORKERS] GPU Cluster:"
	@for ctx in worker-rtx5090 worker-rtx3090ti worker-rtx3060; do \
		docker --context $$ctx ps --format '{{.Names}}:{{.Status}}' 2>/dev/null | wc -l && echo "  [$$ctx]: $$(docker --context $$ctx ps -q | wc -l) containers"; \
	done
	@echo ""
	@echo "[ORACLE] VPS Services:"
	@docker --context oracle ps --filter 'status=running' --format '{{.Service}}' 2>/dev/null | wc -l && echo "  Services running"
	@echo ""
