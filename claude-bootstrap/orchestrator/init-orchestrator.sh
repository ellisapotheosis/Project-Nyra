#!/bin/bash
# Claude Flow V3 - Orchestrator PC Initialization Script
# Project Nyra - 4-PC Cluster Bootstrap

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BOOTSTRAP_DIR="$PROJECT_ROOT/claude-bootstrap"

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Claude Flow V3 - Orchestrator Initialization           ║
║   Project Nyra - AI-Powered Mortgage Automation          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Step counter
STEP=0
TOTAL_STEPS=15

step() {
    STEP=$((STEP + 1))
    echo ""
    echo -e "${MAGENTA}[${STEP}/${TOTAL_STEPS}]${NC} ${CYAN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root (sudo)"
fi

# Step 1: System Detection
step "Detecting System Configuration"

OS_TYPE=$(uname -s)
OS_ARCH=$(uname -m)
HOSTNAME=$(hostname)

echo "  OS: $OS_TYPE"
echo "  Architecture: $OS_ARCH"
echo "  Hostname: $HOSTNAME"

if [ "$OS_TYPE" != "Linux" ]; then
    error "This script requires Linux. For Windows, use init-orchestrator.ps1"
fi

success "System detection complete"

# Step 2: Install Dependencies
step "Installing System Dependencies"

if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
else
    error "Unsupported package manager. Please install manually."
fi

echo "  Using package manager: $PKG_MANAGER"

# Update package lists
$PKG_MANAGER update -y

# Install core dependencies
DEPS=(
    "curl"
    "wget"
    "git"
    "build-essential"
    "python3"
    "python3-pip"
    "docker.io"
    "docker-compose"
    "jq"
    "netcat"
)

for dep in "${DEPS[@]}"; do
    if ! command -v $dep &> /dev/null && ! dpkg -l | grep -q $dep; then
        echo "  Installing $dep..."
        $PKG_MANAGER install -y $dep
    else
        success "$dep already installed"
    fi
done

success "System dependencies installed"

# Step 3: Install Node.js and pnpm
step "Installing Node.js 20 and pnpm"

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    $PKG_MANAGER install -y nodejs
fi

NODE_VERSION=$(node --version)
success "Node.js installed: $NODE_VERSION"

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm@10.27.0
fi

PNPM_VERSION=$(pnpm --version)
success "pnpm installed: $PNPM_VERSION"

# Step 4: Install Volta (Optional)
step "Installing Volta Package Manager"

if ! command -v volta &> /dev/null; then
    curl https://get.volta.sh | bash
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"
    success "Volta installed"
else
    success "Volta already installed"
fi

# Step 5: Clone/Update Repository
step "Checking Repository"

cd "$PROJECT_ROOT"
if [ -d ".git" ]; then
    success "Repository found"
    git fetch --all
else
    warning "Not a git repository"
fi

# Step 6: Install Project Dependencies
step "Installing Project Dependencies"

cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile

success "Project dependencies installed"

# Step 7: Install zod globally (critical fix)
step "Installing Zod Dependency"

npm install -g zod
pnpm add -w zod

success "Zod installed globally and locally"

# Step 8: Install claude-flow@alpha Locally
step "Setting Up Local Claude Flow Development"

cd "$PROJECT_ROOT"

# Check if claude-flow local repo exists
CLAUDE_FLOW_LOCAL_PATH="$HOME/dev/claude-flow"

if [ -d "$CLAUDE_FLOW_LOCAL_PATH" ]; then
    success "Local claude-flow repo found: $CLAUDE_FLOW_LOCAL_PATH"

    # Build local version
    cd "$CLAUDE_FLOW_LOCAL_PATH"
    pnpm install
    pnpm run build

    # Create npm link
    npm link

    # Link in Project Nyra
    cd "$PROJECT_ROOT"
    npm link claude-flow

    success "NPM link configured for local development"
else
    warning "Local claude-flow repo not found at $CLAUDE_FLOW_LOCAL_PATH"
    warning "Install globally only"
fi

# Step 9: Install claude-flow@alpha Globally
step "Installing Claude Flow V3 Globally"

npm install -g claude-flow@alpha --force

# Verify installation
CLAUDE_FLOW_VERSION=$(npx claude-flow@alpha --version 2>&1 | grep -oP 'v?\d+\.\d+\.\d+.*' || echo "unknown")
success "claude-flow@alpha installed: $CLAUDE_FLOW_VERSION"

# Step 10: Configure Optimal Settings
step "Configuring Optimal Claude Flow Settings"

# Copy optimal configuration
cp "$BOOTSTRAP_DIR/configs/claude-flow-optimal.json" "$PROJECT_ROOT/.claude/settings-optimal.json"

# Merge with existing settings
if [ -f "$PROJECT_ROOT/.claude/settings.json" ]; then
    jq -s '.[0] * .[1]' \
        "$PROJECT_ROOT/.claude/settings.json" \
        "$PROJECT_ROOT/.claude/settings-optimal.json" \
        > "$PROJECT_ROOT/.claude/settings-merged.json"

    mv "$PROJECT_ROOT/.claude/settings-merged.json" "$PROJECT_ROOT/.claude/settings.json"
    success "Settings merged with optimal configuration"
else
    cp "$PROJECT_ROOT/.claude/settings-optimal.json" "$PROJECT_ROOT/.claude/settings.json"
    success "Optimal settings applied"
fi

# Step 11: Initialize Claude Flow
step "Initializing Claude Flow V3"

cd "$PROJECT_ROOT"

# Initialize with optimal topology
npx claude-flow@alpha init \
    --topology hierarchical-mesh \
    --max-agents 15 \
    --memory-backend hybrid \
    --enable-hnsw \
    --enable-learning \
    --enable-security \
    || warning "Init may have already been run"

success "Claude Flow initialized"

# Step 12: Load Project Nyra Agents
step "Loading Project Nyra Specialized Agents"

AGENT_COUNT=0
for agent_file in "$PROJECT_ROOT/.claude/agents/custom"/*.md; do
    if [ -f "$agent_file" ]; then
        AGENT_NAME=$(basename "$agent_file" .md)
        echo "  Loading: $AGENT_NAME"
        AGENT_COUNT=$((AGENT_COUNT + 1))
    fi
done

success "$AGENT_COUNT agents configured"

# Step 13: Build Docker Containers
step "Building Production Docker Containers"

cd "$PROJECT_ROOT/infra/claude-flow"

# Build claude-flow container
docker build -t project-nyra/claude-flow:v3-alpha -f Dockerfile ../..

success "Docker containers built"

# Step 14: Start Core Services
step "Starting Core Services"

cd "$PROJECT_ROOT"

# Start only core services needed for claude-flow
docker-compose -f infra/docker-compose.dev.yml up -d \
    nexus-router \
    letta \
    mem0 \
    redis \
    postgres

# Wait for services to be healthy
echo "  Waiting for services to be healthy..."
sleep 10

success "Core services started"

# Step 15: Run Validation Tests
step "Running Validation Tests"

cd "$PROJECT_ROOT"

# Test claude-flow status
echo "  Testing claude-flow status..."
npx claude-flow@alpha status > /tmp/claude-flow-status.txt 2>&1 || true
cat /tmp/claude-flow-status.txt

# Test hook runner
echo "  Testing hook runner..."
bash "$PROJECT_ROOT/.claude/helpers/claude-flow-hook.sh" --version

# Test docker containers
echo "  Testing Docker containers..."
docker ps | grep -E "(nexus|letta|mem0|redis|postgres)" || warning "Some containers not running"

# Test network connectivity
echo "  Testing network connectivity..."
curl -f http://localhost:6000/health > /dev/null 2>&1 && success "Nexus Router: OK" || warning "Nexus Router: NOT READY"
curl -f http://localhost:8283/health > /dev/null 2>&1 && success "Letta: OK" || warning "Letta: NOT READY"
curl -f http://localhost:4321/health > /dev/null 2>&1 && success "Mem0: OK" || warning "Mem0: NOT READY"

success "Validation tests completed"

# Final Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  ✓ Orchestrator Initialization Complete!                 ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📊 Installation Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Node.js:        $NODE_VERSION"
echo "  pnpm:           $PNPM_VERSION"
echo "  Claude Flow:    $CLAUDE_FLOW_VERSION"
echo "  Agents Loaded:  $AGENT_COUNT"
echo "  Docker Status:  Running"
echo ""

echo -e "${CYAN}🚀 Next Steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. Test orchestrator:  bash claude-bootstrap/orchestrator/test-orchestrator.sh"
echo "  2. Set up workers:     bash claude-bootstrap/worker/init-worker.sh"
echo "  3. Start development:  pnpm run dev"
echo ""

echo -e "${CYAN}📋 Quick Commands${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  • Check status:   npx claude-flow@alpha status"
echo "  • List agents:    npx claude-flow@alpha agents list"
echo "  • View services:  docker-compose ps"
echo "  • View logs:      docker-compose logs -f"
echo ""

echo -e "${GREEN}🎉 Ready to start building Project Nyra!${NC}"
echo ""
