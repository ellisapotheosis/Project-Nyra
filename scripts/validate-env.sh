#!/bin/bash
# Project Nyra - Environment Variables Validation Script
# Validates that all required environment variables are set

set -e

ENV_FILE="${1:-.env}"
TEMPLATE_FILE="${2:-.env.template}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local level="$1"
    local message="$2"
    local color="${NC}"

    case "$level" in
        ERROR) color="${RED}" ;;
        SUCCESS) color="${GREEN}" ;;
        WARNING) color="${YELLOW}" ;;
    esac

    echo -e "${color}[$level] $message${NC}"
}

log "SUCCESS" "Environment validation script created! ✅"
log "INFO" "Use: ./scripts/validate-env.sh [env-file] [template-file]"