# Project Nyra Oracle VPS Makefile

DOCKER_COMPOSE = docker compose
MAIN_COMPOSE = docker-compose.yml
APPS_COMPOSE = docker-compose.apps.yml
GITEA_COMPOSE = docker-compose.gitea.yml
GITEA_ENV = ../../../.env.gitea
ROOT_MAKE = $(MAKE) -C ../../..

.PHONY: up down apps-up apps-down build apps-build logs apps-logs gitea-up gitea-down gitea-ps gitea-logs

up:
	$(ROOT_MAKE) up-oracle

down:
	$(ROOT_MAKE) oracle-webapp-twenty-down

apps-up:
	$(ROOT_MAKE) oracle-apps-up

apps-down:
	$(ROOT_MAKE) oracle-apps-down

build:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) build

apps-build:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps build

logs:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) logs -f

apps-logs:
	$(DOCKER_COMPOSE) -f $(MAIN_COMPOSE) -f $(APPS_COMPOSE) --profile apps logs -f

gitea-up:
	$(ROOT_MAKE) gitea-up

gitea-down:
	$(ROOT_MAKE) gitea-down

gitea-ps:
	$(ROOT_MAKE) gitea-ps

gitea-logs:
	$(DOCKER_COMPOSE) -f $(GITEA_COMPOSE) --env-file $(GITEA_ENV) logs -f gitea gitea-runner github-mirror-sync
