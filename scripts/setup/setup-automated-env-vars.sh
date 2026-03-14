#!/bin/bash
# ==============================================================================
# Project Nyra - Automated Environment Variable Setup (Bash/WSL/Linux)
# ==============================================================================
# Sets up environment variables that DO NOT require online account creation.
# Variables requiring online accounts (API keys) must be set manually.
# See bootstrap/docs/USER-ACTION-GUIDE.md for manual setup steps.
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper Functions
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warning() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

# Usage
usage() {
    cat << EOF
Usage: $0 -t <pc-type> [-e <environment>] [-o <output-file>]

Options:
    -t    PC Type (required): orchestrator, worker-1, worker-2, worker-3
    -e    Environment (optional): development, staging, production (default: development)
    -o    Output file (optional): default is .env.<pc-type>
    -h    Show this help message

Examples:
    $0 -t orchestrator -e production
    $0 -t worker-1 -e development -o .env.worker1
EOF
    exit 1
}

# Parse Arguments
PC_TYPE=""
ENVIRONMENT="development"
OUTPUT_FILE=""

while getopts "t:e:o:h" opt; do
    case $opt in
        t) PC_TYPE="$OPTARG" ;;
        e) ENVIRONMENT="$OPTARG" ;;
        o) OUTPUT_FILE="$OPTARG" ;;
        h) usage ;;
        *) usage ;;
    esac
done

# Validate PC Type
if [[ -z "$PC_TYPE" ]]; then
    error "PC Type is required"
    usage
fi

if [[ ! "$PC_TYPE" =~ ^(orchestrator|worker-1|worker-2|worker-3)$ ]]; then
    error "Invalid PC Type: $PC_TYPE"
    usage
fi

# Validate Environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid Environment: $ENVIRONMENT"
    usage
fi

# Set Output File
if [[ -z "$OUTPUT_FILE" ]]; then
    OUTPUT_FILE=".env.$PC_TYPE"
fi

# Header
echo -e "${CYAN}🚀 Project Nyra - Automated Environment Variable Setup${NC}"
echo -e "${YELLOW}PC Type: $PC_TYPE | Environment: $ENVIRONMENT${NC}"
echo ""

# Helper Functions for Generation
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

generate_hex_token() {
    local bytes=${1:-32}
    openssl rand -hex $bytes
}

detect_ip() {
    if command -v ip &> /dev/null; then
        ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v 127.0.0.1 | head -1
    elif command -v ifconfig &> /dev/null; then
        ifconfig | grep -oP 'inet \K[\d.]+' | grep -v 127.0.0.1 | head -1
    else
        echo ""
    fi
}

detect_gateway() {
    if command -v ip &> /dev/null; then
        ip route | grep default | awk '{print $3}' | head -1
    elif command -v route &> /dev/null; then
        route -n | grep '^0.0.0.0' | awk '{print $2}' | head -1
    else
        echo ""
    fi
}

detect_mac() {
    if command -v ip &> /dev/null; then
        ip link show | grep -A1 "state UP" | grep ether | awk '{print $2}' | head -1
    elif command -v ifconfig &> /dev/null; then
        ifconfig | grep -oP 'ether \K[0-9a-f:]+' | head -1
    else
        echo ""
    fi
}

detect_gpu() {
    if command -v nvidia-smi &> /dev/null; then
        local gpu_name=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)
        if [[ "$gpu_name" =~ RTX[[:space:]]*([0-9]+)[[:space:]]*Ti ]]; then
            echo "rtx_${BASH_REMATCH[1]}ti"
        elif [[ "$gpu_name" =~ RTX[[:space:]]*([0-9]+) ]]; then
            echo "rtx_${BASH_REMATCH[1]}"
        else
            echo ""
        fi
    else
        echo ""
    fi
}

# Start Generation
info "Setting up system configuration..."

# Environment Variables Array
declare -A ENV_VARS

