#!/bin/bash
# Test script for Open-WebUI Development Chat Interface
# Usage: ./test-openwebui.sh

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DOCKER_DIR="$SCRIPT_DIR/.."

echo "==================================="
echo "Open-WebUI Test Script"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker Compose found"

# Check if nexus-router is running
echo ""
echo "Checking dependencies..."
if docker ps | grep -q "nyra-nexus"; then
    echo -e "${GREEN}✓${NC} Nexus Router is running"
else
    echo -e "${RED}❌ Nexus Router is NOT running${NC}"
    echo "Start it with: docker-compose -f base/docker-compose.mcp.yml up -d nexus-router"
    exit 1
fi

# Start Open-WebUI
echo ""
echo "Starting Open-WebUI..."
cd "$SCRIPT_DIR"
docker-compose up -d openwebui

# Wait for health check
echo ""
echo "Waiting for Open-WebUI to be healthy..."
RETRY_COUNT=0
MAX_RETRIES=30

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker ps | grep -q "nyra-openwebui.*healthy"; then
        echo -e "${GREEN}✓${NC} Open-WebUI is healthy"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo -e "${RED}❌ Open-WebUI failed to become healthy${NC}"
        echo ""
        echo "Check logs with: docker-compose logs -f openwebui"
        exit 1
    fi

    echo "Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

# Test health endpoint
echo ""
echo "Testing health endpoint..."
if curl -f -s http://localhost:3333/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Health check passed"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

# Test Nexus Router connection
echo ""
echo "Testing Nexus Router connection..."
MODELS_RESPONSE=$(docker exec nyra-openwebui curl -s http://nexus-router:6000/v1/models 2>/dev/null || echo "failed")
if [ "$MODELS_RESPONSE" != "failed" ]; then
    echo -e "${GREEN}✓${NC} Connected to Nexus Router"
    MODEL_COUNT=$(echo "$MODELS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "  Found $MODEL_COUNT available models"
else
    echo -e "${YELLOW}⚠${NC}  Could not fetch models from Nexus Router"
fi

# Check configuration file
echo ""
echo "Checking configuration..."
if docker exec nyra-openwebui test -f /app/backend/data/config.json; then
    echo -e "${GREEN}✓${NC} Configuration file mounted successfully"
else
    echo -e "${YELLOW}⚠${NC}  Configuration file not found (will use defaults)"
fi

# Print access information
echo ""
echo "==================================="
echo -e "${GREEN}✓ Open-WebUI is ready!${NC}"
echo "==================================="
echo ""
echo "Access the interface at:"
echo -e "  ${GREEN}http://localhost:3333${NC}"
echo ""
echo "Default configuration:"
echo "  - Primary Model: DeepSeek-R1 236B (Worker-5090)"
echo "  - Authentication: Enabled (create account on first visit)"
echo "  - RAG: Enabled with AgentDB"
echo "  - Function Calling: Enabled"
echo ""
echo "Useful commands:"
echo "  View logs:        docker-compose logs -f openwebui"
echo "  Restart:          docker-compose restart openwebui"
echo "  Stop:             docker-compose stop openwebui"
echo "  Check status:     docker-compose ps openwebui"
echo ""
echo "For troubleshooting, see:"
echo "  ${SCRIPT_DIR}/../config/README.md"
echo ""
