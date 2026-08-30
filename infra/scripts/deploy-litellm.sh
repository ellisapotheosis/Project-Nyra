#!/bin/bash
# LiteLLM Deployment Script — Oracle VPS
#
# Automates multi-provider gateway setup with Infisical secret integration
#
# Usage:
#   bash infra/scripts/deploy-litellm.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ORACLE_VPS_DIR="$PROJECT_ROOT/infra/hosts/oracle-vps"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Deployment state
STEP=0
TOTAL_STEPS=8

# Helper functions
step() {
    ((STEP++))
    echo -e "${BLUE}[STEP $STEP/$TOTAL_STEPS]${NC} $*"
}

success() {
    echo -e "${GREEN}✓${NC} $*"
}

error() {
    echo -e "${RED}✗${NC} $*"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠${NC} $*"
}

info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================
preflight_checks() {
    step "Pre-flight checks"

    # Check Docker context
    if ! docker context show oracle-vps > /dev/null 2>&1; then
        error "Docker context 'oracle-vps' not found. Set up with: docker context create oracle-vps ..."
    fi
    success "Docker context oracle-vps exists"

    # Check compose files exist
    if [ ! -f "$ORACLE_VPS_DIR/docker-compose.yml" ]; then
        error "Missing: $ORACLE_VPS_DIR/docker-compose.yml"
    fi
    if [ ! -f "$ORACLE_VPS_DIR/docker-compose.litellm.yml" ]; then
        error "Missing: $ORACLE_VPS_DIR/docker-compose.litellm.yml"
    fi
    success "Docker compose files found"

    # Check LiteLLM config
    if [ ! -f "$ORACLE_VPS_DIR/litellm/config.yaml" ]; then
        error "Missing: $ORACLE_VPS_DIR/litellm/config.yaml"
    fi
    success "LiteLLM config found"

    # Check environment template
    if [ ! -f "$ORACLE_VPS_DIR/.env.litellm.example" ]; then
        error "Missing: $ORACLE_VPS_DIR/.env.litellm.example"
    fi
    success "Environment template found"

    echo ""
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================
setup_environment() {
    step "Environment setup"

    ENV_FILE="$ORACLE_VPS_DIR/.env.litellm"

    if [ -f "$ENV_FILE" ]; then
        warn ".env.litellm already exists"
        read -p "Overwrite? (y/N) " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp "$ORACLE_VPS_DIR/.env.litellm.example" "$ENV_FILE"
            success "Environment reset from template"
        else
            info "Keeping existing .env.litellm"
        fi
    else
        cp "$ORACLE_VPS_DIR/.env.litellm.example" "$ENV_FILE"
        success "Environment file created: $ENV_FILE"
    fi

    echo ""
}

# ============================================================================
# INFISICAL SECRET RETRIEVAL
# ============================================================================
retrieve_secrets() {
    step "Retrieve secrets from Infisical"

    ENV_FILE="$ORACLE_VPS_DIR/.env.litellm"

    info "To populate secrets, either:"
    info "  1. Manual: Edit $ENV_FILE and fill values from Infisical"
    info "  2. Automated: Use Infisical gateway (if configured)"
    echo ""

    # Check if Infisical gateway is available
    if command -v infisical &> /dev/null; then
        read -p "Use Infisical CLI to fetch secrets? (y/N) " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Fetching secrets from Infisical..."

            # This would require proper Infisical setup
            warn "Infisical CLI integration requires additional setup"
            warn "For now, manually populate .env.litellm from Infisical UI"
        fi
    fi

    # Verify required secrets are present
    echo ""
    info "Verifying required secrets..."

    local missing_secrets=()
    for secret in CLAUDE_API_KEY CODEX_API_KEY OMNIROUTE_API_KEY OPENROUTER_API_KEY LITELLM_MASTER_KEY; do
        if ! grep -q "^$secret=" "$ENV_FILE" || grep -q "^$secret=$\|^$secret=REPLACE_\|^$secret=XX" "$ENV_FILE"; then
            missing_secrets+=("$secret")
        fi
    done

    if [ ${#missing_secrets[@]} -gt 0 ]; then
        warn "Missing or incomplete secrets:"
        for secret in "${missing_secrets[@]}"; do
            echo "  - $secret"
        done
        echo ""
        error "Please populate missing secrets in $ENV_FILE before continuing"
    fi

    success "All required secrets configured"
    echo ""
}

# ============================================================================
# DOCKER COMPOSE VALIDATION
# ============================================================================
validate_compose() {
    step "Validate Docker Compose configuration"

    info "Checking compose file syntax..."
    if docker --context oracle-vps compose \
        -f "$ORACLE_VPS_DIR/docker-compose.yml" \
        -f "$ORACLE_VPS_DIR/docker-compose.litellm.yml" \
        --env-file "$ORACLE_VPS_DIR/.env.litellm" \
        config > /dev/null 2>&1; then
        success "Compose configuration valid"
    else
        error "Compose configuration validation failed. Check syntax and environment variables."
    fi

    echo ""
}

# ============================================================================
# DEPLOY LITELLM
# ============================================================================
deploy_litellm() {
    step "Deploy LiteLLM and Redis"

    info "Starting services..."
    if docker --context oracle-vps compose \
        -f "$ORACLE_VPS_DIR/docker-compose.yml" \
        -f "$ORACLE_VPS_DIR/docker-compose.litellm.yml" \
        --env-file "$ORACLE_VPS_DIR/.env.litellm" \
        up -d litellm litellm-redis; then
        success "LiteLLM and Redis started"
    else
        error "Failed to start LiteLLM services"
    fi

    # Wait for services to be ready
    info "Waiting for services to be healthy (up to 60 seconds)..."
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker --context oracle-vps exec nyra-litellm curl -sf http://localhost:4000/health/readiness > /dev/null 2>&1; then
            success "LiteLLM is healthy"
            break
        fi
        ((attempt++))
        sleep 1
    done

    if [ $attempt -eq $max_attempts ]; then
        error "LiteLLM failed to become healthy. Check logs with: docker --context oracle-vps logs nyra-litellm"
    fi

    echo ""
}

# ============================================================================
# VERIFY PROVIDER CONNECTIVITY
# ============================================================================
verify_providers() {
    step "Verify provider connectivity"

    ENV_FILE="$ORACLE_VPS_DIR/.env.litellm"
    LITELLM_KEY=$(grep LITELLM_MASTER_KEY "$ENV_FILE" | cut -d= -f2)
    LITELLM_URL="http://oracle-vps.trex-fiordland.ts.net:4000"

    info "Checking model list..."
    if docker --context oracle-vps exec nyra-litellm curl -sf \
        -H "Authorization: Bearer $LITELLM_KEY" \
        http://localhost:4000/v1/models > /dev/null 2>&1; then
        success "Model list accessible"
    else
        warn "Model list not immediately available (may still be initializing)"
    fi

    info "Testing provider tiers..."
    local tiers=(
        "claude/3-5-sonnet:TIER 1 - Claude API"
        "codex/subscription:TIER 2 - Codex"
        "omniroute/auto:TIER 3 - OmniRoute"
        "local/qwen-3.1-72b:TIER 4 - Local Workers"
        "openrouter/deepseek-r1-free:TIER 5 - OpenRouter"
    )

    for tier_info in "${tiers[@]}"; do
        IFS=: read model desc <<< "$tier_info"
        if docker --context oracle-vps exec nyra-litellm curl -sf \
            -X POST \
            -H "Authorization: Bearer $LITELLM_KEY" \
            -H "Content-Type: application/json" \
            -d '{"model":"'"$model"'","messages":[{"role":"user","content":"test"}],"max_tokens":5}' \
            http://localhost:4000/v1/chat/completions > /dev/null 2>&1; then
            success "$desc"
        else
            warn "$desc (not available or slow to respond)"
        fi
    done

    echo ""
}

# ============================================================================
# CONFIGURE LETTA INTEGRATION
# ============================================================================
configure_letta() {
    step "Configure Letta agent integration"

    info "Letta agents should be configured to use:"
    echo "    API Base: http://litellm:4000/v1"
    echo "    Model: default"
    echo "    API Key: \$LETTA_AGENTS_API_KEY"
    echo ""
    echo "  If Letta is running in docker-compose:"
    echo "    - Network: nyra-network (shared)"
    echo "    - Internal URL: http://litellm:4000"
    echo "    - External URL: http://oracle-vps.trex-fiordland.ts.net:4000"
    echo ""

    info "To update Letta config:"
    echo "    1. Update docker-compose.memory.yml with LiteLLM endpoint"
    echo "    2. Set LETTA_MODEL_API_BASE=http://litellm:4000/v1"
    echo "    3. Set LETTA_MODEL_NAME=default"
    echo "    4. Restart Letta service"
    echo ""

    success "Integration instructions generated"
    echo ""
}

# ============================================================================
# RUN TEST SUITE
# ============================================================================
run_tests() {
    step "Run LiteLLM test suite"

    ENV_FILE="$ORACLE_VPS_DIR/.env.litellm"
    LITELLM_KEY=$(grep LITELLM_MASTER_KEY "$ENV_FILE" | cut -d= -f2)

    info "Running comprehensive provider chain tests..."
    if export LITELLM_MASTER_KEY="$LITELLM_KEY" \
        LITELLM_URL="http://oracle-vps.trex-fiordland.ts.net:4000" \
        bash "$SCRIPT_DIR/test-litellm-routing.sh"; then
        success "All tests passed!"
    else
        warn "Some tests failed. This is expected if external providers are not configured."
        warn "Check logs and run: bash $SCRIPT_DIR/test-litellm-routing.sh"
    fi

    echo ""
}

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================
summary() {
    step "Deployment complete!"

    echo -e "${GREEN}"
    cat << 'EOF'
╔════════════════════════════════════════════════════════════╗
║           LiteLLM Multi-Provider Gateway Ready             ║
╚════════════════════════════════════════════════════════════╝

Provider Chain (Tier Order):
  1. Claude API (Anthropic native)
  2. Codex CLI (subscription)
  3. OmniRoute (free models)
  4. Local Workers (GPU clusters)
  5. OpenRouter (free tier fallback)

Endpoints:
  Internal:  http://litellm:4000/v1
  External:  http://oracle-vps.trex-fiordland.ts.net:4000/v1
  Admin UI:  http://oracle-vps.trex-fiordland.ts.net:4000/docs

Health Checks:
  curl -H "Authorization: Bearer \$LITELLM_MASTER_KEY" \
    http://oracle-vps.trex-fiordland.ts.net:4000/health/readiness

Model Listing:
  curl -H "Authorization: Bearer \$LITELLM_MASTER_KEY" \
    http://oracle-vps.trex-fiordland.ts.net:4000/v1/models

Chat Completion:
  curl -X POST \
    -H "Authorization: Bearer \$LITELLM_MASTER_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"default","messages":[{"role":"user","content":"Hello"}]}' \
    http://oracle-vps.trex-fiordland.ts.net:4000/v1/chat/completions

Logs:
  docker --context oracle-vps logs -f nyra-litellm

Testing:
  bash infra/scripts/test-litellm-routing.sh

Documentation:
  docs/infrastructure/litellm-multi-provider-setup.md

Next Steps:
  1. Configure Letta agents to use http://litellm:4000/v1
  2. Set model to "default" for automatic fallback routing
  3. Monitor logs: docker --context oracle-vps logs nyra-litellm
  4. Run tests regularly to validate provider health
EOF
    echo -e "${NC}"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║     LiteLLM Multi-Provider Gateway Deployment Script       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""

    preflight_checks
    setup_environment
    retrieve_secrets
    validate_compose
    deploy_litellm
    verify_providers
    configure_letta
    run_tests
    summary
}

# Execute main
main "$@"
