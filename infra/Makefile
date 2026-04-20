# Project Nyra infra Makefile (canonicalized)

SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
MAIN_COMPOSE := docker-compose.yml
ORACLE_COMPOSE := hosts/oracle-vps/docker-compose.oracle.yml
WORKERS_COMPOSE := hosts/docker-compose.workers.yml
CLOUDFLARED_COMPOSE := compose/docker-compose.cloudflared.yml

SERVICE ?=
WORKER ?=all

# llxprt/jefe Configuration
ORCHESTRATOR_HOST ?= AlienApotheosis51
JEFE_BOOTSTRAP ?= ~/.local/bin/jefe-bootstrap.sh
JEFE_BIN ?= $(HOME)/repos/project-nyra/external/llxprt-jefe/target/release/jefe
LLXPRT_PROFILES ?= $(HOME)/.llxprt/profiles

.PHONY: help verify-paths init bootstrap up down logs health build test dev \
	db-init db-backup \
	worker-up worker-down oracle-up oracle-down oracle-logs \
	tunnel-start tunnel-stop tunnel-setup port-discovery verify-connectivity \
	orch orch-attach llxprt-claude llxprt-grid llxprt-gemini llxprt-codex \
	llxprt-status llxprt-check tmux-cluster tmux-grid tmux-ai-grid \
	clean reset

help:
	@echo "Project Nyra Infra + llxprt/jefe Orchestration"
	@echo "==============================================="
	@echo ""
	@echo "DOCKER ORCHESTRATION:"
	@echo "  make verify-paths       Validate makefile file/script references"
	@echo "  make init               Install dependencies and bootstrap .env"
	@echo "  make bootstrap          Compatibility alias for init + up"
	@echo "  make up|down            Start/stop core infra stack"
	@echo "  make logs SERVICE=name  Tail logs (all services if SERVICE unset)"
	@echo "  make health             Run infra health checks"
	@echo "  make db-init            Compatibility init for the core postgres databases"
	@echo "  make db-backup          Run the canonical backup script"
	@echo "  make worker-up          Start worker compose stack"
	@echo "  make worker-down        Stop worker compose stack"
	@echo "  make oracle-up          Start Oracle VPS host stack"
	@echo "  make oracle-down        Stop Oracle VPS host stack"
	@echo "  make tunnel-start       Start cloudflared compose profile"
	@echo "  make tunnel-stop        Stop cloudflared compose profile"
	@echo "  make port-discovery     Run port discovery script"
	@echo "  make verify-connectivity Run connectivity verification"
	@echo ""
	@echo "LLXPRT/JEFE AI ORCHESTRATION:"
	@echo "  make orch               Launch/attach Jefe Orchestrator UI (via tmux)"
	@echo "  make orch-attach        Attach to existing orch session"
	@echo "  make llxprt-claude      Launch llxprt with Anthropic profile"
	@echo "  make llxprt-grid        Launch llxprt with local GPU grid profile"
	@echo "  make llxprt-gemini      Launch llxprt with Google Gemini profile"
	@echo "  make llxprt-codex       Launch llxprt with OpenAI Codex profile"
	@echo "  make llxprt-status      Show active llxprt sessions"
	@echo "  make llxprt-check       Verify llxprt/jefe configuration"
	@echo ""
	@echo "TMUX SESSION MANAGEMENT:"
	@echo "  make tmux-cluster       Launch full cluster tmux layout"
	@echo "  make tmux-grid          Launch 5-pane SSH mesh monitor"
	@echo "  make tmux-ai-grid       Launch AI CLI grid (Claude/Codex/Gemini/Workers)"
	@echo ""
	@echo "CLEANUP:"
	@echo "  make clean              Stop all docker services"
	@echo "  make reset              Hard reset (volumes + orphans)"

