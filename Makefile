# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector
WORKER_PROFILE ?= workers
TWENTY_COMPOSE_FILE ?= infra/docker-compose.twenty.yml
TWENTY_COMPOSE ?= docker compose -f $(TWENTY_COMPOSE_FILE)

ifeq (,$(wildcard pnpm-lock.yaml))
PKG_MGR ?= npm
PKG_RUN ?= npx
else
PKG_MGR ?= pnpm
PKG_RUN ?= pnpm exec
endif

.PHONY: help install test lint validate compose-config compose-config-all \
  up down restart logs ps pull \
  profile-up profile-down profile-ps stack-doctor \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle up-worker-3060 up-worker-3090ti up-worker-5090 \
  archon-config archon-up archon-down archon-logs archon-ps archon-up-infisical \
  node-up-orchestrator node-up-oracle node-up-worker-3060 node-up-worker-3090ti node-up-worker-5090 node-down-orchestrator node-down-oracle node-down-worker-3060 node-down-worker-3090ti node-down-worker-5090 \
  down-workers nexus-up nexus-down health stack-up stack-verify scan-env ports port-check bootstrap-import bootstrap-import-apply bootstrap-ultimate bootstrap-oracle bootstrap-worker-3060 bootstrap-worker-3090ti bootstrap-worker-5090 \
  archive-guard repo-structure-audit edge-docs \
  gitea-up gitea-up-ai gitea-up-actions gitea-up-actions-large gitea-up-infisical-agent gitea-down gitea-ps gitea-config gitea-bootstrap-orchestrator infisical-up infisical-down infisical-config \
  up-gitea down-gitea logs-gitea health-gitea up-infisical down-infisical logs-infisical health-infisical \
  twenty-crm-config twenty-crm-up twenty-crm-down twenty-crm-restart twenty-crm-logs twenty-crm-ps twenty-crm-health twenty-crm-setup twenty-crm-reset twenty-crm-dev twenty-mcp-up twenty-mcp-down

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - common targets"
	@echo
	@echo "make install            Install root JS dependencies"
	@echo "make test               Run tests ($(PKG_MGR) test)"
	@echo "make lint               Run lint ($(PKG_RUN) eslint .)"
	@echo "make validate           Validate compose + test + lint"
	@echo
	@echo "make up                 Start default stack profiles"
	@echo "make profile-up         Start custom profiles (PROFILES=core,gateway,...)"
	@echo "make profile-down       Stop services for custom profiles (PROFILES=core,...)"
	@echo "make profile-ps         Show status for custom profiles (PROFILES=core,...)"
	@echo "make stack-doctor       Run docker/compose diagnostics for selected profiles"
	@echo "make down               Stop and remove stack"
	@echo "make logs               Tail logs for full stack"
	@echo "make ps                 Show running containers"
	@echo
	@echo "make up-core            Start core data services only"
	@echo "make up-orchestrator    Start orchestrator profile set"
	@echo "make up-apps            Start apps profile"
	@echo "make up-dev             Start Claude Flow dev profile"
	@echo "make up-workers         Start worker profile if defined"
	@echo "make archon-up          Start dedicated Archon stack (docker-compose.archon.yml)"
	@echo "make archon-up-infisical Start dedicated Archon stack via infisical run"
	@echo "make archon-down        Stop dedicated Archon stack"
	@echo "make archon-logs        Tail dedicated Archon stack logs"
	@echo "make archon-ps          Show dedicated Archon stack container status"
	@echo
	@echo "make nexus-up           Start litellm + nexus-router only"
	@echo "make nexus-down         Stop litellm + nexus-router"
	@echo "make health             Stack health checks (uses HEALTH_ENV_FILE/STACK_ENV_FILE)"
	@echo "make stack-up           One-command orchestrator bring-up (uses .env.stack)"
	@echo "make stack-verify       Verify health endpoints + compose status"
	@echo "make scan-env           Build env inventory + missing env reports"
	@echo "make archive-guard      Fail if deprecated root archive paths return"
	@echo "make repo-structure-audit Generate structure hotspot report in docs/reports/consolidation"
	@echo "make edge-docs          Regenerate ports + cloudflared docs from canonical compose files"
	@echo "make ports              Print canonical ports registry path"
	@echo "make bootstrap-ultimate Bring up orchestrator + oracle + all workers"
	@echo
	@echo "make gitea-up           Start Gitea bootstrap stack"
	@echo "make gitea-up-ai        Start Gitea stack with AI reviewer profile"
	@echo "make gitea-up-actions   Start Gitea stack with actions runner profile"
	@echo "make gitea-up-actions-large Start Gitea stack with large actions runner profile"
	@echo "make gitea-up-infisical-agent Start Gitea stack with Infisical agent profile"
	@echo "make gitea-config       Validate new Gitea compose config"
	@echo "make gitea-bootstrap-orchestrator Bring up full Gitea + Actions package"
	@echo "make infisical-up       Start Infisical self-host stack"
	@echo "make infisical-config   Validate new Infisical compose config"

