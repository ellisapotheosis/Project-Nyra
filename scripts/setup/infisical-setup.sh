#!/bin/bash
# Infisical Secrets Management Setup for Nyra Infrastructure
# This script configures Infisical for secure environment variable and secret management

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if Infisical CLI is installed
check_infisical_cli() {
    log "Checking Infisical CLI installation..."

    if command -v infisical &> /dev/null; then
        success "Infisical CLI already installed"
        infisical --version
        return 0
    fi

    log "Installing Infisical CLI..."

    local installed=false
    local user_bin="$HOME/.local/bin"
    mkdir -p "$user_bin"

    if [[ "$installed" == "false" ]] && command -v apt-get >/dev/null 2>&1 && command -v sudo >/dev/null 2>&1 && sudo -n true >/dev/null 2>&1; then
        if curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash \
            && sudo apt-get update -y \
            && sudo apt-get install -y infisical; then
            installed=true
        fi
    fi

    if [[ "$installed" == "false" ]] && command -v npm >/dev/null 2>&1; then
        local npm_prefix="${NPM_CONFIG_PREFIX:-$HOME/.local/npm-global}"
        mkdir -p "$npm_prefix/bin"
        if npm install -g --prefix "$npm_prefix" @infisical/cli >/dev/null 2>&1; then
            export PATH="$npm_prefix/bin:$PATH"
            installed=true
        fi
    fi

    if [[ "$installed" == "false" ]]; then
        error "Unable to auto-install Infisical CLI (no usable apt+sudo or npm path)."
        error "Install manually, then re-run this script: https://infisical.com/docs/cli/overview"
        exit 1
    fi

    if ! command -v infisical >/dev/null 2>&1; then
        export PATH="$user_bin:$PATH"
    fi

    if ! command -v infisical >/dev/null 2>&1; then
        error "Infisical CLI installation completed but binary is not on PATH."
        exit 1
    fi

    success "Infisical CLI installed"

    # Verify installation
    infisical --version
}

ensure_infisical_token_auth() {
    if ! nyra_require_infisical_token; then
        error "INFISICAL_TOKEN environment variable is required."
        exit 1
    fi

    nyra_resolve_infisical_project_id
}

# Create Infisical project structure
setup_infisical_project() {
    log "Setting up Infisical project..."

    ensure_infisical_token_auth

    if [[ -f "$PROJECT_ROOT/.infisical.json" ]]; then
        success "Infisical project metadata already present"
    else
        warning "No .infisical.json found. Continuing with explicit project id only."
    fi
}

