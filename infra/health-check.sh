#!/bin/bash

# ==============================================================================
# HEALTH CHECK SCRIPT - Project Nyra
# ==============================================================================
# Comprehensive system health verification across:
# - Orchestrator (PC1) services
# - GPU Workers (PC2/PC3/PC4) via Tailscale
# - Oracle Cloud services
# ==============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PROJECT NYRA - HEALTH CHECK${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check a service
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-5}
    
    echo -n "Checking $name... "
    
    if timeout $timeout curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to check docker container
check_container() {
    local name=$1
    
    echo -n "Checking container: $name... "
    
    local status=$(docker-compose ps --filter "name=$name" --format "{{.Status}}" 2>/dev/null | head -1)
    
    if [[ -z "$status" ]]; then
        echo -e "${RED}✗ NOT FOUND${NC}"
        ((FAILED++))
        return 1
    elif [[ "$status" == *"Up"* ]]; then
        echo -e "${GREEN}✓ UP${NC} ($status)"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠ $status${NC}"
        ((WARNINGS++))
        return 1
    fi
}

# ==============================================================================
# ORCHESTRATOR SERVICES (PC1)
# ==============================================================================

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ORCHESTRATOR (Control Plane)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Docker Containers:"
check_container "nyra-nexus-router"
check_container "nyra-archon-os-orchestrator"
check_container "nyra-postgres"
check_container "nyra-redis"
check_container "nyra-qdrant"
check_container "nyra-letta"
check_container "nyra-prometheus"
check_container "nyra-grafana"
check_container "nyra-loki"

echo ""
echo "Service Connectivity:"
check_service "Nexus Router" "http://localhost:6000/health" 10
check_service "Claude Flow" "http://localhost:8000/health" 10
check_service "PostgreSQL" "localhost:5432" 5
check_service "Redis" "localhost:6379" 5
check_service "Qdrant" "http://localhost:6333/health" 5
check_service "Prometheus" "http://localhost:9090/-/healthy" 5
check_service "Grafana" "http://localhost:3005/api/health" 5

echo ""
echo "Database Connectivity:"
docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1 && \
    echo -e "${GREEN}✓ PostgreSQL connection OK${NC}" && ((PASSED++)) || \
    (echo -e "${RED}✗ PostgreSQL connection FAILED${NC}" && ((FAILED++)))

redis-cli -p 6379 ping > /dev/null 2>&1 && \
    echo -e "${GREEN}✓ Redis connection OK${NC}" && ((PASSED++)) || \
    (echo -e "${RED}✗ Redis connection FAILED${NC}" && ((FAILED++)))

# ==============================================================================
# GPU WORKERS (via Tailscale)
# ==============================================================================

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}GPU WORKERS (Distributed Inference)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check Tailscale connectivity
echo "Tailscale Mesh Network:"
if command -v tailscale &> /dev/null; then
    tailscale status > /dev/null 2>&1 && \
        echo -e "${GREEN}✓ Tailscale connected${NC}" && ((PASSED++)) || \
        (echo -e "${YELLOW}⚠ Tailscale not connected${NC}" && ((WARNINGS++)))
else
    echo -e "${YELLOW}⚠ Tailscale not installed${NC}"
    ((WARNINGS++))
fi

echo ""
echo "Worker Connectivity (via Tailscale):"

