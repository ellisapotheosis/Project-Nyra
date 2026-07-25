# ============================================================================
# Orchestrator — Makefile
# ============================================================================
PROJECT_NAME := orchestrator
include ../../shared/makefiles/infisical.mk

COMPOSE_FILE      := docker-compose.yml
LITELLM_COMPOSE   := docker-compose.litellm.yml
HERMES_COMPOSE    := docker-compose.hermes-gateway.yml
CLAWTEAM_COMPOSE  := docker-compose.clawteam.yml
PROTECTED_COMPOSE := docker-compose.protected.yml
OBS_COMPOSE       := docker-compose.observability.yml

.PHONY: up down restart litellm-up litellm-down hermes-up hermes-down \
        protected-up protected-down clawteam-up clawteam-down \
        logs status litellm-health litellm-models

# ── Main stack ────────────────────────────────────────────────────────────────
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

# ── Canonical LiteLLM gateway ─────────────────────────────────────────────────
litellm-up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) -f $(LITELLM_COMPOSE) up -d

litellm-down:
	$(DC) -f $(COMPOSE_FILE) -f $(LITELLM_COMPOSE) stop litellm litellm-redis

litellm-health:
	@if [ -z "$${LITELLM_MASTER_KEY:-}" ] && [ -f ~/.zsh/secrets ]; then \
	    source ~/.zsh/secrets; \
	fi; \
	curl -sf \
	    -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" \
	    http://localhost:4010/health/readiness \
	    && echo "  LiteLLM: healthy" || echo "  LiteLLM: UNHEALTHY"

litellm-models:
	@if [ -z "$${LITELLM_MASTER_KEY:-}" ] && [ -f ~/.zsh/secrets ]; then \
	    source ~/.zsh/secrets; \
	fi; \
	curl -s \
	    -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" \
	    http://localhost:4010/v1/models | python3 -m json.tool

# ── Hermes gateway ────────────────────────────────────────────────────────────
hermes-up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) -f $(HERMES_COMPOSE) up -d

hermes-down:
	$(DC) -f $(COMPOSE_FILE) -f $(HERMES_COMPOSE) stop hermes-gateway hermes-metrics

hermes-logs:
	$(DC) -f $(HERMES_COMPOSE) logs -f hermes-gateway

# ── ClawTeam ─────────────────────────────────────────────────────────────────
clawteam-up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) -f $(CLAWTEAM_COMPOSE) up -d

clawteam-down:
	$(DC) -f $(COMPOSE_FILE) -f $(CLAWTEAM_COMPOSE) stop

# ── Protected plane (portainer-agent + syncthing) ─────────────────────────────
protected-up:
	COMPOSE_PROJECT_NAME=orchestrator-protected \
	$(INJECT) docker compose -p orchestrator-protected \
	    -f $(PROTECTED_COMPOSE) up -d

protected-down:
	@bash ../../scripts/guarded-down.sh \
	    -p orchestrator-protected -f $(PROTECTED_COMPOSE) down

protected-status:
	docker compose -p orchestrator-protected -f $(PROTECTED_COMPOSE) ps

# ── Full stack (main + litellm + hermes) ─────────────────────────────────────
all-up:
	$(INJECT) $(DC) \
	    -f $(COMPOSE_FILE) \
	    -f $(LITELLM_COMPOSE) \
	    -f $(HERMES_COMPOSE) \
	    up -d