# Create environment-specific secret configurations
create_secret_templates() {
    log "Creating secret templates..."

    mkdir -p "$PROJECT_ROOT/config/secrets"

    # Development environment secrets
    cat > "$PROJECT_ROOT/config/secrets/development.template.yaml" <<EOF
# Nyra Development Environment Secrets Template
# Copy to Infisical and update with actual values

secrets:
  # Cloudflare Configuration
  CLOUDFLARE_API_KEY:
    description: "Cloudflare Global API Key or Token"
    required: true
    environment: "development"

  CLOUDFLARE_EMAIL:
    description: "Cloudflare account email"
    required: true
    environment: "development"

  CLOUDFLARE_ZONE_ID:
    description: "Zone ID for ratehunter.net"
    required: true
    environment: "development"

  CLOUDFLARE_ACCOUNT_ID:
    description: "Cloudflare Account ID"
    required: true
    environment: "development"

  # Tunnel Configuration
  NYRA_ORCHESTRATOR_TUNNEL_ID:
    description: "Cloudflared tunnel ID for orchestrator"
    required: true
    environment: "development"

  # Database Credentials
  DATABASE_URL:
    description: "PostgreSQL connection string"
    required: false
    environment: "development"

  REDIS_URL:
    description: "Redis connection string for caching"
    required: false
    environment: "development"

  # API Security
  JWT_SECRET:
    description: "JWT signing secret (auto-generated if not provided)"
    required: false
    environment: "development"

  API_ENCRYPTION_KEY:
    description: "API encryption key for sensitive data"
    required: false
    environment: "development"

  # External Service APIs
  OPENAI_API_KEY:
    description: "OpenAI API key for AI services"
    required: false
    environment: "development"

  ANTHROPIC_API_KEY:
    description: "Anthropic Claude API key"
    required: false
    environment: "development"

  # Monitoring and Alerts
  SLACK_WEBHOOK_URL:
    description: "Slack webhook for alerts"
    required: false
    environment: "development"

  DISCORD_WEBHOOK_URL:
    description: "Discord webhook for notifications"
    required: false
    environment: "development"

  # Network Configuration
  INTERNAL_NETWORK_CIDR:
    description: "Internal network CIDR for security"
    required: true
    environment: "development"
    default: "192.168.1.0/24"
EOF

    # Production environment secrets
    cat > "$PROJECT_ROOT/config/secrets/production.template.yaml" <<EOF
# Nyra Production Environment Secrets Template
# Copy to Infisical and update with actual values

secrets:
  # Cloudflare Configuration (Production)
  CLOUDFLARE_API_KEY:
    description: "Cloudflare Global API Key or Token (Production)"
    required: true
    environment: "production"

  CLOUDFLARE_EMAIL:
    description: "Cloudflare account email (Production)"
    required: true
    environment: "production"

  CLOUDFLARE_ZONE_ID:
    description: "Zone ID for ratehunter.net (Production)"
    required: true
    environment: "production"

  CLOUDFLARE_ACCOUNT_ID:
    description: "Cloudflare Account ID (Production)"
    required: true
    environment: "production"

  # Tunnel Configuration (Production)
  NYRA_ORCHESTRATOR_TUNNEL_ID:
    description: "Cloudflared tunnel ID for orchestrator (Production)"
    required: true
    environment: "production"

  # High-Security Credentials
  DATABASE_URL:
    description: "PostgreSQL connection string (Production)"
    required: true
    environment: "production"

  REDIS_URL:
    description: "Redis connection string (Production)"
    required: true
    environment: "production"

  # Production API Security
  JWT_SECRET:
    description: "JWT signing secret (Production - High Entropy)"
    required: true
    environment: "production"

  API_ENCRYPTION_KEY:
    description: "API encryption key (Production - AES-256)"
    required: true
    environment: "production"

  WEBHOOK_SIGNING_SECRET:
    description: "Webhook signature verification secret"
    required: true
    environment: "production"

  # External Services (Production Keys)
  OPENAI_API_KEY:
    description: "OpenAI API key (Production)"
    required: false
    environment: "production"

  ANTHROPIC_API_KEY:
    description: "Anthropic Claude API key (Production)"
    required: false
    environment: "production"

  # Monitoring and Alerting (Production)
  DATADOG_API_KEY:
    description: "Datadog API key for monitoring"
    required: false
    environment: "production"

  PAGERDUTY_API_KEY:
    description: "PagerDuty API key for alerts"
    required: false
    environment: "production"

  SLACK_WEBHOOK_URL:
    description: "Slack webhook for alerts (Production)"
    required: false
    environment: "production"

  # SSL/TLS Certificates
  SSL_PRIVATE_KEY:
    description: "SSL private key for custom certificates"
    required: false
    environment: "production"

  SSL_CERTIFICATE:
    description: "SSL certificate chain"
    required: false
    environment: "production"
EOF

    success "Secret templates created"
}

