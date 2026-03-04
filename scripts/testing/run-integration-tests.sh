#!/bin/bash

###############################################################################
# Run Integration Tests
# Executes integration tests with service dependencies
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}Running Integration Tests...${NC}"
echo ""

# Set test environment
export NODE_ENV=test
export LOG_LEVEL=error
export USE_DOCKER_SERVICES=true

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${YELLOW}Warning: Docker is not running. Some integration tests may fail.${NC}"
  echo -e "${BLUE}Starting Docker services...${NC}"

  # Try to start Docker services
  if [ -f "infra/docker-compose.test.yml" ]; then
    docker-compose -f infra/docker-compose.test.yml up -d
    echo "Waiting for services to be ready..."
    sleep 10
  fi
fi

# Run Jest with integration test configuration
pnpm test -- --config=jest.config.integration.js --coverage --runInBand

# Cleanup Docker services
if [ -f "infra/docker-compose.test.yml" ] && [ "${KEEP_SERVICES}" != "true" ]; then
  echo ""
  echo -e "${BLUE}Stopping Docker test services...${NC}"
  docker-compose -f infra/docker-compose.test.yml down -v
fi

echo ""
echo -e "${GREEN}Integration tests completed!${NC}"
