#!/bin/bash
# Cluster Health Check Script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
CHECK_CLUSTER=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --cluster)
            CHECK_CLUSTER=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}🏥 Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check local services
check_service() {
    local name=$1
    local url=$2

    echo -n "  $name: "
    if curl -f -s $url > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        return 1
    fi
}

echo ""
echo "Local Services:"
check_service "Nexus Router" "http://localhost:6000/health"
check_service "Letta" "http://localhost:8283/health"
check_service "Mem0" "http://localhost:4321/health"
check_service "Redis" "http://localhost:6379"
check_service "PostgreSQL" "http://localhost:5432"

# Check claude-flow
echo ""
echo "Claude Flow:"
if npx claude-flow@alpha status > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Claude Flow: Running${NC}"
else
    echo -e "  ${YELLOW}⚠ Claude Flow: Not Running${NC}"
fi

# Check Docker
echo ""
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v NAMES | while read -r line; do
    name=$(echo $line | awk '{print $1}')
    status=$(echo $line | awk '{print $2}')

    if [[ $status == *"Up"* ]]; then
        echo -e "  ${GREEN}✓${NC} $name"
    else
        echo -e "  ${RED}✗${NC} $name"
    fi
done

# Check cluster (if requested)
if [ "$CHECK_CLUSTER" = true ]; then
    echo ""
    echo "Cluster Nodes:"

    if [ -f "/etc/claude-flow-cluster.conf" ]; then
        source /etc/claude-flow-cluster.conf

        for var in $(compgen -v | grep _IP); do
            ip=${!var}
            role=$(echo $var | sed 's/_IP//')

            echo -n "  $role ($ip): "
            if ping -c 1 -W 2 $ip > /dev/null 2>&1; then
                echo -e "${GREEN}✓ Reachable${NC}"
            else
                echo -e "${RED}✗ Unreachable${NC}"
            fi
        done
    else
        echo -e "  ${YELLOW}⚠ Cluster configuration not found${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✓ Health check complete${NC}"
echo ""
