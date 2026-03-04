# Project Nyra orchestration Makefile (Docker Compose + monorepo utilities)

SHELL := /bin/bash

COMPOSE_FILE ?= infra/docker-compose.yml
COMPOSE ?= docker compose -f $(COMPOSE_FILE)
STACK_ENV_FILE ?= .env.stack
HEALTH_ENV_FILE ?= $(STACK_ENV_FILE)

DEFAULT_PROFILES ?= core,gateway,workflow,crm,archon,apps,observability,vector
WORKER_PROFILE ?= workers

.PHONY: help install test lint validate compose-config \
  up down restart logs ps pull \
  up-core up-orchestrator up-apps up-dev up-workers up-oracle up-worker-3060 up-worker-3090ti up-worker-5090 \
  down-workers nexus-up nexus-down health stack-up stack-verify scan-env ports bootstrap-import bootstrap-import-apply bootstrap-ultimate bootstrap-oracle bootstrap-worker-3060 bootstrap-worker-3090ti bootstrap-worker-5090

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
	@echo "make health             Stack health checks (uses HEALTH_ENV_FILE/STACK_ENV_FILE)"
	@echo "make stack-up           One-command orchestrator bring-up (uses .env.stack)"
	@echo "make stack-verify       Verify health endpoints + compose status"
	@echo "make scan-env           Build env inventory + missing env reports"
	@echo "make ports              Print canonical ports registry path"
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
	./scripts/verify-stack.sh $(HEALTH_ENV_FILE)



stack-up:
	@test -f $(STACK_ENV_FILE) || (echo "Missing $(STACK_ENV_FILE). Copy .env.stack.example -> $(STACK_ENV_FILE)" && exit 1)
	docker compose --env-file $(STACK_ENV_FILE) -f $(COMPOSE_FILE) --profile core --profile gateway --profile workflow --profile crm --profile archon --profile apps --profile observability --profile vector up -d

stack-verify:
	./scripts/stack/verify-stack.sh $(STACK_ENV_FILE)

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

scan-env:
	python scripts/generate-env-docs.py

ports:
	@echo "See docs/02_ports_registry.md"
