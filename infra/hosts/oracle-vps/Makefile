# Project Nyra Oracle VPS Makefile

DOCKER_COMPOSE = docker compose
MAIN_COMPOSE = docker-compose.yml
APPS_COMPOSE = docker-compose.apps.yml
GITEA_COMPOSE = docker-compose.gitea.yml
GITEA_ENV = ../../../.env.gitea

.PHONY: up down apps-up apps-down build apps-build logs apps-logs gitea-up gitea-down gitea-ps gitea-logs

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

gitea-up:
	$(DOCKER_COMPOSE) -f $(GITEA_COMPOSE) --env-file $(GITEA_ENV) up -d

gitea-down:
	$(DOCKER_COMPOSE) -f $(GITEA_COMPOSE) --env-file $(GITEA_ENV) down

gitea-ps:
	$(DOCKER_COMPOSE) -f $(GITEA_COMPOSE) --env-file $(GITEA_ENV) ps

gitea-logs:
	$(DOCKER_COMPOSE) -f $(GITEA_COMPOSE) --env-file $(GITEA_ENV) logs -f gitea gitea-runner github-mirror-sync
