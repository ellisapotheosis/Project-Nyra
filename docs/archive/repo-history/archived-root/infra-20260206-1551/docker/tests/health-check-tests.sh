#!/usr/bin/env bash
# ============================================================================
# Health Check Tests - Verify all services are healthy
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

test_service() {
    local service=$1
    local description=$2
    local test_command=$3

    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    log_info "Testing: $service - $description"

    if eval "$test_command"; then
        log_info "✓ PASSED: $service"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "✗ FAILED: $service"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

wait_for_service() {
    local service=$1
    local max_attempts=${2:-30}
    local attempt=1

    log_info "Waiting for $service to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep $service | grep -q "Up"; then
            log_info "$service is up"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "$service failed to start within timeout"
    return 1
}

# ============================================================================
# Test Cases
# ============================================================================

echo "============================================================================"
echo "Health Check Tests - Starting"
echo "============================================================================"

# Check if docker-compose is running
test_service "Docker Compose" \
    "Verify docker-compose is accessible" \
    "docker-compose --version"

# Test PostgreSQL
test_service "PostgreSQL" \
    "Database health check" \
    "docker-compose exec -T postgres pg_isready -U nyra -d nyra"

# Test Redis
test_service "Redis" \
    "Cache health check" \
    "docker-compose exec -T redis redis-cli -a \${REDIS_PASSWORD:-dev-only-password} ping | grep -q PONG"

# Test MongoDB
test_service "MongoDB" \
    "Document database health check" \
    "docker-compose exec -T mongo mongosh --quiet --eval 'db.adminCommand({ping: 1})' | grep -q ok"

# Test Claude Flow
test_service "Claude Flow" \
    "MCP orchestration health check" \
    "docker-compose exec -T claude-flow node -e \"require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))\""

# Test Archon OS
test_service "Archon OS" \
    "AI framework health check" \
    "docker-compose exec -T archon python -c \"import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()\" 2>/dev/null"

# Test Graphiti MCP
test_service "Graphiti MCP" \
    "Knowledge graph health check" \
    "curl -sf http://localhost:8001/health > /dev/null"

# Test Mem0 MCP
test_service "Mem0 MCP" \
    "Memory service health check" \
    "curl -sf http://localhost:8002/health > /dev/null"

# Test Infisical
test_service "Infisical" \
    "Secret management health check" \
    "curl -sf http://localhost:8080/api/status > /dev/null"

# Test Gitea
test_service "Gitea" \
    "Git service health check" \
    "curl -sf http://localhost:3001/api/healthz > /dev/null"

# Test n8n
test_service "n8n" \
    "Workflow automation health check" \
    "curl -sf http://localhost:5678/healthz > /dev/null"

# ============================================================================
# Container Health Status
# ============================================================================

echo ""
log_info "Checking Docker container health status..."
docker-compose ps

# ============================================================================
# Results Summary
# ============================================================================

echo ""
echo "============================================================================"
echo "Health Check Tests - Results"
echo "============================================================================"
echo "Total Tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "============================================================================"

if [ $TESTS_FAILED -eq 0 ]; then
    log_info "All health checks passed! 🎉"
    exit 0
else
    log_error "Some health checks failed. Please review the logs above."
    exit 1
fi
