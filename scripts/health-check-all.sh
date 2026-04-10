#!/bin/bash
# Project Nyra - Comprehensive Health Check Script
# Validates all services across 4-PC cluster

VERBOSE=false
EXPORT_REPORT=false
REPORT_PATH="./health-report.json"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose) VERBOSE=true; shift ;;
        -e|--export) EXPORT_REPORT=true; shift ;;
        -o|--output) REPORT_PATH="$2"; shift 2 ;;
        *) shift ;;
    esac
done

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m'

echo -e "${CYAN}=================================="
echo "  Project Nyra Health Check"
echo "  Checking all 22 services..."
echo -e "==================================${NC}"
echo ""

# Service definitions
declare -a services=(
    # PC1 - Orchestrator
    "PC1|Nexus Router|http://10.0.0.1:6000/health|required"
    "PC1|Letta (MemGPT)|http://10.0.0.1:8283/health|required"
    "PC1|Mem0|http://10.0.0.1:4321/health|required"
    "PC1|Claude Flow|http://10.0.0.1:3010/health|required"
    "PC1|ruvector|http://10.0.0.1:8080/health|required"
    "PC1|RuVector|http://10.0.0.1:8888/health|optional"
    "PC1|Redis (Orchestrator)|http://10.0.0.1:6380|required"
    "PC1|Qdrant|http://10.0.0.1:6333/healthz|optional"

    # PC2 - Worker 2
    "PC2|TwentyCRM|http://10.0.0.2:3000/health|required"
    "PC2|n8n|http://10.0.0.2:5678/healthz|required"
    "PC2|Redis (Worker)|http://10.0.0.2:6379|required"

    # PC3 - Worker 3
    "PC3|Ollama|http://10.0.0.3:11434|required"
    "PC3|Neo4j|http://10.0.0.3:7474|optional"
    "PC3|FalkorDB|http://10.0.0.3:6379|optional"

    # PC4 - Worker 4
    "PC4|Prometheus|http://10.0.0.4:9090/-/healthy|required"
    "PC4|Grafana|http://10.0.0.4:3005/api/health|required"
    "PC4|Loki|http://10.0.0.4:3100/ready|required"
    "PC4|Promtail|http://10.0.0.4:9080/ready|optional"
    "PC4|Alertmanager|http://10.0.0.4:9093/-/healthy|optional"
)

# Results tracking
healthy_count=0
unhealthy_count=0
unreachable_count=0
total_services=${#services[@]}

declare -a results=()

# Test each service
for service in "${services[@]}"; do
    IFS='|' read -r pc name url required <<< "$service"

    echo -n "Testing $name ($pc)... "

    start_time=$(date +%s%3N)
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))

    timestamp=$(date "+%Y-%m-%d %H:%M:%S")

    if [ "$status_code" == "200" ]; then
        echo -e "${GREEN}✓ HEALTHY${NC} ${GRAY}(${response_time}ms)${NC}"
        status="HEALTHY"
        ((healthy_count++))
    elif [ "$status_code" == "000" ]; then
        if [ "$required" == "required" ]; then
            echo -e "${RED}✗ UNREACHABLE${NC}"
        else
            echo -e "${YELLOW}⚠ UNREACHABLE (optional)${NC}"
        fi
        status="UNREACHABLE"
        ((unreachable_count++))
    else
        echo -e "${YELLOW}⚠ UNHEALTHY (Status: $status_code)${NC}"
        status="UNHEALTHY"
        ((unhealthy_count++))
    fi

    # Store result
    result=$(cat <<EOF
{
  "pc": "$pc",
  "name": "$name",
  "url": "$url",
  "required": "$required",
  "status": "$status",
  "statusCode": $status_code,
  "responseTime": $response_time,
  "timestamp": "$timestamp"
}
EOF
)
    results+=("$result")
done

# Summary
echo ""
echo -e "${CYAN}=================================="
echo "  Health Check Summary"
echo -e "==================================${NC}"
echo ""

health_percent=$(awk "BEGIN {printf \"%.2f\", ($healthy_count / $total_services) * 100}")

echo "Total Services:   $total_services"
echo -e "${GREEN}Healthy:          $healthy_count${NC}"
echo -e "${YELLOW}Unhealthy:        $unhealthy_count${NC}"
echo -e "${RED}Unreachable:      $unreachable_count${NC}"

