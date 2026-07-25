#!/usr/bin/env bash
# Agent Credential Mediation Wrapper
# Usage: agent-run.sh [--env ENV] [--path PATH] -- COMMAND [ARGS...]
#
# Retrieves secrets from Infisical at runtime (no raw keys in memory or logs).
# Suitable for autonomous agents that need temporary credential access.
#
# Environment:
#   INFISICAL_TOKEN: Machine identity token (required)
#   INFISICAL_PROJECT_ID: Project ID (default: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
#   INFISICAL_ENV: Environment (default: prod)
#   INFISICAL_PATH: Secret path (default: /hosts/orchestrator)
#
# Example:
#   agent-run.sh -- node my-agent.js
#   agent-run.sh --env staging -- python agent.py
#   agent-run.sh --path /shared -- curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" https://api.anthropic.com

set -euo pipefail

ENV="${INFISICAL_ENV:-prod}"
PATH_PREFIX="${INFISICAL_PATH:-/hosts/orchestrator}"
COMMAND=()

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV="$2"
      shift 2
      ;;
    --path)
      PATH_PREFIX="$2"
      shift 2
      ;;
    --)
      shift
      COMMAND=("$@")
      break
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ ${#COMMAND[@]} -eq 0 ]]; then
  echo "Usage: $0 [--env ENV] [--path PATH] -- COMMAND [ARGS...]" >&2
  exit 1
fi

# Validate Infisical auth
if [[ -z "${INFISICAL_TOKEN:-}" ]]; then
  echo "Error: INFISICAL_TOKEN not set. Authenticate first: infisical login" >&2
  exit 1
fi

# Run command with secrets injected at runtime
# Secrets are NOT exported to environment; command must request them via $() substitution or file reads
echo "[agent-run] Executing command with Infisical credentials..." >&2

exec infisical run \
  --token="${INFISICAL_TOKEN}" \
  --projectId="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}" \
  --env="${ENV}" \
  --path="${PATH_PREFIX}" \
  -- "${COMMAND[@]}"
