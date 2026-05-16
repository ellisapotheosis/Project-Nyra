#!/bin/bash
# Nexus Router Label Validation Script
# Validates that all Nyra services have required Docker labels for auto-discovery

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required labels
REQUIRED_LABELS=(
  "nyra.service.name"
  "nyra.service.type"
  "nyra.service.category"
  "nyra.mcp.enabled"
  "nyra.api.enabled"
)

# Conditional labels
MCP_LABELS=(
  "nyra.mcp.transport"
  "nyra.mcp.port"
)

API_LABELS=(
  "nyra.api.port"
  "nyra.api.protocol"
)

# Counters
TOTAL=0
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Nexus Router Label Validation Script                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
  exit 1
fi

echo -e "${BLUE}📋 Scanning for Nyra services...${NC}"
echo ""

# Function to get label value
get_label() {
  local container=$1
  local label=$2
  docker inspect "$container" --format "{{index .Config.Labels \"$label\"}}" 2>/dev/null || echo ""
}

# Function to validate a single service
validate_service() {
  local container=$1
  local errors=0
  local warnings=0

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}🔍 Validating: $container${NC}"

  # Check required labels
  for label in "${REQUIRED_LABELS[@]}"; do
    value=$(get_label "$container" "$label")
    if [ -z "$value" ]; then
      echo -e "${RED}  ❌ Missing required label: $label${NC}"
      ((errors++))
    else
      echo -e "${GREEN}  ✅ $label: $value${NC}"
    fi
  done

  # Get service type flags
  mcp_enabled=$(get_label "$container" "nyra.mcp.enabled")
  api_enabled=$(get_label "$container" "nyra.api.enabled")

  # Check MCP labels if enabled
  if [ "$mcp_enabled" = "true" ]; then
    echo -e "${BLUE}  📡 MCP Enabled - Checking MCP labels...${NC}"
    for label in "${MCP_LABELS[@]}"; do
      value=$(get_label "$container" "$label")
      if [ -z "$value" ]; then
        echo -e "${YELLOW}  ⚠️  Missing MCP label: $label${NC}"
        ((warnings++))
      else
        echo -e "${GREEN}  ✅ $label: $value${NC}"
      fi
    done
  fi

  # Check API labels if enabled
  if [ "$api_enabled" = "true" ]; then
    echo -e "${BLUE}  🌐 API Enabled - Checking API labels...${NC}"
    for label in "${API_LABELS[@]}"; do
      value=$(get_label "$container" "$label")
      if [ -z "$value" ]; then
        echo -e "${YELLOW}  ⚠️  Missing API label: $label${NC}"
        ((warnings++))
      else
        echo -e "${GREEN}  ✅ $label: $value${NC}"
      fi
    done
  fi

  # Check network membership
  networks=$(docker inspect "$container" --format '{{range $net, $v := .NetworkSettings.Networks}}{{$net}} {{end}}')
  if echo "$networks" | grep -q "nyra"; then
    echo -e "${GREEN}  ✅ Connected to nyra network${NC}"
  else
    echo -e "${YELLOW}  ⚠️  Not connected to nyra network: $networks${NC}"
    ((warnings++))
  fi

  # Summary for this service
  echo ""
  if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}  ✅ Service validation PASSED${NC}"
    ((PASSED++))
  elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}  ⚠️  Service validation PASSED with $warnings warnings${NC}"
    ((PASSED++))
    ((WARNINGS+=warnings))
  else
    echo -e "${RED}  ❌ Service validation FAILED with $errors errors and $warnings warnings${NC}"
    ((FAILED++))
    ((WARNINGS+=warnings))
  fi

  echo ""
}

# Find all nyra containers
CONTAINERS=$(docker ps --filter "name=nyra-*" --format "{{.Names}}" 2>/dev/null || echo "")

if [ -z "$CONTAINERS" ]; then
  echo -e "${YELLOW}⚠️  No Nyra services found running.${NC}"
  echo -e "${YELLOW}   Please start services with: docker compose up -d${NC}"
  exit 0
fi

# Validate each container
while IFS= read -r container; do
  if [ -n "$container" ]; then
    validate_service "$container"
    ((TOTAL++))
  fi
done <<< "$CONTAINERS"

# Final summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Validation Summary                                     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Total Services Scanned:  ${BLUE}$TOTAL${NC}"
echo -e "  Services Passed:         ${GREEN}$PASSED${NC}"
echo -e "  Services Failed:         ${RED}$FAILED${NC}"
echo -e "  Total Warnings:          ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All services passed validation!${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  However, there are $WARNINGS warnings that should be addressed.${NC}"
  fi
  exit 0
else
  echo -e "${RED}❌ $FAILED services failed validation.${NC}"
  echo -e "${YELLOW}   Please fix the errors and run validation again.${NC}"
  exit 1
fi
