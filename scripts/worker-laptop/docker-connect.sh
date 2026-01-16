#!/bin/bash
#
# Project Nyra - Worker Laptop Docker Connection
# Connects worker laptop to orchestrator's Docker via SSH tunnel
#
# Usage: ./docker-connect.sh
#   or: docker-connect (if alias is set in .bashrc)
#
# Location: ~/nyra/project-nyra/scripts/worker-laptop/docker-connect.sh
#

set -e

ORCHESTRATOR_IP="10.0.0.1"
ORCHESTRATOR_USER="nyra"
LOCAL_PORT="2375"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔌 Nyra Orchestrator Docker Connection${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${YELLOW}⚠️  SSH key not found. Generating...${NC}"
    ssh-keygen -t ed25519 -C "worker-laptop" -f ~/.ssh/id_ed25519 -N ""
    echo ""
    echo -e "${YELLOW}📋 Copy this public key to orchestrator:${NC}"
    cat ~/.ssh/id_ed25519.pub
    echo ""
    echo -e "${YELLOW}On orchestrator, run:${NC}"
    echo -e "  ssh nyra@10.0.0.1"
    echo -e "  echo '<your-public-key>' >> ~/.ssh/authorized_keys"
    echo ""
    exit 1
fi

# Test SSH connection first
echo -e "${BLUE}🧪 Testing SSH connection to orchestrator...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP}" exit 2>/dev/null; then
    echo -e "${RED}❌ Cannot connect to orchestrator via SSH${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo -e "  1. Verify orchestrator is powered on and WSL is running"
    echo -e "  2. Test network: ping ${ORCHESTRATOR_IP}"
    echo -e "  3. Copy SSH key to orchestrator (see above)"
    echo -e "  4. Test SSH manually: ssh ${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP}"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ SSH connection successful${NC}"
echo ""

# Check if tunnel already exists
echo -e "${BLUE}🔍 Checking for existing SSH tunnel...${NC}"
if pgrep -f "ssh.*${ORCHESTRATOR_IP}.*docker.sock" > /dev/null; then
    echo -e "${GREEN}✅ SSH tunnel already active${NC}"
else
    echo -e "${BLUE}📡 Creating SSH tunnel...${NC}"

    # Forward local port to orchestrator's Docker socket
    ssh -f -N -L ${LOCAL_PORT}:/var/run/docker.sock ${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP}

    # Wait for tunnel to establish
    sleep 2

    if pgrep -f "ssh.*${ORCHESTRATOR_IP}.*docker.sock" > /dev/null; then
        echo -e "${GREEN}✅ SSH tunnel established${NC}"
    else
        echo -e "${RED}❌ Failed to create SSH tunnel${NC}"
        exit 1
    fi
fi
echo ""

# Export Docker host for current session
export DOCKER_HOST=tcp://localhost:${LOCAL_PORT}

# Test Docker connection
echo -e "${BLUE}🧪 Testing Docker connection...${NC}"
if docker version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connected to orchestrator Docker!${NC}"
    echo ""

    # Show summary of running containers
    echo -e "${BLUE}📊 Container Summary:${NC}"
    TOTAL=$(docker ps --format '{{.Names}}' | wc -l)
    echo -e "  Total running: ${GREEN}${TOTAL}${NC} containers"
    echo ""

    echo -e "${BLUE}📦 Top 10 Services:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -11
    echo ""

    # Show critical services status
    echo -e "${BLUE}🏥 Critical Services:${NC}"
    for service in postgres redis mongo infisical claude-flow nexus; do
        if docker ps --format '{{.Names}}' | grep -q "$service"; then
            echo -e "  ${GREEN}✅${NC} $service"
        else
            echo -e "  ${YELLOW}⚠️${NC}  $service (not found)"
        fi
    done
    echo ""

    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 Ready to develop!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  • View all containers: ${YELLOW}docker ps${NC}"
    echo -e "  • View logs: ${YELLOW}docker logs <container-name>${NC}"
    echo -e "  • Start Claude Code: ${YELLOW}cd ~/nyra/project-nyra && claude-code${NC}"
    echo ""
    echo -e "${BLUE}💡 Tip:${NC} Add to .bashrc for auto-connect:"
    echo -e "    ${YELLOW}export DOCKER_HOST=tcp://localhost:${LOCAL_PORT}${NC}"
    echo ""
else
    echo -e "${RED}❌ Docker connection failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "  1. Check if Docker is running on orchestrator:"
    echo -e "     ${YELLOW}ssh ${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP} 'docker ps'${NC}"
    echo -e "  2. Verify orchestrator user is in docker group:"
    echo -e "     ${YELLOW}ssh ${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP} 'groups'${NC}"
    echo -e "  3. Restart Docker on orchestrator:"
    echo -e "     ${YELLOW}ssh ${ORCHESTRATOR_USER}@${ORCHESTRATOR_IP} 'sudo systemctl restart docker'${NC}"
    echo ""
    exit 1
fi
