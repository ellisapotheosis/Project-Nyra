#!/usr/bin/env bash
# Nyra devcontainer helper: configure env for worker role sessions
set -euo pipefail

# Workers talk back to orchestrator for services; override URLs per environment as needed
export NYRA_ROLE="worker"
export NYRA_ORCHESTRATOR_URL="${NYRA_ORCHESTRATOR_URL:-http://orchestrator-mini:8000}"
export NEXUS_ROUTER_URL="${NEXUS_ROUTER_URL:-http://orchestrator-mini:12010/nyra/complete}"

cat <<EOF
[nyra-worker-env]
  NYRA_ROLE=$NYRA_ROLE
  NYRA_ORCHESTRATOR_URL=$NYRA_ORCHESTRATOR_URL
  NEXUS_ROUTER_URL=$NEXUS_ROUTER_URL
EOF