install:
	$(PKG_MGR) install

test:
	$(PKG_MGR) test

lint:
	$(PKG_RUN) eslint .

compose-config:
	$(COMPOSE) config >/dev/null

validate:
	$(COMPOSE) config >/dev/null
	@echo "compose config ok"
	-@$(PKG_MGR) test
	-@$(PKG_RUN) eslint .

compose-config-all:
	docker compose --env-file infra/env/.env.orchestrator -f infra/docker-compose.yml -f infra/compose/overrides/docker-compose.orchestrator.override.yml config >/dev/null
	docker compose --env-file infra/env/.env.worker-rtx3060 -f infra/docker-compose.yml -f infra/compose/overrides/docker-compose.worker-rtx3060.override.yml config >/dev/null
	docker compose --env-file infra/env/.env.worker-rtx3090ti -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml config >/dev/null
	docker compose --env-file infra/env/.env.worker-rtx5090 -f infra/workers/worker-rtx5090/docker-compose.worker.yml config >/dev/null
	@echo "compose config ok for orchestrator and all workers"

up:
	@profiles=$$(echo "$(DEFAULT_PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	echo "Starting profiles: $(DEFAULT_PROFILES)"; \
	$(COMPOSE) $$args up -d

profile-up:
	@test -n "$(PROFILES)" || (echo "Missing PROFILES. Example: make profile-up PROFILES=core,gateway,apps" && exit 1)
	@profiles=$$(echo "$(PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	echo "Starting profiles: $(PROFILES)"; \
	$(COMPOSE) $$args up -d

profile-down:
	@test -n "$(PROFILES)" || (echo "Missing PROFILES. Example: make profile-down PROFILES=apps,dev" && exit 1)
	@profiles=$$(echo "$(PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	echo "Stopping profiles: $(PROFILES)"; \
	$(COMPOSE) $$args down --remove-orphans

profile-ps:
	@test -n "$(PROFILES)" || (echo "Missing PROFILES. Example: make profile-ps PROFILES=core,gateway" && exit 1)
	@profiles=$$(echo "$(PROFILES)" | tr ',' ' '); \
	for p in $$profiles; do args="$$args --profile $$p"; done; \
	$(COMPOSE) $$args ps

down:
	$(COMPOSE) down --remove-orphans

restart: down up

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps

pull:
	$(COMPOSE) pull

up-core:
	$(COMPOSE) --profile core up -d

up-orchestrator:
	$(COMPOSE) --profile orchestrator up -d

up-apps:
	$(COMPOSE) --profile apps up -d

up-dev:
	$(COMPOSE) --profile dev up -d

up-workers:
	$(COMPOSE) -f infra/workers/worker-rtx3060/docker-compose.worker.yml --profile worker-3060 up -d || $(COMPOSE) --profile worker-3060 up -d
	$(COMPOSE) -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml --profile worker-3090ti up -d || $(COMPOSE) --profile worker-3090ti up -d
	$(COMPOSE) -f infra/workers/worker-rtx5090/docker-compose.worker.yml --profile worker-5090 up -d || $(COMPOSE) --profile worker-5090 up -d

archon-config:
	docker compose -f docker-compose.archon.yml config >/dev/null

archon-up:
	docker compose -f docker-compose.archon.yml --profile archon up -d

archon-up-infisical:
	infisical run --env=prod --path="/shared" -- docker compose -f docker-compose.archon.yml --profile archon up -d

archon-down:
	docker compose -f docker-compose.archon.yml down --remove-orphans

archon-logs:
	docker compose -f docker-compose.archon.yml logs -f --tail=200

archon-ps:
	docker compose -f docker-compose.archon.yml ps

down-workers:
	$(COMPOSE) -f infra/workers/worker-rtx3060/docker-compose.worker.yml down --remove-orphans || $(COMPOSE) --profile worker-3060 down --remove-orphans
	$(COMPOSE) -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml down --remove-orphans || $(COMPOSE) --profile worker-3090ti down --remove-orphans
	$(COMPOSE) -f infra/workers/worker-rtx5090/docker-compose.worker.yml down --remove-orphans || $(COMPOSE) --profile worker-5090 down --remove-orphans

nexus-up:
	$(COMPOSE) --profile gateway up -d litellm nexus-router

nexus-down:
	$(COMPOSE) stop nexus-router litellm || true

health:
	./scripts/verify-stack.sh $(HEALTH_ENV_FILE)

stack-doctor:
	./scripts/stack/stack-doctor.sh $(COMPOSE_FILE) "$(PROFILES)"



stack-up:
	@test -f $(STACK_ENV_FILE) || (echo "Missing $(STACK_ENV_FILE). Copy .env.stack.example -> $(STACK_ENV_FILE)" && exit 1)
	docker compose --env-file $(STACK_ENV_FILE) -f $(COMPOSE_FILE) --profile core --profile gateway --profile workflow --profile crm --profile archon --profile apps --profile observability --profile vector up -d

stack-verify:
	./scripts/stack/verify-stack.sh $(STACK_ENV_FILE)

up-oracle:
	docker compose -f infra/oracle/docker-compose.oracle.yml up -d

up-worker-3060:
	$(COMPOSE) --profile worker-3060 up -d

up-worker-3090ti:
	$(COMPOSE) --profile worker-3090ti up -d

up-worker-5090:
	$(COMPOSE) --profile worker-5090 up -d

bootstrap-import:
	./infra/scripts/bootstrap-import.sh bootstrap/incoming dry-run

bootstrap-import-apply:
	./infra/scripts/bootstrap-import.sh bootstrap/incoming apply


bootstrap-ultimate:
	./infra/scripts/ultimate-bootstrap.sh orchestrator up
	./infra/scripts/ultimate-bootstrap.sh oracle up
	./infra/scripts/ultimate-bootstrap.sh worker-3060 up
	./infra/scripts/ultimate-bootstrap.sh worker-3090ti up
	./infra/scripts/ultimate-bootstrap.sh worker-5090 up

bootstrap-oracle:
	./infra/scripts/ultimate-bootstrap.sh oracle up

bootstrap-worker-3060:
	./infra/scripts/ultimate-bootstrap.sh worker-3060 up

bootstrap-worker-3090ti:
	./infra/scripts/ultimate-bootstrap.sh worker-3090ti up

bootstrap-worker-5090:
	./infra/scripts/ultimate-bootstrap.sh worker-5090 up

scan-env:
	python scripts/generate-env-docs.py

archive-guard:
	bash ./scripts/maintenance/archive-guard.sh

repo-structure-audit:
	bash ./scripts/maintenance/repo-structure-audit.sh

ports:
	@echo "See docs/02_ports_registry.md"

edge-docs:
	python3 scripts/generate-edge-docs.py

port-check:
	python infra/scripts/check-port-collisions.py

node-up-orchestrator:
	./infra/scripts/node-up.sh orchestrator

node-up-oracle:
	./infra/scripts/node-up.sh oracle

node-up-worker-3060:
	./infra/scripts/node-up.sh worker-rtx3060

node-up-worker-3090ti:
	./infra/scripts/node-up.sh worker-rtx3090ti

node-up-worker-5090:
	./infra/scripts/node-up.sh worker-rtx5090

node-down-orchestrator:
	./infra/scripts/node-down.sh orchestrator

node-down-oracle:
	./infra/scripts/node-down.sh oracle

node-down-worker-3060:
	./infra/scripts/node-down.sh worker-rtx3060

node-down-worker-3090ti:
	./infra/scripts/node-down.sh worker-rtx3090ti

node-down-worker-5090:
	./infra/scripts/node-down.sh worker-rtx5090

# Canonical consolidation wrappers (backwards compatible)
.PHONY: down-oracle logs-oracle health-oracle down-orchestrator logs-orchestrator health-orchestrator health-workers audit-ports audit-env up-twenty down-twenty logs-twenty health-twenty

down-oracle:
	docker compose -f infra/oracle/docker-compose.oracle.yml down --remove-orphans

logs-oracle:
	docker compose -f infra/oracle/docker-compose.oracle.yml logs -f --tail=200

health-oracle:
	docker compose -f infra/oracle/docker-compose.oracle.yml ps

down-orchestrator:
	$(COMPOSE) --profile orchestrator down --remove-orphans

logs-orchestrator:
	$(COMPOSE) --profile orchestrator logs -f --tail=200

health-orchestrator:
	$(COMPOSE) --profile orchestrator ps

up-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml up -d twenty postgres

down-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml stop twenty postgres

logs-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml logs -f --tail=200 twenty postgres

health-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml ps twenty postgres

health-workers:
	$(COMPOSE) -f infra/workers/worker-rtx3060/docker-compose.worker.yml ps || $(COMPOSE) --profile worker-3060 ps || true
	$(COMPOSE) -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml ps || $(COMPOSE) --profile worker-3090ti ps || true
	$(COMPOSE) -f infra/workers/worker-rtx5090/docker-compose.worker.yml ps || $(COMPOSE) --profile worker-5090 ps || true

audit-ports:
	python infra/scripts/check-port-collisions.py

audit-env:
	python scripts/generate-env-docs.py

gitea-config:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea config >/dev/null

gitea-up:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea up -d

gitea-up-ai:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea --profile ai up -d

gitea-up-actions:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea --profile actions up -d

gitea-up-actions-large:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea --profile actions-large up -d

gitea-up-infisical-agent:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea --profile infisical up -d

gitea-down:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea down --remove-orphans

gitea-ps:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea ps

gitea-bootstrap-orchestrator:
	ENABLE_ACTIONS=true ENABLE_ACTIONS_LARGE=false ENABLE_INFISICAL_AGENT=true ./scripts/gitea/bootstrap-orchestrator-gitea.sh

infisical-config:
	docker compose -f docker-compose.infisical.yml --env-file .env.infisical config >/dev/null

infisical-up:
	docker compose -f docker-compose.infisical.yml --env-file .env.infisical up -d

infisical-down:
	docker compose -f docker-compose.infisical.yml --env-file .env.infisical down --remove-orphans

# Additive bootstrap-safe wrappers (do not replace existing flows)
up-gitea:
	docker compose -f docker-compose.gitea.bootstrap.yml --env-file .env.gitea up -d

down-gitea:
	docker compose -f docker-compose.gitea.bootstrap.yml --env-file .env.gitea down --remove-orphans

logs-gitea:
	docker compose -f docker-compose.gitea.bootstrap.yml --env-file .env.gitea logs -f --tail=200

health-gitea:
	docker compose -f docker-compose.gitea.bootstrap.yml --env-file .env.gitea ps

up-infisical:
	docker compose -f docker-compose.infisical.bootstrap.yml --env-file .env.infisical up -d

down-infisical:
	docker compose -f docker-compose.infisical.bootstrap.yml --env-file .env.infisical down --remove-orphans

logs-infisical:
	docker compose -f docker-compose.infisical.bootstrap.yml --env-file .env.infisical logs -f --tail=200

health-infisical:
	docker compose -f docker-compose.infisical.bootstrap.yml --env-file .env.infisical ps

# TwentyCRM Integration Commands
.PHONY: twenty-crm-config twenty-crm-setup twenty-crm-up twenty-crm-dev twenty-crm-down twenty-crm-restart twenty-crm-logs twenty-crm-ps twenty-crm-health twenty-crm-reset twenty-mcp-up twenty-mcp-down

twenty-crm-config:
	$(TWENTY_COMPOSE) config >/dev/null
	@echo "TwentyCRM compose config validated"

twenty-crm-setup:
	@echo "Setting up TwentyCRM for Nyra..."
	cd apps/twenty-crm && node scripts/setup.js

twenty-crm-up:
	@echo "Starting TwentyCRM production stack..."
	$(TWENTY_COMPOSE) up -d
	@echo "TwentyCRM available at: http://localhost:3020"

twenty-crm-dev:
	@echo "Starting TwentyCRM development environment..."
	cd apps/twenty-crm && npm run dev
	@echo "TwentyCRM dev environment available at: http://localhost:3021"

twenty-crm-down:
	@echo "Stopping TwentyCRM stack..."
	$(TWENTY_COMPOSE) down --remove-orphans

twenty-crm-restart: twenty-crm-down twenty-crm-up

twenty-crm-logs:
	$(TWENTY_COMPOSE) logs -f --tail=200

twenty-crm-ps:
	$(TWENTY_COMPOSE) ps

twenty-crm-health:
	@echo "=== TwentyCRM Health Status ==="
	$(TWENTY_COMPOSE) ps
	@echo ""
	@echo "=== Service Health Checks ==="
	@docker inspect --format='{{.State.Health.Status}}' nyra-twenty-db 2>/dev/null | xargs -I {} echo "Database: {}" || echo "Database: not running"
	@docker inspect --format='{{.State.Health.Status}}' nyra-twenty-redis 2>/dev/null | xargs -I {} echo "Redis: {}" || echo "Redis: not running"
	@docker inspect --format='{{.State.Health.Status}}' nyra-twenty-crm 2>/dev/null | xargs -I {} echo "Application: {}" || echo "Application: not running"

twenty-crm-reset:
	@echo "WARNING: This will remove all TwentyCRM data!"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	$(TWENTY_COMPOSE) down -v --remove-orphans
	@echo "TwentyCRM reset completed. Run 'make twenty-crm-setup' to initialize."

twenty-mcp-up:
	@echo "Starting TwentyCRM MCP Server..."
	$(TWENTY_COMPOSE) --profile mcp-server up -d twenty-mcp-server
	@echo "TwentyCRM MCP Server available at: http://localhost:3022"

twenty-mcp-down:
	@echo "Stopping TwentyCRM MCP Server..."
	$(TWENTY_COMPOSE) stop twenty-mcp-server
