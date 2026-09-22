# Project Nyra host orchestration
#
# Canonical topology: orchestrator, oracle-vps, worker-rtx5090, and
# worker-rtx3090ti.

SHELL := /usr/bin/env bash

INFISICAL_PROJECT_ID := 8374cea9-e5e8-4050-bda4-b91f25ab30ef
# Use a simple assignment so a malformed inherited self-reference cannot break
# every Make target; a command-line value still overrides this default.
INFISICAL_ENV := prod
ORCHESTRATOR_CONTEXT ?= orchestrator
ORACLE_CONTEXT ?= oracle-vps
WORKER_5090_CONTEXT ?= default
WORKER_3090TI_CONTEXT ?= worker-rtx3090ti

ORCHESTRATOR_PROJECT := orchestrator
ORACLE_PROJECT := oracle-vps
WORKER_5090_PROJECT := worker-rtx5090
WORKER_3090TI_PROJECT := worker-rtx3090ti

ORCHESTRATOR_COMPOSE := infra/hosts/orchestrator/docker-compose.yml
ORACLE_COMPOSE := infra/hosts/oracle-vps/docker-compose.yml
WORKER_5090_COMPOSE := infra/hosts/worker-rtx5090/docker-compose.yml
WORKER_3090TI_COMPOSE := infra/hosts/worker-rtx3090ti/docker-compose.yml
HOSTS := orchestrator oracle-vps worker-rtx5090 worker-rtx3090ti
HOST_EXAMPLES := $(foreach host,$(HOSTS),infra/hosts/$(host)/.env.example)

# Compose interpolation happens on the client. Infisical wraps the Docker
# command itself; a sidecar cannot provide variables early enough.
INFISICAL_RUN = infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(INFISICAL_ENV) --path=/hosts/$(1) --
COMPOSE = $(INFISICAL_RUN) env COMPOSE_PROJECT_NAME=$(2) docker --context $(3) compose --env-file /dev/null -f $(4)

.DEFAULT_GOAL := help
.PHONY: help context-check host-env-examples compose-config stack-status \
  openclaw-status worker-5090-config worker-3090ti-config \
  clean-local-wrong-host-containers \
  up-orchestrator up-oracle up-worker-5090 up-worker-3090ti \
  down-orchestrator down-oracle down-worker-5090 down-worker-3090ti \
  up-all down-all validate makefile-check

help:
	@printf '%s\n' \
	  'Project Nyra host orchestration' \
	  '' \
	  'Read-only checks:' \
	  '  make context-check       Check Docker daemon reachability' \
	  '  make stack-status        Show containers on every node' \
	  '  make compose-config      Validate canonical Compose files' \
	  '  make openclaw-status     Check local and orchestrator OpenClaw' \
	  '  make clean-local-wrong-host-containers  Remove only stale created cross-host containers' \
	  '' \
	  'Mutating targets (Infisical-wrapped):' \
	  '  make up-worker-5090      Start this PC worker stack' \
	  '  make up-worker-3090ti    Start the 3090 Ti stack when online' \
	  '  make up-orchestrator     Start the orchestrator stack' \
	  '  make up-oracle           Start the Oracle stack' \
	  '  make up-all              Start all reachable canonical stacks'

context-check:
	@set -e; for context in $(WORKER_5090_CONTEXT) $(ORCHESTRATOR_CONTEXT) $(ORACLE_CONTEXT) $(WORKER_3090TI_CONTEXT); do \
	  printf '%-22s ' "$$context"; \
	  if timeout 20s docker --context "$$context" version --format 'server={{.Server.Version}}' 2>/dev/null; then :; else echo 'UNREACHABLE'; fi; \
	done

host-env-examples:
	@set -e; for file in $(HOST_EXAMPLES); do test -f "$$file" || { echo "missing $$file"; exit 1; }; done
	@test -f infra/hosts/shared.env || { echo 'missing infra/hosts/shared.env'; exit 1; }
	@echo 'Host env contracts present.'

