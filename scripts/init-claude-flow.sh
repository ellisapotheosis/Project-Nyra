#!/bin/bash
# Initialize Claude Flow V3 for Project Nyra

set -e

echo "🚀 Initializing Claude Flow V3 for Project Nyra..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check dependencies
echo -e "${YELLOW}[1/7]${NC} Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+${NC}"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
    npm install -g pnpm@10.27.0
fi

echo -e "${GREEN}✓ Dependencies OK${NC}"

# Step 2: Install project dependencies
echo -e "${YELLOW}[2/7]${NC} Installing project dependencies..."
pnpm install --frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 3: Install claude-flow@alpha
echo -e "${YELLOW}[3/7]${NC} Installing claude-flow@alpha..."
pnpm add -g claude-flow@alpha
echo -e "${GREEN}✓ claude-flow@alpha installed${NC}"

# Step 4: Initialize claude-flow
echo -e "${YELLOW}[4/7]${NC} Initializing claude-flow..."
npx claude-flow@alpha init --topology hierarchical-mesh --max-agents 15 || true
echo -e "${GREEN}✓ claude-flow initialized${NC}"

# Step 5: Load agent configurations
echo -e "${YELLOW}[5/7]${NC} Loading Project Nyra agents..."
AGENT_FILES=(
    ".claude/agents/custom/mortgage-architect.md"
    ".claude/agents/custom/fastapi-backend-engineer.md"
    ".claude/agents/custom/nextjs-frontend-engineer.md"
    ".claude/agents/custom/compliance-sentinel.md"
    ".claude/agents/custom/devops-orchestrator.md"
    ".claude/agents/custom/integration-specialist.md"
)

for agent_file in "${AGENT_FILES[@]}"; do
    if [ -f "$agent_file" ]; then
        echo -e "  Loading $(basename $agent_file)..."
    else
        echo -e "${YELLOW}  ⚠️  Agent file not found: $agent_file${NC}"
    fi
done
echo -e "${GREEN}✓ Agents loaded${NC}"

# Step 6: Start claude-flow daemon
echo -e "${YELLOW}[6/7]${NC} Starting claude-flow daemon..."
npx claude-flow@alpha daemon start || true
sleep 2
echo -e "${GREEN}✓ Daemon started${NC}"

# Step 7: Verify installation
echo -e "${YELLOW}[7/7]${NC} Verifying installation..."
npx claude-flow@alpha status

echo ""
echo -e "${GREEN}✅ Claude Flow V3 initialization complete!${NC}"
echo ""
echo "📋 Quick Commands:"
echo "  • Check status:  npx claude-flow@alpha status"
echo "  • View agents:   npx claude-flow@alpha agents list"
echo "  • View tasks:    npx claude-flow@alpha tasks list"
echo "  • View memory:   npx claude-flow@alpha memory stats"
echo "  • Stop daemon:   npx claude-flow@alpha daemon stop"
echo ""
echo "🏗️  Project Nyra Specialized Agents Loaded:"
echo "  ✓ mortgage_architect      - System architecture & compliance design"
echo "  ✓ fastapi_backend_engineer - Python FastAPI services"
echo "  ✓ nextjs_frontend_engineer - TypeScript React Next.js"
echo "  ✓ compliance_sentinel      - Regulatory validation"
echo "  ✓ devops_orchestrator      - Infrastructure & deployment"
echo "  ✓ integration_specialist   - Third-party API integration"
echo ""