# ==============================================================================
# SECTION 1: System Configuration
# ==============================================================================
ENV_VARS[NYRA_ENVIRONMENT]="$ENVIRONMENT"
ENV_VARS[NYRA_PC_ID]="$PC_TYPE"
ENV_VARS[NYRA_MODE]=$([ "$PC_TYPE" = "orchestrator" ] && echo "orchestrator" || echo "worker")
ENV_VARS[NODE_ENV]=$([ "$ENVIRONMENT" = "production" ] && echo "production" || echo "development")
ENV_VARS[LOG_LEVEL]=$([ "$ENVIRONMENT" = "production" ] && echo "info" || echo "debug")

success "System configuration set"

# ==============================================================================
# SECTION 2: Network Configuration
# ==============================================================================
info "Detecting network configuration..."

CURRENT_IP=$(detect_ip)
GATEWAY=$(detect_gateway)

if [[ -n "$CURRENT_IP" ]]; then
    info "Current IP: $CURRENT_IP"
fi
if [[ -n "$GATEWAY" ]]; then
    info "Gateway: $GATEWAY"
fi

# Static IP assignment
case "$PC_TYPE" in
    orchestrator) STATIC_IP="192.168.1.101" ;;
    worker-1) STATIC_IP="192.168.1.102" ;;
    worker-2) STATIC_IP="192.168.1.103" ;;
    worker-3) STATIC_IP="192.168.1.104" ;;
esac

ENV_VARS[STATIC_IP]="$STATIC_IP"
ENV_VARS[SUBNET_MASK]="255.255.255.0"
ENV_VARS[GATEWAY]="192.168.1.1"
ENV_VARS[DNS_SERVERS]="1.1.1.1,8.8.8.8"

# MAC Address
MAC_ADDRESS=$(detect_mac)
if [[ -n "$MAC_ADDRESS" ]]; then
    ENV_VARS[MAC_ADDRESS]="$MAC_ADDRESS"
    success "MAC Address detected: $MAC_ADDRESS"
else
    ENV_VARS[MAC_ADDRESS]="<detect-manually>"
    warning "MAC Address not detected - set manually"
fi

success "Network configuration set"

# ==============================================================================
# SECTION 3: GPU Configuration (Workers Only)
# ==============================================================================
if [[ "$PC_TYPE" != "orchestrator" ]]; then
    info "Detecting GPU configuration..."

    GPU_TYPE=$(detect_gpu)
    if [[ -n "$GPU_TYPE" ]]; then
        ENV_VARS[GPU_TYPE]="$GPU_TYPE"
        success "GPU detected: $GPU_TYPE"
    else
        # Default GPU types
        case "$PC_TYPE" in
            worker-1)
                ENV_VARS[GPU_TYPE]="rtx_3060"
                ENV_VARS[GPU_VRAM_GB]="12"
                ;;
            worker-2)
                ENV_VARS[GPU_TYPE]="rtx_5090"
                ENV_VARS[GPU_VRAM_GB]="32"
                ;;
            worker-3)
                ENV_VARS[GPU_TYPE]="rtx_3090ti"
                ENV_VARS[GPU_VRAM_GB]="24"
                ;;
        esac
        warning "GPU not detected - using defaults for $PC_TYPE"
    fi
fi

# ==============================================================================
# SECTION 4: Docker Configuration
# ==============================================================================
info "Setting up Docker configuration..."

ENV_VARS[DOCKER_NETWORK]="nyra-network"
ENV_VARS[DOCKER_SUBNET]="172.21.0.0/16"
ENV_VARS[DOCKER_GATEWAY]="172.21.0.1"
ENV_VARS[COMPOSE_PROJECT_NAME]="nyra"
ENV_VARS[COMPOSE_FILE]="docker-compose.yml:docker-compose.infisical.yml"

success "Docker configuration set"

# ==============================================================================
# SECTION 5: Service Ports
# ==============================================================================
info "Setting up service ports..."

if [[ "$PC_TYPE" = "orchestrator" ]]; then
    ENV_VARS[ORCHESTRATOR_API_PORT]="8000"
    ENV_VARS[ORCHESTRATOR_MGMT_PORT]="8080"
    ENV_VARS[POSTGRES_PORT]="5432"
    ENV_VARS[REDIS_PORT]="6379"
    ENV_VARS[NEO4J_HTTP_PORT]="7474"
    ENV_VARS[NEO4J_BOLT_PORT]="7687"
    ENV_VARS[FALKORDB_PORT]="6379"
    ENV_VARS[CHROMA_PORT]="8001"
    ENV_VARS[QDRANT_PORT]="6333"
    ENV_VARS[GITEA_HTTP_PORT]="3000"
    ENV_VARS[GITEA_SSH_PORT]="222"
    ENV_VARS[N8N_PORT]="5678"
