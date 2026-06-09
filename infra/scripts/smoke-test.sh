#!/bin/bash

# Project Nyra Infra Smoke Test
# Verifies reachability of core services via their health endpoints.

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "🚀 ${GREEN}Starting Project Nyra Smoke Test...${NC}"

# Host IPs
ORACLE_IP="100.64.0.3"

# Services to check
# Format: "URL|NAME"
SERVICES=(
  "http://${ORACLE_IP}:3002|Webapp"
  "http://${ORACLE_IP}:3016|Nexus-UI"
  "http://${ORACLE_IP}:3000/health|Twenty CRM"
  "http://${ORACLE_IP}:5678/healthz|n8n"
  "http://${ORACLE_IP}:4001/health|CRM API"
  "http://${ORACLE_IP}:7070/health|Quote API"
  "http://${ORACLE_IP}:6000/health|Nexus Router"
  "http://${ORACLE_IP}:4000/health/readiness|LiteLLM"
  "http://${ORACLE_IP}:9090/-/healthy|Prometheus"
  "http://${ORACLE_IP}:3100/ready|Loki"
  "http://localhost:18789/health|OpenClaw Gateway"
  "http://localhost:8787/health|Status Bridge"
)

FAILED=0

# Check for x-crm-api-key if we want CRM API to pass with 200
CRM_API_KEY="tbd"

for item in "${SERVICES[@]}"; do
  URL="${item%%|*}"
  NAME="${item##*|}"

  echo -n "Checking $NAME ($URL)... "

  # Special handling for CRM API which might require auth
  if [[ "$NAME" == "CRM API" ]]; then
    if curl -s -H "x-crm-api-key: $CRM_API_KEY" --fail "$URL" > /dev/null; then
      echo -e "${GREEN}PASS${NC}"
    else
      echo -e "${RED}FAIL (Auth/Down)${NC}"
      FAILED=$((FAILED + 1))
    fi
    continue
  fi

  if curl -s --head --fail "$URL" > /dev/null; then
    echo -e "${GREEN}PASS${NC}"
  else
    # Try a simple GET if HEAD fails
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