compose-config:
	@set -e; \
	$(call COMPOSE,$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_CONTEXT),$(ORCHESTRATOR_COMPOSE)) config --quiet; \
	$(call COMPOSE,$(ORACLE_PROJECT),$(ORACLE_PROJECT),$(ORACLE_CONTEXT),$(ORACLE_COMPOSE)) config --quiet; \
	$(call COMPOSE,$(WORKER_5090_PROJECT),$(WORKER_5090_PROJECT),$(WORKER_5090_CONTEXT),$(WORKER_5090_COMPOSE)) config --quiet; \
	$(call COMPOSE,$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_CONTEXT),$(WORKER_3090TI_COMPOSE)) config --quiet

stack-status:
	@for pair in 'orchestrator $(ORCHESTRATOR_CONTEXT) $(ORCHESTRATOR_COMPOSE)' \
	            'oracle-vps $(ORACLE_CONTEXT) $(ORACLE_COMPOSE)' \
	            'worker-rtx5090 $(WORKER_5090_CONTEXT) $(WORKER_5090_COMPOSE)' \
	            'worker-rtx3090ti $(WORKER_3090TI_CONTEXT) $(WORKER_3090TI_COMPOSE)'; do \
	  set -- $$pair; printf '\n[%s]\n' "$$1"; timeout 20s docker --context "$$2" ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' || true; \
	done

clean-local-wrong-host-containers:
	@set -e; for id in $$(docker ps -aq --filter status=created); do \
	  wd=$$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$$id" 2>/dev/null || true); \
	  project=$$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$$id" 2>/dev/null || true); \
	  if [[ "$$wd" == *'/infra/hosts/oracle-vps' || "$$project" == 'homeassistant' ]]; then \
	    name=$$(docker inspect -f '{{.Name}}' "$$id" | sed 's#^/##'); \
	    printf 'Removing stale created container %s\n' "$$name"; docker rm "$$id"; \
	  fi; \
	done

openclaw-status:
	@printf '%s\n' '[local OpenClaw]'; systemctl --user --no-pager status openclaw-gateway.service 2>/dev/null || true
	@printf '%s\n' '[orchestrator OpenClaw]'; timeout 20s docker --context $(ORCHESTRATOR_CONTEXT) ps --filter name=openclaw-gateway --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || true

worker-5090-config:
	@$(call COMPOSE,$(WORKER_5090_PROJECT),$(WORKER_5090_PROJECT),$(WORKER_5090_CONTEXT),$(WORKER_5090_COMPOSE)) config --services

worker-3090ti-config:
	@$(call COMPOSE,$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_CONTEXT),$(WORKER_3090TI_COMPOSE)) config --services

up-orchestrator:
	@$(call COMPOSE,$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_CONTEXT),$(ORCHESTRATOR_COMPOSE)) up -d

up-oracle:
	@$(call COMPOSE,$(ORACLE_PROJECT),$(ORACLE_PROJECT),$(ORACLE_CONTEXT),$(ORACLE_COMPOSE)) up -d

up-worker-5090:
	@$(call COMPOSE,$(WORKER_5090_PROJECT),$(WORKER_5090_PROJECT),$(WORKER_5090_CONTEXT),$(WORKER_5090_COMPOSE)) up -d

up-worker-3090ti:
	@$(call COMPOSE,$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_CONTEXT),$(WORKER_3090TI_COMPOSE)) up -d

down-orchestrator:
	@$(call COMPOSE,$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_PROJECT),$(ORCHESTRATOR_CONTEXT),$(ORCHESTRATOR_COMPOSE)) down

down-oracle:
	@$(call COMPOSE,$(ORACLE_PROJECT),$(ORACLE_PROJECT),$(ORACLE_CONTEXT),$(ORACLE_COMPOSE)) down

down-worker-5090:
	@$(call COMPOSE,$(WORKER_5090_PROJECT),$(WORKER_5090_PROJECT),$(WORKER_5090_CONTEXT),$(WORKER_5090_COMPOSE)) down

down-worker-3090ti:
	@$(call COMPOSE,$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_PROJECT),$(WORKER_3090TI_CONTEXT),$(WORKER_3090TI_COMPOSE)) down

up-all: up-orchestrator up-oracle up-worker-5090 up-worker-3090ti

down-all: down-worker-3090ti down-worker-5090 down-orchestrator down-oracle

validate: host-env-examples compose-config makefile-check

makefile-check:
	@echo 'Makefile topology check passed.'
