# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

# Core Paths — canonical compose is per-host under infra/hosts/
ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.yml
COMPOSE_FILE ?= $(ORCHESTRATOR_COMPOSE)
COMPOSE ?= docker compose -f $(COMPOSE_FILE)

# Cloudflared Tunnel Compose Files
CF_ORCH_COMPOSE  := infra/hosts/orchestrator/docker-compose.cloudflared.yml
ORACLE_APPS_COMPOSE := infra/hosts/oracle-vps/docker-compose.apps.yml

# Host Specific Compose Files
ORCHESTRATOR_LLXPRT_COMPOSE := infra/hosts/orchestrator/docker-compose.llxprt.yml
WORKER_3060_LLXPRT_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.llxprt.yml
WORKER_3090TI_LLXPRT_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.llxprt.yml
WORKER_5090_LLXPRT_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.llxprt.yml
ORACLE_ACTIVEPIECES_MCP_COMPOSE := infra/hosts/oracle-vps/docker-compose.activepieces-mcp.yml

# Canonical Host Composes
WORKER_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.yml
WORKER_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.yml
ORACLE_COMPOSE := infra/hosts/oracle-vps/docker-compose.yml
ORACLE_AGENT_UTILS_COMPOSE := infra/hosts/oracle-vps/docker-compose.oracle.yml
ORACLE_MEMORY_COMPOSE := infra/hosts/oracle-vps/docker-compose.memory.yml
ORACLE_LETTA_MCP_COMPOSE := infra/hosts/oracle-vps/docker-compose.letta-mcp.yml
ORACLE_MEMORY_EXTRA_COMPOSE := infra/hosts/oracle-vps/docker-compose.memory-extra.yml
ORACLE_PAPERCLIP_COMPOSE := infra/hosts/oracle-vps/docker-compose.paperclip.yml
ORACLE_CLAWTEAM_COMPOSE := infra/hosts/oracle-vps/docker-compose.clawteam.yml
ORACLE_UI_FACTORY_SERVICES := nyra-ui-engine magicui-mcp shadcn-mcp
ORACLE_MCP_TOOL_SERVICES := llxprt-bridge-proxy activepieces-mcp litellm ha-mcp twenty-mcp git-mcp sequential-thinking-mcp playwright-mcp firecrawl-mcp magicui-mcp shadcn-mcp next-devtools-mcp tavily-mcp wcgw-mcp gitingest-mcp codebase-index-mcp nexus
ORACLE_PORTAINER_SERVICES := portainer portainer-edge-agent
INFISICAL_RUNTIME_COMPOSE := infra/hosts/_templates/docker-compose.infisical-runtime.yml
WORKER_AI_COMMON_COMPOSE := infra/hosts/_templates/docker-compose.worker-ai-common.yml
WORKER_5090_NERVE_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.nerve.yml
WORKER_5090_MODEL_SWITCHER_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.model-switcher.yml
WORKER_3090TI_NERVE_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.nerve.yml
WORKER_3060_OPENCLAW_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.openclaw.yml
AGENT_INFRA_ENV ?= prod
INFISICAL_PROJECT_ID ?= 8374cea9-e5e8-4050-bda4-b91f25ab30ef
ORCHESTRATOR_CONTEXT ?= orchestrator
ORACLE_CONTEXT ?= oracle
WORKER_5090_CONTEXT ?= worker-rtx5090
WORKER_3090TI_CONTEXT ?= worker-rtx3090ti
WORKER_3060_CONTEXT ?= worker-rtx3060

# Voice Setup Compose Files
VOICE_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.voice.yml
VOICE_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.voice.yml
VOICE_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.voice.yml
VOICE_ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.voice.yml

# Distributed Voice Compose Files
DIST_VOICE_3060 := infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml
DIST_VOICE_5090 := infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml
DIST_VOICE_3090TI := infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml
KYUTAI_BASE_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.voice.yml
KYUTAI_MESH_3060_COMPOSE := infra/hosts/worker-rtx3060/docker-compose.distributed-voice.yml
KYUTAI_MESH_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.distributed-voice.yml
KYUTAI_MESH_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.distributed-voice.yml

DEFAULT_PROFILES ?= apps,sync,debug

