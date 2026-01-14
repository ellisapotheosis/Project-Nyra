#!/bin/bash
# ==============================================================================
# Project Nyra - Start Services Script
# ==============================================================================
# Start all Project Nyra services
#
# Usage:
#   ./start-services.sh [service...]
#   ./start-services.sh                    # Start all services
#   ./start-services.sh quote-engine       # Start specific service
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

COMPOSE_FILE="infra/docker-compose.dev.yml"
PROJECT_NAME="nyra"

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Starting Services${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

if [ $# -eq 0 ]; then
    echo -e "${BLUE}Starting all services...${NC}"
    docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d
else
    echo -e "${BLUE}Starting services: $@${NC}"
    docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d "$@"
fi

echo ""
echo -e "${GREEN}Services started successfully!${NC}"
echo ""
echo -e "View logs:    docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} logs -f"
echo -e "Check status: docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} ps"
echo ""
