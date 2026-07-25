# ============================================================================
# Worker RTX 3090Ti — Makefile
# ============================================================================
PROJECT_NAME := worker-rtx3090ti
include ../../shared/makefiles/infisical.mk

COMPOSE_FILE      := docker-compose.yml
PROTECTED_COMPOSE := docker-compose.protected.yml

.PHONY: up down restart protected-up protected-down logs status vllm-health

up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) up -d

down:
	@bash ../../scripts/guarded-down.sh -p $(COMPOSE_PROJECT) -f $(COMPOSE_FILE) down

restart:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) up -d --force-recreate

logs:
	$(DC) -f $(COMPOSE_FILE) logs -f --tail=100

status:
	$(DC) -f $(COMPOSE_FILE) ps

protected-up:
	COMPOSE_PROJECT_NAME=worker-rtx3090ti-protected \
	$(INJECT) docker compose -p worker-rtx3090ti-protected \
	    -f $(PROTECTED_COMPOSE) up -d

protected-down:
	@bash ../../scripts/guarded-down.sh \
	    -p worker-rtx3090ti-protected -f $(PROTECTED_COMPOSE) down

vllm-health:
	@curl -sf http://localhost:$${VLLM_PORT:-8000}/health \
	    && echo "vLLM: healthy" || echo "vLLM: UNHEALTHY"