verify-paths:
	@test -f $(MAIN_COMPOSE) || (echo "Missing $(MAIN_COMPOSE)" && exit 1)
	@test -f $(ORACLE_COMPOSE) || (echo "Missing $(ORACLE_COMPOSE)" && exit 1)
	@test -f $(WORKERS_COMPOSE) || (echo "Missing $(WORKERS_COMPOSE)" && exit 1)
	@test -f $(CLOUDFLARED_COMPOSE) || (echo "Missing $(CLOUDFLARED_COMPOSE)" && exit 1)
	@test -f health-check.sh || (echo "Missing health-check.sh" && exit 1)
	@test -f port-discovery.sh || (echo "Missing port-discovery.sh" && exit 1)
	@test -f tunnel-setup.sh || (echo "Missing tunnel-setup.sh" && exit 1)
	@test -f verify-connectivity.sh || (echo "Missing verify-connectivity.sh" && exit 1)
	@echo "All infra Makefile references are valid."

init: verify-paths
	@test -f ../.env || cp env/.env.template ../.env
	@cd .. && pnpm install --frozen-lockfile || (cd .. && pnpm install)

bootstrap: init up
	@echo "Bootstrap complete."

up: verify-paths
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) down --remove-orphans

logs: verify-paths
ifdef SERVICE
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) logs -f $(SERVICE)
else
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) logs -f
endif

health: verify-paths
	@bash ./health-check.sh

build: verify-paths
	cd .. && pnpm build
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) build

test:
	cd .. && pnpm test

dev:
	cd .. && pnpm dev

db-init: verify-paths
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) up -d postgres
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) exec -T postgres sh -lc '\
		psql -v ON_ERROR_STOP=1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" <<'\''SQL'\''\n\
		SELECT '\''CREATE DATABASE twenty'\'' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '\''twenty'\'') \\gexec\n\
		SELECT '\''CREATE DATABASE n8n'\'' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '\''n8n'\'') \\gexec\n\
		SELECT '\''CREATE DATABASE litellm'\'' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '\''litellm'\'') \\gexec\n\
		SQL'

db-backup: verify-paths
	@bash ../scripts/deployment/backup-data.sh

worker-up: verify-paths
	$(DOCKER_COMPOSE) -f $(WORKERS_COMPOSE) up -d

worker-down: verify-paths
	$(DOCKER_COMPOSE) -f $(WORKERS_COMPOSE) down --remove-orphans

oracle-up: verify-paths
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) up -d

oracle-down: verify-paths
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) down --remove-orphans

oracle-logs: verify-paths
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) logs -f

tunnel-setup: verify-paths
	@bash ./tunnel-setup.sh

tunnel-start: verify-paths
	$(DOCKER_COMPOSE) -f $(CLOUDFLARED_COMPOSE) up -d

tunnel-stop: verify-paths
	$(DOCKER_COMPOSE) -f $(CLOUDFLARED_COMPOSE) down --remove-orphans

port-discovery: verify-paths
	@bash ./port-discovery.sh

verify-connectivity: verify-paths
	@bash ./verify-connectivity.sh

# ==============================================================================
# LLXPRT/JEFE AI ORCHESTRATION TARGETS
# ==============================================================================

llxprt-check:
	@echo "Checking llxprt/jefe configuration..."
	@echo ""
	@echo "Orchestrator Host: $(ORCHESTRATOR_HOST)"
	@echo "Jefe Bootstrap:    $(JEFE_BOOTSTRAP)"
	@echo "Jefe Binary:       $(JEFE_BIN)"
	@echo "Profiles Path:     $(LLXPRT_PROFILES)"
	@echo ""
	@test -d $(LLXPRT_PROFILES) && echo "✓ Profiles directory exists" || echo "✗ Profiles directory missing"
	@test -f $(JEFE_BIN) && echo "✓ Jefe binary found" || echo "✗ Jefe binary not compiled"
	@test -f ~/.ssh/config && grep -q "$(ORCHESTRATOR_HOST)" ~/.ssh/config && echo "✓ Orchestrator in SSH config" || echo "✗ Orchestrator not in SSH config"
	@which llxprt > /dev/null && echo "✓ llxprt CLI available" || echo "⚠ llxprt CLI not in PATH (use: npm install -g @vybestack/llxprt-code)"
	@echo ""
	@echo "Profiles available:"
	@ls -1 $(LLXPRT_PROFILES) 2>/dev/null | sed 's/^/  - /'

