# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector
WORKER_PROFILE ?= workers

.PHONY: help install test lint validate compose-config compose-config-all \
  up down restart logs ps pull \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle up-worker-3060 up-worker-3090ti up-worker-5090 \
  archon-config archon-up archon-down archon-logs archon-ps archon-up-infisical \
  node-up-orchestrator node-up-oracle node-up-worker-3060 node-up-worker-3090ti node-up-worker-5090 node-down-orchestrator node-down-oracle node-down-worker-3060 node-down-worker-3090ti node-down-worker-5090 \
  down-workers nexus-up nexus-down health stack-up stack-verify scan-env ports port-check bootstrap-import bootstrap-import-apply bootstrap-ultimate bootstrap-oracle bootstrap-worker-3060 bootstrap-worker-3090ti bootstrap-worker-5090 \
  gitea-up gitea-up-ai gitea-up-actions gitea-up-infisical-agent gitea-down gitea-ps gitea-config infisical-up infisical-down infisical-config \
  up-gitea down-gitea logs-gitea health-gitea up-infisical down-infisical logs-infisical health-infisical

.DEFAULT_GOAL := help

help:
	@echo "Project Nyra - common targets"
	@echo
	@echo "make install            Install root JS dependencies"
	@echo "make test               Run tests (npm test)"
	@echo "make lint               Run lint (npx eslint .)"
	@echo "make validate           Validate compose + test + lint"
	@echo
	@echo "make up                 Start default stack profiles"
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
	@echo "make ports              Print canonical ports registry path"
	@echo "make bootstrap-ultimate Bring up orchestrator + oracle + all workers"
	@echo
	@echo "make gitea-up           Start Gitea bootstrap stack"
	@echo "make gitea-up-ai        Start Gitea stack with AI reviewer profile"
	@echo "make gitea-up-actions   Start Gitea stack with actions runner profile"
	@echo "make gitea-up-infisical-agent Start Gitea stack with Infisical agent profile"
	@echo "make gitea-config       Validate new Gitea compose config"
	@echo "make infisical-up       Start Infisical self-host stack"
	@echo "make infisical-config   Validate new Infisical compose config"

install:
	npm install

test:
	npm test

lint:
	npx eslint .

compose-config:
	$(COMPOSE) config >/dev/null

validate:
	$(COMPOSE) config >/dev/null
	@echo "compose config ok"
	-@npm test
	-@npx eslint .

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
	docker compose -f infra/orchestrator/docker-compose.orchestrator.yml up -d

up-apps:
	$(COMPOSE) --profile apps up -d

up-dev:
	$(COMPOSE) --profile dev up -d

up-workers:
	docker compose -f infra/workers/worker-rtx3060/docker-compose.worker.yml up -d
	docker compose -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml up -d
	docker compose -f infra/workers/worker-rtx5090/docker-compose.worker.yml up -d

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
	docker compose -f infra/workers/worker-rtx3060/docker-compose.worker.yml down --remove-orphans
	docker compose -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml down --remove-orphans
	docker compose -f infra/workers/worker-rtx5090/docker-compose.worker.yml down --remove-orphans

nexus-up:
	$(COMPOSE) --profile gateway up -d litellm nexus-router

nexus-down:
	$(COMPOSE) stop nexus-router litellm || true

health:
	./scripts/verify-stack.sh $(HEALTH_ENV_FILE)



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

ports:
	@echo "See docs/port-map.md"

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
	docker compose -f infra/orchestrator/docker-compose.orchestrator.yml down --remove-orphans

logs-orchestrator:
	docker compose -f infra/orchestrator/docker-compose.orchestrator.yml logs -f --tail=200

health-orchestrator:
	docker compose -f infra/orchestrator/docker-compose.orchestrator.yml ps

up-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml up -d twenty postgres

down-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml stop twenty postgres

logs-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml logs -f --tail=200 twenty postgres

health-twenty:
	docker compose -f infra/oracle/docker-compose.oracle.yml ps twenty postgres

health-workers:
	docker compose -f infra/workers/worker-rtx3060/docker-compose.worker.yml ps || true
	docker compose -f infra/workers/worker-rtx3090ti/docker-compose.worker.yml ps || true
	docker compose -f infra/workers/worker-rtx5090/docker-compose.worker.yml ps || true

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

gitea-up-infisical-agent:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea --profile infisical up -d

gitea-down:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea down --remove-orphans

gitea-ps:
	docker compose -f docker-compose.gitea.yml --env-file .env.gitea ps

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
