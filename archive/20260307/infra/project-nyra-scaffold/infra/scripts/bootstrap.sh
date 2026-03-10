#!/bin/bash
# ===== PROJECT NYRA BOOTSTRAP SCRIPT =====
# One-click initialization and deployment
# Usage: bash infra/scripts/bootstrap.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Config
PROJECT_NAME="project-nyra"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Project Nyra Bootstrap${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# ===== CHECK PREREQUISITES =====
echo -e "${YELLOW}Checking prerequisites...${NC}"

command -v docker &> /dev/null || {
  echo -e "${RED}❌ Docker not found. Install Docker Desktop first.${NC}"
  exit 1
}

command -v docker-compose &> /dev/null || {
  echo -e "${RED}❌ Docker Compose not found.${NC}"
  exit 1
}

command -v make &> /dev/null || {
  echo -e "${RED}❌ Make not found. Install make:${NC}"
  echo "   macOS: brew install make"
  echo "   Ubuntu: sudo apt-get install make"
  exit 1
}

echo -e "${GREEN}✓ Docker, Compose, Make found${NC}"
echo ""

# ===== SETUP ENVIRONMENT =====
echo -e "${YELLOW}Setting up environment...${NC}"

if [ ! -f "$REPO_ROOT/.env" ]; then
  echo -e "${YELLOW}Creating .env from .env.example...${NC}"
  cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
  echo -e "${YELLOW}⚠️  Edit .env with your actual values before continuing!${NC}"
  echo ""
  read -p "Press Enter once you've edited .env..."
fi

echo -e "${GREEN}✓ .env configured${NC}"
echo ""

# ===== LOAD ENVIRONMENT =====
set -a
source "$REPO_ROOT/.env"
set +a

echo -e "${YELLOW}Checking critical env variables...${NC}"

[ -z "$ANTHROPIC_API_KEY" ] && {
  echo -e "${RED}❌ ANTHROPIC_API_KEY not set in .env${NC}"
  exit 1
}

[ -z "$TAILSCALE_AUTHKEY" ] && {
  echo -e "${RED}❌ TAILSCALE_AUTHKEY not set in .env${NC}"
  exit 1
}

echo -e "${GREEN}✓ Critical env variables present${NC}"
echo ""

# ===== CREATE DIRECTORIES =====
echo -e "${YELLOW}Creating directory structure...${NC}"

mkdir -p infra/{config,scripts,volumes}
mkdir -p services/{quote-engine,nexus-router,gitea-webhook-agent}
mkdir -p apps/{claude-flow,openclaw,archon-os}
mkdir -p src/{agents,schemas,utils,types}
mkdir -p docs

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# ===== DETECT MACHINE TYPE =====
echo -e "${YELLOW}Detecting machine type...${NC}"

MACHINE_TYPE="orchestrator"
read -p "Is this (o)rchestrator, (w)orker-area51, (t)worker-3090ti, or (m)worker-3060? [o/w/t/m]: " -n 1 MACHINE_CHOICE
echo ""

case $MACHINE_CHOICE in
  o|O) MACHINE_TYPE="orchestrator" ;;
  w|W) MACHINE_TYPE="worker-area51" ;;
  t|T) MACHINE_TYPE="worker-3090ti" ;;
  m|M) MACHINE_TYPE="worker-3060" ;;
  *) MACHINE_TYPE="orchestrator" ;;
esac

echo -e "${GREEN}✓ Machine type: $MACHINE_TYPE${NC}"
echo ""

# ===== BUILD QUOTE ENGINE =====
echo -e "${YELLOW}Building Quote Engine...${NC}"

cd "$REPO_ROOT/services/quote-engine"
docker build -t project-nyra/quote-engine:latest . || {
  echo -e "${RED}❌ Quote Engine build failed${NC}"
  exit 1
}

cd "$REPO_ROOT"
echo -e "${GREEN}✓ Quote Engine built${NC}"
echo ""

# ===== DEPLOY BASED ON MACHINE TYPE =====
echo -e "${YELLOW}Deploying $MACHINE_TYPE stack...${NC}"
echo ""

case $MACHINE_TYPE in
  orchestrator)
    echo "Starting Oracle + Orchestrator..."
    make bootstrap
    ;;
  worker-area51)
    echo "Starting vLLM worker (RTX 5090)..."
    docker-compose --profile area51 -f infra/docker-compose.workers.yml up -d
    ;;
  worker-3090ti)
    echo "Starting vLLM worker (RTX 3090Ti)..."
    docker-compose --profile 3090ti -f infra/docker-compose.workers.yml up -d
    ;;
  worker-3060)
    echo "Starting Ollama worker (RTX 3060)..."
    docker-compose --profile 3060 -f infra/docker-compose.workers.yml up -d
    ;;
esac

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Bootstrap Complete! 🚀${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify services are running:"
echo "   make status"
echo ""
echo "2. Check health:"
echo "   make health"
echo ""
echo "3. View logs:"
echo "   make logs"
echo ""
echo "4. Test the API:"
if [ "$MACHINE_TYPE" = "orchestrator" ]; then
  echo "   curl http://localhost:6000/health (Nexus Router)"
  echo "   curl http://localhost:4000/health (LiteLLM)"
  echo "   curl http://localhost:8080/health (Claude-Flow)"
fi
echo ""

if [ "$MACHINE_TYPE" != "orchestrator" ]; then
  echo -e "${YELLOW}Worker Registration:${NC}"
  echo "Update Tailscale IPs in litellm-config.yaml:"
  echo "  Find your IP: tailscale status"
  echo "  Replace 100.x.x.1/2/3 with actual IPs"
  echo ""
fi

echo -e "${GREEN}Happy coding! 🎉${NC}"