orch:
	@echo "Launching Jefe Orchestrator UI on $(ORCHESTRATOR_HOST)..."
	@ssh $(ORCHESTRATOR_HOST) -t "bash $(JEFE_BOOTSTRAP)"

orch-attach:
	@echo "Attaching to existing Jefe Orchestrator session..."
	@tmux attach-session -t jefe-orch 2>/dev/null || \
		(echo "No existing jefe-orch session. Run: make orch" && exit 1)

llxprt-claude:
	@echo "Launching llxprt with Anthropic (Claude) profile..."
	llxprt --profile-load claude

llxprt-grid:
	@echo "Launching llxprt with Local GPU Grid profile..."
	llxprt --profile-load local-grid

llxprt-gemini:
	@echo "Launching llxprt with Google Gemini profile..."
	llxprt --profile-load gemini

llxprt-codex:
	@echo "Launching llxprt with OpenAI Codex profile..."
	llxprt --profile-load codex

llxprt-status:
	@echo "Active llxprt sessions:"
	@tmux list-sessions 2>/dev/null | grep -i llxprt || echo "  (none)"
	@echo ""
	@echo "Active jefe sessions:"
	@tmux list-sessions 2>/dev/null | grep -i jefe || echo "  (none)"

tmux-cluster:
	@echo "Launching full cluster tmux layout..."
	@echo "This will create a tmux session with:"
	@echo "  - Orchestrator (jefe-orch)"
	@echo "  - Claude profile (llxprt-claude)"
	@echo "  - GPU Grid profile (llxprt-grid)"
	@echo "  - Codex profile (llxprt-codex)"
	@echo ""
	@tmux new-session -d -s cluster-control -x 240 -y 50
	@tmux new-window -t cluster-control -n orch "ssh $(ORCHESTRATOR_HOST) -t bash $(JEFE_BOOTSTRAP)"
	@tmux new-window -t cluster-control -n claude "llxprt --profile-load claude"
	@tmux new-window -t cluster-control -n grid "llxprt --profile-load local-grid"
	@tmux new-window -t cluster-control -n codex "llxprt --profile-load codex"
	@tmux attach-session -t cluster-control

tmux-grid:
	@echo "Launching 5-pane SSH mesh monitor..."
	@echo "Monitoring:"
	@echo "  - Orchestrator (AlienApotheosis51)"
	@echo "  - GPU 5090 Worker"
	@echo "  - GPU 3090 Ti Worker"
	@echo "  - GPU 3060 Worker"
	@echo "  - Local Node"
	@echo ""
	@tmux new-session -d -s mesh-grid -c $(HOME)
	@tmux send-keys -t mesh-grid "ssh $(ORCHESTRATOR_HOST)" C-m
	@tmux split-window -t mesh-grid -h "ssh worker-rtx5090"
	@tmux split-window -t mesh-grid -v "ssh worker-rtx3090ti"
	@tmux split-window -t mesh-grid -v "ssh worker-rtx3060"
	@tmux split-window -t mesh-grid -v "pwd"
	@tmux attach-session -t mesh-grid

tmux-ai-grid:
	@echo "Launching AI CLI grid (Claude/Codex/Gemini/Workers)..."
	@tmux new-session -d -s ai-grid -x 240 -y 50
	@tmux send-keys -t ai-grid "llxprt --profile-load claude" C-m
	@tmux split-window -t ai-grid -h "llxprt --profile-load codex"
	@tmux split-window -t ai-grid -h "llxprt --profile-load gemini"
	@tmux split-window -t ai-grid -h "llxprt --profile-load local-grid"
	@tmux attach-session -t ai-grid

clean:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) down --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(WORKERS_COMPOSE) down --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) down --remove-orphans || true

reset:
	@echo "WARNING: this removes containers and volumes for main + worker + oracle stacks."
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) down -v --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(WORKERS_COMPOSE) down -v --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) down -v --remove-orphans || true
	docker system prune -af
