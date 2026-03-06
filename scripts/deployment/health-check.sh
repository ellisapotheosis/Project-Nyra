#!/bin/bash
# ==============================================================================
# Project Nyra - Health Check Script
# ==============================================================================
# Check health status of all Project Nyra services
#
# Usage:
#   ./health-check.sh
#
# ==============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  Project Nyra - Health Check${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo ""

HEALTHY=0
UNHEALTHY=0

check_service() {
    local name="$1"
    local url="$2"
    local timeout="${3:-5}"

    printf "%-30s" "  $name"

    if curl -f -s -m $timeout "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        ((HEALTHY++))
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        ((UNHEALTHY++))
        return 1
    fi
}

echo -e "${BLUE}Business Services:${NC}"
check_service "Nyra Orchestrator" "http://localhost:8010/health"
check_service "Quote Engine" "http://localhost:8001/health"
check_service "Campaign Engine" "http://localhost:8002/health"
check_service "Mem0 API" "http://localhost:8003/health"
echo ""

echo -e "${BLUE}Infrastructure:${NC}"
check_service "PostgreSQL" "http://localhost:5432" 2 || echo -e "${YELLOW}  (Database check may require psql)${NC}"
check_service "Redis" "http://localhost:6379" 2 || echo -e "${YELLOW}  (Redis check may require redis-cli)${NC}"
echo ""

echo -e "${BLUE}AI Services:${NC}"
check_service "Letta" "http://localhost:8283/health" 10
check_service "OpenClaw UI" "http://localhost:3333/health" 10
echo ""

echo -e "${BLUE}Workflow Automation:${NC}"
check_service "n8n" "http://localhost:5678/healthz"
echo ""

echo -e "${BLUE}CRM & Support:${NC}"
check_service "TwentyCRM" "http://localhost:3000/healthz" 10
check_service "Langfuse" "http://localhost:3002"
echo ""

echo -e "${BLUE}Monitoring:${NC}"
check_service "Grafana" "http://localhost:3001/api/health"
check_service "Prometheus" "http://localhost:9090/-/healthy"
echo ""

# Summary
echo -e "${BLUE}===================================================================${NC}"
echo -e "${GREEN}Healthy Services:   $HEALTHY${NC}"
echo -e "${RED}Unhealthy Services: $UNHEALTHY${NC}"
echo -e "${BLUE}===================================================================${NC}"

if [ $UNHEALTHY -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Some services are unhealthy. Check logs:${NC}"
    echo -e "  docker-compose -f infra/docker-compose.dev.yml -p nyra logs [service]"
    exit 1
fi

echo ""
echo -e "${GREEN}All services are healthy!${NC}"
exit 0
