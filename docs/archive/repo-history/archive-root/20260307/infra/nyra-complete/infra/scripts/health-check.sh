#!/bin/bash

# Health Check Script for Project Nyra
# Verifies all services across orchestrator, workers, and oracle

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check() {
  local name=$1
  local url=$2
  local timeout=${3:-5}
  
  if curl -sf --connect-timeout "$timeout" "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $name"
    ((FAILED++))
  fi
}

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Project Nyra Health Check (v3.0)         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}ORCHESTRATOR (Minisforum)${NC}"
check "Nexus Router (6000)" "http://localhost:6000/health"
check "LiteLLM (4000)" "http://localhost:4000/health"
check "Claude-Flow (8000)" "http://localhost:8000/health"
check "OpenClaw (8001)" "http://localhost:8001/health"
check "Archon-OS (8080)" "http://localhost:8080/health"
check "Redis (6379)" "redis://localhost:6379"
echo ""

echo -e "${YELLOW}GPU WORKERS (Tailscale)${NC}"
check "RTX 5090 vLLM (8000)" "http://100.x.x.1:8000/health" 10
check "RTX 3090Ti vLLM (8000)" "http://100.x.x.2:8000/health" 10
check "RTX 3060 Ollama (11434)" "http://100.x.x.3:11434/api/tags" 10
echo ""

echo -e "${YELLOW}ORACLE CLOUD (System of Record)${NC}"
check "TwentyCRM (3000)" "http://oracle.trex-fiordland.ts.net:3000/health" 10
check "Postgres (5432)" "postgresql://postgres@oracle.trex-fiordland.ts.net:5432/twenty" || true
check "Redis (6379)" "http://oracle.trex-fiordland.ts.net:6379" || true
check "Quote Engine (8089)" "http://oracle.trex-fiordland.ts.net:8089/health" 10
check "Lead Ingestion (8090)" "http://oracle.trex-fiordland.ts.net:8090/health" 10
check "Mem0 (5000)" "http://oracle.trex-fiordland.ts.net:5000/health" 10
check "Activepieces (3001)" "http://oracle.trex-fiordland.ts.net:3001/health" 10
echo ""

echo -e "${YELLOW}NETWORK CONNECTIVITY${NC}"
check "Tailscale mesh (ping 100.x.x.1)" "http://100.x.x.1:8000/health" 10
check "Public DNS (8.8.8.8)" "http://8.8.8.8" || true
check "Cloudflare DNS (1.1.1.1)" "http://1.1.1.1" || true
echo ""

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All systems healthy! ✓${NC}"
  exit 0
else
  echo -e "${YELLOW}Some services may be down, review above.${NC}"
  exit 1
fi
