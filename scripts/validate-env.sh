#!/bin/bash
# ==============================================================================
# Project Nyra - Environment Variable Validation Script
# ==============================================================================
# Validates that all required environment variables are set correctly
# Created: 2026-01-13
#
# Usage:
#   ./scripts/validate-env.sh
#   ./scripts/validate-env.sh --strict  # Fail on warnings
#
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
SUCCESS=0

# Strict mode flag
STRICT_MODE=false
if [[ "$1" == "--strict" ]]; then
    STRICT_MODE=true
fi

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Environment Variable Validation${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and fill in the values:${NC}"
    echo -e "  ${BLUE}cp .env.example .env${NC}"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

echo -e "${BLUE}Checking required variables...${NC}"
echo ""

# ==============================================================================
# VALIDATION FUNCTIONS
# ==============================================================================

check_required() {
    local var_name="$1"
    local description="$2"
    local value="${!var_name}"

    if [ -z "$value" ]; then
        echo -e "${RED}✗ $var_name${NC} - MISSING"
        echo -e "  ${YELLOW}Description: $description${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✓ $var_name${NC} - Set"
        ((SUCCESS++))
        return 0
    fi
}

check_optional() {
    local var_name="$1"
    local description="$2"
    local value="${!var_name}"

    if [ -z "$value" ]; then
        echo -e "${YELLOW}⚠ $var_name${NC} - NOT SET (optional)"
        echo -e "  ${YELLOW}Description: $description${NC}"
        ((WARNINGS++))
        if [ "$STRICT_MODE" = true ]; then
            ((ERRORS++))
        fi
        return 1
    else
        echo -e "${GREEN}✓ $var_name${NC} - Set"
        ((SUCCESS++))
        return 0
    fi
}

check_min_length() {
    local var_name="$1"
    local min_length="$2"
    local value="${!var_name}"

    if [ -n "$value" ] && [ ${#value} -lt $min_length ]; then
        echo -e "${YELLOW}⚠ $var_name${NC} - TOO SHORT (minimum $min_length characters)"
        ((WARNINGS++))
        if [ "$STRICT_MODE" = true ]; then
            ((ERRORS++))
        fi
        return 1
    fi
    return 0
}

check_url_format() {
    local var_name="$1"
    local value="${!var_name}"

    if [ -n "$value" ] && [[ ! "$value" =~ ^https?:// ]]; then
        echo -e "${YELLOW}⚠ $var_name${NC} - INVALID URL FORMAT (should start with http:// or https://)"
        ((WARNINGS++))
        return 1
    fi
    return 0
}

check_email_format() {
    local var_name="$1"
    local value="${!var_name}"

    if [ -n "$value" ] && [[ ! "$value" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${YELLOW}⚠ $var_name${NC} - INVALID EMAIL FORMAT"
        ((WARNINGS++))
        return 1
    fi
    return 0
}

check_phone_format() {
    local var_name="$1"
    local value="${!var_name}"

    if [ -n "$value" ] && [[ ! "$value" =~ ^\+[0-9]{11,15}$ ]]; then
        echo -e "${YELLOW}⚠ $var_name${NC} - INVALID PHONE FORMAT (should be +15551234567)"
        ((WARNINGS++))
        return 1
    fi
    return 0
}

# ==============================================================================
# CATEGORY: DATABASE
# ==============================================================================

echo -e "${BLUE}--- Database Configuration ---${NC}"
check_required "POSTGRES_PASSWORD" "PostgreSQL master password"
check_min_length "POSTGRES_PASSWORD" 16
check_required "REDIS_PASSWORD" "Redis authentication password"
check_min_length "REDIS_PASSWORD" 16
check_required "FALKORDB_PASSWORD" "FalkorDB authentication password"
check_min_length "FALKORDB_PASSWORD" 16
echo ""

# ==============================================================================
# CATEGORY: LLM API KEYS
# ==============================================================================

echo -e "${BLUE}--- LLM API Keys ---${NC}"
check_required "ANTHROPIC_API_KEY" "Claude API for complex reasoning"
check_required "GOOGLE_API_KEY" "Gemini API for cost-efficient tasks"
check_optional "OPENROUTER_API_KEY" "Alternative LLM provider"
echo ""

# ==============================================================================
# CATEGORY: NEXUS ROUTER
# ==============================================================================

echo -e "${BLUE}--- Nexus Router ---${NC}"
check_required "NEXUS_JWT_SECRET" "JWT signing key for Nexus Router"
check_min_length "NEXUS_JWT_SECRET" 32
check_required "NEXUS_ADMIN_TOKEN" "Admin API token for Nexus Router"
check_min_length "NEXUS_ADMIN_TOKEN" 32
echo ""

# ==============================================================================
# CATEGORY: WORKFLOW AUTOMATION
# ==============================================================================

echo -e "${BLUE}--- Workflow Automation ---${NC}"
check_required "N8N_BASIC_AUTH_PASSWORD" "n8n admin password"
check_min_length "N8N_BASIC_AUTH_PASSWORD" 8
check_required "N8N_ENCRYPTION_KEY" "n8n data encryption key"
check_min_length "N8N_ENCRYPTION_KEY" 32
echo ""

# ==============================================================================
# CATEGORY: TWENTYCRM
# ==============================================================================

echo -e "${BLUE}--- TwentyCRM ---${NC}"
check_required "TWENTY_ACCESS_TOKEN_SECRET" "Access token signing key"
check_min_length "TWENTY_ACCESS_TOKEN_SECRET" 32
check_required "TWENTY_LOGIN_TOKEN_SECRET" "Login token signing key"
check_min_length "TWENTY_LOGIN_TOKEN_SECRET" 32
check_required "TWENTY_REFRESH_TOKEN_SECRET" "Refresh token signing key"
check_min_length "TWENTY_REFRESH_TOKEN_SECRET" 32
check_required "TWENTY_FILE_TOKEN_SECRET" "File token signing key"
check_min_length "TWENTY_FILE_TOKEN_SECRET" 32
echo ""

# ==============================================================================
# CATEGORY: MEMORY SYSTEMS
# ==============================================================================

echo -e "${BLUE}--- Memory Systems ---${NC}"
check_required "LETTA_API_KEY" "Letta memory server API key"
check_min_length "LETTA_API_KEY" 32
check_required "LETTA_SERVER_PASS" "Letta admin password"
check_min_length "LETTA_SERVER_PASS" 8
check_optional "GRAPHITI_API_KEY" "Graphiti cloud mode (optional - uses local FalkorDB)"
check_optional "MEM0_API_KEY" "Mem0 cloud mode (optional - uses local)"
echo ""

# ==============================================================================
# CATEGORY: COMMUNICATION
# ==============================================================================

echo -e "${BLUE}--- Communication Services ---${NC}"
check_required "TWILIO_ACCOUNT_SID" "Twilio account identifier"
check_required "TWILIO_AUTH_TOKEN" "Twilio authentication token"
check_required "TWILIO_PHONE_NUMBER" "Twilio phone number"
check_phone_format "TWILIO_PHONE_NUMBER"
echo ""

echo -e "${BLUE}--- Email Configuration ---${NC}"
check_required "SMTP_USER" "Email account username"
check_email_format "SMTP_USER"
check_required "SMTP_PASSWORD" "Email account password"
check_required "SMTP_FROM_EMAIL" "From email address"
check_email_format "SMTP_FROM_EMAIL"
echo ""

# ==============================================================================
# CATEGORY: MONITORING
# ==============================================================================

echo -e "${BLUE}--- Monitoring ---${NC}"
check_required "GRAFANA_ADMIN_PASSWORD" "Grafana admin password"
check_min_length "GRAFANA_ADMIN_PASSWORD" 8
check_optional "LITELLM_MASTER_KEY" "LiteLLM proxy master key"
echo ""

# ==============================================================================
# CATEGORY: ACTIVEPIECES
# ==============================================================================

echo -e "${BLUE}--- Activepieces ---${NC}"
check_optional "ACTIVEPIECES_API_KEY" "Activepieces API key"
check_optional "AP_ENCRYPTION_KEY" "Activepieces encryption key"
check_optional "AP_JWT_SECRET" "Activepieces JWT secret"
echo ""

# ==============================================================================
# CATEGORY: PRODUCTION
# ==============================================================================

if [ "$NODE_ENV" = "production" ] || [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}--- Production Environment ---${NC}"
    check_required "INFISICAL_TOKEN" "Infisical authentication token"
    check_required "INFISICAL_PROJECT_ID" "Infisical project identifier"
    check_required "CLOUDFLARED_TUNNEL_TOKEN" "Cloudflared tunnel token"
    echo ""
fi

# ==============================================================================
# SUMMARY
# ==============================================================================

echo ""
echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Validation Summary${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""
echo -e "${GREEN}✓ Success: $SUCCESS variables${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS variables${NC}"
echo -e "${RED}✗ Errors: $ERRORS variables${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}VALIDATION FAILED!${NC}"
    echo ""
    echo -e "Required variables are missing or invalid."
    echo -e "Please update your .env file with the required values."
    echo ""
    echo -e "To generate secrets, run:"
    echo -e "  ${BLUE}openssl rand -hex 32${NC}"
    echo ""
    echo -e "For API keys, visit:"
    echo -e "  ${BLUE}Anthropic: https://console.anthropic.com${NC}"
    echo -e "  ${BLUE}Google: https://aistudio.google.com/apikey${NC}"
    echo -e "  ${BLUE}Twilio: https://console.twilio.com${NC}"
    echo ""
    echo -e "See ENVIRONMENT_VARIABLES.md for complete documentation."
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}VALIDATION PASSED WITH WARNINGS${NC}"
    echo ""
    echo -e "Some optional variables are not set."
    echo -e "The system will work, but some features may be unavailable."
    echo ""
    if [ "$STRICT_MODE" = false ]; then
        echo -e "To fail on warnings, run with --strict flag."
        echo ""
    fi
    exit 0
else
    echo -e "${GREEN}VALIDATION PASSED!${NC}"
    echo ""
    echo -e "All required variables are set correctly."
    echo -e "You can now start the services with:"
    echo -e "  ${BLUE}docker-compose -f infra/docker-compose.dev.yml up -d${NC}"
    echo ""
    exit 0
fi
