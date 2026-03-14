#!/bin/bash
# ============================================================================
# Secret Rotation Script - Project Nyra
# ============================================================================
# Rotates all secrets in Infisical and triggers service restarts
#
# Usage:
#   ./scripts/security/rotate-secrets.sh [--dry-run]
#
# Options:
#   --dry-run  Preview changes without applying them
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
# shellcheck source=scripts/lib/infisical-token.sh
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

nyra_require_infisical_token
nyra_resolve_infisical_project_id
INFISICAL_ENV="production"

# Function to print messages
print_section() { echo -e "\n${BLUE}>>> $1${NC}\n"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Project Nyra - Secret Rotation${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo -e "Environment: ${INFISICAL_ENV}"
if [ "$DRY_RUN" == "true" ]; then
    echo -e "${YELLOW}Mode: DRY RUN (no changes will be made)${NC}"
else
    echo -e "${RED}Mode: LIVE (secrets will be rotated)${NC}"
fi
echo ""

# Check if Infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    print_error "Infisical CLI not found. Install with: brew install infisical/get-cli/infisical"
    exit 1
fi

# Confirmation prompt for production
if [ "$DRY_RUN" == "false" ]; then
    echo -e "${RED}WARNING: This will rotate all secrets in production!${NC}"
    echo "Services will need to be restarted for changes to take effect."
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        print_warning "Secret rotation cancelled"
        exit 0
    fi
fi

# ============================================================================
# Rotate Database Passwords
# ============================================================================
print_section "1/5: Rotating Database Passwords"

rotate_secret() {
    local secret_name=$1
    local secret_path=$2
    local generator=$3

    echo "Rotating: $secret_name"

    if [ "$DRY_RUN" == "true" ]; then
        print_warning "[DRY RUN] Would rotate $secret_name"
        return
    fi

    # Generate new secret
    local new_value
    new_value=$($generator)

    # Update in Infisical
    if nyra_infisical_secrets_set \
        "$INFISICAL_ENV" \
        "$secret_path" \
        "$secret_name=$new_value" 2>&1; then
        print_success "$secret_name rotated"
    else
        print_error "Failed to rotate $secret_name"
        return 1
    fi
}

# Generate strong password (32 characters)
gen_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Generate UUID
gen_uuid() {
    uuidgen
}

# Generate JWT secret (64 characters)
gen_jwt() {
    openssl rand -base64 64 | tr -d "\n"
}

# Rotate database passwords
echo "PostgreSQL..."
rotate_secret "POSTGRES_PASSWORD" "/shared/database" gen_password

echo "Redis..."
rotate_secret "REDIS_PASSWORD" "/shared/cache" gen_password

echo "FalkorDB..."
rotate_secret "FALKORDB_PASSWORD" "/shared/graph-db" gen_password

echo "Qdrant..."
rotate_secret "QDRANT_API_KEY" "/shared/vector-db" gen_uuid

# ============================================================================
# Rotate Application Secrets
# ============================================================================
print_section "2/5: Rotating Application Secrets"

echo "JWT Secret..."
rotate_secret "JWT_SECRET" "/shared/auth" gen_jwt

echo "Session Secret..."
rotate_secret "SESSION_SECRET" "/shared/auth" gen_jwt

echo "Encryption Key..."
rotate_secret "ENCRYPTION_KEY" "/shared/security" gen_password

# ============================================================================
# Rotate MCP Server Tokens
# ============================================================================
print_section "3/5: Rotating MCP Server Tokens"

echo "ruv-swarm MCP token..."
rotate_secret "MCP_RUV_SWARM_TOKEN" "/shared/mcp" "echo mcp_$(openssl rand -hex 32)"

echo "flow-nexus MCP token..."
rotate_secret "MCP_FLOW_NEXUS_TOKEN" "/shared/mcp" "echo mcp_$(openssl rand -hex 32)"

# ============================================================================
# Rotate API Keys (if managed in Infisical)
# ============================================================================
print_section "4/5: Checking API Keys"

# Note: External API keys (Anthropic, OpenRouter, E2B) should NOT be rotated automatically
# They must be rotated manually through their respective platforms

print_warning "External API keys (Anthropic, OpenRouter, E2B) must be rotated manually"
echo "These keys are managed by external providers and require manual rotation:"
echo "  - Anthropic API Key: https://console.anthropic.com/settings/keys"
echo "  - OpenRouter API Key: https://openrouter.ai/keys"
echo "  - E2B API Key: https://e2b.dev/dashboard"

# ============================================================================
# Generate Rotation Report
# ============================================================================
print_section "5/5: Generating Rotation Report"

REPORT_FILE="./security-reports/secret-rotation-$(date +%Y%m%d-%H%M%S).md"
mkdir -p ./security-reports

cat > "$REPORT_FILE" <<EOF
# Secret Rotation Report

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Environment**: ${INFISICAL_ENV}
**Mode**: $([ "$DRY_RUN" == "true" ] && echo "DRY RUN" || echo "LIVE")

---

## Rotated Secrets

### Database Passwords
- [x] POSTGRES_PASSWORD
- [x] REDIS_PASSWORD
- [x] FALKORDB_PASSWORD
- [x] QDRANT_API_KEY

### Application Secrets
- [x] JWT_SECRET
- [x] SESSION_SECRET
- [x] ENCRYPTION_KEY

### MCP Server Tokens
- [x] MCP_RUV_SWARM_TOKEN
- [x] MCP_FLOW_NEXUS_TOKEN

### External API Keys (Manual Rotation Required)
- [ ] ANTHROPIC_API_KEY - https://console.anthropic.com/settings/keys
- [ ] OPENROUTER_API_KEY - https://openrouter.ai/keys
- [ ] E2B_API_KEY - https://e2b.dev/dashboard

---

## Next Steps

1. **Restart Services** to apply new secrets:
   \`\`\`bash
   cd infra/docker
   infisical run --projectId="$INFISICAL_PROJECT_ID" \\
     --env="$INFISICAL_ENV" \\
     --path="/shared" \\
     -- docker compose -f docker-compose.orchestration.yml restart
   \`\`\`

2. **Verify Services** are healthy:
   \`\`\`bash
   docker compose -f docker-compose.orchestration.yml ps
   \`\`\`

3. **Update External API Keys** manually (see list above)

4. **Test Authentication**:
   - Login to admin panel
   - Test API endpoints
   - Verify MCP server connectivity

5. **Monitor Logs** for any authentication errors:
   \`\`\`bash
   docker compose -f docker-compose.orchestration.yml logs -f
   \`\`\`

6. **Update Documentation** if secret rotation procedures changed

---

## Rollback Procedure

If issues occur after rotation:

1. Check Infisical audit log for previous secret values
2. Restore previous secrets via Infisical UI or CLI
3. Restart affected services
4. Investigate root cause

---

## Next Rotation Date

Secrets should be rotated every **90 days**.

Next rotation due: $(date -d "+90 days" '+%Y-%m-%d' 2>/dev/null || date -v +90d '+%Y-%m-%d' 2>/dev/null || echo "Calculate manually")

Set calendar reminder: $(date -d "+83 days" '+%Y-%m-%d' 2>/dev/null || date -v +83d '+%Y-%m-%d' 2>/dev/null || echo "Calculate manually") (7 days before)

---

*Generated by Project Nyra Secret Rotation Script*
EOF

print_success "Report generated: $REPORT_FILE"

# ============================================================================
# Final Summary
# ============================================================================
echo ""
echo -e "${BLUE}============================================================================${NC}"
if [ "$DRY_RUN" == "true" ]; then
    echo -e "${YELLOW}Secret rotation DRY RUN completed!${NC}"
    echo ""
    echo "No changes were made. Review the above output and run without --dry-run to apply."
else
    echo -e "${GREEN}Secret rotation completed!${NC}"
    echo ""
    echo "IMPORTANT: Services must be restarted for changes to take effect."
    echo ""
    echo "Run the following command to restart services:"
    echo ""
    echo "  cd infra/docker"
    echo "  infisical run --projectId=\"$INFISICAL_PROJECT_ID\" \\"
    echo "    --env=\"$INFISICAL_ENV\" \\"
    echo "    --path=\"/shared\" \\"
    echo "    -- docker compose -f docker-compose.orchestration.yml restart"
    echo ""
fi
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo "Report: cat $REPORT_FILE"
echo ""

if [ "$DRY_RUN" == "false" ]; then
    print_warning "Remember to update external API keys manually!"
fi
