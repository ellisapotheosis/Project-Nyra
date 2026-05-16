#!/bin/bash
# ============================================
# Project Nyra - Complete Health Check Script
# ============================================
# Run this to verify all services are healthy

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           Project Nyra - Service Health Check                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
HEALTHY=0
UNHEALTHY=0
WARNINGS=0

# Function to check HTTP endpoint
check_http() {
    local name="$1"
    local url="$2"
    local expected="${3:-200}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null || echo "000")
    
    if [ "$response" == "$expected" ]; then
        echo -e "  ${GREEN}✅ $name${NC} (HTTP $response)"
        ((HEALTHY++))
    elif [ "$response" == "000" ]; then
        echo -e "  ${RED}❌ $name${NC} (Connection refused)"
        ((UNHEALTHY++))
    else
        echo -e "  ${YELLOW}⚠️  $name${NC} (HTTP $response, expected $expected)"
        ((WARNINGS++))
    fi
}

# Function to check TCP port
check_tcp() {
    local name="$1"
    local host="$2"
    local port="$3"
    
    if nc -z -w5 "$host" "$port" 2>/dev/null; then
        echo -e "  ${GREEN}✅ $name${NC} (port $port open)"
        ((HEALTHY++))
    else
        echo -e "  ${RED}❌ $name${NC} (port $port closed)"
        ((UNHEALTHY++))
    fi
}

# Function to check Redis
check_redis() {
    local name="$1"
    local port="$2"
    
    if redis-cli -p "$port" ping 2>/dev/null | grep -q "PONG"; then
        echo -e "  ${GREEN}✅ $name${NC} (PONG)"
        ((HEALTHY++))
    else
        echo -e "  ${RED}❌ $name${NC} (no response)"
        ((UNHEALTHY++))
    fi
}

# Function to check Postgres
check_postgres() {
    local name="$1"
    local port="$2"
    
    if pg_isready -h localhost -p "$port" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $name${NC} (ready)"
        ((HEALTHY++))
    else
        echo -e "  ${RED}❌ $name${NC} (not ready)"
        ((UNHEALTHY++))
    fi
}

# ============================================
# MCP SERVERS
# ============================================
echo "📡 MCP SERVERS"
echo "─────────────────────────────────────────"
check_http "Nexus Router" "http://localhost:6000/health"
check_http "Claude-Flow MCP" "http://localhost:3001/health"
check_http "Graphiti MCP" "http://localhost:8100/health"
check_http "RuVector" "http://localhost:8200/health"
check_http "AgentDB" "http://localhost:8300/health"
check_http "Twenty MCP" "http://localhost:8400/health"
check_http "LiteLLM" "http://localhost:8500/health"
check_http "Letta AI" "http://localhost:8283/health"
echo ""

# ============================================
# CORE SERVICES
# ============================================
echo "🏢 CORE SERVICES"
echo "─────────────────────────────────────────"
check_http "Twenty CRM" "http://localhost:3020/healthz"
check_http "n8n" "http://localhost:5678/healthz"
check_http "Activepieces" "http://localhost:5000/health"
check_http "Archon OS" "http://localhost:4000/health"
check_http "Archon UI" "http://localhost:4001/" "200"
check_http "Claude-Flow Dashboard" "http://localhost:3100/" "200"
check_http "Gitea" "http://localhost:3000/api/healthz"
check_http "Moltbot" "http://localhost:3333/health"
echo ""

# ============================================
# DATABASES
# ============================================
echo "🗄️  DATABASES"
echo "─────────────────────────────────────────"
check_postgres "Twenty Postgres" 5432
check_postgres "RuVector Postgres" 5433
check_postgres "Archon Postgres" 5434
check_redis "Redis" 6379
check_redis "FalkorDB" 6380
echo ""

# ============================================
# DOCKER CONTAINERS
# ============================================
echo "🐳 DOCKER CONTAINERS"
echo "─────────────────────────────────────────"

# Get list of nyra containers
containers=$(docker ps --format "{{.Names}}" 2>/dev/null | grep "nyra-" || true)

if [ -z "$containers" ]; then
    echo -e "  ${RED}❌ No nyra-* containers running${NC}"
    ((UNHEALTHY++))
else
    for container in $containers; do
        status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$container" 2>/dev/null || echo "unknown")
        
        if [ "$status" == "running" ]; then
            if [ "$health" == "healthy" ] || [ "$health" == "no-healthcheck" ]; then
                echo -e "  ${GREEN}✅ $container${NC} ($status)"
                ((HEALTHY++))
            else
                echo -e "  ${YELLOW}⚠️  $container${NC} ($status, health: $health)"
                ((WARNINGS++))
            fi
        else
            echo -e "  ${RED}❌ $container${NC} ($status)"
            ((UNHEALTHY++))
        fi
    done
fi
echo ""

# ============================================
# TAILSCALE NETWORK
# ============================================
echo "🌐 TAILSCALE NETWORK"
echo "─────────────────────────────────────────"

