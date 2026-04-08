#!/bin/bash

###############################################################################
# Run All Tests
# Executes complete test suite: unit, integration, and E2E tests
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Project Nyra - Complete Test Suite${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Track test results
FAILED_TESTS=()

# Function to run tests and track failures
run_test() {
  local test_name=$1
  local test_command=$2

  echo -e "${YELLOW}Running ${test_name}...${NC}"

  if eval "$test_command"; then
    echo -e "${GREEN}✓ ${test_name} passed${NC}"
    echo ""
  else
    echo -e "${RED}✗ ${test_name} failed${NC}"
    FAILED_TESTS+=("$test_name")
    echo ""
    if [ "${CONTINUE_ON_ERROR}" != "true" ]; then
      exit 1
    fi
  fi
}

# Run unit tests
run_test "Unit Tests" "bash scripts/testing/run-unit-tests.sh"

# Run integration tests
run_test "Integration Tests" "bash scripts/testing/run-integration-tests.sh"

# Run E2E tests
run_test "E2E Tests" "bash scripts/testing/run-e2e-tests.sh"

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Test Summary${NC}"
echo -e "${GREEN}========================================${NC}"

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
  echo -e "${GREEN}All tests passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}Failed tests:${NC}"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "${RED}  - ${test}${NC}"
  done
  exit 1
fi
