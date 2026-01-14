#!/bin/bash

# Tenant Management Script for LiteLLM Proxy
# Usage: ./scripts/manage-tenants.sh [create|list|update|delete] [args]

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate secure API key
generate_api_key() {
    local prefix="sk-$1"
    local random=$(openssl rand -hex 24)
    echo "${prefix}-${random}"
}

create_tenant() {
    local tenant_id="$1"
    local budget="${2:-100.0}"
    local models="${3:-llama-3.1-70b,qwen-2.5-32b}"

    if [ -z "$tenant_id" ]; then
        log_error "Tenant ID is required"
        echo "Usage: $0 create <tenant-id> [budget] [models]"
        exit 1
    fi

    log_info "Creating tenant: $tenant_id"

    # Generate API key
    local api_key=$(generate_api_key "$tenant_id")

    # Create tenant configuration file
    local tenant_file="$PROJECT_DIR/config/tenants/${tenant_id}.yaml"
    mkdir -p "$PROJECT_DIR/config/tenants"

    cat > "$tenant_file" <<EOF
# Tenant Configuration: $tenant_id
tenant:
  id: $tenant_id
  api_key: $api_key

allowed_models:
$(echo "$models" | tr ',' '\n' | sed 's/^/  - /')

budget:
  daily_limit: $(echo "$budget / 30" | bc -l | xargs printf "%.2f")
  monthly_limit: $budget

rate_limits:
  requests_per_minute: 60
  requests_per_hour: 1000
  requests_per_day: 10000

metadata:
  created_at: $(date -Iseconds)
  created_by: $(whoami)
EOF

    # Insert into database
    docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
INSERT INTO tenants (tenant_id, api_key, allowed_models, budget_id, is_active)
VALUES (
    '$tenant_id',
    '$api_key',
    ARRAY['$(echo "$models" | sed "s/,/','/g")'],
    '$tenant_id',
    true
)
ON CONFLICT (tenant_id) DO UPDATE SET
    api_key = '$api_key',
    allowed_models = ARRAY['$(echo "$models" | sed "s/,/','/g")'],
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO budgets (budget_id, max_budget, time_period, period_start, period_end)
VALUES (
    '$tenant_id',
    $budget,
    'monthly',
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
)
ON CONFLICT (budget_id) DO UPDATE SET
    max_budget = $budget,
    updated_at = CURRENT_TIMESTAMP;
SQL

    log_success "Tenant created successfully!"
    echo ""
    echo "Tenant Details:"
    echo "  ID: $tenant_id"
    echo "  API Key: $api_key"
    echo "  Budget: \$${budget}/month"
    echo "  Models: $models"
    echo ""
    echo "Configuration saved to: $tenant_file"
    echo ""
    echo "To use this tenant:"
    echo "  export LITELLM_API_KEY=\"$api_key\""
    echo "  curl -X POST http://localhost:4000/v1/chat/completions \\"
    echo "    -H \"Authorization: Bearer \$LITELLM_API_KEY\" \\"
    echo "    -d '{\"model\": \"llama-3.1-70b\", \"messages\": [...]}'"
}

list_tenants() {
    log_info "Listing all tenants..."

    docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
SELECT
    t.tenant_id,
    t.is_active,
    b.max_budget,
    b.current_spend,
    ROUND((b.current_spend / b.max_budget) * 100, 2) as utilization_pct,
    t.rate_limit_per_minute as rpm,
    t.created_at
FROM tenants t
LEFT JOIN budgets b ON t.budget_id = b.budget_id
ORDER BY t.created_at DESC;
SQL

    echo ""
    log_info "Configuration files:"
    ls -lh "$PROJECT_DIR/config/tenants/"
}

update_tenant() {
    local tenant_id="$1"
    local field="$2"
    local value="$3"

    if [ -z "$tenant_id" ] || [ -z "$field" ] || [ -z "$value" ]; then
        log_error "Missing arguments"
        echo "Usage: $0 update <tenant-id> <field> <value>"
        echo "Fields: budget, models, rate_limit, status"
        exit 1
    fi

    case "$field" in
        budget)
            docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
UPDATE budgets
SET max_budget = $value, updated_at = CURRENT_TIMESTAMP
WHERE budget_id = '$tenant_id';
SQL
            ;;
        models)
            docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
UPDATE tenants
SET allowed_models = ARRAY['$(echo "$value" | sed "s/,/','/g")'],
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = '$tenant_id';
SQL
            ;;
        rate_limit)
            docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
UPDATE tenants
SET rate_limit_per_minute = $value, updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = '$tenant_id';
SQL
            ;;
        status)
            local is_active=$([ "$value" = "active" ] && echo "true" || echo "false")
            docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
UPDATE tenants
SET is_active = $is_active, updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = '$tenant_id';
SQL
            ;;
        *)
            log_error "Unknown field: $field"
            exit 1
            ;;
    esac

    log_success "Tenant $tenant_id updated successfully!"
}

delete_tenant() {
    local tenant_id="$1"

    if [ -z "$tenant_id" ]; then
        log_error "Tenant ID is required"
        exit 1
    fi

    read -p "Are you sure you want to delete tenant '$tenant_id'? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Deletion cancelled"
        exit 0
    fi

    # Deactivate instead of delete (preserve history)
    docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
UPDATE tenants
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = '$tenant_id';

UPDATE budgets
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE budget_id = '$tenant_id';
SQL

    log_success "Tenant $tenant_id deactivated!"
}

show_usage() {
    local tenant_id="$1"

    if [ -z "$tenant_id" ]; then
        log_error "Tenant ID is required"
        exit 1
    fi

    log_info "Usage for tenant: $tenant_id"

    docker-compose exec -T postgres psql -U litellm -d litellm <<SQL
-- Last 7 days usage
SELECT
    date,
    SUM(total_requests) as requests,
    SUM(total_tokens) as tokens,
    SUM(total_cost) as cost
FROM cost_tracking
WHERE tenant_id = '$tenant_id'
    AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date DESC;

-- By model
SELECT
    model,
    SUM(total_requests) as requests,
    SUM(total_tokens) as tokens,
    SUM(total_cost) as cost
FROM cost_tracking
WHERE tenant_id = '$tenant_id'
    AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY model
ORDER BY cost DESC;
SQL
}

# Main
case "$1" in
    create)
        create_tenant "$2" "$3" "$4"
        ;;
    list)
        list_tenants
        ;;
    update)
        update_tenant "$2" "$3" "$4"
        ;;
    delete)
        delete_tenant "$2"
        ;;
    usage)
        show_usage "$2"
        ;;
    *)
        echo "Usage: $0 {create|list|update|delete|usage} [args]"
        echo ""
        echo "Commands:"
        echo "  create <tenant-id> [budget] [models]  - Create new tenant"
        echo "  list                                   - List all tenants"
        echo "  update <tenant-id> <field> <value>    - Update tenant"
        echo "  delete <tenant-id>                     - Delete tenant"
        echo "  usage <tenant-id>                      - Show tenant usage"
        echo ""
        echo "Examples:"
        echo "  $0 create engineering 500 'llama-3.1-70b,qwen-2.5-32b'"
        echo "  $0 update engineering budget 1000"
        echo "  $0 usage engineering"
        exit 1
        ;;
esac

exit 0
