#!/bin/bash
# ==============================================================================
# Project Nyra - Integration Test Runner
# ==============================================================================
# Run all integration tests against running services
#
# Usage:
#   ./run_tests.sh
#   ./run_tests.sh --coverage
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Integration Tests${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Check if services are running
echo -e "${BLUE}Checking if services are running...${NC}"
if ! docker ps | grep -q nyra-orchestrator; then
    echo -e "${YELLOW}Services not running. Starting services...${NC}"
    docker-compose -f infra/docker-compose.dev.yml -p nyra up -d
    echo -e "${YELLOW}Waiting for services to be ready (30 seconds)...${NC}"
    sleep 30
fi

# Run health checks
echo -e "${BLUE}Running health checks...${NC}"
if bash scripts/deployment/health-check.sh; then
    echo -e "${GREEN}✓ All services healthy${NC}"
else
    echo -e "${RED}✗ Some services unhealthy. Tests may fail.${NC}"
fi

echo ""

# Install test dependencies
echo -e "${BLUE}Installing test dependencies...${NC}"
pip install -q -r tests/integration/requirements.txt

echo ""

# Run tests
echo -e "${BLUE}Running integration tests...${NC}"
echo ""

if [ "$1" == "--coverage" ]; then
    pip install -q pytest-cov
    pytest tests/integration/ -v -s --cov=services --cov-report=html
    echo ""
    echo -e "${GREEN}Coverage report generated: htmlcov/index.html${NC}"
else
    pytest tests/integration/ -v -s
fi

echo ""
echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}  Integration Tests Complete${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo ""
