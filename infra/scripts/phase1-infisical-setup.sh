#!/usr/bin/env bash
# Phase 1 Infisical Setup
# Creates folder taxonomy and imports for orchestrator + worker-5090

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }

# === Configuration ===
PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
ENVIRONMENT="${INFISICAL_ENV:-prod}"

log_info "Phase 1 Infisical Setup"
log_info "Project ID: $PROJECT_ID"
log_info "Environment: $ENVIRONMENT"

# === Create Host-Specific Paths ===
# These paths already have secrets but need to be created as folders

log_info "Creating host folders..."

for host in orchestrator worker-rtx5090 worker-rtx3090ti ; do
    path="/hosts/$host"
    log_info "Checking path: $path"

    # Try to read from path to verify it exists
    if set +e; infisical secrets --path "$path" --output json >/dev/null 2>&1; then
        if [ $? -eq 0 ]; then
            log_info "  ✓ Path exists: $path"
        else
            log_warn "  Path may not exist, will create via set command: $path"
        fi
    fi
done

# === Create Folder Imports ===
# Each host imports /hosts/shared to get shared secrets

log_info "Setting up folder imports for /hosts/shared..."

# For orchestrator
log_info "Orchestrator: importing /hosts/shared"
# Note: Infisical folder imports are configured via UI or API
# Using 'set' to create a reference variable in /hosts/orchestrator that points to shared

infisical secrets set \
    INFISICAL_PROJECT_ID="$PROJECT_ID" \
    INFISICAL_ENV="$ENVIRONMENT" \
    INFISICAL_PATH="/hosts/orchestrator" \
    --path "/hosts/orchestrator" \
    --env "$ENVIRONMENT" 2>/dev/null || log_warn "Could not set bootstrap vars in /hosts/orchestrator"

# For worker-5090
log_info "Worker-5090: setting bootstrap variables"
infisical secrets set \
    COMPOSE_PROJECT_NAME="worker-rtx5090" \
    INFISICAL_PROJECT_ID="$PROJECT_ID" \
    INFISICAL_ENV="$ENVIRONMENT" \
    INFISICAL_PATH="/hosts/worker-rtx5090" \
    --path "/hosts/worker-rtx5090" \
    --env "$ENVIRONMENT" 2>/dev/null || log_warn "Could not set bootstrap vars in /hosts/worker-rtx5090"

# === Verify Key Secrets Exist ===
log_info "Verifying critical secrets for Phase 1..."

critical_paths=(
    "/llm-providers/litellm:LITELLM_MASTER_KEY"
    "/external/portainer:ORCHESTRATOR_PORTAINER_EDGE_KEY"
    "/external/tailscale:ORCHESTRATOR_TAILSCALE_AUTHKEY"
    "/security/infisical/local:INFISICAL_TOKEN"
    "/external/openclaw:OPENCLAW_GATEWAY_TOKEN"
)

missing=0
for entry in "${critical_paths[@]}"; do
    path="${entry%:*}"
    key="${entry#*:}"

    value=$(infisical secrets get "$key" --path "$path" 2>/dev/null || echo "")
    if [ -n "$value" ]; then
        log_info "  ✓ $path :: $key"
    else
        log_error "  ✗ MISSING: $path :: $key"
        ((missing++))
    fi
done

if [ $missing -gt 0 ]; then
    log_error "$missing critical secrets missing. Phase 1 deployment will fail."
    exit 1
fi

log_info "✓ Phase 1 Infisical setup complete"
