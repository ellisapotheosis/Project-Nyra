#!/bin/bash
# ==============================================================================
# Project Nyra - Orchestrator Deployment Script
# ==============================================================================
# Deploy full Nyra stack to orchestrator mini PC (main control node)
#
# Usage:
#   ./deploy-orchestrator.sh [environment]
#   ./deploy-orchestrator.sh production
#   ./deploy-orchestrator.sh development  (default)
#
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-development}"
COMPOSE_FILE="infra/docker-compose.dev.yml"
PROJECT_NAME="nyra"

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Orchestrator Deployment${NC}"
echo -e "${BLUE}  Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

# Validate environment file
if [ ! -f ".env" ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo -e "${YELLOW}Please create .env file before deploying.${NC}"
    echo -e "  Run: ${BLUE}cp .env.example .env${NC}"
    echo -e "  Then edit .env with your configuration."
    exit 1
fi

# Validate environment variables
echo -e "${BLUE}Validating environment variables...${NC}"
if [ -f "scripts/validate-env.sh" ]; then
    bash scripts/validate-env.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Environment validation failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Warning: validate-env.sh not found, skipping validation${NC}"
fi

# Pull latest changes (if git repo)
if [ -d ".git" ]; then
    echo -e "${BLUE}Pulling latest changes from git...${NC}"
    git pull origin main || echo -e "${YELLOW}Warning: Failed to pull from git${NC}"
fi

# Stop existing services
echo -e "${BLUE}Stopping existing services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} down || true

# Pull latest images
echo -e "${BLUE}Pulling latest Docker images...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} pull || true

# Build custom services
echo -e "${BLUE}Building custom service images...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} build \
    quote-engine \
    campaign-engine \
    nyra-orchestrator \
    mem0-rest-api

# Start core infrastructure services
echo -e "${BLUE}Starting core infrastructure services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    postgres \
    redis \
    falkordb \
    neo4j

# Wait for databases to be ready
echo -e "${BLUE}Waiting for databases to be ready...${NC}"
sleep 15

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
if [ -f "infra/postgres/init-migrations.sql" ]; then
    docker exec -i ${PROJECT_NAME}-postgres psql -U postgres -d nyra < infra/postgres/init-migrations.sql
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${YELLOW}Warning: No migrations file found${NC}"
fi

# Start AI/LLM services
echo -e "${BLUE}Starting AI and LLM services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    letta \
    dify \
    ollama \
    litellm

# Start business services
echo -e "${BLUE}Starting business services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    quote-engine \
    campaign-engine \
    nyra-orchestrator \
    mem0-rest-api

# Start workflow and automation services
echo -e "${BLUE}Starting workflow automation services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    n8n \
    activepieces

# Start CRM and support services
echo -e "${BLUE}Starting CRM and support services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    twentycrm \
    langfuse

# Start monitoring services
echo -e "${BLUE}Starting monitoring services...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    grafana \
    prometheus

# Start MCP servers
echo -e "${BLUE}Starting MCP servers...${NC}"
docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} up -d \
    mcp-vscode \
    mcp-twentycrm \
    mcp-dify \
    mcp-bitwarden \
    mcp-filesystem \
    mcp-github

# Wait for services to stabilize
echo -e "${BLUE}Waiting for services to stabilize...${NC}"
sleep 10

# Health check
echo -e "${BLUE}Running health checks...${NC}"
if [ -f "scripts/deployment/health-check.sh" ]; then
    bash scripts/deployment/health-check.sh
else
    echo -e "${YELLOW}Warning: health-check.sh not found${NC}"
fi

# Display service URLs
echo ""
echo -e "${GREEN}===================================================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Nyra Orchestrator:    http://localhost:8010"
echo -e "  Quote Engine:         http://localhost:8001"
echo -e "  Campaign Engine:      http://localhost:8002"
echo -e "  Mem0 API:             http://localhost:8003"
echo -e "  n8n:                  http://localhost:5678"
echo -e "  TwentyCRM:            http://localhost:3000"
echo -e "  Dify:                 http://localhost:8080"
echo -e "  Grafana:              http://localhost:3001"
echo -e "  Langfuse:             http://localhost:3002"
echo ""
echo -e "${BLUE}API Documentation:${NC}"
echo -e "  Orchestrator API:     http://localhost:8010/docs"
echo -e "  Quote Engine API:     http://localhost:8001/docs"
echo -e "  Campaign Engine API:  http://localhost:8002/docs"
echo -e "  Mem0 API:             http://localhost:8003/docs"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo -e "  docker-compose -f ${COMPOSE_FILE} -p ${PROJECT_NAME} logs -f [service]"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo -e "  bash scripts/deployment/stop-services.sh"
echo ""