.PHONY: help install test lint validate up down restart logs ps pull verify-paths dev-orchestrate dev-down dev-panels dev-status dev-llxprt-jefe dev-llxprt-code llxprt-bridge-up llxprt-bridge-down llxprt-bridge-status llxprt-oracle-tunnel-up llxprt-oracle-tunnel-down llxprt-oracle-tunnel-status llxprt-oracle-subscription-up up-worker-3090ti up-worker-5090 up-worker-3060 up-all-workers down-all-workers paperclip-up paperclip-down paperclip-logs paperclip-status \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle \
  cluster cluster-kill grid grid-kill \
  nexus-up nexus-down health stack-up stack-verify \
  gitea-up gitea-down gitea-ps twenty-crm-up twenty-crm-down \
  voice-3060 voice-5090 voice-3090ti voice-orch voice-distributed \
  cf-orch-up cf-orch-down cf-orch-logs \
  oracle-apps-up oracle-apps-down oracle-quote-engine-up oracle-campaign-engine-up \
  oracle-ui-factory-up oracle-ui-factory-down oracle-ui-factory-ps oracle-ui-install \
  oracle-mcp-tools-up oracle-mcp-tools-down oracle-mcp-tools-ps \
  agent-vault-up agent-vault-down agent-vault-ps agent-vault-logs \
  oracle-portainer-up oracle-portainer-down oracle-portainer-ps \
  sync-env sync-env-all \
  up-all down-all cluster-status

restoration-up: oracle-mcp-tools-up oracle-memory-full-up
	@echo "🚀 Bringing up LLXPRT cluster..."
	@docker --context $(ORCHESTRATOR_CONTEXT) compose -f $(ORCHESTRATOR_LLXPRT_COMPOSE) up -d
	@docker --context $(WORKER_5090_CONTEXT) compose -f $(WORKER_5090_LLXPRT_COMPOSE) up -d
	@docker --context $(WORKER_3090TI_CONTEXT) compose -f $(WORKER_3090TI_LLXPRT_COMPOSE) up -d
	@docker --context $(WORKER_3060_CONTEXT) compose -f $(WORKER_3060_LLXPRT_COMPOSE) up -d
	@echo "🐾 Starting ActivePieces MCP on Oracle..."
	@docker --context oracle compose -f $(ORACLE_ACTIVEPIECES_MCP_COMPOSE) up -d
	@echo "✅ Full Restoration Stack is LIVE."

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - Unified Control Plane"
	@echo
	@echo "--- INFRASTRUCTURE ---"
	@echo "make up-all             Start all services across all PC nodes"
	@echo "make down-all           Stop all services across all nodes"
	@echo "make cluster-status     Show running containers across the entire cluster"
	@echo "make restoration-up     🚀 RESTORE ALL MISSING SERVICES (ActivePieces, LLXPRT, Memory)"
	@echo "make up                 Start default local stack profiles"
	@echo "make down               Stop and remove local stack"
	@echo "make ps                 Show running containers"
	@echo "make health             Run system-wide health checks"
	@echo "make llxprt-bridge-up   Start local OpenAI-compatible LLxprt subscription bridge"
	@echo "make llxprt-oracle-tunnel-up  Reverse-tunnel the LLxprt bridge into Oracle"
	@echo "make llxprt-oracle-subscription-up  Start the bridge and Oracle reverse tunnel"
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
	@echo
	@echo "--- WAVE AI + ZELLIJ GRID ---"
	@echo "make wave-stack-up        Start orchestrator + 5090/3090 AI grid and attach Wave/Zellij"
	@echo "make wave-stack-up-3060   Start default grid plus 3060 OpenClaw/NerveUI tab"
	@echo "make wave-stack-status    Show AI grid container status through Docker contexts"
	@echo "make wave-only            Attach the persistent Wave/Zellij cockpit only"
	@echo "make oracle-paperclip-up  Start Paperclip on Oracle VPS"
	@echo "make oracle-clawteam-up   Start ClawTeam on Oracle VPS"
	@echo "make oracle-ui-factory-up Start UI Factory MCP/tooling containers"
	@echo "make oracle-mcp-tools-up  Start Oracle MCP containers and Nexus aggregator"
	@echo "make oracle-portainer-up  Start Oracle Portainer CE + local agent"
	@echo "make agent-vault-up      Start the self-hosted Infisical / agent-vault stack"

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

up-all: sync-env up up-workers up-oracle

