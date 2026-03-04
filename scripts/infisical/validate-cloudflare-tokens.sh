#!/bin/bash

################################################################################
# Project Nyra - Cloudflare Tunnel Token Validation Script
################################################################################
# Validates that Cloudflare tunnel tokens are properly stored in Infisical
# and accessible by services
#
# Usage:
#   ./validate-cloudflare-tokens.sh [--environment production|development] [--verbose]
#
# Exit Codes:
#   0 - All validations passed
#   1 - One or more validations failed
#   2 - Prerequisites not met
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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENVIRONMENT="${1:-development}"
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Infisical paths for each service
declare -A INFISICAL_PATHS=(
    ["orchestrator"]="/nyra/orchestrator"
    ["worker-rtx5090"]="/nyra/worker-rtx5090"
    ["worker-rtx3060"]="/nyra/worker-rtx3060"
    ["worker-rtx3090ti"]="/nyra/worker-rtx3090ti"
    ["claude-flow"]="/nyra/claude-flow"
    ["archon"]="/nyra/archon"
)

# Validation results
declare -A VALIDATION_RESULTS
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[DEBUG]${NC} $1"
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    local prereq_passed=true

    # Check if Infisical CLI is installed
    if ! command -v infisical &> /dev/null; then
        log_error "Infisical CLI not found"
        prereq_passed=false
    else
        log_success "Infisical CLI found: $(infisical --version)"
    fi

    # Check if INFISICAL_TOKEN is set
    if [ -z "${INFISICAL_TOKEN:-}" ]; then
        log_error "INFISICAL_TOKEN environment variable not set"
        prereq_passed=false
    else
        log_success "INFISICAL_TOKEN is set"
    fi

    # Check if docker is available (for container checks)
    if command -v docker &> /dev/null; then
        log_success "Docker found: $(docker --version | head -n1)"
    else
        log_warning "Docker not found (some checks will be skipped)"
    fi

    if [ "$prereq_passed" = false ]; then
        return 2
    fi

    return 0
}

