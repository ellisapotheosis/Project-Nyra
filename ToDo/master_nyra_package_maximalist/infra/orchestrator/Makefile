.PHONY: help up down restart ps logs pull build doctor \
        up-all down-all \
        up-claude-flow up-archon up-gitea up-dashboard up-tunnel \
        build-twenty-mcp

COMPOSE = docker compose
BASE = -f docker-compose.yml

help:
	@echo "Nyra Orchestrator (Docker Desktop + WSL2)"
	@echo ""
	@echo "Core commands"
	@echo "  make up            Start core orchestration stack"
	@echo "  make down          Stop core stack"
	@echo "  make logs          Tail logs (ctrl-c to exit)"
	@echo "  make ps            Show container status"
	@echo "  make doctor        Quick sanity checks"
	@echo ""
	@echo "Optional profiles / overlays"
	@echo "  make up-claude-flow   Start claude-flow dev + ruvector-postgres"
	@echo "  make up-archon        Start Archon OS stack (requires repo code at services/archon-os)"
	@echo "  make up-gitea         Start Gitea + Runner"
	@echo "  make up-dashboard     Start claude-flow dashboard/event-server"
	@echo "  make up-tunnel        Start cloudflared tunnel (needs CF_TUNNEL_TOKEN)"
	@echo ""
	@echo "Build helpers"
	@echo "  make build-twenty-mcp Build local image nyra/twenty-crm-mcp:local (for Nexus docker MCP)"

up:
	$(COMPOSE) $(BASE) up -d

down:
	$(COMPOSE) $(BASE) down

restart:
	$(COMPOSE) $(BASE) restart

ps:
	$(COMPOSE) $(BASE) ps

logs:
	$(COMPOSE) $(BASE) logs -f --tail=200

pull:
	$(COMPOSE) $(BASE) pull

build:
	$(COMPOSE) $(BASE) build

doctor:
	@echo "[doctor] Docker engine:" && docker version --format '{{.Server.Version}}' || true
	@echo "[doctor] Compose:" && docker compose version || true
	@echo "[doctor] Nexus health:" && curl -fsS http://localhost:$${NEXUS_PORT:-8000}/health || true
	@echo "[doctor] LiteLLM models:" && curl -fsS http://localhost:$${LITELLM_PORT:-4000}/v1/models -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" || true
	@echo "[doctor] n8n health:" && curl -fsS http://localhost:$${N8N_PORT:-5678}/healthz || true

# ---------------------------------------------------------------------------
# Overlays — we keep your uploaded compose files in ./compose/.
# ---------------------------------------------------------------------------

up-claude-flow:
	$(COMPOSE) $(BASE) --profile claude-flow --profile vector up -d

up-archon:
	$(COMPOSE) $(BASE) -f compose/docker-compose.archon.yml --profile archon up -d

up-gitea:
	$(COMPOSE) $(BASE) -f compose/docker-compose.gitea.yml up -d

up-dashboard:
	$(COMPOSE) $(BASE) -f compose/docker-compose.dashboard.yml up -d

up-tunnel:
	$(COMPOSE) $(BASE) -f compose/docker-compose.orchestrator-cf-tunnel.yml up -d

up-all:
	$(COMPOSE) $(BASE) -f compose/docker-compose.gitea.yml -f compose/docker-compose.dashboard.yml -f compose/docker-compose.archon.yml --profile claude-flow --profile vector --profile archon up -d

down-all:
	$(COMPOSE) $(BASE) -f compose/docker-compose.gitea.yml -f compose/docker-compose.dashboard.yml -f compose/docker-compose.archon.yml --profile claude-flow --profile vector --profile archon down

build-twenty-mcp:
	docker build -t nyra/twenty-crm-mcp:local ./mcp/twenty-crm-mcp-server
