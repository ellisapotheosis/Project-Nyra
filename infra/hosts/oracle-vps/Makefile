# ============================================================================
# Oracle VPS — Makefile
# ============================================================================
# Secrets are injected via Infisical CLI using credentials from ~/.zsh/secrets.
# If infisical is not installed or INFISICAL_PROJECT_ID is not set, commands
# fall through to plain docker compose (existing .env file used as fallback).
#
# Container naming: COMPOSE_PROJECT_NAME=oracle-vps
# All containers: oracle-vps-<service>  (no "nyra" prefix)
# ============================================================================

PROJECT_NAME := oracle-vps
include ../../shared/makefiles/infisical.mk

COMPOSE_FILE          := docker-compose.yml
FORGEJO_COMPOSE       := docker-compose.forgejo.yml
PROTECTED_COMPOSE     := docker-compose.protected.yml
TAILSCALE_PROXY_COMPOSE := docker-compose.tailscale-proxy.yml
MEMORY_COMPOSE        := docker-compose.memory.yml
APPS_COMPOSE          := docker-compose.apps.yml

.PHONY: up down restart protected-up protected-down tailscale-proxy-up tailscale-proxy-status forgejo-up forgejo-down \
        memory-up memory-down apps-up apps-down logs status pull

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

pull:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) pull

# ── Protected plane (cloudflared + portainer-ce) ──────────────────────────────
# These run under a SEPARATE compose project: oracle-vps-protected
protected-up:
	COMPOSE_PROJECT_NAME=oracle-vps-protected \
	$(INJECT) docker compose -p oracle-vps-protected \
	    -f $(PROTECTED_COMPOSE) up -d

protected-down:
	@echo "Stopping protected services requires --force."
	@bash ../../scripts/guarded-down.sh \
	    -p oracle-vps-protected -f $(PROTECTED_COMPOSE) down

protected-status:
	docker compose -p oracle-vps-protected -f $(PROTECTED_COMPOSE) ps

# Private HTTPS reverse proxy. Keep ORACLE_TAILSCALE_IP unset until the host
# has authenticated to Tailscale; the Compose default binds only to loopback.
tailscale-proxy-up:
	$(INJECT) docker compose -p oracle-vps-tailscale-proxy -f $(TAILSCALE_PROXY_COMPOSE) up -d

tailscale-proxy-status:
	docker compose -p oracle-vps-tailscale-proxy -f $(TAILSCALE_PROXY_COMPOSE) ps

# ── Forgejo ───────────────────────────────────────────────────────────────────
forgejo-up:
	$(INJECT) $(DC) -f $(FORGEJO_COMPOSE) up -d

forgejo-down:
	$(DC) -f $(FORGEJO_COMPOSE) down

forgejo-logs:
	$(DC) -f $(FORGEJO_COMPOSE) logs -f forgejo

# ── Memory plane (Letta + Mem0 + FalkorDB + Qdrant) ──────────────────────────
memory-up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) -f $(MEMORY_COMPOSE) up -d

memory-down:
	$(DC) -f $(COMPOSE_FILE) -f $(MEMORY_COMPOSE) down

# ── Apps overlay ─────────────────────────────────────────────────────────────
apps-up:
	$(INJECT) $(DC) -f $(COMPOSE_FILE) -f $(APPS_COMPOSE) --profile apps up -d

apps-down:
	$(DC) -f $(COMPOSE_FILE) -f $(APPS_COMPOSE) --profile apps stop

# ── LiteLLM health check ──────────────────────────────────────────────────────
litellm-health:
	@curl -sf \
	    -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" \
	    http://localhost:4010/health/readiness \
	    && echo "LiteLLM: healthy" || echo "LiteLLM: UNHEALTHY"

litellm-models:
	@curl -s \
	    -H "Authorization: Bearer $${LITELLM_MASTER_KEY}" \
	    http://localhost:4010/v1/models | python3 -m json.tool