else
    # Worker ports
    WORKER_NUM="${PC_TYPE#worker-}"
    ENV_VARS[WORKER_API_PORT]="800$WORKER_NUM"
    ENV_VARS[WORKER_GPU_METRICS_PORT]="900$WORKER_NUM"
fi

# MCP Server Ports (all PCs)
ENV_VARS[MCP_CLAUDE_FLOW_PORT]="8003"
ENV_VARS[MCP_ARCHON_PORT]="8004"
ENV_VARS[MCP_METAMCP_PORT]="8005"
ENV_VARS[MCP_INFISICAL_PORT]="8006"
ENV_VARS[MCP_EXA_PORT]="8007"

success "Service ports configured"

# ==============================================================================
# SECTION 6: Database Configuration (Orchestrator Only)
# ==============================================================================
if [[ "$PC_TYPE" = "orchestrator" ]]; then
    info "Generating database credentials..."

    ENV_VARS[POSTGRES_DB]="nyra_db"
    ENV_VARS[POSTGRES_USER]="nyra"
    ENV_VARS[POSTGRES_PASSWORD]=$(generate_password 32)

    ENV_VARS[REDIS_PASSWORD]=$(generate_password 32)

    ENV_VARS[NEO4J_USER]="neo4j"
    ENV_VARS[NEO4J_PASSWORD]=$(generate_password 32)

    ENV_VARS[CHROMA_TOKEN]=$(generate_hex_token 32)
    ENV_VARS[QDRANT_API_KEY]=$(generate_hex_token 32)

    # Database URLs
    ENV_VARS[POSTGRES_URL]="postgresql://nyra:${ENV_VARS[POSTGRES_PASSWORD]}@postgres:5432/nyra_db"
    ENV_VARS[REDIS_URL]="redis://:${ENV_VARS[REDIS_PASSWORD]}@redis:6379"
    ENV_VARS[NEO4J_URL]="bolt://neo4j:${ENV_VARS[NEO4J_PASSWORD]}@neo4j:7687"
    ENV_VARS[FALKORDB_URL]="redis://falkordb:6379"
    ENV_VARS[CHROMADB_URL]="http://chromadb:8000"
    ENV_VARS[QDRANT_URL]="http://qdrant:6333"

    success "Database credentials generated"
fi

# ==============================================================================
# SECTION 7: Application Secrets
# ==============================================================================
info "Generating application secrets..."

ENV_VARS[JWT_SECRET]=$(generate_hex_token 64)
ENV_VARS[SESSION_SECRET]=$(generate_hex_token 64)
ENV_VARS[ENCRYPTION_KEY]=$(generate_hex_token 32)

if [[ "$PC_TYPE" = "orchestrator" ]]; then
    ENV_VARS[GITEA_SECRET_KEY]=$(generate_hex_token 32)
    ENV_VARS[GITEA_INTERNAL_TOKEN]=$(generate_hex_token 64)
    ENV_VARS[N8N_ENCRYPTION_KEY]=$(generate_hex_token 32)
fi

success "Application secrets generated"

# ==============================================================================
# SECTION 8: Claude Flow Configuration
# ==============================================================================
info "Setting up Claude Flow configuration..."

ENV_VARS[CLAUDE_FLOW_MODE]="v3"
ENV_VARS[CLAUDE_FLOW_HOOKS_ENABLED]="true"
ENV_VARS[CLAUDE_FLOW_TOPOLOGY]="hierarchical-mesh"
ENV_VARS[CLAUDE_FLOW_MAX_AGENTS]="15"
ENV_VARS[CLAUDE_FLOW_MEMORY_BACKEND]="hybrid"
ENV_VARS[CLAUDE_FLOW_DISTRIBUTED]="true"

success "Claude Flow configuration set"

