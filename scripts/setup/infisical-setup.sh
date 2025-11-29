#!/bin/bash
# Infisical Secrets Management Setup for Nyra Infrastructure
# This script configures Infisical for secure environment variable and secret management

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

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

    if ! command -v infisical &> /dev/null; then
        log "Installing Infisical CLI..."

        # Install Infisical CLI
        curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
        sudo apt update && sudo apt install infisical

        success "Infisical CLI installed"
    else
        success "Infisical CLI already installed"
    fi

    # Verify installation
    infisical --version
}

# Create Infisical project structure
setup_infisical_project() {
    log "Setting up Infisical project..."

    # Check if already logged in
    if ! infisical user whoami &> /dev/null; then
        warning "Please login to Infisical first:"
        echo "  infisical login"
        echo "Then re-run this script"
        exit 1
    fi

    # Initialize Infisical in project if not already done
    if [[ ! -f "$PROJECT_ROOT/.infisical.json" ]]; then
        log "Initializing Infisical project..."
        cd "$PROJECT_ROOT"
        infisical init
        success "Infisical project initialized"
    else
        success "Infisical project already initialized"
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

# Get all secrets for current environment
nyra_secrets_get() {
    local env=${1:-development}
    echo "🔐 Getting secrets for environment: $env"
    infisical secrets --env=$env
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

    echo "🔐 Setting secret: $key in $env"
    infisical secrets set $key="$value" --env=$env
}

# Run command with secrets injected
nyra_run_with_secrets() {
    local env=${1:-development}
    shift

    echo "🚀 Running command with secrets from $env environment"
    infisical run --env=$env -- "$@"
}

# Generate secure secrets
nyra_generate_secrets() {
    local env=${1:-development}

    echo "🔐 Generating secure secrets for $env environment"

    # Generate JWT secret
    local jwt_secret=$(openssl rand -base64 64 | tr -d '\n')
    infisical secrets set JWT_SECRET="$jwt_secret" --env=$env

    # Generate API encryption key
    local api_key=$(openssl rand -base64 32 | tr -d '\n')
    infisical secrets set API_ENCRYPTION_KEY="$api_key" --env=$env

    # Generate webhook signing secret
    local webhook_secret=$(openssl rand -base64 32 | tr -d '\n')
    infisical secrets set WEBHOOK_SIGNING_SECRET="$webhook_secret" --env=$env

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

    echo "📁 Exporting $env secrets to $output_file"
    infisical export --env=$env --format=dotenv > "$output_file"
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

    echo "📥 Importing secrets from $file to $env environment"

    while IFS='=' read -r key value; do
        if [[ ! -z "$key" && ! "$key" =~ ^# ]]; then
            # Remove quotes and whitespace
            value=$(echo "$value" | sed 's/^["'"'"']//' | sed 's/["'"'"']$//' | xargs)
            infisical secrets set "$key"="$value" --env="$env"
            echo "   ✅ Set: $key"
        fi
    done < "$file"

    echo "✅ Import completed"
}

# Validate secrets configuration
nyra_validate_secrets() {
    local env=${1:-development}

    echo "🔍 Validating secrets for $env environment"

    local required_secrets=(
        "CLOUDFLARE_API_KEY"
        "CLOUDFLARE_EMAIL"
        "CLOUDFLARE_ZONE_ID"
        "CLOUDFLARE_ACCOUNT_ID"
    )

    local missing_secrets=()

    for secret in "${required_secrets[@]}"; do
        if ! infisical secrets get $secret --env=$env --silent > /dev/null 2>&1; then
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
        echo "   Use 'infisical secrets set KEY=VALUE --env=$env' to add secrets"
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
    "dev": "infisical run --env=development -- node src/app.js",
    "start": "infisical run --env=production -- node src/app.js",
    "start:orchestrator": "infisical run --env=production -- node src/orchestrator/main.js",
    "start:worker": "infisical run --env=production -- node src/worker/main.js",
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

1. Install and login to Infisical:
   \`\`\`bash
   infisical login
   \`\`\`

2. Initialize project (if not done):
   \`\`\`bash
   infisical init
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
    if ! infisical user whoami &> /dev/null; then
        error "Infisical CLI not authenticated. Run 'infisical login' first."
        return 1
    fi

    # Check project initialization
    if [[ ! -f "$PROJECT_ROOT/.infisical.json" ]]; then
        error "Infisical project not initialized. Run 'infisical init' in project root."
        return 1
    fi

    # Test secret operations
    if infisical secrets --env=development > /dev/null 2>&1; then
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
   infisical secrets set CLOUDFLARE_API_KEY="your_key"
   infisical secrets set CLOUDFLARE_EMAIL="your_email"
   infisical secrets set CLOUDFLARE_ZONE_ID="your_zone_id"
   infisical secrets set CLOUDFLARE_ACCOUNT_ID="your_account_id"

2. Generate security secrets:
   ./scripts/secrets/infisical-helpers.sh generate development

3. Test integration:
   infisical run --env=development -- echo "Secrets loaded!"

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