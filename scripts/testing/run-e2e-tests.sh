#!/bin/bash

###############################################################################
# Run E2E Tests
# Executes end-to-end tests with Playwright
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Running E2E Tests...${NC}"
echo ""

# Set test environment
export NODE_ENV=test
export E2E_TEST=true
export BASE_URL=${BASE_URL:-http://localhost:3000}

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
  echo -e "${BLUE}Installing Playwright browsers...${NC}"
  pnpm exec playwright install --with-deps chromium
fi

# Check if specific browser is requested
BROWSER=${BROWSER:-chromium}

echo -e "${BLUE}Testing with browser: ${BROWSER}${NC}"

# Run Playwright tests
if [ "${HEADED}" = "true" ]; then
  echo -e "${BLUE}Running tests in headed mode...${NC}"
  pnpm exec playwright test --project=${BROWSER} --headed
else
  pnpm exec playwright test --project=${BROWSER}
fi

# Generate HTML report
if [ "${SKIP_REPORT}" != "true" ]; then
  echo ""
  echo -e "${BLUE}Generating test report...${NC}"
  pnpm exec playwright show-report
fi

echo ""
echo -e "${GREEN}E2E tests completed!${NC}"
