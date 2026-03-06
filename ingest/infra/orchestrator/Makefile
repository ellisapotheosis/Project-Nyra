ENV_FILE ?= ../configs/env/.env.orchestrator.example
COMPOSE = docker compose --env-file $(ENV_FILE)

FILES = \
  -f docker-compose.yml

FILES_LEGACY = \
  -f compose/docker-compose.base.yml \
  -f compose/docker-compose.orchestration.yml \
  -f compose/docker-compose.workflows.yml \
  -f compose/docker-compose.apps.yml \
  -f compose/docker-compose.mcp.yml \
  -f compose/docker-compose.archon.full.yml \
  -f compose/docker-compose.claude-flow.full.yml \
  -f compose/docker-compose.observability.yml \
  -f compose/docker-compose.monitoring.yml

.PHONY: up down logs ps build dev prod openclaw claude-flow-dev admin
up:
	$(COMPOSE) $(FILES) up -d --build || $(COMPOSE) $(FILES_LEGACY) up -d --build

down:
	$(COMPOSE) $(FILES) down || $(COMPOSE) $(FILES_LEGACY) down

logs:
	$(COMPOSE) $(FILES) logs -f --tail=200 || $(COMPOSE) $(FILES_LEGACY) logs -f --tail=200

ps:
	$(COMPOSE) $(FILES) ps || $(COMPOSE) $(FILES_LEGACY) ps

build:
	$(COMPOSE) $(FILES) build || $(COMPOSE) $(FILES_LEGACY) build

dev:
	$(COMPOSE) $(FILES_LEGACY) -f compose/docker-compose.dev.yml up -d --build

prod:
	$(COMPOSE) $(FILES_LEGACY) -f compose/docker-compose.prod.yml up -d --build

openclaw:
	$(COMPOSE) $(FILES_LEGACY) --profile openclaw up -d --build clawhub-web clawhub-api clawhub-worker clawhub-mcp

claude-flow-dev:
	$(COMPOSE) $(FILES_LEGACY) --profile claude-flow-dev up -d --build claude-flow-modules agentdb agentic-flow epic-sdk agent-booster ruv-swarm onnx-runtime

admin:
	$(COMPOSE) $(FILES_LEGACY) --profile admin up -d pgadmin infisical
