# ============================================================================
# Worker RTX 5090 — Makefile
# ============================================================================
PROJECT_NAME := worker-rtx5090
include ../../shared/makefiles/infisical.mk

COMPOSE_FILE      := docker-compose.yml
PROTECTED_COMPOSE := docker-compose.protected.yml

.PHONY: up down restart protected-up protected-down logs status vllm-health litellm-health

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

# ── Protected (portainer-agent + syncthing send-only) ─────────────────────────
protected-up:
	COMPOSE_PROJECT_NAME=worker-rtx5090-protected \
	$(INJECT) docker compose -p worker-rtx5090-protected \
	    -f $(PROTECTED_COMPOSE) up -d

protected-down:
	@bash ../../scripts/guarded-down.sh \
	    -p worker-rtx5090-protected -f $(PROTECTED_COMPOSE) down

# ── Health checks ─────────────────────────────────────────────────────────────
vllm-health:
	@curl -sf http://localhost:$${VLLM_PORT:-8000}/health \
	    && echo "vLLM: healthy" || echo "vLLM: UNHEALTHY"

litellm-health:
	@if [ -z "$${LITELLM_MASTER_KEY:-}" ] && [ -f ~/.zsh/secrets ]; then \
	    source ~/.zsh/secrets; \
	fi; \
	curl -sf \
	    -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" \
	    http://localhost:$${LITELLM_PORT:-4000}/health/readiness \
	    && echo "LiteLLM: healthy" || echo "LiteLLM: UNHEALTHY"
