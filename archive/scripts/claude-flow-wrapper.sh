#!/bin/bash
# Claude Flow V3 Wrapper Script - Ensures proper environment and dependencies

# Set project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if zod is available globally
if ! npm list -g zod >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Installing missing zod dependency globally...${NC}"
    npm install -g zod >/dev/null 2>&1
fi

# Check if claude-flow@alpha is available
if ! command -v npx >/dev/null 2>&1; then
    echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
    exit 1
fi

# Run claude-flow command with all arguments passed through
echo -e "${GREEN}▶ Running: claude-flow@alpha $@${NC}"
npx claude-flow@alpha "$@"
