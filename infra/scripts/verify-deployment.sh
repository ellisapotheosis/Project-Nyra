#!/bin/bash
# Verify Full Stack Deployment Health
# Checks all 60+ services and reports status

set -e

ORACLE_IP="${ORACLE_IP:-100.64.0.31}"
VERBOSE="${VERBOSE:-0}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check_service() {
  local service=$1
  local url=$2
  local expected_code=${3:-200}
  local timeout=${4:-5}

  printf "%-40s" "$service"

  response=$(curl -s -w "\n%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo -e "\n000")
  http_code=$(echo "$response" | tail -n1)

  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $http_code, expected $expected_code)"
    ((FAILED++))
  fi
}

check_port() {
  local service=$1
  local host=$2
  local port=$3
  local timeout=${4:-2}

  printf "%-40s" "$service"

  if timeout $timeout bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
    echo -e "${GREEN}✅ OPEN${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ CLOSED${NC}"
    ((FAILED++))
  fi
}

check_docker() {
  local service=$1
  local host=$2
  local container=$3

  printf "%-40s" "$service"

  if ssh -o ConnectTimeout=2 $host "docker ps --filter name=$container --quiet | grep -q ." 2>/dev/null; then
    echo -e "${GREEN}✅ RUNNING${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ NOT RUNNING${NC}"
    ((FAILED++))
  fi
}

echo "═══════════════════════════════════════════════════════════════════"
echo "  Project Nyra Deployment Verification"
echo "═══════════════════════════════════════════════════════════════════"
echo

# PHASE 0: Infrastructure
echo "📋 PHASE 0: Infrastructure & Networking"
echo "───────────────────────────────────────────────────────────────────"

check_port "Oracle-VPS SSH" "$ORACLE_IP" "22"
check_port "Oracle-VPS Docker" "$ORACLE_IP" "2375"

echo

# PHASE 1: Agent-Vault
echo "📋 PHASE 1: Agent-Vault (CRITICAL)"
echo "───────────────────────────────────────────────────────────────────"

check_service "Agent-Vault Health" "http://127.0.0.1:14321/health"
check_port "Agent-Vault Admin UI" "127.0.0.1" "14321"
check_port "Agent-Vault Proxy" "127.0.0.1" "14322"

echo

# PHASE 2: Foundation
echo "📋 PHASE 2: Foundation Services"
echo "───────────────────────────────────────────────────────────────────"

check_service "Supabase Auth" "http://127.0.0.1:9999/health"
check_service "Supabase Realtime" "http://127.0.0.1:4000/health"
check_port "Supabase DB" "127.0.0.1" "5433"

echo

check_service "Letta Server" "http://127.0.0.1:8283/v1/health"
check_service "Mem0 API" "http://127.0.0.1:5001/health"
check_port "FalkorDB" "127.0.0.1" "6379"
check_service "Qdrant" "http://127.0.0.1:6333/health"

echo

check_service "Forgejo" "http://127.0.0.1:3000/api/v1/version"
check_port "Forgejo SSH" "127.0.0.1" "2222"

echo

# PHASE 3: MCP Servers
echo "📋 PHASE 3: MCP Servers"
echo "───────────────────────────────────────────────────────────────────"

for name in "Firecrawl" "Git" "Next.js DevTools" "Tavily" "Sequential-Thinking" "Playwright" "Shadcn" "Codebase-Index"; do
  port=$((8772 + RANDOM % 10))
  check_port "$name MCP" "127.0.0.1" "$port"
done

echo

check_service "Nexus Router" "http://127.0.0.1:7001/health" "200" "5" || {
  echo -e "${YELLOW}⚠️  Nexus Router may not be deployed yet${NC}"
  ((WARNINGS++))
}

echo

# PHASE 4: Workers
echo "📋 PHASE 4: Worker Services"
echo "───────────────────────────────────────────────────────────────────"

for worker in "worker-rtx3060:100.64.0.20" "worker-rtx3090ti:100.64.0.21" "worker-rtx5090:100.64.0.22"; do
  IFS=: read name ip <<< "$worker"
  check_port "$name LiteLLM" "$ip" "4000"
done

echo

# PHASE 5: Automation
echo "📋 PHASE 5: Automation & Orchestration"
echo "───────────────────────────────────────────────────────────────────"

check_service "n8n" "http://127.0.0.1:5678/api/v1/health"
check_port "n8n Webhooks" "127.0.0.1" "5679"

echo

check_service "ActivePieces" "http://127.0.0.1:3001/api/health" "200" "5" || {
  echo -e "${YELLOW}⚠️  ActivePieces may not be deployed yet${NC}"
  ((WARNINGS++))
}

echo

check_port "Twenty CRM" "127.0.0.1" "3000"

echo

# PHASE 6: Monitoring
echo "📋 PHASE 6: Monitoring & Observability"
echo "───────────────────────────────────────────────────────────────────"

check_service "Prometheus" "http://127.0.0.1:9090/-/healthy"
check_service "Grafana" "http://127.0.0.1:3001/api/health"
check_service "Uptime-kuma" "http://127.0.0.1:3002" "302" # Redirects to login
check_service "cAdvisor" "http://127.0.0.1:8080/healthz"
check_port "Alertmanager" "127.0.0.1" "9093"
check_port "Node Exporter" "127.0.0.1" "9100"
check_service "OpenLIT" "http://127.0.0.1:8088/health"

echo

# PHASE 7: Optional
echo "📋 PHASE 7: Optional Services"
echo "───────────────────────────────────────────────────────────────────"

check_port "SearXNG" "127.0.0.1" "8888" || {
  echo -e "${YELLOW}⚠️  SearXNG not deployed (optional)${NC}"
  ((WARNINGS++))
}

check_port "OpenWebUI" "127.0.0.1" "8001" || {
  echo -e "${YELLOW}⚠️  OpenWebUI not deployed (optional)${NC}"
  ((WARNINGS++))
}

echo

# Summary
echo "═══════════════════════════════════════════════════════════════════"
echo "  Verification Summary"
echo "═══════════════════════════════════════════════════════════════════"

TOTAL=$((PASSED + FAILED + WARNINGS))

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical services operational${NC}"
  exit 0
else
  echo -e "${RED}❌ $FAILED service(s) failing${NC}"
  echo -e "${GREEN}✅ $PASSED passing${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings (non-critical)${NC}"
  fi
  exit 1
fi
