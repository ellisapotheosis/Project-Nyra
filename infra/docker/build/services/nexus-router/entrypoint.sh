#!/bin/bash
# ==============================================================================
# Nexus Router Entrypoint with Infisical Integration
# ==============================================================================
# This script wraps the Nexus Router startup with Infisical CLI to inject
# secrets from Infisical at runtime.
#
# Required Environment Variables:
#   INFISICAL_TOKEN     - Machine identity token for authentication
#
# Optional Environment Variables:
#   INFISICAL_PROJECT_ID - Project ID (default: 8374cea9-e5e8-4050-bda4-b91f25ab30ef)
#   INFISICAL_ENV       - Environment (default: dev)
#   INFISICAL_PATH      - Secret path (default: /shared)
#   NEXUS_CONFIG        - Path to Nexus config file (default: /etc/nexus.toml)
#   DEBUG               - Enable debug output (default: false)
# ==============================================================================

set -eo pipefail

# ==============================================================================
# Configuration
# ==============================================================================

INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"
NEXUS_CONFIG="${NEXUS_CONFIG:-/etc/nexus.toml}"
DEBUG="${DEBUG:-false}"

# ==============================================================================
# Helper Functions
# ==============================================================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [NEXUS-ENTRYPOINT] $*"
}

debug() {
    if [ "$DEBUG" = "true" ]; then
        log "DEBUG: $*"
    fi
}

error() {
    log "ERROR: $*" >&2
}

# ==============================================================================
# Preflight Checks
# ==============================================================================

log "Starting Nexus Router with Infisical integration..."

# Check if Infisical CLI is available
if ! command -v infisical &> /dev/null; then
    error "Infisical CLI not found. Please ensure it is installed."
    exit 1
fi

debug "Infisical CLI version: $(infisical --version)"

# Check if INFISICAL_TOKEN is set
if [ -z "$INFISICAL_TOKEN" ]; then
    error "INFISICAL_TOKEN environment variable is required"
    error "Please set it to a valid Infisical machine identity token"
    exit 1
fi

debug "INFISICAL_TOKEN is set (${#INFISICAL_TOKEN} characters)"
debug "Project ID: $INFISICAL_PROJECT_ID"
debug "Environment: $INFISICAL_ENV"
debug "Secret Path: $INFISICAL_PATH"

# Check if Nexus config exists
if [ -f "$NEXUS_CONFIG" ]; then
    log "Using Nexus config at: $NEXUS_CONFIG"
else
    log "Warning: Nexus config not found at $NEXUS_CONFIG"
    log "Nexus will use default configuration or environment variables"
fi

# ==============================================================================
# Test Infisical Connection
# ==============================================================================

log "Testing Infisical connection..."

if ! infisical secrets list \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$INFISICAL_PATH" \
    --silent &> /dev/null; then
    error "Failed to connect to Infisical or retrieve secrets"
    error "Please verify:"
    error "  1. INFISICAL_TOKEN is valid"
    error "  2. Project ID is correct: $INFISICAL_PROJECT_ID"
    error "  3. Environment exists: $INFISICAL_ENV"
    error "  4. Path exists: $INFISICAL_PATH"
    exit 1
fi

log "Successfully connected to Infisical"

# ==============================================================================
# Start Nexus with Infisical
# ==============================================================================

log "Starting Nexus Router with injected secrets..."

# Run Nexus with Infisical secret injection
exec infisical run \
    --projectId="$INFISICAL_PROJECT_ID" \
    --env="$INFISICAL_ENV" \
    --path="$INFISICAL_PATH" \
    --silent \
    -- "$@"
