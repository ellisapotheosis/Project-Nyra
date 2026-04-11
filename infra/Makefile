# Project Nyra infra Makefile (canonicalized)

SHELL := /bin/bash

DOCKER_COMPOSE ?= docker compose
MAIN_COMPOSE := docker-compose.yml
ORACLE_COMPOSE := hosts/oracle-vps/docker-compose.oracle.yml
WORKERS_COMPOSE := hosts/docker-compose.workers.yml
CLOUDFLARED_COMPOSE := compose/docker-compose.cloudflared.yml

SERVICE ?=
WORKER ?=all

.PHONY: help verify-paths init up down logs health build test dev \
	worker-up worker-down oracle-up oracle-down oracle-logs \
	tunnel-start tunnel-stop tunnel-setup port-discovery verify-connectivity \
	clean reset

help:
	@echo "Project Nyra Infra"
	@echo "=================="
	@echo "make verify-paths       Validate makefile file/script references"
	@echo "make init               Install dependencies and bootstrap .env"
	@echo "make up|down            Start/stop core infra stack"
	@echo "make logs SERVICE=name  Tail logs (all services if SERVICE unset)"
	@echo "make health             Run infra health checks"
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
	@test -f ../.env || cp env/.env.template ../.env
	@cd .. && pnpm install --frozen-lockfile || (cd .. && pnpm install)

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
	docker system prune -f
	docker volume prune -f

reset:
	@echo "WARNING: this removes containers and volumes for main + worker + oracle stacks."
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) down -v --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(WORKERS_COMPOSE) down -v --remove-orphans || true
	$(DOCKER_COMPOSE) -f $(ORACLE_COMPOSE) down -v --remove-orphans || true
	docker system prune -af
