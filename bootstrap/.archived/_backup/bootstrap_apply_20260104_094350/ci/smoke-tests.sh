#!/bin/bash
# Smoke Tests
# Quick health checks for all Nyra services

set -e

echo "🧪 Starting smoke tests..."

# Configuration
MAX_WAIT=60
RETRY_DELAY=2

# Service endpoints
declare -A SERVICES=(
  ["campaign-engine"]="http://localhost:8080/health"
  ["quote-engine"]="http://localhost:8081/health"
  ["quote-api"]="http://localhost:8082/health"
  ["nyra-orchestrator"]="http://localhost:8083/health"
  ["mem0-mcp"]="http://localhost:8081/health"
  ["prometheus"]="http://localhost:9090/-/healthy"
  ["grafana"]="http://localhost:3000/api/health"
  ["loki"]="http://localhost:3100/ready"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED_SERVICES=()
PASSED_SERVICES=()

# Function to wait for service
wait_for_service() {
  local name=$1
  local url=$2
  local elapsed=0

  echo -n "Checking $name... "

  while [ $elapsed -lt $MAX_WAIT ]; do
    if curl -f -s -o /dev/null "$url" 2>/dev/null; then
      echo -e "${GREEN}✅ PASS${NC}"
      PASSED_SERVICES+=("$name")
      return 0
    fi
    sleep $RETRY_DELAY
    elapsed=$((elapsed + RETRY_DELAY))
  done

  echo -e "${RED}❌ FAIL${NC} (timeout after ${MAX_WAIT}s)"
  FAILED_SERVICES+=("$name")
  return 1
}

# Function to check service metrics
check_metrics() {
  local name=$1
  local metrics_url=$2

  echo -n "Checking $name metrics... "

  if curl -f -s "$metrics_url" | grep -q "^# TYPE"; then
    echo -e "${GREEN}✅ PASS${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  WARN${NC} (no metrics found)"
    return 1
  fi
}

# Function to check database connectivity
check_database() {
  echo -n "Checking database connectivity... "

  # Try to connect to postgres (adjust as needed)
  if docker-compose exec -T postgres pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠️  WARN${NC} (database check skipped)"
    return 1
  fi
}

# Run health checks
echo "Running health checks..."
for service in "${!SERVICES[@]}"; do
  wait_for_service "$service" "${SERVICES[$service]}"
done

# Check Prometheus metrics
echo ""
echo "Checking metrics endpoints..."
check_metrics "campaign-engine" "http://localhost:8080/metrics"
check_metrics "quote-engine" "http://localhost:8081/metrics"
check_metrics "quote-api" "http://localhost:8082/metrics"

# Check database
echo ""
check_database

# Test critical API endpoints
echo ""
echo "Testing critical API endpoints..."

# Test quote API
echo -n "Testing quote API... "
RESPONSE=$(curl -s -X POST http://localhost:8082/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"riskType":"auto","coverageAmount":100000}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "quoteId"; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  FAILED_SERVICES+=("quote-api-functional")
fi

# Test campaign engine
echo -n "Testing campaign engine... "
RESPONSE=$(curl -s -X GET http://localhost:8080/api/campaigns 2>/dev/null)

if [ -n "$RESPONSE" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  FAILED_SERVICES+=("campaign-engine-functional")
fi

# Summary
echo ""
echo "========================================="
echo "Smoke Test Summary"
echo "========================================="
echo -e "Passed: ${GREEN}${#PASSED_SERVICES[@]}${NC}"
echo -e "Failed: ${RED}${#FAILED_SERVICES[@]}${NC}"

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
  echo ""
  echo "Failed services:"
  for service in "${FAILED_SERVICES[@]}"; do
    echo -e "  ${RED}✗${NC} $service"
  done
  exit 1
else
  echo -e "${GREEN}✅ All smoke tests passed!${NC}"
  exit 0
fi
