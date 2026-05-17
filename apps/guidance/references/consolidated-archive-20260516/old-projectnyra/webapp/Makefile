REPO_ROOT ?= ../../..
INFISICAL_PROJECT_ID ?= 8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV ?= dev
APP_INFISICAL_PATH ?= /apps/projectnyra-webapp

.PHONY: infisical-env infisical-run orchestrator-up oracle-apps-up

infisical-env:
	infisical export --projectId=$(INFISICAL_PROJECT_ID) --env=$(INFISICAL_ENV) --path=$(APP_INFISICAL_PATH)

infisical-run:
	infisical run --projectId=$(INFISICAL_PROJECT_ID) --env=$(INFISICAL_ENV) --path=$(APP_INFISICAL_PATH) -- env

orchestrator-up:
	$(MAKE) -C $(REPO_ROOT) orchestrator-up

oracle-apps-up:
	$(MAKE) -C $(REPO_ROOT) oracle-apps-up