# ==============================================================================
# SECTION 9: Orchestrator URL (Workers Only)
# ==============================================================================
if [[ "$PC_TYPE" != "orchestrator" ]]; then
    info "Setting orchestrator connection..."

    ENV_VARS[ORCHESTRATOR_URL]="https://nyra-orchestrator.yourdomain.com"
    ENV_VARS[ORCHESTRATOR_IP]="192.168.1.101"

    warning "Update ORCHESTRATOR_URL with your actual Cloudflare tunnel URL"
fi

# ==============================================================================
# SECTION 10: Paths and Directories
# ==============================================================================
info "Setting up paths and directories..."

PROJECT_ROOT=$(pwd)
ENV_VARS[PROJECT_ROOT]="$PROJECT_ROOT"
ENV_VARS[DATA_DIR]="$PROJECT_ROOT/data"
ENV_VARS[LOGS_DIR]="$PROJECT_ROOT/logs"
ENV_VARS[CACHE_DIR]="$PROJECT_ROOT/cache"
ENV_VARS[BACKUPS_DIR]="$PROJECT_ROOT/backups"

success "Paths configured"

# ==============================================================================
# OUTPUT: Generate .env file
# ==============================================================================
info "Generating $OUTPUT_FILE..."

cat > "$OUTPUT_FILE" << EOF
# ============================================================================
# Project Nyra - Automated Environment Variables
# ============================================================================
# Generated: $(date '+%Y-%m-%d %H:%M:%S')
# PC Type: $PC_TYPE
# Environment: $ENVIRONMENT
#
# ⚠️ DO NOT COMMIT THIS FILE TO GIT
#
# This file contains automatically generated configuration.
# For manual setup requirements, see: bootstrap/docs/USER-ACTION-GUIDE.md
# ============================================================================

# SYSTEM CONFIGURATION
NYRA_ENVIRONMENT=${ENV_VARS[NYRA_ENVIRONMENT]}
NYRA_PC_ID=${ENV_VARS[NYRA_PC_ID]}
NYRA_MODE=${ENV_VARS[NYRA_MODE]}
NODE_ENV=${ENV_VARS[NODE_ENV]}
LOG_LEVEL=${ENV_VARS[LOG_LEVEL]}

# NETWORK CONFIGURATION
STATIC_IP=${ENV_VARS[STATIC_IP]}
SUBNET_MASK=${ENV_VARS[SUBNET_MASK]}
GATEWAY=${ENV_VARS[GATEWAY]}
DNS_SERVERS=${ENV_VARS[DNS_SERVERS]}
MAC_ADDRESS=${ENV_VARS[MAC_ADDRESS]}

EOF

# GPU Configuration (Workers Only)
if [[ "$PC_TYPE" != "orchestrator" ]]; then
    cat >> "$OUTPUT_FILE" << EOF
# GPU CONFIGURATION
GPU_TYPE=${ENV_VARS[GPU_TYPE]}
GPU_VRAM_GB=${ENV_VARS[GPU_VRAM_GB]:-}

EOF
fi

# Docker, Ports, etc.
cat >> "$OUTPUT_FILE" << EOF
# DOCKER CONFIGURATION
DOCKER_NETWORK=${ENV_VARS[DOCKER_NETWORK]}
DOCKER_SUBNET=${ENV_VARS[DOCKER_SUBNET]}
DOCKER_GATEWAY=${ENV_VARS[DOCKER_GATEWAY]}
COMPOSE_PROJECT_NAME=${ENV_VARS[COMPOSE_PROJECT_NAME]}
COMPOSE_FILE=${ENV_VARS[COMPOSE_FILE]}

# MCP SERVER PORTS
MCP_CLAUDE_FLOW_PORT=${ENV_VARS[MCP_CLAUDE_FLOW_PORT]}
MCP_ARCHON_PORT=${ENV_VARS[MCP_ARCHON_PORT]}
MCP_METAMCP_PORT=${ENV_VARS[MCP_METAMCP_PORT]}
MCP_INFISICAL_PORT=${ENV_VARS[MCP_INFISICAL_PORT]}
MCP_EXA_PORT=${ENV_VARS[MCP_EXA_PORT]}

EOF

# Service Ports
if [[ "$PC_TYPE" = "orchestrator" ]]; then
    cat >> "$OUTPUT_FILE" << EOF
