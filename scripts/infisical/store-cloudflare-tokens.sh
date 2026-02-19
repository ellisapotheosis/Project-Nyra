#!/bin/bash

################################################################################
# Project Nyra - Cloudflare Tunnel Token Storage Script
################################################################################
# Stores Cloudflare tunnel tokens in Infisical for secure secret management
# across distributed 4-PC cluster
#
# Usage:
#   ./store-cloudflare-tokens.sh [--environment production|development]
#
# Prerequisites:
#   - Infisical CLI installed (https://infisical.com/docs/cli/overview)
#   - Valid Infisical authentication token
#   - INFISICAL_TOKEN environment variable set
#
# Author: Project Nyra Team
# Date: 2026-01-15
################################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENVIRONMENT="${1:-development}"

# Infisical paths for each service
declare -A INFISICAL_PATHS=(
    ["orchestrator"]="/nyra/orchestrator"
    ["worker-rtx5090"]="/nyra/worker-rtx5090"
    ["worker-rtx3060"]="/nyra/worker-rtx3060"
    ["worker-rtx3090ti"]="/nyra/worker-rtx3090ti"
    ["claude-flow"]="/nyra/claude-flow"
    ["archon"]="/nyra/archon"
)

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Infisical CLI is installed
    if ! command -v infisical &> /dev/null; then
        log_error "Infisical CLI not found. Please install it first:"
        log_error "  brew install infisical/get-cli/infisical  # macOS"
        log_error "  curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo -E bash && sudo apt-get install infisical  # Linux"
        exit 1
    fi

    # Check if INFISICAL_TOKEN is set
    if [ -z "${INFISICAL_TOKEN:-}" ]; then
        log_error "INFISICAL_TOKEN environment variable not set"
        log_error "Please set it with: export INFISICAL_TOKEN=your_token_here"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Function to validate Cloudflare token format