sync-env:
	@echo "🐾 Synchronizing cluster environment secrets from Infisical..."
	@./scripts/mirror-sync-env.sh

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
	@test -f $(ORACLE_MEMORY_COMPOSE) || (echo "Missing $(ORACLE_MEMORY_COMPOSE)" && exit 1)
	@test -f $(ORACLE_AGENT_UTILS_COMPOSE) || (echo "Missing $(ORACLE_AGENT_UTILS_COMPOSE)" && exit 1)
	@test -f $(INFISICAL_RUNTIME_COMPOSE) || (echo "Missing $(INFISICAL_RUNTIME_COMPOSE)" && exit 1)
	@test -f $(WORKER_AI_COMMON_COMPOSE) || (echo "Missing $(WORKER_AI_COMMON_COMPOSE)" && exit 1)
	@test -f $(WORKER_3090TI_NERVE_COMPOSE) || (echo "Missing $(WORKER_3090TI_NERVE_COMPOSE)" && exit 1)
	@test -f $(WORKER_5090_NERVE_COMPOSE) || (echo "Missing $(WORKER_5090_NERVE_COMPOSE)" && exit 1)
	@test -f $(VOICE_3060_COMPOSE) || (echo "Missing $(VOICE_3060_COMPOSE)" && exit 1)
	@test -f $(VOICE_5090_COMPOSE) || (echo "Missing $(VOICE_5090_COMPOSE)" && exit 1)
	@test -f $(VOICE_3090TI_COMPOSE) || (echo "Missing $(VOICE_3090TI_COMPOSE)" && exit 1)
	@test -f $(VOICE_ORCHESTRATOR_COMPOSE) || (echo "Missing $(VOICE_ORCHESTRATOR_COMPOSE)" && exit 1)
	@test -f $(DIST_VOICE_3060) || (echo "Missing $(DIST_VOICE_3060)" && exit 1)
	@test -f $(DIST_VOICE_5090) || (echo "Missing $(DIST_VOICE_5090)" && exit 1)
	@test -f $(DIST_VOICE_3090TI) || (echo "Missing $(DIST_VOICE_3090TI)" && exit 1)
	@echo "All Makefile compose paths are valid."

dev-orchestrate:
	@echo "🎨 Starting local development orchestration..."
	@make up
	@make orchestrator-setup
	@echo "Development stack is being prepared. Use 'make orchestrator-full' to launch the cockpit."

# --- CORE TARGETS ---

