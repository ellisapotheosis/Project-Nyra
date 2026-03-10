#!/bin/bash

# Project Nyra Health Check Script
# Validates all services are running and healthy

set -e

echo "🔍 Project Nyra Health Check"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service endpoints to check
declare -A SERVICES=(
    ["Nexus Router"]="http://localhost:6000/health"
    ["TwentyCRM"]="http://localhost:3000/health"
    ["Letta"]="http://localhost:8283/health"
    ["Mem0"]="http://localhost:4321/health"
    ["n8n"]="http://localhost:5678/healthz"
    ["Dify"]="http://localhost:3001/health"
    ["Quote Engine"]="http://localhost:8001/health"
    ["Campaign Engine"]="http://localhost:8002/health"
    ["Nyra Orchestrator"]="http://localhost:8010/health"
    ["RateHunter API"]="http://localhost:8003/health"
    ["RateHunter Web"]="http://localhost:3100/api/health"
    ["Nyra Admin"]="http://localhost:3101/api/health"
    ["Prometheus"]="http://localhost:9090/-/healthy"
    ["Grafana"]="http://localhost:3005/api/health"
    ["Loki"]="http://localhost:3100/ready"
)

# Track results
HEALTHY=0
UNHEALTHY=0
TOTAL=${#SERVICES[@]}

echo "Checking ${TOTAL} services..."
echo ""

# Check each service
for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"

    printf "%-20s " "$service"

    # Check if service responds within 10 seconds
    if curl -f -s -m 10 "$url" > /dev/null 2>&1; then
        printf "${GREEN}✅ HEALTHY${NC}\n"
        ((HEALTHY++))
    else
        printf "${RED}❌ UNHEALTHY${NC}\n"
        ((UNHEALTHY++))
    fi
done

echo ""
echo "Results:"
echo "========"
printf "Healthy:   ${GREEN}%d${NC}\n" $HEALTHY
printf "Unhealthy: ${RED}%d${NC}\n" $UNHEALTHY
printf "Total:     %d\n" $TOTAL

echo ""

# Check Docker containers
echo "🐳 Docker Container Status:"
echo "==========================="
docker-compose -f infra/compose/docker-compose.main.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Database connectivity
echo "🗄️  Database Connectivity:"
echo "========================="
if docker exec nyra_postgres pg_isready -U postgres > /dev/null 2>&1; then
    printf "PostgreSQL: ${GREEN}✅ CONNECTED${NC}\n"
else
    printf "PostgreSQL: ${RED}❌ CONNECTION FAILED${NC}\n"
    ((UNHEALTHY++))
fi

if docker exec nyra_redis redis-cli ping > /dev/null 2>&1; then
    printf "Redis:      ${GREEN}✅ CONNECTED${NC}\n"
else
    printf "Redis:      ${RED}❌ CONNECTION FAILED${NC}\n"
    ((UNHEALTHY++))
fi

echo ""

# Overall status
if [ $UNHEALTHY -eq 0 ]; then
    printf "${GREEN}🎉 ALL SYSTEMS HEALTHY${NC}\n"
    echo ""
    echo "Project Nyra is fully operational!"
    echo "Access points:"
    echo "• RateHunter Web: http://localhost:3100"
    echo "• Nyra Admin:     http://localhost:3101"
    echo "• TwentyCRM:      http://localhost:3000"
    echo "• n8n Workflows:  http://localhost:5678"
    echo "• Grafana:        http://localhost:3005"
    exit 0
else
    printf "${RED}⚠️  ISSUES DETECTED${NC}\n"
    echo ""
    echo "Some services are unhealthy. Check the output above."
    echo "Troubleshooting:"
    echo "• Check logs: make logs"
    echo "• Restart services: make down && make up"
    echo "• Check environment: cat .env"
    exit 1
fi