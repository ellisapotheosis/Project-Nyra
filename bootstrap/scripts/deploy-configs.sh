#!/bin/bash
# ==============================================================================
# CONFIG DEPLOYMENT SCRIPT
# ==============================================================================
# Deploys shared configuration files from bootstrap/configs/ to target locations
# Usage: ./deploy-configs.sh [--type <config-type>] [--target <pc-name>] [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIGS_DIR="$PROJECT_ROOT/bootstrap/configs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default options
DRY_RUN=false
CONFIG_TYPE="all"
TARGET="local"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            CONFIG_TYPE="$2"
            shift 2
            ;;
        --target)
            TARGET="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [--type <config-type>] [--target <pc-name>] [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --type <type>       Deploy specific config type (claude-flow, mcp, env, infisical, agents, quality, docker, all)"
            echo "  --target <pc>       Target PC (local, orchestrator-mini, worker-rtx3090ti, worker-rtx3060, worker-rtx5090)"
            echo "  --dry-run           Show what would be done without making changes"
            echo "  --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to copy file with backup
copy_with_backup() {
    local src="$1"
    local dest="$2"
    local dest_dir="$(dirname "$dest")"
    
    # Create destination directory if needed
    if [ ! -d "$dest_dir" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would create directory: $dest_dir"
        else
            mkdir -p "$dest_dir"
            echo "${GREEN}✓${NC} Created directory: $dest_dir"
        fi
    fi
    
    # Backup existing file
    if [ -f "$dest" ]; then
        local backup="$dest.backup.$(date +%Y%m%d_%H%M%S)"
        if [ "$DRY_RUN" = true ]; then
            echo "[DRY-RUN] Would backup: $dest -> $backup"
        else
            cp "$dest" "$backup"
            echo "${YELLOW}!${NC} Backed up: $dest -> $backup"
        fi
    fi
    
    # Copy file
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would copy: $src -> $dest"
    else
        cp "$src" "$dest"
        echo "${GREEN}✓${NC} Copied: $src -> $dest"
    fi
}

# Deploy Claude Flow configs
deploy_claude_flow() {
    echo ""
    echo "=== Deploying Claude Flow Configs ==="
    copy_with_backup "$CONFIGS_DIR/claude-flow/claude-flow.config.json" "$PROJECT_ROOT/claude-flow.config.json"
    copy_with_backup "$CONFIGS_DIR/claude-flow/config.yaml" "$PROJECT_ROOT/.claude-flow/config.yaml"
    copy_with_backup "$CONFIGS_DIR/claude-flow/settings.json" "$PROJECT_ROOT/.claude-flow/settings.json"
    copy_with_backup "$CONFIGS_DIR/claude-flow/swarm-config.json" "$PROJECT_ROOT/.claude-flow/swarm-config.json"
    copy_with_backup "$CONFIGS_DIR/claude-flow/agents-profiles.json" "$PROJECT_ROOT/.claude-flow/agents-profiles.json"
}

# Deploy MCP configs
deploy_mcp() {
    echo ""
    echo "=== Deploying MCP Configs ==="
    if [ "$TARGET" = "local" ] || [ "$TARGET" = "orchestrator-mini" ]; then
        copy_with_backup "$CONFIGS_DIR/mcp/mcp.development.json" "$PROJECT_ROOT/.mcp.json"
    else
        copy_with_backup "$CONFIGS_DIR/mcp/mcp.json" "$PROJECT_ROOT/.mcp.json"
    fi
}

# Deploy environment templates
deploy_env() {
    echo ""
    echo "=== Deploying Environment Templates ==="
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        copy_with_backup "$CONFIGS_DIR/env/env.example" "$PROJECT_ROOT/.env"
        echo "${YELLOW}!${NC} Created .env from template - EDIT THIS FILE to add your secrets!"
    else
        echo "${YELLOW}!${NC} .env already exists - skipping (use --force to overwrite)"
    fi
}

# Deploy Infisical configs
deploy_infisical() {
    echo ""
    echo "=== Deploying Infisical Configs ==="
    copy_with_backup "$CONFIGS_DIR/infisical/infisical.json" "$PROJECT_ROOT/.infisical.json"
    copy_with_backup "$CONFIGS_DIR/infisical/docker-compose.infisical.yml" "$PROJECT_ROOT/docker-compose.infisical.yml"
}

# Deploy agent configs
deploy_agents() {
    echo ""
    echo "=== Deploying Agent Configs ==="
    for agent in "$CONFIGS_DIR/agents"/*.yaml; do
        local basename="$(basename "$agent")"
        copy_with_backup "$agent" "$PROJECT_ROOT/agents/$basename"
    done
}

# Deploy quality configs
deploy_quality() {
    echo ""
    echo "=== Deploying Code Quality Configs ==="
    copy_with_backup "$CONFIGS_DIR/quality/.yamllint.yml" "$PROJECT_ROOT/.yamllint.yml"
    copy_with_backup "$CONFIGS_DIR/quality/.audit-ci.json" "$PROJECT_ROOT/.audit-ci.json"
    copy_with_backup "$CONFIGS_DIR/quality/.prettierrc.json" "$PROJECT_ROOT/.prettierrc.json"
    copy_with_backup "$CONFIGS_DIR/quality/.eslintrc.json" "$PROJECT_ROOT/.eslintrc.json"
    copy_with_backup "$CONFIGS_DIR/quality/.releaserc.json" "$PROJECT_ROOT/.releaserc.json"
    copy_with_backup "$CONFIGS_DIR/quality/codecov.yml" "$PROJECT_ROOT/codecov.yml"
}

# Deploy Docker configs
deploy_docker() {
    echo ""
    echo "=== Deploying Docker Configs ==="
    copy_with_backup "$CONFIGS_DIR/docker/docker-compose.memory.yml" "$PROJECT_ROOT/docker-compose.memory.yml"
}

# Main deployment logic
echo "================================================================"
echo "  PROJECT NYRA - CONFIG DEPLOYMENT"
echo "================================================================"
echo "Source: $CONFIGS_DIR"
echo "Target: $TARGET"
echo "Type: $CONFIG_TYPE"
echo "Dry Run: $DRY_RUN"
echo "================================================================"

case $CONFIG_TYPE in
    claude-flow)
        deploy_claude_flow
        ;;
    mcp)
        deploy_mcp
        ;;
    env)
        deploy_env
        ;;
    infisical)
        deploy_infisical
        ;;
    agents)
        deploy_agents
        ;;
    quality)
        deploy_quality
        ;;
    docker)
        deploy_docker
        ;;
    all)
        deploy_claude_flow
        deploy_mcp
        deploy_env
        deploy_infisical
        deploy_agents
        deploy_quality
        deploy_docker
        ;;
    *)
        echo "${RED}✗${NC} Unknown config type: $CONFIG_TYPE"
        exit 1
        ;;
esac

echo ""
echo "================================================================"
if [ "$DRY_RUN" = true ]; then
    echo "${YELLOW}DRY RUN COMPLETE${NC} - No files were actually modified"
else
    echo "${GREEN}DEPLOYMENT COMPLETE${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env to add your secrets and PC-specific values"
    echo "2. Update MCP config paths if using local development"
    echo "3. Restart services to apply new configs"
fi
echo "================================================================"