# Function to validate token format
validate_token_format() {
    local token="$1"

    # Check minimum length
    if [ ${#token} -lt 50 ]; then
        return 1
    fi

    # Check if it's base64-like
    if ! echo "$token" | grep -qE '^[A-Za-z0-9+/=]+$'; then
        return 1
    fi

    return 0
}

# Function to check if a secret exists in Infisical
check_secret_exists() {
    local service_name="$1"
    local secret_name="$2"
    local infisical_path="${INFISICAL_PATHS[$service_name]}"

    ((TOTAL_CHECKS++))

    log_debug "Checking secret ${secret_name} for ${service_name} at path ${infisical_path}"

    # Try to get the secret
    local secret_value
    secret_value=$(infisical secrets get \
        --env="${ENVIRONMENT}" \
        --path="${infisical_path}" \
        "${secret_name}" \
        --plain \
        2>/dev/null || echo "")

    if [ -z "$secret_value" ]; then
        log_error "${service_name}: ${secret_name} not found"
        VALIDATION_RESULTS["${service_name}_${secret_name}"]="FAILED"
        ((FAILED_CHECKS++))
        return 1
    else
        log_success "${service_name}: ${secret_name} exists"

        # Validate token format if it's a tunnel token
        if [ "$secret_name" = "CLOUDFLARE_TUNNEL_TOKEN" ]; then
            if validate_token_format "$secret_value"; then
                log_success "${service_name}: Token format is valid"
            else
                log_warning "${service_name}: Token format may be invalid"
                ((WARNING_CHECKS++))
            fi
        fi

        VALIDATION_RESULTS["${service_name}_${secret_name}"]="PASSED"
        ((PASSED_CHECKS++))
        return 0
    fi
}

# Function to validate Infisical agent configuration
validate_agent_config() {
    local service_name="$1"
    local config_path="${PROJECT_ROOT}/bootstrap/configs/infisical/agent-${service_name}.yaml"

    ((TOTAL_CHECKS++))

    log_debug "Validating agent config for ${service_name}"

    if [ ! -f "$config_path" ]; then
        log_warning "${service_name}: Agent config file not found at ${config_path}"
        ((WARNING_CHECKS++))
        return 1
    fi

    # Check if config file has required fields
    if grep -q "infisical:" "$config_path" && \
       grep -q "auth:" "$config_path" && \
       grep -q "sinks:" "$config_path"; then
        log_success "${service_name}: Agent config file is valid"
        ((PASSED_CHECKS++))
        return 0
    else
        log_error "${service_name}: Agent config file is incomplete"
        ((FAILED_CHECKS++))
        return 1
    fi
}

# Function to check if Infisical agent container is running
check_agent_container() {
    local service_name="$1"
    local container_name="nyra-agent-${service_name}"

    ((TOTAL_CHECKS++))

    if ! command -v docker &> /dev/null; then
        log_debug "Docker not available, skipping container check"
        return 0
    fi

    log_debug "Checking if agent container ${container_name} is running"

    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container_name}$"; then
        log_success "${service_name}: Agent container is running"
        ((PASSED_CHECKS++))

        # Check container logs for errors
        if docker logs "$container_name" 2>&1 | tail -n 20 | grep -qi "error\|fatal"; then
            log_warning "${service_name}: Agent container has recent errors in logs"
            ((WARNING_CHECKS++))
        fi

        return 0
    else
        log_warning "${service_name}: Agent container is not running"
        ((WARNING_CHECKS++))
        return 1
    fi
}

# Function to check if secrets file exists in shared volume
check_secrets_file() {
    local service_name="$1"
    local expected_path="/secrets/${service_name}.env"

    ((TOTAL_CHECKS++))

    # This check only works if running inside a container or if volume is mounted
    # For now, we'll just check if the docker volume exists

    if ! command -v docker &> /dev/null; then
        log_debug "Docker not available, skipping secrets file check"
        return 0
    fi

    local volume_name="${service_name}_secrets"

    if docker volume ls --format '{{.Name}}' 2>/dev/null | grep -q "^${volume_name}$"; then
        log_success "${service_name}: Secrets volume exists"
        ((PASSED_CHECKS++))
        return 0
    else
        log_warning "${service_name}: Secrets volume not found (may not be created yet)"
        ((WARNING_CHECKS++))
        return 1
    fi
}

# Function to validate schema compliance
validate_schema_compliance() {
    log_info "Validating against schema..."

    local schema_file="${PROJECT_ROOT}/bootstrap/configs/infisical/cloudflare-secrets-schema.json"

    if [ ! -f "$schema_file" ]; then
        log_warning "Schema file not found, skipping schema validation"
        return 0
    fi

    log_success "Schema file exists at ${schema_file}"

    # Basic schema validation (check if it's valid JSON)
    if command -v jq &> /dev/null; then
        if jq empty "$schema_file" 2>/dev/null; then
            log_success "Schema file is valid JSON"
        else
            log_error "Schema file is not valid JSON"
            return 1
        fi
    fi

    return 0
}

# Function to print summary report
print_summary() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              Validation Summary Report                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Environment:      ${CYAN}${ENVIRONMENT}${NC}"
    echo -e "Total Checks:     ${CYAN}${TOTAL_CHECKS}${NC}"
    echo -e "Passed:           ${GREEN}${PASSED_CHECKS}${NC}"
    echo -e "Failed:           ${RED}${FAILED_CHECKS}${NC}"
    echo -e "Warnings:         ${YELLOW}${WARNING_CHECKS}${NC}"
    echo ""

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}✓ All critical validations passed!${NC}"

        if [ $WARNING_CHECKS -gt 0 ]; then
            echo -e "${YELLOW}⚠ There are ${WARNING_CHECKS} warnings that should be addressed${NC}"
        fi

        return 0
    else
        echo -e "${RED}✗ ${FAILED_CHECKS} validation(s) failed${NC}"
        echo ""
        echo "Failed checks:"
        for key in "${!VALIDATION_RESULTS[@]}"; do
            if [ "${VALIDATION_RESULTS[$key]}" = "FAILED" ]; then
                echo -e "  ${RED}✗${NC} $key"
            fi
        done
        return 1
    fi
}

# Main validation function
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║   Project Nyra - Cloudflare Tunnel Token Validation                  ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Check prerequisites
    if ! check_prerequisites; then
        log_error "Prerequisites check failed"
        exit 2
    fi

    echo ""
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Verbose: ${VERBOSE}"
    echo ""

    # Validate schema compliance
    validate_schema_compliance

    echo ""
    log_info "Validating secrets in Infisical..."
    echo ""

    # Check each service
    for service_name in "${!INFISICAL_PATHS[@]}"; do
        echo -e "${CYAN}Checking ${service_name}...${NC}"

        # Check if CLOUDFLARE_TUNNEL_TOKEN exists
        check_secret_exists "$service_name" "CLOUDFLARE_TUNNEL_TOKEN"

        # Check if CLOUDFLARE_TUNNEL_NAME exists (optional)
        check_secret_exists "$service_name" "CLOUDFLARE_TUNNEL_NAME" || true

        # Validate agent configuration
        validate_agent_config "$service_name" || true

        # Check if agent container is running
        check_agent_container "$service_name" || true

        # Check if secrets file exists in shared volume
        check_secrets_file "$service_name" || true

        echo ""
    done

    # Print summary
    print_summary

    local exit_code=$?

    echo ""
    if [ $exit_code -eq 0 ]; then
        log_success "Validation complete - All systems operational"
    else
        log_error "Validation complete - Issues detected"
    fi

    exit $exit_code
}

# Run main function
main "$@"