# Setup Infisical CLI commands
setup_cli_shortcuts() {
    log "Setting up CLI shortcuts..."

    # Create helper script for Infisical operations
    cat > "$PROJECT_ROOT/scripts/secrets/infisical-helpers.sh" <<'EOF'
#!/bin/bash
# Infisical Helper Scripts for Nyra

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

require_token() {
    nyra_require_infisical_token
    nyra_resolve_infisical_project_id
}

# Get all secrets for current environment
nyra_secrets_get() {
    local env=${1:-development}
    require_token
    echo "🔐 Getting secrets for environment: $env"
    infisical secrets --projectId="$INFISICAL_PROJECT_ID" --env="$env"
}

# Set a secret
nyra_secret_set() {
    local key=$1
    local value=$2
    local env=${3:-development}

    if [[ -z "$key" || -z "$value" ]]; then
        echo "Usage: nyra_secret_set <key> <value> [environment]"
        return 1
    fi

    require_token
    echo "🔐 Setting secret: $key in $env"
    infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$env" "$key=$value"
}

# Run command with secrets injected
nyra_run_with_secrets() {
    local env=${1:-development}
    shift

    require_token
    echo "🚀 Running command with secrets from $env environment"
    infisical run --projectId="$INFISICAL_PROJECT_ID" --env="$env" -- "$@"
}

# Generate secure secrets
nyra_generate_secrets() {
    local env=${1:-development}

    require_token
    echo "🔐 Generating secure secrets for $env environment"

    # Generate JWT secret
    local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
    infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$env" "JWT_SECRET=$jwt_secret"

    # Generate API encryption key
    local api_key=$(openssl rand -base64 32 | tr -d '\n')
    infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$env" "API_ENCRYPTION_KEY=$api_key"

    # Generate webhook signing secret
    local webhook_secret=$(openssl rand -base64 32 | tr -d '\n')
    infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$env" "WEBHOOK_SIGNING_SECRET=$webhook_secret"

    echo "✅ Generated secure secrets for $env"
}

# Export secrets to .env file (for development only)
nyra_export_env() {
    local env=${1:-development}
    local output_file="$PROJECT_ROOT/.env.${env}"

    if [[ "$env" == "production" ]]; then
        echo "❌ Cannot export production secrets to file for security reasons"
        return 1
    fi

    require_token
    echo "📁 Exporting $env secrets to $output_file"
    infisical export --projectId="$INFISICAL_PROJECT_ID" --env="$env" --format=dotenv > "$output_file"
    chmod 600 "$output_file"
    echo "✅ Secrets exported to $output_file"
}

# Import secrets from file
nyra_import_secrets() {
    local file=$1
    local env=${2:-development}

    if [[ ! -f "$file" ]]; then
        echo "❌ File not found: $file"
        return 1
    fi

    require_token
    echo "📥 Importing secrets from $file to $env environment"

    while IFS='=' read -r key value; do
        if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
            # Remove quotes and whitespace
            value=$(echo "$value" | sed 's/^["'"'"']//' | sed 's/["'"'"']$//' | xargs)
            infisical secrets set --projectId="$INFISICAL_PROJECT_ID" --env="$env" "$key=$value"
            echo "   ✅ Set: $key"
        fi
    done < "$file"

    echo "✅ Import completed"
}

# Validate secrets configuration
nyra_validate_secrets() {
    local env=${1:-development}

    require_token
    echo "🔍 Validating secrets for $env environment"

    local required_secrets=(
        "CLOUDFLARE_API_KEY"
        "CLOUDFLARE_EMAIL"
        "CLOUDFLARE_ZONE_ID"
        "CLOUDFLARE_ACCOUNT_ID"
    )

    local missing_secrets=()

    for secret in "${required_secrets[@]}"; do
        if ! infisical secrets get "$secret" --projectId="$INFISICAL_PROJECT_ID" --env="$env" --silent > /dev/null 2>&1; then
            missing_secrets+=("$secret")
        fi
    done

    if [[ ${#missing_secrets[@]} -eq 0 ]]; then
        echo "✅ All required secrets are configured for $env"
        return 0
    else
        echo "❌ Missing required secrets in $env environment:"
        for secret in "${missing_secrets[@]}"; do
            echo "   - $secret"
        done
        return 1
    fi
}

# Show help
nyra_secrets_help() {
    cat <<HELP
Nyra Secrets Management Helper

Available Commands:
  nyra_secrets_get [env]           - Get all secrets for environment
  nyra_secret_set <key> <value> [env] - Set a secret
  nyra_run_with_secrets [env] <cmd>   - Run command with secrets
  nyra_generate_secrets [env]      - Generate secure secrets
  nyra_export_env [env]           - Export secrets to .env file (dev only)
  nyra_import_secrets <file> [env] - Import secrets from file
  nyra_validate_secrets [env]     - Validate required secrets
  nyra_secrets_help              - Show this help

Default environment: development
Available environments: development, staging, production
HELP
}

# Make functions available
case "${1:-help}" in
    "get")
        nyra_secrets_get "${2:-development}"
        ;;
    "set")
        nyra_secret_set "$2" "$3" "${4:-development}"
        ;;
    "run")
        nyra_run_with_secrets "${@:2}"
        ;;
    "generate")
        nyra_generate_secrets "${2:-development}"
        ;;
    "export")
        nyra_export_env "${2:-development}"
        ;;
    "import")
        nyra_import_secrets "$2" "${3:-development}"
        ;;
    "validate")
        nyra_validate_secrets "${2:-development}"
        ;;
    "help"|*)
        nyra_secrets_help
        ;;
esac
EOF

    chmod +x "$PROJECT_ROOT/scripts/secrets/infisical-helpers.sh"

    # Create alias in project
    echo 'alias nyra-secrets="$PROJECT_ROOT/scripts/secrets/infisical-helpers.sh"' >> "$PROJECT_ROOT/.bashrc.nyra"

    success "CLI shortcuts created"
}

# Setup environment-specific configurations
setup_environments() {
    log "Setting up Infisical environments..."

    # Create environments in Infisical project (if they don't exist)
    local environments=("development" "staging" "production")

    for env in "${environments[@]}"; do
        echo "📋 Environment: $env"
        echo "   Use 'infisical secrets set --projectId=$INFISICAL_PROJECT_ID KEY=VALUE --env=$env' to add secrets"
    done

    success "Environments configured"
}

