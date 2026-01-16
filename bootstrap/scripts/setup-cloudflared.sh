#!/bin/bash

# ==============================================================================
# Cloudflared Setup and Validation Script
# ==============================================================================
# This script helps set up Cloudflare Tunnels for all 4 PCs
#
# Usage:
#   ./setup-cloudflared.sh <pc-name>
#
# PC Names:
#   - orchestrator-mini
#   - worker-rtx5090
#   - worker-rtx3060
#   - worker-rtx3090ti
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   Cloudflare Tunnel Setup - Project Nyra                        ║
║   Secure External Access for Distributed Infrastructure          ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: PC name is required${NC}"
    echo ""
    echo "Usage: $0 <pc-name>"
    echo ""
    echo "Valid PC names:"
    echo "  - orchestrator-mini"
    echo "  - worker-rtx5090"
    echo "  - worker-rtx3060"
    echo "  - worker-rtx3090ti"
    exit 1
fi

PC_NAME="$1"

# Validate PC name
case "$PC_NAME" in
    orchestrator-mini|worker-rtx5090|worker-rtx3060|worker-rtx3090ti)
        echo -e "${GREEN}✓ Valid PC name: $PC_NAME${NC}"
        ;;
    *)
        echo -e "${RED}✗ Invalid PC name: $PC_NAME${NC}"
        echo ""
        echo "Valid options: orchestrator-mini, worker-rtx5090, worker-rtx3060, worker-rtx3090ti"
        exit 1
        ;;
esac

# Determine base directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
BOOTSTRAP_DIR="$(dirname "$SCRIPT_DIR")"
PC_DIR="$BOOTSTRAP_DIR/$PC_NAME/docker"

echo ""
echo -e "${BLUE}Setup Configuration:${NC}"
echo "  PC Name: $PC_NAME"
echo "  PC Directory: $PC_DIR"
echo ""

# Check if PC directory exists
if [ ! -d "$PC_DIR" ]; then
    echo -e "${RED}✗ Directory not found: $PC_DIR${NC}"
    exit 1
fi

cd "$PC_DIR"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validation checks
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✓ Docker installed${NC}"
    docker --version
else
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Check Docker Compose
if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose available${NC}"
    if command_exists docker-compose; then
        docker-compose --version
    else
        docker compose version
    fi
    COMPOSE_CMD="docker compose"
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    fi
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

echo ""

# Check if .env exists
echo -e "${BLUE}[2/6] Checking environment configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"

    # Check if tunnel token is set
    if grep -q "CLOUDFLARE_TUNNEL_TOKEN.*=.*your.*token" .env; then
        echo -e "${YELLOW}⚠ WARNING: Tunnel token not configured in .env${NC}"
        echo "  Please edit .env and set your Cloudflare tunnel token"
        echo ""
        read -p "Do you want to edit .env now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        else
            echo -e "${YELLOW}  Skipping. Please configure manually before starting services.${NC}"
        fi
    else
        echo -e "${GREEN}✓ Tunnel token appears to be configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"

    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
        echo -e "${YELLOW}⚠ Please edit .env and configure your tunnel token${NC}"
        echo ""
        read -p "Do you want to edit .env now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
fi

echo ""

# Validate docker-compose.yml
echo -e "${BLUE}[3/6] Validating docker-compose.yml...${NC}"

if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml exists${NC}"

    # Validate syntax
    if $COMPOSE_CMD config > /dev/null 2>&1; then
        echo -e "${GREEN}✓ docker-compose.yml syntax is valid${NC}"
    else
        echo -e "${RED}✗ docker-compose.yml has syntax errors:${NC}"
        $COMPOSE_CMD config
        exit 1
    fi
else
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    exit 1
fi

echo ""

# Check Docker network (for orchestrator)
echo -e "${BLUE}[4/6] Checking Docker networks...${NC}"

if [ "$PC_NAME" = "orchestrator-mini" ]; then
    # For orchestrator, check if external networks exist
    if docker network ls | grep -q "nyra-network"; then
        echo -e "${GREEN}✓ nyra-network exists${NC}"
    else
        echo -e "${YELLOW}⚠ nyra-network not found. It will be created when starting services.${NC}"
    fi
else
    # For workers, network is internal
    echo -e "${GREEN}✓ Worker will use internal network${NC}"
fi

echo ""

# Pull images
echo -e "${BLUE}[5/6] Pulling Docker images...${NC}"

if $COMPOSE_CMD pull cloudflared; then
    echo -e "${GREEN}✓ Successfully pulled cloudflared image${NC}"
else
    echo -e "${RED}✗ Failed to pull cloudflared image${NC}"
    exit 1
fi

echo ""

# Start services
echo -e "${BLUE}[6/6] Starting cloudflared service...${NC}"
echo ""

read -p "Do you want to start the cloudflared service now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if $COMPOSE_CMD up -d cloudflared; then
        echo -e "${GREEN}✓ Successfully started cloudflared${NC}"
        echo ""

        # Wait for health check
        echo "Waiting for health check..."
        sleep 10

        # Check status
        if docker ps | grep -q "cloudflared.*Up.*Healthy"; then
            echo -e "${GREEN}✓ Cloudflared is healthy${NC}"
        elif docker ps | grep -q "cloudflared.*Up"; then
            echo -e "${YELLOW}⚠ Cloudflared is running but health check not yet passed${NC}"
            echo "  Run 'docker logs <container-name>' to check logs"
        else
            echo -e "${RED}✗ Cloudflared is not running${NC}"
            echo "  Run 'docker logs <container-name>' to check logs"
        fi
    else
        echo -e "${RED}✗ Failed to start cloudflared${NC}"
        exit 1
    fi
else
    echo "Skipped. You can start services manually with:"
    echo "  cd $PC_DIR"
    echo "  $COMPOSE_CMD up -d cloudflared"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify tunnel status in Cloudflare Zero Trust dashboard"
echo "  2. Test external access to your services"
echo "  3. Configure access policies for security"
echo ""
echo "Useful commands:"
echo "  Check status:  $COMPOSE_CMD ps"
echo "  View logs:     $COMPOSE_CMD logs -f cloudflared"
echo "  Stop service:  $COMPOSE_CMD stop cloudflared"
echo "  Restart:       $COMPOSE_CMD restart cloudflared"
echo ""
echo "Documentation:"
echo "  See docs/deployment/CLOUDFLARE-TUNNEL-SETUP.md for detailed guide"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
