# infra/shared/makefiles/infisical.mk
#
# Include this fragment in any host Makefile to get:
#   - Infisical-backed secret injection via $(INJECT)
#   - Protected-container guard via $(GUARDED_DOWN)
#   - Standardised project naming via $(COMPOSE_PROJECT)
#
# Usage in your Makefile:
#   PROJECT_NAME  := oracle-vps          # must be set BEFORE include
#   INFISICAL_PATH_OVERRIDE := /oracle   # optional override (default: /$(PROJECT_NAME))
#   include ../../shared/makefiles/infisical.mk

SHELL         := /bin/bash
.SHELLFLAGS   := -euo pipefail -c

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPTS_DIR    := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))../../scripts
INJECT         := INFISICAL_PATH=$(or $(INFISICAL_PATH_OVERRIDE),/$(PROJECT_NAME)) \
                  bash $(SCRIPTS_DIR)/inject-secrets.sh
GUARDED_DOWN   := bash $(SCRIPTS_DIR)/guarded-down.sh

# ── Docker Compose project name ───────────────────────────────────────────────
# Containers are named <PROJECT_NAME>-<service>.  Never "nyra-" anything.
COMPOSE_PROJECT := $(PROJECT_NAME)
DC              := COMPOSE_PROJECT_NAME=$(COMPOSE_PROJECT) docker compose -p $(COMPOSE_PROJECT)

# ── Convenience targets (available in every host Makefile) ────────────────────
.PHONY: ps logs shell secrets-check

ps:
	$(DC) ps

logs:
	$(DC) logs -f --tail=100

secrets-check:
	@echo "[secrets-check] Verifying Infisical credentials..."
	@INFISICAL_PATH=/$(PROJECT_NAME) bash $(SCRIPTS_DIR)/inject-secrets.sh \
	    infisical secrets list --projectId="$${INFISICAL_PROJECT_ID:-}" \
	    --env="$${INFISICAL_ENV:-prod}" --path="/$(PROJECT_NAME)" \
	    || echo "[secrets-check] Could not list secrets — check credentials."
