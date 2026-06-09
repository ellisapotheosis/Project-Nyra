#!/bin/bash

###############################################################################
# Run Unit Tests
# Executes fast, isolated unit tests
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Running Unit Tests...${NC}"
echo ""

# Set test environment
export NODE_ENV=test
export LOG_LEVEL=error

# Run the implemented unit/smoke suite. Broader gap-tracking tests remain
# available through the full Vitest config but are not CI-gating.
pnpm exec vitest --config vitest.smoke.config.mjs run --maxWorkers=4

echo ""
echo -e "${GREEN}Unit tests completed!${NC}"
