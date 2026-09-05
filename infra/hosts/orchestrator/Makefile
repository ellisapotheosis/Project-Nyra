# ============================================================================
# Orchestrator — Makefile
# ============================================================================
PROJECT_NAME := orchestrator
include ../../shared/makefiles/infisical.mk

# The orchestrator LiteLLM overlay was REMOVED. LiteLLM runs on oracle-vps
# only, from the root compose.yaml `oracle` profile — one control plane.
# orchestrator's model-plane role is the CPU memory-manager host: see
# `memory-*` below and the root compose.yaml `orchestrator` profile.
ROOT_COMPOSE      := ../../../compose.yaml
COMPOSE_FILE      := docker-compose.yml
HERMES_COMPOSE    := docker-compose.hermes-gateway.yml
CLAWTEAM_COMPOSE  := docker-compose.clawteam.yml
PROTECTED_COMPOSE := docker-compose.protected.yml
OBS_COMPOSE       := docker-compose.observability.yml

.PHONY: up down restart hermes-up hermes-down \
        protected-up protected-down clawteam-up clawteam-down \
        logs status memory-up memory-down memory-health

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

# ── Memory-manager plane (embeddings + BitNet), root compose profile ─────────
# No auth headers here on purpose: these are unauthenticated Tailnet-only
# origins behind LiteLLM, exactly like the vLLM workers. The scoped-key surface
# is the LiteLLM gateway on oracle-vps, not these origins.
memory-up:
	docker compose -f $(ROOT_COMPOSE) --profile orchestrator up -d --build

memory-down:
	docker compose -f $(ROOT_COMPOSE) --profile orchestrator stop \
	    embeddings memory-manager

memory-health:
	@curl -fsS http://100.64.0.10:8081/health >/dev/null \
	    && echo "  embeddings:     healthy" || echo "  embeddings:     UNHEALTHY"
	@curl -fsS http://100.64.0.10:8087/health >/dev/null \
	    && echo "  memory-manager: healthy" || echo "  memory-manager: UNHEALTHY"

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

# ── Full stack (main + hermes) ───────────────────────────────────────────────
all-up:
	$(INJECT) $(DC) \
	    -f $(COMPOSE_FILE) \
	    -f $(HERMES_COMPOSE) \
	    up -d
