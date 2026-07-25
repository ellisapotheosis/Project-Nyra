#!/usr/bin/env bash
# infra/scripts/inject-secrets.sh
#
# Wraps any command with Infisical secret injection.
# Loads credentials from ~/.zsh/secrets (or INFISICAL_* env vars already set),
# then either delegates to `infisical run` or falls through to the command
# with secrets sourced into the environment directly.
#
# Usage:
#   bash ../../scripts/inject-secrets.sh docker compose up -d
#   INFISICAL_PATH=/oracle-vps bash ../../scripts/inject-secrets.sh docker compose ps
#
# Required env vars (set in ~/.zsh/secrets or .env):
#   INFISICAL_PROJECT_ID   — from Infisical project settings
#   INFISICAL_MACHINE_IDENTITY_CLIENT_ID      — machine identity client ID
#   INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET  — machine identity secret
#
# Optional:
#   INFISICAL_ENV   — defaults to "prod"
#   INFISICAL_PATH  — defaults to "/" (set per-host in Makefile or env)
#   INFISICAL_TOKEN — pre-fetched token (skips auth step)

set -euo pipefail

ZSH_SECRETS="${HOME}/.zsh/secrets"
INFISICAL_ENV="${INFISICAL_ENV:-prod}"
INFISICAL_PATH="${INFISICAL_PATH:-/}"

# ── 1. Load credentials from zsh secrets file ────────────────────────────────
if [[ -f "$ZSH_SECRETS" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ZSH_SECRETS"
    set +a
fi

# ── 2. Validate we have something to run ────────────────────────────────────
if [[ $# -eq 0 ]]; then
    echo "[inject-secrets] No command provided." >&2
    exit 1
fi

# ── 3. Try infisical run ─────────────────────────────────────────────────────
if command -v infisical >/dev/null 2>&1; then
    if [[ -n "${INFISICAL_PROJECT_ID:-}" ]]; then
        # Authenticate: prefer pre-fetched token, then machine identity, then CLI login cache
        AUTH_ARGS=()
        if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
            AUTH_ARGS=("--token=${INFISICAL_TOKEN}")
        fi

        exec infisical run \
            "${AUTH_ARGS[@]}" \
            --projectId="${INFISICAL_PROJECT_ID}" \
            --env="${INFISICAL_ENV}" \
            --path="${INFISICAL_PATH}" \
            -- "$@"
    else
        echo "[inject-secrets] INFISICAL_PROJECT_ID not set — running without secret injection." >&2
    fi
else
    echo "[inject-secrets] infisical CLI not found — running without secret injection." >&2
fi

# ── 4. Fallback: run command with env sourced from zsh secrets ───────────────
exec "$@"