if (( $(echo "$health_percent >= 90" | bc -l) )); then
    echo -e "${GREEN}Health Score:     $health_percent%${NC}"
elif (( $(echo "$health_percent >= 70" | bc -l) )); then
    echo -e "${YELLOW}Health Score:     $health_percent%${NC}"
else
    echo -e "${RED}Health Score:     $health_percent%${NC}"
fi

echo ""

# Check required services
required_healthy=0
required_total=0

for service in "${services[@]}"; do
    IFS='|' read -r pc name url required <<< "$service"
    if [ "$required" == "required" ]; then
        ((required_total++))
    fi
done

for result in "${results[@]}"; do
    required=$(echo "$result" | grep -o '"required": "[^"]*"' | cut -d'"' -f4)
    status=$(echo "$result" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)

    if [ "$required" == "required" ] && [ "$status" == "HEALTHY" ]; then
        ((required_healthy++))
    fi
done

if [ $required_healthy -eq $required_total ]; then
    echo -e "${GREEN}✓ All required services are healthy!${NC}"
    exit_code=0
else
    echo -e "${RED}✗ Some required services are unhealthy!${NC}"
    echo -e "${YELLOW}  Required: $required_healthy / $required_total healthy${NC}"
    exit_code=1
fi

# Per-PC breakdown
echo ""
echo -e "${CYAN}Per-PC Status:${NC}"

for pc in PC1 PC2 PC3 PC4; do
    pc_healthy=0
    pc_total=0

    for result in "${results[@]}"; do
        result_pc=$(echo "$result" | grep -o '"pc": "[^"]*"' | cut -d'"' -f4)
        result_status=$(echo "$result" | grep -o '"status": "[^"]*"' | cut -d'"' -f4)

        if [ "$result_pc" == "$pc" ]; then
            ((pc_total++))
            if [ "$result_status" == "HEALTHY" ]; then
                ((pc_healthy++))
            fi
        fi
    done

    if [ $pc_total -gt 0 ]; then
        pc_percent=$(awk "BEGIN {printf \"%.2f\", ($pc_healthy / $pc_total) * 100}")

        if (( $(echo "$pc_percent >= 90" | bc -l) )); then
            echo -e "  ${pc}: ${GREEN}$pc_healthy/$pc_total healthy ($pc_percent%)${NC}"
        elif (( $(echo "$pc_percent >= 70" | bc -l) )); then
            echo -e "  ${pc}: ${YELLOW}$pc_healthy/$pc_total healthy ($pc_percent%)${NC}"
        else
            echo -e "  ${pc}: ${RED}$pc_healthy/$pc_total healthy ($pc_percent%)${NC}"
        fi
    fi
done

# Export report
if [ "$EXPORT_REPORT" = true ]; then
    echo ""
    echo -e "${CYAN}Exporting health report to: $REPORT_PATH${NC}"

    cat > "$REPORT_PATH" <<EOF
{
  "timestamp": "$(date "+%Y-%m-%d %H:%M:%S")",
  "summary": {
    "totalServices": $total_services,
    "healthy": $healthy_count,
    "unhealthy": $unhealthy_count,
    "unreachable": $unreachable_count,
    "healthPercent": $health_percent,
    "requiredHealthy": $required_healthy,
    "requiredTotal": $required_total
  },
  "services": [
    $(IFS=,; echo "${results[*]}")
  ]
}
EOF
    echo -e "${GREEN}Report exported successfully${NC}"
fi

# Recommendations
echo ""
echo -e "${YELLOW}Recommendations:${NC}"

if [ $unreachable_count -gt 0 ]; then
    echo "  1. Check network connectivity between PCs (ping 10.0.0.1-4)"
    echo "  2. Verify Docker containers are running: docker ps"
    echo "  3. Check service logs: docker compose logs [service-name]"
fi

if [ $unhealthy_count -gt 0 ]; then
    echo "  1. Restart unhealthy services: docker compose restart [service-name]"
    echo "  2. Check service configuration and environment variables"
    echo "  3. Review logs for errors"
fi

echo ""
echo -e "${CYAN}Troubleshooting Guide: ./docs/MASTER-TROUBLESHOOTING.md${NC}"
echo ""

exit $exit_code
