#!/bin/bash
# ==============================================================================
# Project Nyra - Stop Services Script
# ==============================================================================
# Stop all Project Nyra services
#
# Usage:
#   ./stop-services.sh [service...]
#   ./stop-services.sh                     # Stop all services
#   ./stop-services.sh quote-engine        # Stop specific service
#   ./stop-services.sh --remove-volumes    # Stop and remove volumes
#
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="infra/docker-compose.dev.yml"
PROJECT_NAME="nyra"
REMOVE_VOLUMES=false

# Check for --remove-volumes flag
if [ "$1" == "--remove-volumes" ]; then
    REMOVE_VOLUMES=true
    shift
fi

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Stopping Services${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

if [ $REMOVE_VOLUMES == true ]; then
    echo -e "${YELLOW}WARNING: This will remove all data volumes!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Cancelled."
        exit 0
    fi
fi

if [ $# -eq 0 ]; then
    echo -e "${BLUE}Stopping all services...${NC}"
    if [ $REMOVE_VOLUMES == true ]; then
        docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down -v
    else
        docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down
    fi
else
    echo -e "${BLUE}Stopping services: $@${NC}"
    docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} stop "$@"
fi

echo ""
echo -e "${GREEN}Services stopped successfully!${NC}"
echo ""