# SERVICE PORTS (Orchestrator)
ORCHESTRATOR_API_PORT=${ENV_VARS[ORCHESTRATOR_API_PORT]}
ORCHESTRATOR_MGMT_PORT=${ENV_VARS[ORCHESTRATOR_MGMT_PORT]}
POSTGRES_PORT=${ENV_VARS[POSTGRES_PORT]}
REDIS_PORT=${ENV_VARS[REDIS_PORT]}
NEO4J_HTTP_PORT=${ENV_VARS[NEO4J_HTTP_PORT]}
NEO4J_BOLT_PORT=${ENV_VARS[NEO4J_BOLT_PORT]}
FALKORDB_PORT=${ENV_VARS[FALKORDB_PORT]}
CHROMA_PORT=${ENV_VARS[CHROMA_PORT]}
QDRANT_PORT=${ENV_VARS[QDRANT_PORT]}
GITEA_HTTP_PORT=${ENV_VARS[GITEA_HTTP_PORT]}
GITEA_SSH_PORT=${ENV_VARS[GITEA_SSH_PORT]}
N8N_PORT=${ENV_VARS[N8N_PORT]}

# DATABASE CONFIGURATION
POSTGRES_DB=${ENV_VARS[POSTGRES_DB]}
POSTGRES_USER=${ENV_VARS[POSTGRES_USER]}
POSTGRES_PASSWORD=${ENV_VARS[POSTGRES_PASSWORD]}
POSTGRES_URL=${ENV_VARS[POSTGRES_URL]}

REDIS_PASSWORD=${ENV_VARS[REDIS_PASSWORD]}
REDIS_URL=${ENV_VARS[REDIS_URL]}

NEO4J_USER=${ENV_VARS[NEO4J_USER]}
NEO4J_PASSWORD=${ENV_VARS[NEO4J_PASSWORD]}
NEO4J_URL=${ENV_VARS[NEO4J_URL]}

CHROMA_TOKEN=${ENV_VARS[CHROMA_TOKEN]}
CHROMADB_URL=${ENV_VARS[CHROMADB_URL]}

QDRANT_API_KEY=${ENV_VARS[QDRANT_API_KEY]}
QDRANT_URL=${ENV_VARS[QDRANT_URL]}

FALKORDB_URL=${ENV_VARS[FALKORDB_URL]}

EOF
else
    cat >> "$OUTPUT_FILE" << EOF
# SERVICE PORTS (Worker)
WORKER_API_PORT=${ENV_VARS[WORKER_API_PORT]}
WORKER_GPU_METRICS_PORT=${ENV_VARS[WORKER_GPU_METRICS_PORT]}

# ORCHESTRATOR CONNECTION
ORCHESTRATOR_URL=${ENV_VARS[ORCHESTRATOR_URL]}
ORCHESTRATOR_IP=${ENV_VARS[ORCHESTRATOR_IP]}

EOF
fi

# Application Secrets
cat >> "$OUTPUT_FILE" << EOF
# APPLICATION SECRETS
JWT_SECRET=${ENV_VARS[JWT_SECRET]}
SESSION_SECRET=${ENV_VARS[SESSION_SECRET]}
ENCRYPTION_KEY=${ENV_VARS[ENCRYPTION_KEY]}

EOF

if [[ "$PC_TYPE" = "orchestrator" ]]; then
    cat >> "$OUTPUT_FILE" << EOF
# GITEA SECRETS
GITEA_SECRET_KEY=${ENV_VARS[GITEA_SECRET_KEY]}
GITEA_INTERNAL_TOKEN=${ENV_VARS[GITEA_INTERNAL_TOKEN]}

# N8N SECRETS
N8N_ENCRYPTION_KEY=${ENV_VARS[N8N_ENCRYPTION_KEY]}

EOF
fi

