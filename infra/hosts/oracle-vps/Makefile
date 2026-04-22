# Project Nyra Oracle VPS Makefile

DOCKER_COMPOSE = docker compose
MAIN_COMPOSE = docker-compose.yml
APPS_COMPOSE = docker-compose.apps.yml

.PHONY: up down apps-up apps-down build apps-build logs apps-logs

up:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) down

apps-up:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps up -d

apps-down:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps stop

build:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) build

apps-build:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps build

logs:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) logs -f

apps-logs:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps logs -f
