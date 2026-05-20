#!/bin/bash

# Project Nyra Infra Smoke Test
# Verifies reachability of core services via their health endpoints.

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "🚀 ${GREEN}Starting Project Nyra Smoke Test...${NC}"

# Internal services (Docker network names within hosts)
SERVICES=(
  "http://localhost:3001|Webapp"
  "http://localhost:3016|Nexus-UI"
  "http://localhost:3000|Twenty CRM"
  "http://localhost:5678/healthz|n8n"
  "http://localhost:4001/api/leads?limit=1|CRM API"
  "http://localhost:7070/health|Quote API"
  "http://localhost:3000/health|Nexus"
  "http://localhost:4000/health/readiness|LiteLLM"
  "http://localhost:9090/-/healthy|Prometheus"
  "http://localhost:3100/ready|Loki"
  "http://localhost:18789/health|OpenClaw Gateway"
)

FAILED=0

for item in "${SERVICES[@]}"; do
  URL="${item%%|*}"
  NAME="${item##*|}"
  
  echo -n "Checking $NAME ($URL)... "
  if curl -s --head --fail "$URL" > /dev/null; then
    echo -e "${GREEN}PASS${NC}"
  else
    # Try a simple GET if HEAD fails (some services don't support HEAD)
    if curl -s --fail "$URL" > /dev/null; then
      echo -e "${GREEN}PASS${NC}"
    else
      echo -e "${RED}FAIL${NC}"
      FAILED=$((FAILED + 1))
    fi
  fi
done

if [ $FAILED -eq 0 ]; then
  echo -e "\n✨ ${GREEN}All core services are reachable!${NC}"
  exit 0
else
  echo -e "\n❌ ${RED}$FAILED services failed the smoke test.${NC}"
  exit 1
fi