up:
	@profiles=$$(echo "$(DEFAULT_PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	docker --context $(ORCHESTRATOR_CONTEXT) compose -f $(ORCHESTRATOR_COMPOSE) $$args up -d

down:
	docker --context $(ORCHESTRATOR_CONTEXT) compose -f $(ORCHESTRATOR_COMPOSE) down --remove-orphans

ps:
	docker --context $(ORCHESTRATOR_CONTEXT) compose -f $(ORCHESTRATOR_COMPOSE) ps

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

ORACLE_GITEA_COMPOSE := infra/hosts/oracle-vps/docker-compose.gitea.yml

gitea-up:
	docker --context oracle compose -f $(ORACLE_GITEA_COMPOSE) up -d

gitea-down:
	docker --context oracle compose -f $(ORACLE_GITEA_COMPOSE) stop

gitea-ps:
	docker --context oracle compose -f $(ORACLE_GITEA_COMPOSE) ps

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
		zellij --layout infra/configs/zellij/nyra-swarm.kdl --session nyra-swarm -d; \
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

llxprt-bridge-up:
	@infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/providers/llxprt -- ./scripts/start-llxprt-bridge.sh

llxprt-bridge-down:
	@./scripts/stop-llxprt-bridge.sh

llxprt-bridge-status:
	@curl -fsS http://127.0.0.1:8090/health || (echo "llxprt-bridge down" && exit 1)

llxprt-oracle-tunnel-up:
	@./scripts/start-llxprt-oracle-tunnel.sh

llxprt-oracle-tunnel-down:
	@./scripts/stop-llxprt-oracle-tunnel.sh

llxprt-oracle-tunnel-status:
	@ssh nyra-dev 'curl -fsS http://127.0.0.1:8090/health' || (echo "llxprt oracle tunnel down" && exit 1)

llxprt-oracle-subscription-up: llxprt-bridge-up llxprt-oracle-tunnel-up llxprt-oracle-tunnel-status

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
	@echo "PAPERCLIP: http://paperclip.projectnyra.com"

paperclip-down:
	@docker --context oracle compose -f $(ORACLE_COMPOSE) stop paperclip paperclip-mcp

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
	@test -f infra/configs/zellij/nyra-orchestrator-mcp.kdl || (echo "❌ infra/configs/zellij/nyra-orchestrator-mcp.kdl missing" && exit 1)
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
	@echo "  → Zellij layout: " && (zellij setup --dump-layout infra/configs/zellij/nyra-orchestrator-mcp.kdl >/dev/null 2>&1 && echo "✅" || echo "⚠️  Syntax check: infra/configs/zellij/nyra-orchestrator-mcp.kdl")
	@echo ""

# Full orchestrator bootstrap: secrets → compile → health → launch
orchestrator-full: orchestrator-setup orchestrator-compile-letta orchestrator-daemon-health
	@echo "🚀 [FINAL] Launching Ultimate Orchestrator Cockpit..."
	@set -a; source ~/.nyra/.env.orchestrator 2>/dev/null; set +a; \
	if zellij list-sessions 2>/dev/null | grep -q "nyra-orchestrator"; then \
		echo "⚡ Orchestrator session already active. Attaching..."; \
	else \
		echo "🌊 Spawning detached Zellij (nyra-orchestrator) with Letta-MCP daemon..."; \
		zellij --layout infra/configs/zellij/nyra-orchestrator-mcp.kdl --session nyra-orchestrator -d; \
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

# ════════════════════════════════════════════════════════════════════════════
# 📎 PAPERCLIP + 🦞 CLAWTEAM — Oracle-VPS Primary + RTX3060 Fallback
# ════════════════════════════════════════════════════════════════════════════

.PHONY: oracle-paperclip oracle-clawteam rtx3060-clawteam-fallback \
  clawteam-all-deploy clawteam-monitor clawteam-failover-check

oracle-paperclip:
	@$(MAKE) oracle-paperclip-up

oracle-clawteam:
	@$(MAKE) oracle-clawteam-up

rtx3060-clawteam-fallback:
	@docker --context $(WORKER_3060_CONTEXT) compose \
	  -f infra/hosts/worker-rtx3060/docker-compose.yml \
	  -f infra/hosts/worker-rtx3060/docker-compose.clawteam.yml up -d clawteam

clawteam-all-deploy: oracle-clawteam rtx3060-clawteam-fallback
	@echo "✅ ClawTeam dual-deployment complete"
	@echo "   Primary:  oracle-vps:9001"
	@echo "   Fallback: worker-rtx3060:9002"
	@docker --context $(ORACLE_CONTEXT) exec nyra-clawteam-primary curl -s http://localhost:8080/health 2>/dev/null | jq .status || true

clawteam-monitor:
	@echo "Monitoring ClawTeam on Oracle-VPS..."
	@watch -n 5 "docker --context $(ORACLE_CONTEXT) stats nyra-clawteam-primary --no-stream"

clawteam-failover-check:
	@echo "Checking ClawTeam health: Primary (Oracle) vs Fallback (RTX3060)..."
	ORACLE_HEALTH=$$(docker --context $(ORACLE_CONTEXT) exec nyra-clawteam-primary curl -s http://localhost:8080/health 2>/dev/null | jq .status || echo "down") && \
	RTX3060_HEALTH=$$(docker --context $(WORKER_3060_CONTEXT) exec worker-3060-clawteam-fallback curl -s http://localhost:9000/health 2>/dev/null | jq .status || echo "down") && \
	echo "Oracle-VPS ClawTeam: $$ORACLE_HEALTH" && \
	echo "RTX3060 Fallback:    $$RTX3060_HEALTH" && \
	if [ "$$ORACLE_HEALTH" != "healthy" ] && [ "$$RTX3060_HEALTH" = "healthy" ]; then \
		echo "⚠️  PRIMARY DOWN — Fallback to RTX3060 active"; \
	fi

paperclip-oracle: oracle-paperclip
	@echo "Paperclip MCP Gateway ready at oracle-vps:8888"


# ════════════════════════════════════════════════════════════════════════════
# 🦞 RTX3060 OPENCLAW — Cron Jobs + Rate Quoting + Activepieces Testing
# ════════════════════════════════════════════════════════════════════════════

.PHONY: rtx3060-openclaw rtx3060-openclaw-health openclaw-all-workers \
  openclaw-status-dashboard

rtx3060-openclaw:
	@$(MAKE) worker-3060-ai-up

rtx3060-openclaw-health:
	@echo "=== RTX3060 OpenClaw Health ==="
	@docker --context $(WORKER_3060_CONTEXT) ps --filter "name=worker-3060" --format "table {{.Names}}\t{{.Status}}"

openclaw-all-workers:
	@$(MAKE) worker-5090-ai-up
	@$(MAKE) worker-3090ti-ai-up
	@$(MAKE) worker-3060-ai-up

openclaw-status-dashboard:
	@echo "════════════════════════════════════════════════════════════"
	@echo "🦞 OPENCLAW TOPOLOGY — 3 Workers + NerveUI Monitoring"
	@echo "════════════════════════════════════════════════════════════"
	@echo ""
	@echo "🔴 RTX5090 (Inference)"
	@echo "   OpenClaw: worker-rtx5090:8001 | NerveUI: worker-rtx5090:6006"
	@docker --context $(WORKER_5090_CONTEXT) exec $(COMPOSE_PROJECT_NAME:-nyra)-worker-rtx5090-openclaw curl -s http://localhost:8001/health 2>/dev/null | jq .status || echo "   Status: offline"
	@echo ""
	@echo "🟢 RTX3090Ti (Inference)"
	@echo "   OpenClaw: worker-rtx3090ti:8002 | NerveUI: worker-rtx3090ti:6007"
	@docker --context $(WORKER_3090TI_CONTEXT) exec $(COMPOSE_PROJECT_NAME:-nyra)-worker-rtx3090ti-openclaw curl -s http://localhost:8001/health 2>/dev/null | jq .status || echo "   Status: offline"
	@echo ""
	@echo "🟡 RTX3060 (Cron/Testing)"
	@echo "   OpenClaw: worker-rtx3060:8003 | NerveUI: worker-rtx3060:6008"
	@docker --context $(WORKER_3060_CONTEXT) exec $(COMPOSE_PROJECT_NAME:-nyra)-worker-rtx3060-openclaw curl -s http://localhost:8001/health 2>/dev/null | jq .status || echo "   Status: offline"
	@echo ""
	@echo "════════════════════════════════════════════════════════════"


# ════════════════════════════════════════════════════════════════════════════
# 🐳 DOCKER IMAGE BUILDS — ClawTeam + Paperclip (from Dockerfiles)
# ════════════════════════════════════════════════════════════════════════════

.PHONY: docker-build-clawteam docker-build-paperclip docker-build-all \
  docker-push-clawteam docker-push-paperclip

docker-build-clawteam:
	@echo "Building ClawTeam Docker image..."
	docker build -f infra/docker/Dockerfile.clawteam -t nyra/clawteam:latest .
	@echo "✅ ClawTeam image built: nyra/clawteam:latest"

docker-build-paperclip:
	@echo "Building Paperclip Docker image..."
	docker build -f infra/docker/Dockerfile.paperclip -t nyra/paperclip:latest .
	@echo "✅ Paperclip image built: nyra/paperclip:latest"

docker-build-all: docker-build-clawteam docker-build-paperclip
	@echo "✅ All images built successfully"

docker-push-clawteam:
	docker tag nyra/clawteam:latest localhost:5000/nyra/clawteam:latest
	docker push localhost:5000/nyra/clawteam:latest
	@echo "✅ ClawTeam image pushed to localhost:5000"

docker-push-paperclip:
	docker tag nyra/paperclip:latest localhost:5000/nyra/paperclip:latest
	docker push localhost:5000/nyra/paperclip:latest
	@echo "✅ Paperclip image pushed to localhost:5000"

# ════════════════════════════════════════════════════════════════════════════
# UPDATED DEPLOYMENT — Uses docker-compose build (instead of image:)
# ════════════════════════════════════════════════════════════════════════════

oracle-clawteam-deploy:
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_CLAWTEAM_COMPOSE) build clawteam
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_CLAWTEAM_COMPOSE) up -d clawteam
	@sleep 3
	@echo "✅ ClawTeam deployed to Oracle-VPS (port 8080)"
	@docker --context $(ORACLE_CONTEXT) logs nyra-clawteam-primary --tail 20

oracle-paperclip-deploy:
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_PAPERCLIP_COMPOSE) build paperclip
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_PAPERCLIP_COMPOSE) up -d paperclip
	@sleep 3
	@echo "✅ Paperclip deployed to Oracle-VPS (port 3100)"
	@docker --context $(ORACLE_CONTEXT) logs nyra-paperclip-mcp-gateway --tail 20

