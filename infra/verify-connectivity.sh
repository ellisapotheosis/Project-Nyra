#!/bin/bash

# ==============================================================================
# VERIFY CONNECTIVITY SCRIPT
# ==============================================================================
# Tests connectivity between all services in distributed stack
# Useful for diagnosing network issues across Tailscale mesh
# ==============================================================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}PROJECT NYRA - CONNECTIVITY VERIFICATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to test connection
test_connection() {
    local name=$1
    local host=$2
    local port=$3
    local timeout=${4:-5}
    
    echo -n "Testing $name ($host:$port)... "
    
    if timeout $timeout bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# ==============================================================================
# LOCAL SERVICES (Orchestrator)
# ==============================================================================

echo -e "${YELLOW}LOCAL SERVICES (Orchestrator)${NC}"
echo "════════════════════════════"
echo ""

test_connection "Nexus Router" "localhost" "6000"
test_connection "Claude Flow" "localhost" "8000"
test_connection "PostgreSQL" "localhost" "5432"
test_connection "Redis" "localhost" "6379"
test_connection "Qdrant" "localhost" "6333"
test_connection "Prometheus" "localhost" "9090"
test_connection "Grafana" "localhost" "3005"
test_connection "MongoDB" "localhost" "27017"

echo ""

# ==============================================================================
# DOCKER CONTAINER NETWORK
# ==============================================================================

echo -e "${YELLOW}DOCKER CONTAINER NETWORK${NC}"
echo "════════════════════════════"
echo ""

# Test from inside docker-compose network
docker-compose exec -T nexus-router sh -c 'echo >/dev/tcp/postgres/5432' 2>/dev/null && \
    echo -e "${GREEN}✓ Nexus Router → PostgreSQL${NC}" && ((PASSED++)) || \
    (echo -e "${RED}✗ Nexus Router → PostgreSQL${NC}" && ((FAILED++)))

docker-compose exec -T postgres sh -c 'echo >/dev/tcp/redis/6379' 2>/dev/null && \
    echo -e "${GREEN}✓ PostgreSQL → Redis${NC}" && ((PASSED++)) || \
    (echo -e "${RED}✗ PostgreSQL → Redis${NC}" && ((FAILED++)))

docker-compose exec -T redis sh -c 'echo >/dev/tcp/qdrant/6333' 2>/dev/null && \
    echo -e "${GREEN}✓ Redis → Qdrant${NC}" && ((PASSED++)) || \
    (echo -e "${RED}✗ Redis → Qdrant${NC}" && ((FAILED++)))

echo ""

# ==============================================================================
# TAILSCALE MESH (GPU Workers)
# ==============================================================================

echo -e "${YELLOW}TAILSCALE MESH NETWORK (GPU Workers)${NC}"
echo "════════════════════════════════════════"
echo ""

echo "Checking Tailscale status..."

if ! command -v tailscale &> /dev/null; then
    echo -e "${YELLOW}⚠ Tailscale not installed, skipping worker tests${NC}"
    echo "  Install from: https://tailscale.com/download"
else
    # Check Tailscale connectivity
    if tailscale status &>/dev/null; then
        echo -e "${GREEN}✓ Tailscale connected${NC}"
        ((PASSED++))
        
        # Test worker connectivity
        test_connection "Worker 1 (RTX 3060)" "worker-3060.tail-net.ts.net" "11434" 5
        test_connection "Worker 2 (RTX 5090)" "worker-5090.tail-net.ts.net" "11434" 5
        test_connection "Worker 3 (RTX 3090)" "worker-3090.tail-net.ts.net" "11434" 5
    else
        echo -e "${YELLOW}⚠ Tailscale not connected${NC}"
        echo "  Connect: tailscale up"
        ((FAILED++))
    fi
fi

echo ""

# ==============================================================================
# EXTERNAL SERVICES (Fallback Providers)
# ==============================================================================

echo -e "${YELLOW}EXTERNAL SERVICES (Cloud Fallback)${NC}"
echo "════════════════════════════════════"
echo ""

test_connection "Anthropic API" "api.anthropic.com" "443" 10
test_connection "Google API" "generativelanguage.googleapis.com" "443" 10
test_connection "OpenRouter API" "openrouter.ai" "443" 10

echo ""

# ==============================================================================
# DNS RESOLUTION
# ==============================================================================

echo -e "${YELLOW}DNS RESOLUTION${NC}"
echo "════════════════"
echo ""

declare -a HOSTS=(
    "localhost"
    "postgres"
    "redis"
    "qdrant"
    "worker-3060.tail-net.ts.net"
    "worker-5090.tail-net.ts.net"
    "api.anthropic.com"
    "ratehunter.net"
)

for host in "${HOSTS[@]}"; do
    echo -n "Resolving $host... "
    if getent hosts "$host" > /dev/null 2>&1; then
        ip=$(getent hosts "$host" | awk '{print $1}')
        echo -e "${GREEN}✓ $ip${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Could not resolve${NC}"
        ((FAILED++))
    fi
done

echo ""

# ==============================================================================
# LATENCY CHECKS
# ==============================================================================

echo -e "${YELLOW}LATENCY CHECKS${NC}"
echo "════════════════"
echo ""

# Local services latency
echo "Local services:"
for service in "localhost:6000" "localhost:5432" "localhost:6379"; do
    host=$(echo "$service" | cut -d: -f1)
    port=$(echo "$service" | cut -d: -f2)
    start=$(date +%s%N)
    timeout 1 bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null || true
    end=$(date +%s%N)
    latency=$(( (end - start) / 1000000 ))  # Convert to ms
    echo "  $service: ${latency}ms"
done

# Worker latency (if Tailscale connected)
if tailscale status &>/dev/null; then
    echo ""
    echo "Tailscale workers:"
    for worker in "worker-5090.tail-net.ts.net" "worker-3090.tail-net.ts.net" "worker-3060.tail-net.ts.net"; do
        start=$(date +%s%N)
        timeout 2 bash -c "echo >/dev/tcp/$worker/11434" 2>/dev/null || true
        end=$(date +%s%N)
        latency=$(( (end - start) / 1000000 ))
        echo "  $worker: ${latency}ms"
    done
fi

echo ""

# ==============================================================================
# SUMMARY
# ==============================================================================

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}CONNECTIVITY SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✓ PASSED:${NC}  $PASSED"
echo -e "  ${RED}✗ FAILED:${NC}  $FAILED"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✓ All connectivity tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some connectivity tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check Docker: docker-compose ps"
    echo "  2. Check Tailscale: tailscale status"
    echo "  3. Check network: make logs SERVICE=<service>"
    echo "  4. Restart services: make clean && make bootstrap"
    exit 1
fi
