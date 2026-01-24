#!/usr/bin/env bash
# Nyra devcontainer helper: configure env for the orchestrator role
set -euo pipefail

# Role and endpoints for orchestrator-focused sessions
export NYRA_ROLE="orchestrator"
export NYRA_ORCHESTRATOR_URL="${NYRA_ORCHESTRATOR_URL:-http://orchestrator-mini:8000}"
export NEXUS_ROUTER_URL="${NEXUS_ROUTER_URL:-http://orchestrator-mini:12010/nyra/complete}"

cat <<EOF
[nyra-orchestrator-env]
  NYRA_ROLE=$NYRA_ROLE
  NYRA_ORCHESTRATOR_URL=$NYRA_ORCHESTRATOR_URL
  NEXUS_ROUTER_URL=$NEXUS_ROUTER_URL
EOF
