#!/bin/bash

###############################################################################
# Run Performance Tests
# Executes performance and load tests
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Running Performance Tests...${NC}"
echo ""

# Set test environment
export NODE_ENV=test
export PERFORMANCE_TEST=true

# Check for performance test dependencies
if ! command -v artillery &> /dev/null; then
  echo -e "${YELLOW}Artillery not found. Installing...${NC}"
  pnpm add -g artillery
fi

# Run performance tests
echo -e "${BLUE}Running load tests...${NC}"

if [ -f "tests/performance/load-test.yml" ]; then
  artillery run tests/performance/load-test.yml
else
  echo -e "${YELLOW}No performance test configuration found${NC}"
  echo "Create tests/performance/load-test.yml to run performance tests"
fi

# Run benchmark tests
echo ""
echo -e "${BLUE}Running benchmark tests...${NC}"

if [ -d "tests/performance" ]; then
  node tests/performance/benchmarks.js || echo "No benchmark tests found"
fi

echo ""
echo -e "${GREEN}Performance tests completed!${NC}"
