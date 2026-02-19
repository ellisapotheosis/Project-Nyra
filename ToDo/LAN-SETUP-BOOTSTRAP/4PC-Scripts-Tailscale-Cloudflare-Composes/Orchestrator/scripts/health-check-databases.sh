#!/usr/bin/env bash
# ==============================================================================
# Database Health Check Script
# ==============================================================================
# Comprehensive health checks for all database services
#
# Exit codes:
#   0 - All services healthy
#   1 - One or more services unhealthy
#   2 - Critical error
# ==============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Status tracking
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

log_fail() {
  echo -e "${RED}[✗]${NC} $1"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

log_warn() {
  echo -e "${YELLOW}[⚠]${NC} $1"
  ((WARNING_CHECKS++))
  ((TOTAL_CHECKS++))
}

check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Docker is not running${NC}"
    exit 2
  fi
}

# -----------------------------------------------------------------------------
# HEALTH CHECK FUNCTIONS
# -----------------------------------------------------------------------------

check_postgres() {
  log_info "Checking PostgreSQL..."

  # Container running
  if docker ps --filter "name=orchestrator-postgres" --filter "status=running" | grep -q orchestrator-postgres; then
    log_success "PostgreSQL container is running"
  else
    log_fail "PostgreSQL container is not running"
    return 1
  fi

  # Connection test
  if docker exec orchestrator-postgres pg_isready -U postgres > /dev/null 2>&1; then
    log_success "PostgreSQL is accepting connections"
  else
    log_fail "PostgreSQL is not accepting connections"
    return 1
  fi

  # Database count
  local db_count=$(docker exec orchestrator-postgres psql -U postgres -tAc "SELECT COUNT(*) FROM pg_database WHERE datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical');" 2>/dev/null || echo "0")
  if [ "$db_count" -eq 4 ]; then
    log_success "All 4 databases exist (nyra_main, nyra_auth, nyra_analytics, infisical)"
  else
    log_fail "Database count incorrect (expected 4, found $db_count)"
  fi

  # Active connections
  local connections=$(docker exec orchestrator-postgres psql -U postgres -tAc "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null || echo "0")
  log_info "Active connections: $connections"

  # Disk usage
  local db_size=$(docker exec orchestrator-postgres psql -U postgres -tAc "SELECT pg_size_pretty(SUM(pg_database_size(datname))::bigint) FROM pg_database WHERE datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical');" 2>/dev/null || echo "unknown")
  log_info "Total database size: $db_size"

  return 0
}

check_redis() {
  log_info "Checking Redis..."

  # Container running
  if docker ps --filter "name=orchestrator-redis" --filter "status=running" | grep -q orchestrator-redis; then
    log_success "Redis container is running"
  else
    log_fail "Redis container is not running"
    return 1
  fi

  # Ping test
  if docker exec orchestrator-redis redis-cli ping 2>&1 | grep -q "PONG"; then
    log_success "Redis is responding to PING"
  else
    log_fail "Redis is not responding to PING"
    return 1
  fi

  # Memory usage
  local memory_used=$(docker exec orchestrator-redis redis-cli INFO MEMORY 2>/dev/null | grep "used_memory_human:" | cut -d: -f2 | tr -d '\r' || echo "unknown")
  local memory_max=$(docker exec orchestrator-redis redis-cli CONFIG GET maxmemory 2>/dev/null | tail -n1 || echo "unlimited")
  log_info "Memory usage: $memory_used / $memory_max"

  # Connected clients
  local clients=$(docker exec orchestrator-redis redis-cli INFO CLIENTS 2>/dev/null | grep "connected_clients:" | cut -d: -f2 | tr -d '\r' || echo "0")
  log_info "Connected clients: $clients"

  # Persistence check
  local aof_enabled=$(docker exec orchestrator-redis redis-cli CONFIG GET appendonly 2>/dev/null | tail -n1 || echo "no")
  if [ "$aof_enabled" = "yes" ]; then
    log_success "AOF persistence enabled"
  else
    log_warn "AOF persistence not enabled"
  fi

  # Key count
  local keys=$(docker exec orchestrator-redis redis-cli DBSIZE 2>/dev/null | cut -d: -f2 | tr -d '\r' || echo "0")
  log_info "Total keys: $keys"

  return 0
}

check_mongodb() {
  log_info "Checking MongoDB..."

  # Container running
  if docker ps --filter "name=orchestrator-mongodb" --filter "status=running" | grep -q orchestrator-mongodb; then
    log_success "MongoDB container is running"
  else
    log_fail "MongoDB container is not running"
    return 1
  fi

  # Ping test
  if docker exec orchestrator-mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
    log_success "MongoDB is responding to commands"
  else
    log_fail "MongoDB is not responding to commands"
    return 1
  fi

  # Replica set status
  local rs_status=$(docker exec orchestrator-mongodb mongosh --quiet --eval "rs.status().ok" 2>/dev/null || echo "0")
  if [ "$rs_status" = "1" ]; then
    log_success "MongoDB replica set is healthy"
  else
    log_warn "MongoDB replica set status unclear"
  fi

  # Primary status
  local is_primary=$(docker exec orchestrator-mongodb mongosh --quiet --eval "rs.isMaster().ismaster" 2>/dev/null || echo "false")
  if [ "$is_primary" = "true" ]; then
    log_success "MongoDB is PRIMARY"
  else
    log_warn "MongoDB is not PRIMARY"
  fi

  # Database count
  local db_count=$(docker exec orchestrator-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.length" 2>/dev/null || echo "0")
  log_info "Total databases: $db_count"

  # Connection count
  local connections=$(docker exec orchestrator-mongodb mongosh --quiet --eval "db.serverStatus().connections.current" 2>/dev/null || echo "0")
  log_info "Active connections: $connections"

  return 0
}

check_agentdb() {
  log_info "Checking AgentDB (Qdrant)..."

  # Container running
  if docker ps --filter "name=orchestrator-agentdb" --filter "status=running" | grep -q orchestrator-agentdb; then
    log_success "AgentDB container is running"
  else
    log_fail "AgentDB container is not running"
    return 1
  fi

  # Health endpoint
  if docker exec orchestrator-agentdb wget -q -O - http://localhost:6333/health 2>/dev/null | grep -q "ok"; then
    log_success "AgentDB health endpoint responding"
  else
    log_fail "AgentDB health endpoint not responding"
    return 1
  fi

  # Collections count
  local collections=$(docker exec orchestrator-agentdb wget -q -O - http://localhost:6333/collections 2>/dev/null | grep -o "\"name\"" | wc -l || echo "0")
  log_info "Total collections: $collections"

  # Storage usage
  local storage_info=$(docker exec orchestrator-agentdb du -sh /qdrant/storage 2>/dev/null | cut -f1 || echo "unknown")
  log_info "Storage usage: $storage_info"

  return 0
}

# -----------------------------------------------------------------------------
# MAIN EXECUTION
# -----------------------------------------------------------------------------

clear
echo "=========================================================================="
echo "  DATABASE HEALTH CHECK - Project Nyra Orchestrator"
echo "=========================================================================="
echo ""

# Preflight check
check_docker

# Run all health checks
check_postgres
echo ""

check_redis
echo ""

check_mongodb
echo ""

check_agentdb
echo ""

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------

echo "=========================================================================="
echo "  HEALTH CHECK SUMMARY"
echo "=========================================================================="
echo ""
echo "Total checks:   $TOTAL_CHECKS"
echo -e "Passed:         ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed:         ${RED}$FAILED_CHECKS${NC}"
echo -e "Warnings:       ${YELLOW}$WARNING_CHECKS${NC}"
echo ""

if [ "$FAILED_CHECKS" -eq 0 ]; then
  if [ "$WARNING_CHECKS" -eq 0 ]; then
    echo -e "${GREEN}✓ All health checks passed!${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠ Health checks passed with warnings${NC}"
    exit 0
  fi
else
  echo -e "${RED}✗ Some health checks failed${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check container logs: docker-compose -f $COMPOSE_FILE logs [service]"
  echo "  2. Restart services: docker-compose -f $COMPOSE_FILE restart"
  echo "  3. Re-run setup: ./scripts/setup-databases.sh"
  echo "  4. Check documentation: docs/databases/DATABASE-OPERATIONS.md"
  exit 1
fi