# Claude Flow Config
cat >> "$OUTPUT_FILE" << EOF
# CLAUDE FLOW CONFIGURATION
CLAUDE_FLOW_MODE=${ENV_VARS[CLAUDE_FLOW_MODE]}
CLAUDE_FLOW_HOOKS_ENABLED=${ENV_VARS[CLAUDE_FLOW_HOOKS_ENABLED]}
CLAUDE_FLOW_TOPOLOGY=${ENV_VARS[CLAUDE_FLOW_TOPOLOGY]}
CLAUDE_FLOW_MAX_AGENTS=${ENV_VARS[CLAUDE_FLOW_MAX_AGENTS]}
CLAUDE_FLOW_MEMORY_BACKEND=${ENV_VARS[CLAUDE_FLOW_MEMORY_BACKEND]}
CLAUDE_FLOW_DISTRIBUTED=${ENV_VARS[CLAUDE_FLOW_DISTRIBUTED]}

# PATHS AND DIRECTORIES
PROJECT_ROOT=${ENV_VARS[PROJECT_ROOT]}
DATA_DIR=${ENV_VARS[DATA_DIR]}
LOGS_DIR=${ENV_VARS[LOGS_DIR]}
CACHE_DIR=${ENV_VARS[CACHE_DIR]}
BACKUPS_DIR=${ENV_VARS[BACKUPS_DIR]}

# ============================================================================
# MANUAL SETUP REQUIRED - API KEYS AND CREDENTIALS
# ============================================================================
# These require online account creation. See USER-ACTION-GUIDE.md for details.

# Anthropic (Claude API)
ANTHROPIC_API_KEY=<get-from-console.anthropic.com>

# Google AI Studio (Gemini)
GOOGLE_AI_API_KEY=<get-from-aistudio.google.com>

# Infisical (Secrets Management)
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_TOKEN=<service-token-from-infisical>

# Tailscale (VPN)
TAILSCALE_AUTH_KEY=<get-from-admin.tailscale.com>

# Cloudflare (Tunnels) - Orchestrator Only
CLOUDFLARED_TOKEN=<create-tunnel-at-dash.cloudflare.com>

# Exa AI (Web Search MCP)
EXA_API_KEY=<get-from-dashboard.exa.ai>

# Optional Services
OPENROUTER_API_KEY=<optional>
TWILIO_ACCOUNT_SID=<optional>
TWILIO_AUTH_TOKEN=<optional>
SENDGRID_API_KEY=<optional>

# ============================================================================
# END OF CONFIGURATION
# ============================================================================
EOF

success "Environment file generated: $OUTPUT_FILE"

# ==============================================================================
# SUMMARY
# ==============================================================================
echo ""
echo -e "${CYAN}============================================================================${NC}"
echo -e "${GREEN}✅ AUTOMATED SETUP COMPLETE${NC}"
echo -e "${CYAN}============================================================================${NC}"
echo ""
echo -e "${YELLOW}Generated Variables:${NC}"
echo -e "  • System Configuration: 5 variables"
echo -e "  • Network Configuration: 6 variables"
[[ "$PC_TYPE" != "orchestrator" ]] && echo -e "  • GPU Configuration: 2 variables"
echo -e "  • Docker Configuration: 4 variables"
[[ "$PC_TYPE" = "orchestrator" ]] && echo -e "  • Service Ports: 13 variables" || echo -e "  • Service Ports: 7 variables"
[[ "$PC_TYPE" = "orchestrator" ]] && echo -e "  • Database Credentials: 15 generated passwords"
[[ "$PC_TYPE" = "orchestrator" ]] && echo -e "  • Application Secrets: 7 generated tokens" || echo -e "  • Application Secrets: 3 generated tokens"
echo -e "  • Claude Flow Config: 6 variables"
echo ""
echo -e "${CYAN}Output File: $OUTPUT_FILE${NC}"
echo ""
echo -e "${YELLOW}⚠️  MANUAL SETUP STILL REQUIRED:${NC}"
echo -e "  • Create online accounts (Anthropic, Google AI, Infisical, Tailscale, Cloudflare)"
echo -e "  • Get API keys and credentials"
echo -e "  • Update placeholder values in $OUTPUT_FILE"
echo -e "  • See: bootstrap/docs/USER-ACTION-GUIDE.md"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Review and edit $OUTPUT_FILE"
echo -e "  2. Complete manual setup from USER-ACTION-GUIDE.md"
echo -e "  3. Store secrets in Infisical using the export methodology"
echo -e "  4. Run Docker Compose to start services"
echo ""
echo -e "${CYAN}============================================================================${NC}"
