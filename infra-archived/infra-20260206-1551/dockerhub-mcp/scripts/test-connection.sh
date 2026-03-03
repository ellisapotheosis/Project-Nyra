#!/bin/bash
# Test Docker Hub MCP Server connection and functionality
# Usage: ./scripts/test-connection.sh

set -e

echo "🧪 Docker Hub MCP Server - Connection Test"
echo "==========================================="
echo

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_health() {
    echo -n "Testing health endpoint... "
    if curl -f -s http://localhost:${MCP_PORT:-8007}/health > /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

test_metrics() {
    echo -n "Testing metrics endpoint... "
    if curl -f -s http://localhost:${MCP_PORT:-8007}/metrics > /dev/null; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

test_dockerhub_auth() {
    echo -n "Testing Docker Hub authentication... "
    if [ -z "$DOCKERHUB_TOKEN" ]; then
        echo -e "${YELLOW}⚠ SKIP (no token)${NC}"
        return 0
    fi

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $DOCKERHUB_TOKEN" \
        https://hub.docker.com/v2/users/$DOCKERHUB_USERNAME/)

    if [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL (HTTP $RESPONSE)${NC}"
        return 1
    fi
}

test_container_status() {
    echo -n "Testing container status... "
    if docker ps --filter name=nyra-dockerhub-mcp --format "{{.Status}}" | grep -q "Up"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

test_logs() {
    echo -n "Checking container logs... "
    if docker logs --tail 10 nyra-dockerhub-mcp 2>&1 | grep -q "Docker Hub MCP"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ WARNING${NC}"
        return 0
    fi
}

# Run tests
PASS=0
FAIL=0

echo "Running tests..."
echo

# Test 1: Container status
if test_container_status; then
    ((PASS++))
else
    ((FAIL++))
fi

# Test 2: Health endpoint
if test_health; then
    ((PASS++))
else
    ((FAIL++))
fi

# Test 3: Metrics endpoint
if test_metrics; then
    ((PASS++))
else
    ((FAIL++))
fi

# Test 4: Docker Hub authentication
if test_dockerhub_auth; then
    ((PASS++))
else
    ((FAIL++))
fi

# Test 5: Container logs
if test_logs; then
    ((PASS++))
else
    ((FAIL++))
fi

echo
echo "================================="
echo "Test Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "================================="

# Detailed status
echo
echo "📊 Detailed Status:"
echo

# Show health response
echo "Health Check Response:"
curl -s http://localhost:${MCP_PORT:-8007}/health | jq '.' 2>/dev/null || echo "Unable to parse health response"
echo

# Show metrics
echo "Metrics:"
curl -s http://localhost:${MCP_PORT:-8007}/metrics | jq '.' 2>/dev/null || echo "Unable to parse metrics"
echo

# Show recent logs
echo "Recent Logs (last 5 lines):"
docker logs --tail 5 nyra-dockerhub-mcp 2>&1 || echo "Unable to fetch logs"
echo

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
    exit 1
fi
