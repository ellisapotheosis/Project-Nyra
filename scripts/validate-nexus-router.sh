#!/bin/bash
# Nexus Router Integration Validation Script
# Version: 1.0.0
# Purpose: Validate nexus-router deployment and configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "Nexus Router Validation Script"
echo "=================================="
echo ""

# Track validation results
ERRORS=0
WARNINGS=0

# Helper functions
check_success() {
  echo -e "${GREEN}✓${NC} $1"
}

check_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

check_error() {
  echo -e "${RED}✗${NC} $1"
  ((ERRORS++))
}

# 1. Check Docker Compose Files Exist
echo "1. Checking configuration files..."
if [ -f "docker-compose.nexus-router.yml" ]; then
  check_success "docker-compose.nexus-router.yml exists"
else
  check_error "docker-compose.nexus-router.yml not found"
fi

if [ -f "configs/redis/redis.conf" ]; then
  check_success "configs/redis/redis.conf exists"
else
  check_error "configs/redis/redis.conf not found"
fi

if [ -f ".env" ]; then
  check_success ".env file exists"
else
  check_warning ".env file not found (will use defaults)"
fi

# 2. Validate Docker Compose Syntax
echo ""
echo "2. Validating Docker Compose syntax..."
if docker compose -f docker-compose.nexus-router.yml config > /dev/null 2>&1; then
  check_success "Docker Compose syntax is valid"
else
  check_error "Docker Compose syntax validation failed"
  docker compose -f docker-compose.nexus-router.yml config
fi

# 3. Check for Port Conflicts
echo ""
echo "3. Checking for port conflicts..."
ports=(8000 4001 6379 8001 8002 8003)
for port in "${ports[@]}"; do
  if netstat -tuln 2>/dev/null | grep -q ":$port "; then
    check_warning "Port $port is already in use"
  else
    check_success "Port $port is available"
  fi
done

# 4. Check Environment Variables
echo ""
echo "4. Checking environment variables..."
if [ -f ".env" ]; then
  source .env

  if [ -n "$REDIS_PASSWORD" ]; then
    check_success "REDIS_PASSWORD is set"
  else
    check_warning "REDIS_PASSWORD not set (will use default)"
  fi

  if [ -n "$ANTHROPIC_API_KEY" ]; then
    check_success "ANTHROPIC_API_KEY is set"
  else
    check_warning "ANTHROPIC_API_KEY not set (cloud fallback disabled)"
  fi

  if [ -n "$OPENROUTER_API_KEY" ]; then
    check_success "OPENROUTER_API_KEY is set"
  else
    check_warning "OPENROUTER_API_KEY not set (limited fallback options)"
  fi
else
  check_warning "No .env file found, skipping environment checks"
fi

# 5. Check Docker Network
echo ""
echo "5. Checking Docker network..."
if docker network ls | grep -q "nyra-network"; then
  check_success "nyra-network exists"
else
  check_warning "nyra-network not found (will be created)"
fi

# 6. Check Service Health (if running)
echo ""
echo "6. Checking service health (if running)..."
if docker ps | grep -q "nyra-nexus-router"; then
  if curl -f -s http://localhost:8000/health/live > /dev/null 2>&1; then
    check_success "Nexus Router is running and healthy"

    # Get metrics
    METRICS=$(curl -s http://localhost:8000/health | jq -r '.metrics')
    if [ -n "$METRICS" ]; then
      LOCAL_PCT=$(echo "$METRICS" | jq -r '.localPercentage // "N/A"')
      TOTAL_REQS=$(echo "$METRICS" | jq -r '.totalRequests // 0')
      echo "   → Local usage: ${LOCAL_PCT}%"
      echo "   → Total requests: ${TOTAL_REQS}"
    fi
  else
    check_error "Nexus Router is not responding to health checks"
  fi
else
  check_warning "Nexus Router is not running"
fi

if docker ps | grep -q "nyra-redis-shared"; then
  if docker exec nyra-redis-shared redis-cli -a "${REDIS_PASSWORD:-changeme}" ping 2>/dev/null | grep -q "PONG"; then
    check_success "Redis is running and responding"

    # Get Redis info
    REDIS_MEMORY=$(docker exec nyra-redis-shared redis-cli -a "${REDIS_PASSWORD:-changeme}" INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
    if [ -n "$REDIS_MEMORY" ]; then
      echo "   → Memory usage: ${REDIS_MEMORY}"
    fi
  else
    check_error "Redis is not responding to PING"
  fi
else
  check_warning "Redis is not running"
fi

# 7. Check GPU Workers (if profiles enabled)
echo ""
echo "7. Checking GPU workers..."
GPU_WORKERS=("nyra-gpu-worker-5090" "nyra-gpu-worker-3090" "nyra-gpu-worker-3060")
GPU_FOUND=false
for worker in "${GPU_WORKERS[@]}"; do
  if docker ps | grep -q "$worker"; then
    check_success "GPU worker $worker is running"
    GPU_FOUND=true
  fi
done

if [ "$GPU_FOUND" = false ]; then
  check_warning "No GPU workers found (cloud-only mode)"
fi

# 8. Check Service Dependencies
echo ""
echo "8. Checking service dependencies..."
services=("litellm" "nexus" "letta" "mem0")
for service in "${services[@]}"; do
  if docker ps | grep -q "nyra-$service"; then
    check_success "Service $service is running"
  else
    check_warning "Service $service is not running"
  fi
done

# 9. Test API Endpoints (if running)
echo ""
echo "9. Testing API endpoints..."
if docker ps | grep -q "nyra-nexus-router"; then
  # Test health endpoint
  if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
    check_success "GET /health endpoint responding"
  else
    check_error "GET /health endpoint not responding"
  fi

  # Test models endpoint
  if curl -f -s http://localhost:8000/v1/models > /dev/null 2>&1; then
    check_success "GET /v1/models endpoint responding"
  else
    check_error "GET /v1/models endpoint not responding"
  fi
else
  check_warning "Cannot test endpoints (service not running)"
fi

# 10. Check Documentation
echo ""
echo "10. Checking documentation..."
docs=(
  "docs/architecture/nexus-router-integration.md"
  "docs/deployment/nexus-router-quick-start.md"
  "services/nexus-router/README.md"
)
for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    check_success "Documentation: $doc"
  else
    check_warning "Documentation missing: $doc"
  fi
done

# Summary
echo ""
echo "=================================="
echo "Validation Summary"
echo "=================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Passed with $WARNINGS warning(s)${NC}"
  exit 0
else
  echo -e "${RED}✗ Failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  exit 1
fi
