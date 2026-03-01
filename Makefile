# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector
WORKER_PROFILE ?= workers

.PHONY: help install test lint validate compose-config \
  up down restart logs ps pull \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle up-worker-3060 up-worker-3090ti up-worker-5090 \
  down-workers nexus-up nexus-down health bootstrap-import bootstrap-import-apply bootstrap-ultimate bootstrap-oracle bootstrap-worker-3060 bootstrap-worker-3090ti bootstrap-worker-5090

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
	@echo
	@echo "make nexus-up           Start litellm + nexus-router only"
	@echo "make nexus-down         Stop litellm + nexus-router"
	@echo "make health             Basic health check endpoints"
	@echo "make bootstrap-ultimate Bring up orchestrator + oracle + all workers"

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
	$(COMPOSE) --profile core --profile gateway --profile workflow --profile crm --profile archon up -d

up-apps:
	$(COMPOSE) --profile apps up -d

up-dev:
	$(COMPOSE) --profile dev up -d

up-workers:
	$(COMPOSE) --profile $(WORKER_PROFILE) up -d

down-workers:
	$(COMPOSE) --profile $(WORKER_PROFILE) down --remove-orphans

nexus-up:
	$(COMPOSE) --profile gateway up -d litellm nexus-router

nexus-down:
	$(COMPOSE) stop nexus-router litellm || true

health:
	@echo "Nexus health:" && curl -fsS http://localhost:$${NEXUS_ROUTER_PORT:-7000}/health || true
	@echo "Nexus MCP health:" && curl -fsS http://localhost:$${NEXUS_MCP_PORT:-8080}/health || true
	@echo "LiteLLM health:" && curl -fsS http://localhost:$${LITELLM_PORT:-4000}/health || true


up-oracle:
	$(COMPOSE) --profile oracle up -d

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