# Worker 1: RTX 3060
echo -n "Worker 1 (RTX 3060)... "
if timeout 5 curl -sf "http://worker-3060.tail-net.ts.net:11434/api/tags" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama responding${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Unreachable (may be offline)${NC}"
    ((WARNINGS++))
fi

# Worker 2: RTX 5090
echo -n "Worker 2 (RTX 5090)... "
if timeout 5 curl -sf "http://worker-5090.tail-net.ts.net:11434/api/tags" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama responding${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Unreachable (may be offline)${NC}"
    ((WARNINGS++))
fi

# Worker 3: RTX 3090 Ti
echo -n "Worker 3 (RTX 3090 Ti)... "
if timeout 5 curl -sf "http://worker-3090.tail-net.ts.net:11434/api/tags" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama responding${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Unreachable (may be offline)${NC}"
    ((WARNINGS++))
fi

# ==============================================================================
# ORACLE CLOUD SERVICES
# ==============================================================================

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}ORACLE CLOUD (Always-On Services)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Oracle Services (Local Preview):"
check_container "nyra-twentycrm" || echo "  (OK if Oracle Cloud is remote)"
check_container "nyra-n8n" || echo "  (OK if Oracle Cloud is remote)"
check_container "nyra-activepieces" || echo "  (OK if Oracle Cloud is remote)"

# ==============================================================================
# CLOUDFLARE TUNNEL
# ==============================================================================

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}CLOUDFLARE TUNNEL${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -n "Tunnel Credentials... "
if [[ -f ~/.cloudflared/64fe03f2-9859-44ca-b0ab-e499d8464104.json ]]; then
    echo -e "${GREEN}✓ Found${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Not configured${NC}"
    ((WARNINGS++))
fi

echo -n "Tunnel Configuration... "
if [[ -f infra/cloudflared/config.yml ]]; then
    echo -e "${GREEN}✓ Found${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Not generated${NC}"
    ((WARNINGS++))
fi

echo -n "Tunnel Status... "
if pgrep -f "cloudflared tunnel" > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Not running${NC}"
    ((WARNINGS++))
    echo "  Start with: make tunnel-start"
fi

# ==============================================================================
# MCP SERVERS
# ==============================================================================

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}MCP SERVERS (Nexus Router)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

declare -a MCP_SERVERS=(
    "letta:8000:letta"
    "qdrant:6333:Qdrant"
    "infisical-mcp:8006:Infisical"
    "composio-mcp:8086:Composio"
    "mem0:5000:Mem0"
)

for mcp in "${MCP_SERVERS[@]}"; do
    IFS=: read -r host port name <<< "$mcp"
    echo -n "Checking $name... "
    if timeout 2 curl -sf "http://$host:$port/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Unreachable (may not be running)${NC}"
        ((WARNINGS++))
    fi
done

# ==============================================================================
# SYSTEM RESOURCES
# ==============================================================================

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}SYSTEM RESOURCES${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Disk space
echo "Disk Space:"
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "  Root: $disk_usage% used"
if [[ $disk_usage -gt 90 ]]; then
    echo -e "  ${RED}✗ WARNING: Disk nearly full!${NC}"
    ((WARNINGS++))
elif [[ $disk_usage -gt 80 ]]; then
    echo -e "  ${YELLOW}⚠ Disk usage high${NC}"
    ((WARNINGS++))
else
    echo -e "  ${GREEN}✓ OK${NC}"
    ((PASSED++))
fi

# Memory
echo ""
echo "Memory Usage:"
mem_info=$(free -h | awk 'NR==2 {print $3"/"$2}')
mem_percent=$(free | awk 'NR==2 {printf "%.0f", ($3/$2)*100}')
echo "  Docker containers: $mem_info ($mem_percent%)"
if [[ $mem_percent -gt 90 ]]; then
    echo -e "  ${RED}✗ WARNING: Memory critical!${NC}"
    ((WARNINGS++))
elif [[ $mem_percent -gt 80 ]]; then
    echo -e "  ${YELLOW}⚠ Memory high${NC}"
    ((WARNINGS++))
else
    echo -e "  ${GREEN}✓ OK${NC}"
    ((PASSED++))
fi

# ==============================================================================
# SUMMARY
# ==============================================================================

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}HEALTH CHECK SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✓ PASSED:${NC}  $PASSED"
echo -e "  ${YELLOW}⚠ WARNINGS:${NC} $WARNINGS"
echo -e "  ${RED}✗ FAILED:${NC}  $FAILED"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ System is healthy!${NC}"
    exit 0
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠ System has warnings but is operational${NC}"
    exit 0
else
    echo -e "${RED}✗ System has issues that need attention${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Docker: docker-compose ps"
    echo "  2. Check logs: make logs SERVICE=<service-name>"
    echo "  3. Restart services: make orchestrator-restart"
    echo "  4. Full bootstrap: make bootstrap"
    exit 1
fi
