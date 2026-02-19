#!/bin/bash
# Infisical Docker Compose Wrapper
# Usage: ./scripts/infisical-compose.sh up -d <service-name>
# Example: ./scripts/infisical-compose.sh up -d archon

set -e

# Infisical configuration
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_PATH="${INFISICAL_PATH:-/shared}"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Running Docker Compose with Infisical secrets...${NC}"
echo -e "${YELLOW}Project ID: ${INFISICAL_PROJECT_ID}${NC}"
echo -e "${YELLOW}Environment: ${INFISICAL_ENV}${NC}"
echo -e "${YELLOW}Path: ${INFISICAL_PATH}${NC}"
echo ""

# Run docker-compose with Infisical
infisical run \
  --projectId="${INFISICAL_PROJECT_ID}" \
  --env="${INFISICAL_ENV}" \
  --path="${INFISICAL_PATH}" \
  -- docker-compose "$@"

echo -e "${GREEN}✅ Command completed${NC}"
