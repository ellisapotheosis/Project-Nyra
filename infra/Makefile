# Project Nyra infra Makefile (canonicalized)

SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
MAIN_COMPOSE := hosts/orchestrator/docker-compose.orchestrator.yml
ORACLE_COMPOSE := hosts/oracle-vps/docker-compose.oracle.yml
WORKERS_COMPOSE := hosts/docker-compose.workers.yml
CLOUDFLARED_COMPOSE := hosts/orchestrator/docker-compose.cloudflared.yml

SERVICE ?=
WORKER ?=all

.PHONY: help verify-paths init bootstrap up down logs health build test dev \
	db-init db-backup \
	worker-up worker-down oracle-up oracle-down oracle-logs \
	tunnel-start tunnel-stop tunnel-setup port-discovery verify-connectivity \
	clean reset

help:
	@echo "Project Nyra Infra"
	@echo "=================="
	@echo "make verify-paths       Validate makefile file/script references"
	@echo "make init               Install dependencies and bootstrap .env"
	@echo "make bootstrap          Compatibility alias for init + up"
	@echo "make up|down            Start/stop core infra stack"
	@echo "make logs SERVICE=name  Tail logs (all services if SERVICE unset)"
	@echo "make health             Run infra health checks"
	@echo "make db-init            Compatibility init for the core postgres databases"
	@echo "make db-backup          Run the canonical backup script"
	@echo "make worker-up          Start worker compose stack"
	@echo "make worker-down        Stop worker compose stack"
	@echo "make oracle-up          Start Oracle VPS host stack"
	@echo "make oracle-down        Stop Oracle VPS host stack"
	@echo "make tunnel-start       Start cloudflared compose profile"
	@echo "make tunnel-stop        Stop cloudflared compose profile"
	@echo "make port-discovery     Run port discovery script"
	@echo "make verify-connectivity Run connectivity verification"

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
	@test -f ../.env || cp environments/templates/root/.env.template ../.env
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
	cd .. && pnpm -r --if-present test

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
