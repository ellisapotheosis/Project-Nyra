#!/bin/bash

# Nexus Router Test Suite Runner
# Runs all tests (unit, integration, e2e) with proper reporting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Nexus Router Test Suite Runner${NC}\n"

# Check if npm is available
if ! command -v npm &> /dev/null; then
  echo -e "${RED}npm not found. Please install Node.js and npm.${NC}"
  exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Parse command line arguments
TEST_FILTER=""
TEST_MODE="all"

while [[ $# -gt 0 ]]; do
  case $1 in
    --unit)
      TEST_MODE="unit"
      shift
      ;;
    --integration)
      TEST_MODE="integration"
      shift
      ;;
    --e2e)
      TEST_MODE="e2e"
      shift
      ;;
    --filter)
      TEST_FILTER="$2"
      shift 2
      ;;
    --watch)
      WATCH_MODE="--watch"
      shift
      ;;
    --coverage)
      COVERAGE_MODE="--coverage"
      shift
      ;;
    --help)
      echo "Usage: ./scripts/run-tests.sh [options]"
      echo ""
      echo "Options:"
      echo "  --unit          Run only unit tests"
      echo "  --integration   Run only integration tests"
      echo "  --e2e           Run only e2e tests"
      echo "  --filter        Filter tests by name pattern"
      echo "  --watch         Run tests in watch mode"
      echo "  --coverage      Generate coverage report"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}Test Configuration${NC}"
echo "==================="
echo "Mode: $TEST_MODE"
if [ -n "$TEST_FILTER" ]; then
  echo "Filter: $TEST_FILTER"
fi
if [ -n "$WATCH_MODE" ]; then
  echo "Watch mode: enabled"
fi
if [ -n "$COVERAGE_MODE" ]; then
  echo "Coverage: enabled"
fi
echo ""

# Run tests based on mode
case $TEST_MODE in
  unit)
    echo -e "${BLUE}Running Unit Tests...${NC}\n"
    npm test -- $WATCH_MODE $COVERAGE_MODE --testPathPattern="__tests__/unit" $TEST_FILTER
    ;;
  integration)
    echo -e "${BLUE}Running Integration Tests...${NC}\n"
    npm test -- $WATCH_MODE $COVERAGE_MODE --testPathPattern="__tests__/integration" $TEST_FILTER
    ;;
  e2e)
    echo -e "${BLUE}Running E2E Tests...${NC}\n"
    npm test -- $WATCH_MODE $COVERAGE_MODE --testPathPattern="__tests__/e2e" $TEST_FILTER
    ;;
  all)
    echo -e "${BLUE}Running All Tests...${NC}\n"
    npm test -- $WATCH_MODE $COVERAGE_MODE
    ;;
esac

# Check test results
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"

  # Show coverage summary if coverage was enabled
  if [ -n "$COVERAGE_MODE" ]; then
    echo -e "\n${BLUE}Coverage Report${NC}"
    if [ -f "coverage/lcov-report/index.html" ]; then
      echo "Coverage report generated: coverage/lcov-report/index.html"
    fi
  fi
else
  echo -e "\n${RED}Tests failed!${NC}"
  exit 1
fi