# Setup integration with Node.js/npm scripts
setup_npm_integration() {
    log "Setting up npm script integration..."

    # Check if package.json exists
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        warning "package.json not found. Creating basic package.json..."

        cat > "$PROJECT_ROOT/package.json" <<EOF
{
  "name": "project-nyra",
  "version": "1.0.0",
  "description": "Nyra Distributed GPU Compute Infrastructure",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOF
    fi

    # Add Infisical-powered scripts to package.json
    # This would need to be done manually or with a JSON tool
    echo "📝 Add these scripts to your package.json:"
    cat <<EOF
{
  "scripts": {
    "dev": "infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development -- node src/app.js",
    "start": "infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=production -- node src/app.js",
    "start:orchestrator": "infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=production -- node src/orchestrator/main.js",
    "start:worker": "infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=production -- node src/worker/main.js",
    "secrets:validate": "scripts/secrets/infisical-helpers.sh validate",
    "secrets:generate": "scripts/secrets/infisical-helpers.sh generate development"
  }
}
EOF

    success "npm integration guide provided"
}

# Create secrets directory structure
create_secrets_structure() {
    log "Creating secrets directory structure..."

    mkdir -p "$PROJECT_ROOT/scripts/secrets"
    mkdir -p "$PROJECT_ROOT/config/secrets"

    # Create .gitignore for secrets directory
    cat > "$PROJECT_ROOT/config/secrets/.gitignore" <<EOF
# Ignore all secret files except templates
*
!*.template.*
!.gitignore
EOF

    # Create README for secrets management
    cat > "$PROJECT_ROOT/config/secrets/README.md" <<EOF
# Nyra Secrets Management

This directory contains templates and configuration for managing secrets with Infisical.

## Important Security Notes

🔒 **NEVER commit actual secrets to git**
🔒 **Use Infisical CLI for all secret operations**
🔒 **Template files are safe to commit**

## Quick Start

1. Export your Infisical service token:
   \`\`\`bash
   export INFISICAL_TOKEN=REPLACE_ME_INFISICAL_TOKEN
   \`\`\`

2. Ensure the project id is available:
   \`\`\`bash
   export INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
   \`\`\`

3. Use helper scripts:
   \`\`\`bash
   # Set a secret
   ./scripts/secrets/infisical-helpers.sh set CLOUDFLARE_API_KEY "your_key_here"

   # Validate configuration
   ./scripts/secrets/infisical-helpers.sh validate

   # Run with secrets
   ./scripts/secrets/infisical-helpers.sh run development npm start
   \`\`\`

## Files

- \`development.template.yaml\` - Development environment secret template
- \`production.template.yaml\` - Production environment secret template
- \`.gitignore\` - Ensures no actual secrets are committed

## Environments

- **development** - Local development secrets
- **staging** - Staging environment secrets (optional)
- **production** - Production secrets (high security)
EOF

    success "Secrets directory structure created"
}

# Validate Infisical setup
validate_setup() {
    log "Validating Infisical setup..."

    # Check CLI access
    if ! nyra_require_infisical_token; then
        error "INFISICAL_TOKEN environment variable is required."
        return 1
    fi

    nyra_resolve_infisical_project_id

    # Test secret operations
    if infisical secrets --projectId="$INFISICAL_PROJECT_ID" --env=development > /dev/null 2>&1; then
        success "Infisical setup validated successfully"
    else
        warning "Infisical setup may have issues. Check project configuration."
    fi
}

# Show setup summary
show_setup_summary() {
    log "Infisical Setup Summary"

    cat <<EOF

🔐 Infisical Secrets Management Setup Complete!

📁 Created Files:
   - config/secrets/development.template.yaml
   - config/secrets/production.template.yaml
   - scripts/secrets/infisical-helpers.sh
   - config/secrets/README.md

🛠️ Available Commands:
   - nyra-secrets get [env]              - View secrets
   - nyra-secrets set <key> <value> [env] - Set secret
   - nyra-secrets run [env] <command>     - Run with secrets
   - nyra-secrets validate [env]          - Validate setup

📋 Next Steps:

1. Set required Cloudflare secrets:
   infisical secrets set --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development CLOUDFLARE_API_KEY="your_key"
   infisical secrets set --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development CLOUDFLARE_EMAIL="your_email"
   infisical secrets set --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development CLOUDFLARE_ZONE_ID="your_zone_id"
   infisical secrets set --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development CLOUDFLARE_ACCOUNT_ID="your_account_id"

2. Generate security secrets:
   ./scripts/secrets/infisical-helpers.sh generate development

3. Test integration:
   infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=development -- echo "Secrets loaded!"

4. Use in npm scripts:
   npm run dev  # Runs with development secrets
   npm run start  # Runs with production secrets

🔒 Security Best Practices:
   - Never commit .env files with real secrets
   - Use different secrets for each environment
   - Rotate secrets regularly
   - Limit access to production secrets

EOF
}

# Main setup function
main() {
    log "Starting Infisical secrets management setup..."

    check_infisical_cli
    setup_infisical_project
    create_secrets_structure
    create_secret_templates
    setup_cli_shortcuts
    setup_environments
    setup_npm_integration
    validate_setup

    success "Infisical setup completed!"
    show_setup_summary
}

# Run main function
main "$@"