oracle-clawteam-paperclip-all:
	@echo "Building + deploying ClawTeam + Paperclip to Oracle-VPS..."
	@$(MAKE) docker-build-all
	@$(MAKE) oracle-clawteam-deploy
	@$(MAKE) oracle-paperclip-deploy
	@echo "✅ All services deployed to Oracle-VPS via Portainer"

# ============================================================================
# Wave AI + Zellij persistent grid
# ============================================================================

.PHONY: wave-stack-up wave-stack-up-3060 wave-stack-down wave-stack-status \
  wave-only wave-only-3060 orchestrator-ai-up orchestrator-ai-down \
  worker-5090-ai-up worker-3090ti-ai-up worker-3060-ai-up \
  worker-5090-ai-down worker-3090ti-ai-down worker-3060-ai-down \
  oracle-memory-manager-up oracle-memory-extra-up oracle-memory-full-up \
  oracle-memory-full-down oracle-webapp-twenty-up oracle-webapp-twenty-down \
  oracle-paperclip-up oracle-paperclip-down oracle-clawteam-up \
  oracle-clawteam-down oracle-agent-tools-up oracle-agent-tools-down

wave-stack-up: orchestrator-ai-up worker-5090-ai-up worker-3090ti-ai-up oracle-memory-full-up oracle-webapp-twenty-up oracle-portainer-up oracle-mcp-tools-up wave-only