if command -v tailscale &> /dev/null; then
    ts_status=$(tailscale status --json 2>/dev/null | jq -r '.BackendState' 2>/dev/null || echo "unknown")
    ts_ip=$(tailscale ip -4 2>/dev/null || echo "unknown")
    
    if [ "$ts_status" == "Running" ]; then
        echo -e "  ${GREEN}✅ Tailscale${NC} (Running, IP: $ts_ip)"
        ((HEALTHY++))
        
        # Check known workers
        workers=("100.107.188.97" "100.102.204.112")
        for worker in "${workers[@]}"; do
            if tailscale ping -c 1 "$worker" > /dev/null 2>&1; then
                echo -e "  ${GREEN}✅ Worker $worker${NC} (reachable)"
                ((HEALTHY++))
            else
                echo -e "  ${YELLOW}⚠️  Worker $worker${NC} (unreachable)"
                ((WARNINGS++))
            fi
        done
    else
        echo -e "  ${RED}❌ Tailscale${NC} ($ts_status)"
        ((UNHEALTHY++))
    fi
else
    echo -e "  ${YELLOW}⚠️  Tailscale CLI not found${NC}"
    ((WARNINGS++))
fi
echo ""

# ============================================
# CLOUDFLARE TUNNEL
# ============================================
echo "☁️  CLOUDFLARE TUNNEL"
echo "─────────────────────────────────────────"

if command -v cloudflared &> /dev/null; then
    # Check if cloudflared service is running
    if systemctl is-active --quiet cloudflared 2>/dev/null || \
       sc query cloudflared 2>/dev/null | grep -q "RUNNING"; then
        echo -e "  ${GREEN}✅ Cloudflared Service${NC} (running)"
        ((HEALTHY++))
    else
        # Try checking if process is running
        if pgrep -x "cloudflared" > /dev/null; then
            echo -e "  ${GREEN}✅ Cloudflared Process${NC} (running)"
            ((HEALTHY++))
        else
            echo -e "  ${RED}❌ Cloudflared${NC} (not running)"
            ((UNHEALTHY++))
        fi
    fi
else
    echo -e "  ${YELLOW}⚠️  Cloudflared CLI not found${NC}"
    ((WARNINGS++))
fi
echo ""

# ============================================
# MEMORY SYSTEMS
# ============================================
echo "🧠 MEMORY SYSTEMS"
echo "─────────────────────────────────────────"

# Test Graphiti entity creation
graphiti_test=$(curl -s -X POST http://localhost:8100/api/v1/entities \
    -H "Content-Type: application/json" \
    -d '{"name": "health_check_test", "type": "SYSTEM_TEST"}' 2>/dev/null | jq -r '.id // empty' 2>/dev/null)

if [ -n "$graphiti_test" ]; then
    echo -e "  ${GREEN}✅ Graphiti Write${NC} (created entity)"
    ((HEALTHY++))
else
    echo -e "  ${RED}❌ Graphiti Write${NC} (failed)"
    ((UNHEALTHY++))
fi

# Test RuVector embedding
ruvector_test=$(curl -s -X POST http://localhost:8200/api/v1/embed \
    -H "Content-Type: application/json" \
    -d '{"text": "health check test"}' 2>/dev/null | jq -r '.embedding[0] // empty' 2>/dev/null)

if [ -n "$ruvector_test" ]; then
    echo -e "  ${GREEN}✅ RuVector Embeddings${NC} (generated)"
    ((HEALTHY++))
else
    echo -e "  ${RED}❌ RuVector Embeddings${NC} (failed)"
    ((UNHEALTHY++))
fi

# Test FalkorDB graph
falkor_test=$(redis-cli -p 6380 GRAPH.QUERY nyra_graph "RETURN 1" 2>/dev/null | grep -q "1" && echo "ok" || echo "")

if [ -n "$falkor_test" ]; then
    echo -e "  ${GREEN}✅ FalkorDB Graph${NC} (responsive)"
    ((HEALTHY++))
else
    echo -e "  ${YELLOW}⚠️  FalkorDB Graph${NC} (graph may not exist yet)"
    ((WARNINGS++))
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo "═══════════════════════════════════════════════════════════════"
echo ""
TOTAL=$((HEALTHY + UNHEALTHY + WARNINGS))

echo -e "📊 SUMMARY"
echo -e "   ${GREEN}Healthy:${NC}   $HEALTHY"
echo -e "   ${YELLOW}Warnings:${NC}  $WARNINGS"
echo -e "   ${RED}Unhealthy:${NC} $UNHEALTHY"
echo -e "   Total:     $TOTAL"
echo ""

if [ $UNHEALTHY -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ All systems operational! Ready for production. 😼${NC}"
    exit 0
elif [ $UNHEALTHY -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Systems mostly healthy with some warnings. Review above.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services unhealthy. Please investigate.${NC}"
    exit 1
fi
