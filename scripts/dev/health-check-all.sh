#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
HEALTHY=0
UNHEALTHY=0
TOTAL=0

echo "🏥 Project Nyra - Health Check Dashboard"
echo "========================================"
echo ""

# Service definitions: URL|Name|Critical
services=(
    "http://localhost:6000/health|Nexus Router|true"
    "http://localhost:4000/health|LiteLLM|true"
    "http://localhost:8001/health|Quote Engine|true"
    "http://localhost:8002/health|Campaign Engine|true"
    "http://localhost:8010/health|Orchestrator|true"
    "http://localhost:4321/health|Mem0 REST API|true"
    "http://localhost:8283/health|Letta|true"
    "http://localhost:3000|Twenty CRM|false"
    "http://localhost:5678/healthz|n8n|true"
    "http://localhost:3001|Dify|false"
    "http://localhost:9090/-/healthy|Prometheus|true"
    "http://localhost:3005/api/health|Grafana|true"
    "http://localhost:3100/ready|Loki|true"
    "http://localhost:9093/-/healthy|AlertManager|true"
)

# Function to check service health
check_service() {
    local url=$1
    local name=$2
    local critical=$3

    ((TOTAL++))

    if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - HEALTHY"
        ((HEALTHY++))
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "${RED}❌ $name${NC} - UNHEALTHY (CRITICAL)"
        else
            echo -e "${YELLOW}⚠️  $name${NC} - UNHEALTHY (NON-CRITICAL)"
        fi
        ((UNHEALTHY++))
        return 1
    fi
}

# Check all services
echo "📊 Service Health Status:"
echo "------------------------"
for service in "${services[@]}"; do
    IFS='|' read -r url name critical <<< "$service"
    check_service "$url" "$name" "$critical"
done

echo ""
echo "========================================"
echo "📈 Summary:"
echo "   Total Services: $TOTAL"
echo -e "   ${GREEN}Healthy: $HEALTHY${NC}"
echo -e "   ${RED}Unhealthy: $UNHEALTHY${NC}"
echo "========================================"
echo ""

# Check Docker containers
echo "🐳 Docker Container Status:"
echo "------------------------"
cd "$(dirname "$0")/../.." || exit 1
docker-compose -f infra/docker/docker-compose.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""

# Check resource usage
echo "💾 Resource Usage:"
echo "------------------------"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps --format '{{.Names}}' | grep nyra)

echo ""

# Exit with appropriate code
if [ $UNHEALTHY -gt 0 ]; then
    echo -e "${RED}⚠️  Some services are unhealthy. Check logs with:${NC}"
    echo "   docker-compose -f infra/docker/docker-compose.yml logs -f [service_name]"
    exit 1
else
    echo -e "${GREEN}✅ All services are healthy!${NC}"
    exit 0
fi
