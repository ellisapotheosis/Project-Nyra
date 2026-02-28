#!/bin/bash
# ===== PROJECT NYRA HEALTH CHECK =====
# Comprehensive system diagnostics

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Project Nyra Health Check${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# ===== DOCKER STATUS =====
echo -e "${YELLOW}Docker Status:${NC}"

if ! docker ps &> /dev/null; then
  echo -e "${RED}✗ Docker daemon not running${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Docker daemon running${NC}"

RUNNING=$(docker ps --format "table {{.Names}}" | grep -c nyra || true)
TOTAL=$(docker ps -a --format "table {{.Names}}" | grep -c nyra || true)

echo -e "${GREEN}✓ Containers: $RUNNING running, $TOTAL total${NC}"
echo ""

# ===== ORACLE STACK =====
echo -e "${YELLOW}Oracle Cloud Stack:${NC}"

check_container() {
  local name=$1
  local port=$2
  if docker ps --format "table {{.Names}}" | grep -q "^${name}$"; then
    echo -e "${GREEN}✓${NC} $name running"
    if [ ! -z "$port" ]; then
      if timeout 2 bash -c "echo > /dev/tcp/localhost/$port" 2>/dev/null; then
        echo -e "${GREEN}  ✓ Port $port responding${NC}"
      else
        echo -e "${RED}  ✗ Port $port not responding${NC}"
      fi
    fi
  else
    echo -e "${RED}✗${NC} $name not running"
  fi
}

check_container "postgres-nyra" "5432"
check_container "redis-nyra" "6379"
check_container "twenty-crm-oracle" "3000"
check_container "activepieces-oracle" "3002"
check_container "quote-engine-oracle" "8089"
check_container "mem0-oracle" "9100"
check_container "gitea-oracle" "3001"

echo ""

# ===== ORCHESTRATOR STACK =====
echo -e "${YELLOW}Orchestrator Stack:${NC}"

check_container "nexus-router" "6000"
check_container "litellm-router" "4000"
check_container "claude-flow-dev" "8080"
check_container "openclaw-agent" "9000"
check_container "archon-os" "4001"
check_container "redis-orchestrator" "6379"

echo ""

# ===== WORKER STACKS =====
echo -e "${YELLOW}Worker Stacks:${NC}"

check_container "vllm-worker-area51" "8000"
check_container "vllm-worker-3090ti" "8000"
check_container "ollama-worker-3060" "11434"

echo ""

# ===== TAILSCALE CONNECTIVITY =====
echo -e "${YELLOW}Tailscale Mesh:${NC}"

if command -v tailscale &> /dev/null; then
  TAILSCALE_STATUS=$(tailscale status 2>/dev/null || echo "not-running")
  if echo "$TAILSCALE_STATUS" | grep -q "^[0-9]"; then
    NODES=$(echo "$TAILSCALE_STATUS" | wc -l)
    echo -e "${GREEN}✓ Tailscale connected ($NODES nodes)${NC}"
  else
    echo -e "${RED}✗ Tailscale not connected${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Tailscale CLI not installed${NC}"
fi

echo ""

# ===== DNS RESOLUTION =====
echo -e "${YELLOW}DNS Resolution:${NC}"

test_dns() {
  local domain=$1
  if nslookup "$domain" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $domain resolves"
  else
    echo -e "${RED}✗${NC} $domain fails"
  fi
}

test_dns "google.com"
test_dns "trex-fiordland.ts.net" || true

echo ""

# ===== API ENDPOINTS =====
echo -e "${YELLOW}API Health:${NC}"

test_api() {
  local name=$1
  local url=$2
  if timeout 2 curl -sf "$url" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $name"
  else
    echo -e "${RED}✗${NC} $name"
  fi
}

test_api "Nexus Router" "http://localhost:6000/health"
test_api "LiteLLM" "http://localhost:4000/health"
test_api "TwentyCRM" "http://localhost:3000/health"
test_api "Quote Engine" "http://localhost:8089/health"

echo ""

# ===== DOCKER COMPOSE LOGS SUMMARY =====
echo -e "${YELLOW}Recent Errors (last 20 lines):${NC}"

ERROR_COUNT=0
for compose_file in oracle orchestrator workers; do
  LOG=$(docker-compose -f "infra/docker-compose.${compose_file}.yml" logs --tail=5 2>/dev/null | grep -i "error\|fail\|critical" || true)
  if [ ! -z "$LOG" ]; then
    echo -e "${RED}$compose_file:${NC}"
    echo "$LOG" | head -3
    ((ERROR_COUNT++))
  fi
done

if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ No recent errors${NC}"
fi

echo ""

# ===== DISK SPACE =====
echo -e "${YELLOW}Disk Space:${NC}"

df_output=$(df -h "$REPO_ROOT" | tail -1)
usage=$(echo "$df_output" | awk '{print $(NF-1)}')
available=$(echo "$df_output" | awk '{print $(NF-2)}')

echo "Available: $available, Usage: $usage"

if [[ $usage == *"9"* ]] || [[ $usage == *"10"* ]]; then
  echo -e "${RED}⚠ Disk nearly full!${NC}"
fi

echo ""

# ===== SUMMARY =====
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Health Check Complete${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Commands:${NC}"
echo "  make logs         - View all logs"
echo "  make status       - Container status"
echo "  make down         - Stop all services"
echo "  make up           - Start all services"
echo ""