wave-stack-up-3060: orchestrator-ai-up worker-5090-ai-up worker-3090ti-ai-up worker-3060-ai-up oracle-memory-full-up oracle-webapp-twenty-up oracle-portainer-up oracle-mcp-tools-up wave-only-3060

wave-stack-down: orchestrator-ai-down worker-5090-ai-down worker-3090ti-ai-down worker-3060-ai-down oracle-memory-full-down oracle-webapp-twenty-down oracle-mcp-tools-down
	@zellij kill-session nyra-wave-ai 2>/dev/null || true

wave-only:
	@chmod +x scripts/nyra-wave-zellij.sh scripts/nyra-zellij-pane.sh
	@NYRA_INCLUDE_3060=0 scripts/nyra-wave-zellij.sh

wave-only-3060:
	@chmod +x scripts/nyra-wave-zellij.sh scripts/nyra-zellij-pane.sh
	@NYRA_INCLUDE_3060=1 scripts/nyra-wave-zellij.sh

orchestrator-ai-up:
	@echo "Starting lightweight orchestrator edge services; LiteLLM/Nexus/Portainer CE run on Oracle..."
	@NYRA_INFISICAL_PATH=/machines/orchestrator \
	  docker --context $(ORCHESTRATOR_CONTEXT) compose --env-file /dev/null \
	  -f $(ORCHESTRATOR_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  --profile apps up -d \
	  openclaw-gateway portainer-edge-agent infisical-agent infisical-sidecar

orchestrator-ai-down:
	@NYRA_INFISICAL_PATH=/machines/orchestrator \
	  docker --context $(ORCHESTRATOR_CONTEXT) compose --env-file /dev/null \
	  -f $(ORCHESTRATOR_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) down

worker-5090-ai-up:
	@echo "Starting RTX5090 vLLM + LMCache + Redis + LiteLLM + OpenClaw + NerveUI..."
	@NYRA_INFISICAL_PATH=/machines/worker-rtx5090 WORKER_GRAFANA_PORT=3005 \
	  docker --context $(WORKER_5090_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_5090_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_5090_MODEL_SWITCHER_COMPOSE) \
	  -f $(WORKER_5090_NERVE_COMPOSE) up -d \
	  portainer-edge-agent redis vllm litellm promtail node-exporter gpu-exporter health-monitor grafana model-switcher openclaw nerve-ui infisical-agent infisical-sidecar

worker-3090ti-ai-up:
	@echo "Starting RTX3090Ti vLLM + LMCache + Redis + LiteLLM + OpenClaw + NerveUI..."
	@NYRA_INFISICAL_PATH=/machines/worker-rtx3090ti WORKER_GRAFANA_PORT=3006 \
	  docker --context $(WORKER_3090TI_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_3090TI_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_3090TI_NERVE_COMPOSE) up -d \
	  portainer-edge-agent redis vllm litellm model-switcher promtail node-exporter gpu-exporter health-monitor grafana openclaw nerve-ui infisical-agent infisical-sidecar

worker-3060-ai-up:
	@echo "Starting RTX3060 Ollama + LiteLLM + optional OpenClaw + NerveUI..."
	@NYRA_INFISICAL_PATH=/machines/worker-rtx3060 WORKER_GRAFANA_PORT=3007 \
	  docker --context $(WORKER_3060_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_3060_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_3060_OPENCLAW_COMPOSE) up -d \
	  portainer-edge-agent ollama litellm model-switcher promtail node-exporter gpu-exporter grafana openclaw nerve-ui infisical-agent infisical-sidecar

worker-5090-ai-down:
	@NYRA_INFISICAL_PATH=/machines/worker-rtx5090 WORKER_GRAFANA_PORT=3005 \
	  docker --context $(WORKER_5090_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_5090_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_5090_MODEL_SWITCHER_COMPOSE) \
	  -f $(WORKER_5090_NERVE_COMPOSE) down

worker-3090ti-ai-down:
	@NYRA_INFISICAL_PATH=/machines/worker-rtx3090ti WORKER_GRAFANA_PORT=3006 \
	  docker --context $(WORKER_3090TI_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_3090TI_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_3090TI_NERVE_COMPOSE) down

worker-3060-ai-down:
	@NYRA_INFISICAL_PATH=/machines/worker-rtx3060 WORKER_GRAFANA_PORT=3007 \
	  docker --context $(WORKER_3060_CONTEXT) compose --env-file /dev/null \
	  -f $(WORKER_3060_COMPOSE) \
	  -f $(INFISICAL_RUNTIME_COMPOSE) \
	  -f $(WORKER_AI_COMMON_COMPOSE) \
	  -f $(WORKER_3060_OPENCLAW_COMPOSE) down

oracle-memory-manager-up:
	@echo "Starting Oracle memory manager: Letta + mem0 + FalkorDB + Qdrant + Letta MCP..."
	@infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_MEMORY_COMPOSE) \
	  -f $(ORACLE_LETTA_MCP_COMPOSE) up -d --build