validate_token_format() {
    local token="$1"

    # Basic validation: Cloudflare tunnel tokens are base64-encoded and quite long
    if [ ${#token} -lt 50 ]; then
        return 1
    fi

    # Check if it's base64-like (alphanumeric, +, /, =)
    if ! echo "$token" | grep -qE '^[A-Za-z0-9+/=]+$'; then
        return 1
    fi

    return 0
}

# Function to store a token in Infisical
store_token() {
    local service_name="$1"
    local token_value="$2"
    local infisical_path="${INFISICAL_PATHS[$service_name]}"

    log_info "Storing Cloudflare tunnel token for ${service_name}..."

    # Validate token format
    if ! validate_token_format "$token_value"; then
        log_warning "Token format validation failed for ${service_name}"
        log_warning "Continuing anyway (token might be in a different format)"
    fi

    # Store token using Infisical CLI
    if infisical secrets set \
        --env="${ENVIRONMENT}" \
        --path="${infisical_path}" \
        "CLOUDFLARE_TUNNEL_TOKEN=${token_value}" \
        2>/dev/null; then
        log_success "Token stored successfully for ${service_name}"
        return 0
    else
        log_error "Failed to store token for ${service_name}"
        return 1
    fi
}

# Function to store tunnel name
store_tunnel_name() {
    local service_name="$1"
    local tunnel_name="$2"
    local infisical_path="${INFISICAL_PATHS[$service_name]}"

    log_info "Storing Cloudflare tunnel name for ${service_name}..."

    if infisical secrets set \
        --env="${ENVIRONMENT}" \
        --path="${infisical_path}" \
        "CLOUDFLARE_TUNNEL_NAME=${tunnel_name}" \
        2>/dev/null; then
        log_success "Tunnel name stored successfully for ${service_name}"
        return 0
    else
        log_error "Failed to store tunnel name for ${service_name}"
        return 1
    fi
}

# Function to load tokens from environment file
load_tokens_from_env() {
    local env_file="${PROJECT_ROOT}/.env.cloudflare"

    if [ ! -f "$env_file" ]; then
        log_warning "Environment file not found: ${env_file}"
        return 1
    fi

    log_info "Loading tokens from ${env_file}..."

    # Source the environment file
    set -a
    source "$env_file"
    set +a

    log_success "Tokens loaded from environment file"
}

# Function to interactively input tokens
interactive_token_input() {
    log_info "Interactive token input mode"
    echo ""

    for service_name in "${!INFISICAL_PATHS[@]}"; do
        echo -e "${BLUE}Enter Cloudflare tunnel token for ${service_name}:${NC}"
        read -r -s token_value
        echo ""

        if [ -n "$token_value" ]; then
            store_token "$service_name" "$token_value"

            # Optionally store tunnel name
            echo -e "${BLUE}Enter Cloudflare tunnel name for ${service_name} (optional, press Enter to skip):${NC}"
            read -r tunnel_name

            if [ -n "$tunnel_name" ]; then
                store_tunnel_name "$service_name" "$tunnel_name"
            fi
        else
            log_warning "Skipping ${service_name} (no token provided)"
        fi

        echo ""
    done
}

# Function to store all tokens from environment variables
store_all_tokens_from_env() {
    log_info "Storing all tokens from environment variables..."

    local stored_count=0
    local failed_count=0

    # Orchestrator
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR:-}" ]; then
        if store_token "orchestrator" "$CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR:-}" ]; then
            store_tunnel_name "orchestrator" "$CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR"
        fi
    fi

    # Worker RTX 5090
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090:-}" ]; then
        if store_token "worker-rtx5090" "$CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090:-}" ]; then
            store_tunnel_name "worker-rtx5090" "$CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090"
        fi
    fi

    # Worker RTX 3060
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060:-}" ]; then
        if store_token "worker-rtx3060" "$CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060:-}" ]; then
            store_tunnel_name "worker-rtx3060" "$CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060"
        fi
    fi

    # Worker RTX 3090Ti
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI:-}" ]; then
        if store_token "worker-rtx3090ti" "$CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI:-}" ]; then
            store_tunnel_name "worker-rtx3090ti" "$CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI"
        fi
    fi

    # Claude Flow
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_CLAUDE_FLOW:-}" ]; then
        if store_token "claude-flow" "$CLOUDFLARE_TUNNEL_TOKEN_CLAUDE_FLOW"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_CLAUDE_FLOW:-}" ]; then
            store_tunnel_name "claude-flow" "$CLOUDFLARE_TUNNEL_NAME_CLAUDE_FLOW"
        fi
    fi

    # Archon
    if [ -n "${CLOUDFLARE_TUNNEL_TOKEN_ARCHON:-}" ]; then
        if store_token "archon" "$CLOUDFLARE_TUNNEL_TOKEN_ARCHON"; then
            ((stored_count++))
        else
            ((failed_count++))
        fi

        if [ -n "${CLOUDFLARE_TUNNEL_NAME_ARCHON:-}" ]; then
            store_tunnel_name "archon" "$CLOUDFLARE_TUNNEL_NAME_ARCHON"
        fi
    fi

    log_success "Stored ${stored_count} tokens successfully"

    if [ $failed_count -gt 0 ]; then
        log_error "Failed to store ${failed_count} tokens"
        return 1
    fi

    return 0
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║   Project Nyra - Cloudflare Tunnel Token Storage (Infisical)         ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_prerequisites

    echo ""
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Project Root: ${PROJECT_ROOT}"
    echo ""

    # Try to load from environment file first
    if load_tokens_from_env; then
        store_all_tokens_from_env
    else
        # Fall back to interactive input
        log_info "No .env.cloudflare file found, switching to interactive mode"
        interactive_token_input
    fi

    echo ""
    log_success "Token storage complete!"
    log_info "Tokens are now stored in Infisical and can be accessed by services"
    log_info "Run './validate-cloudflare-tokens.sh' to verify the tokens"
}

# Run main function
main "$@"