oracle-memory-extra-up:
	@echo "Starting optional memory companions: memOS/MemoryTensor and ClaudeMem..."
	@infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_MEMORY_COMPOSE) \
	  -f $(ORACLE_MEMORY_EXTRA_COMPOSE) up -d memos claudemem

oracle-memory-full-up: oracle-memory-manager-up oracle-memory-extra-up

oracle-memory-full-down:
	@infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_MEMORY_COMPOSE) \
	  -f $(ORACLE_LETTA_MCP_COMPOSE) \
	  -f $(ORACLE_MEMORY_EXTRA_COMPOSE) down

oracle-webapp-twenty-up:
	@echo "Starting Oracle webapp + Twenty CRM + Twenty MCP..."
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) \
	  -f $(ORACLE_APPS_COMPOSE) \
	  --profile apps up -d \
	  postgres redis-cache twenty-db twenty twenty-worker twenty-mcp crm-api webapp cloudflared portainer-edge-agent infisical-sidecar

oracle-webapp-twenty-down:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) \
	  -f $(ORACLE_APPS_COMPOSE) down

oracle-paperclip-up:
	@echo "Starting Paperclip on Oracle VPS..."
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) up -d paperclip paperclip-mcp

oracle-paperclip-down:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) stop paperclip paperclip-mcp

oracle-clawteam-up:
	@echo "Starting ClawTeam on Oracle VPS..."
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) \
	  -f $(ORACLE_CLAWTEAM_COMPOSE) up -d clawteam

oracle-clawteam-down:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) \
	  -f $(ORACLE_CLAWTEAM_COMPOSE) stop clawteam

oracle-agent-tools-up: oracle-paperclip-up oracle-clawteam-up

oracle-agent-tools-down: oracle-paperclip-down oracle-clawteam-down

oracle-ui-factory-up:
	@echo "Starting Oracle UI Factory containers..."
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) up -d $(ORACLE_UI_FACTORY_SERVICES)

oracle-ui-factory-down:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) stop $(ORACLE_UI_FACTORY_SERVICES)

oracle-ui-factory-ps:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) ps $(ORACLE_UI_FACTORY_SERVICES)

oracle-ui-install:
	@test -n "$(COMPONENT)" || (echo "usage: make oracle-ui-install COMPONENT=@magicui/shiny-button" >&2; exit 64)
	@scripts/nyra-ui-install.sh "$(COMPONENT)"

oracle-mcp-tools-up:
	@echo "Starting Oracle MCP tool containers and Nexus..."
	@LLXPRT_BRIDGE_API_KEY="$$(infisical secrets get LLXPRT_BRIDGE_API_KEY --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/providers/llxprt --plain --silent 2>/dev/null)" \
	  BETTER_AUTH_SECRET="$$(infisical secrets get BETTER_AUTH_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  PAPERCLIP_AGENT_JWT_SECRET="$$(infisical secrets get PAPERCLIP_AGENT_JWT_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) -f $(ORACLE_ACTIVEPIECES_MCP_COMPOSE) up -d $(ORACLE_MCP_TOOL_SERVICES)

oracle-mcp-tools-down:
	@BETTER_AUTH_SECRET="$$(infisical secrets get BETTER_AUTH_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  PAPERCLIP_AGENT_JWT_SECRET="$$(infisical secrets get PAPERCLIP_AGENT_JWT_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) -f $(ORACLE_ACTIVEPIECES_MCP_COMPOSE) stop $(ORACLE_MCP_TOOL_SERVICES)

oracle-mcp-tools-ps:
	@BETTER_AUTH_SECRET="$$(infisical secrets get BETTER_AUTH_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  PAPERCLIP_AGENT_JWT_SECRET="$$(infisical secrets get PAPERCLIP_AGENT_JWT_SECRET --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/clients/paperclip --plain --silent 2>/dev/null)" \
	  infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(AGENT_INFRA_ENV) --path=/machines/oracle-vps -- \
	  docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) -f $(ORACLE_ACTIVEPIECES_MCP_COMPOSE) ps $(ORACLE_MCP_TOOL_SERVICES)

oracle-portainer-up:
	@echo "Starting Oracle Portainer CE control plane..."
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) up -d $(ORACLE_PORTAINER_SERVICES)

oracle-portainer-down:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) stop $(ORACLE_PORTAINER_SERVICES)

oracle-portainer-ps:
	@docker --context $(ORACLE_CONTEXT) compose --env-file /dev/null \
	  -f $(ORACLE_COMPOSE) ps $(ORACLE_PORTAINER_SERVICES)

agent-vault-up:
	@if docker --context $(ORACLE_CONTEXT) inspect oracle-vps-agent-vault >/dev/null 2>&1; then \
		docker --context $(ORACLE_CONTEXT) restart oracle-vps-agent-vault; \
	else \
		POSTGRES_PASSWORD="$$(docker --context $(ORACLE_CONTEXT) inspect nyra-network-nyra-postgres --format '{{range .Config.Env}}{{println .}}{{end}}' | awk -F= '/^POSTGRES_PASSWORD=/{sub(/^POSTGRES_PASSWORD=/,""); print; exit}')" \
		  docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_AGENT_UTILS_COMPOSE) --env-file infra/hosts/oracle-vps/.env.agent-vault up -d agent-vault; \
	fi

agent-vault-down:
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_AGENT_UTILS_COMPOSE) --env-file infra/hosts/oracle-vps/.env.oracle --env-file infra/hosts/oracle-vps/.env.agent-vault down agent-vault

agent-vault-ps:
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_AGENT_UTILS_COMPOSE) --env-file infra/hosts/oracle-vps/.env.oracle --env-file infra/hosts/oracle-vps/.env.agent-vault ps agent-vault

agent-vault-logs:
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_AGENT_UTILS_COMPOSE) --env-file infra/hosts/oracle-vps/.env.oracle --env-file infra/hosts/oracle-vps/.env.agent-vault logs -f agent-vault

wave-stack-status:
	@echo "=== ORCHESTRATOR ==="
	@docker --context $(ORCHESTRATOR_CONTEXT) compose -f $(ORCHESTRATOR_COMPOSE) ps || true
	@echo
	@echo "=== WORKER RTX5090 ==="
	@docker --context $(WORKER_5090_CONTEXT) compose -f $(WORKER_5090_COMPOSE) -f $(WORKER_5090_NERVE_COMPOSE) ps || true
	@echo
	@echo "=== WORKER RTX3090TI ==="
	@docker --context $(WORKER_3090TI_CONTEXT) compose -f $(WORKER_3090TI_COMPOSE) -f $(WORKER_3090TI_NERVE_COMPOSE) ps || true
	@echo
	@echo "=== WORKER RTX3060 ==="
	@docker --context $(WORKER_3060_CONTEXT) compose -f $(WORKER_3060_COMPOSE) -f $(WORKER_3060_OPENCLAW_COMPOSE) ps || true
	@echo
	@echo "=== ORACLE MEMORY ==="
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_MEMORY_COMPOSE) -f $(ORACLE_LETTA_MCP_COMPOSE) ps || true
	@echo
	@echo "=== ORACLE APPS ==="
	@docker --context $(ORACLE_CONTEXT) compose -f $(ORACLE_COMPOSE) -f $(ORACLE_APPS_COMPOSE) ps || true
