#!/usr/bin/env bash
# ==============================================================================
# Database Setup Script for Project Nyra Orchestrator
# ==============================================================================
# Initializes all databases and verifies their health
#
# Databases initialized:
#   - PostgreSQL (nyra_main, nyra_auth, nyra_analytics, infisical)
#   - Redis (cache + pub/sub)
#   - MongoDB (nyra, nyra_logs, nyra_cache)
#   - AgentDB (Qdrant vector database)
#
# Usage:
#   ./setup-databases.sh [--skip-health-check] [--verbose]
#
# Requirements:
#   - Docker and Docker Compose installed
#   - .env file with database credentials (or Infisical configured)
#   - All database containers running
# ==============================================================================

set -euo pipefail

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
SKIP_HEALTH_CHECK=false
VERBOSE=false

# Retry configuration
MAX_RETRIES=30
RETRY_INTERVAL=5

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Execute command with optional verbose output
execute() {
  if [ "$VERBOSE" = true ]; then
    log_info "Executing: $*"
    "$@"
  else
    "$@" > /dev/null 2>&1
  fi
}

# Wait for a service to be healthy
wait_for_service() {
  local service=$1
  local max_attempts=${2:-$MAX_RETRIES}
  local attempt=1

  log_info "Waiting for $service to be healthy..."

  while [ $attempt -le $max_attempts ]; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" 2>/dev/null | grep -q "Up (healthy)"; then
      log_success "$service is healthy"
      return 0
    fi

    if [ $attempt -eq $max_attempts ]; then
      log_error "$service did not become healthy after $max_attempts attempts"
      return 1
    fi

    echo -n "."
    sleep $RETRY_INTERVAL
    ((attempt++))
  done
}

# -----------------------------------------------------------------------------
# PARSE ARGUMENTS
# -----------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-health-check)
      SKIP_HEALTH_CHECK=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --skip-health-check    Skip waiting for services to be healthy"
      echo "  --verbose, -v          Enable verbose output"
      echo "  --help, -h             Show this help message"
      exit 0
      ;;
    *)
      log_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# -----------------------------------------------------------------------------
# PREFLIGHT CHECKS
# -----------------------------------------------------------------------------

log_info "Starting database setup..."
log_info "Project root: $PROJECT_ROOT"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  log_error "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  log_error "Docker Compose file not found: $COMPOSE_FILE"
  exit 1
fi

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ] && [ ! -f "$PROJECT_ROOT/docker/.env" ]; then
  log_warn "No .env file found. Make sure environment variables are set via Infisical or docker-compose environment."
fi

# -----------------------------------------------------------------------------
# START SERVICES
# -----------------------------------------------------------------------------

log_info "Starting database services..."
cd "$PROJECT_ROOT"
docker-compose -f "$COMPOSE_FILE" up -d postgres redis mongodb agentdb

# -----------------------------------------------------------------------------
# WAIT FOR SERVICES TO BE HEALTHY
# -----------------------------------------------------------------------------

if [ "$SKIP_HEALTH_CHECK" = false ]; then
  log_info "Waiting for services to become healthy (this may take a few minutes)..."

  wait_for_service "postgres" || exit 1
  wait_for_service "redis" || exit 1
  wait_for_service "mongodb" || exit 1
  wait_for_service "agentdb" || exit 1
else
  log_warn "Skipping health check. Waiting 30 seconds for services to start..."
  sleep 30
fi

# -----------------------------------------------------------------------------
# POSTGRESQL INITIALIZATION
# -----------------------------------------------------------------------------

log_info "Initializing PostgreSQL..."

# PostgreSQL init scripts run automatically via docker-entrypoint-initdb.d
# But we can verify they executed successfully

log_info "Verifying PostgreSQL databases..."
POSTGRES_CHECK=$(docker exec orchestrator-postgres psql -U postgres -tAc "SELECT COUNT(*) FROM pg_database WHERE datname IN ('nyra_main', 'nyra_auth', 'nyra_analytics', 'infisical');")

if [ "$POSTGRES_CHECK" -eq 4 ]; then
  log_success "PostgreSQL databases created successfully (4/4)"
else
  log_error "PostgreSQL database creation failed. Expected 4 databases, found $POSTGRES_CHECK"
  exit 1
fi

log_info "Verifying PostgreSQL users..."
POSTGRES_USERS=$(docker exec orchestrator-postgres psql -U postgres -tAc "SELECT COUNT(*) FROM pg_user WHERE usename LIKE 'nyra%' OR usename = 'infisical_user';")

if [ "$POSTGRES_USERS" -ge 4 ]; then
  log_success "PostgreSQL users created successfully ($POSTGRES_USERS users)"
else
  log_warn "PostgreSQL user creation may have failed. Found $POSTGRES_USERS users (expected >= 4)"
fi

# -----------------------------------------------------------------------------
# REDIS INITIALIZATION
# -----------------------------------------------------------------------------

log_info "Initializing Redis..."

# Test Redis connection
if docker exec orchestrator-redis redis-cli ping 2>&1 | grep -q "PONG"; then
  log_success "Redis is responding to commands"
else
  log_error "Redis connection test failed"
  exit 1
fi

# Check Redis persistence
REDIS_AOF=$(docker exec orchestrator-redis redis-cli CONFIG GET appendonly | grep -c "yes" || echo "0")
REDIS_RDB=$(docker exec orchestrator-redis redis-cli CONFIG GET save | grep -c "900" || echo "0")

if [ "$REDIS_AOF" -gt 0 ] && [ "$REDIS_RDB" -gt 0 ]; then
  log_success "Redis persistence enabled (AOF + RDB)"
else
  log_warn "Redis persistence may not be fully configured"
fi

# -----------------------------------------------------------------------------
# MONGODB INITIALIZATION
# -----------------------------------------------------------------------------

log_info "Initializing MongoDB..."

# MongoDB init scripts run automatically via docker-entrypoint-initdb.d
# Verify replica set initialization

log_info "Waiting for MongoDB replica set to initialize..."
sleep 10

MONGO_RS_STATUS=$(docker exec orchestrator-mongodb mongosh --quiet --eval "rs.status().ok" 2>/dev/null || echo "0")

if [ "$MONGO_RS_STATUS" = "1" ]; then
  log_success "MongoDB replica set initialized successfully"
else
  log_warn "MongoDB replica set initialization may have failed. Check logs for details."
fi

# Verify databases
log_info "Verifying MongoDB databases..."
MONGO_DBS=$(docker exec orchestrator-mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d => d.name).filter(n => n.startsWith('nyra')).length" 2>/dev/null || echo "0")

if [ "$MONGO_DBS" -ge 2 ]; then
  log_success "MongoDB databases created successfully ($MONGO_DBS databases)"
else
  log_warn "MongoDB database creation may be incomplete. Found $MONGO_DBS databases"
fi

# -----------------------------------------------------------------------------
# AGENTDB (QDRANT) INITIALIZATION
# -----------------------------------------------------------------------------

log_info "Initializing AgentDB (Qdrant)..."

# Test Qdrant health endpoint
if docker exec orchestrator-agentdb wget -q -O - http://localhost:6333/health 2>/dev/null | grep -q "ok"; then
  log_success "AgentDB (Qdrant) is healthy"
else
  log_error "AgentDB health check failed"
  exit 1
fi

# Create default collection for agent memory (if it doesn't exist)
log_info "Creating default AgentDB collections..."

# Create agent_memory collection with 768-dimensional vectors (for embeddings)
docker exec orchestrator-agentdb wget -q -O - \
  --header="Content-Type: application/json" \
  --post-data='{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    },
    "hnsw_config": {
      "m": 16,
      "ef_construct": 100
    }
  }' \
  http://localhost:6333/collections/agent_memory 2>/dev/null || log_warn "Collection 'agent_memory' may already exist"

log_success "AgentDB initialization complete"

# -----------------------------------------------------------------------------
# FINAL VERIFICATION
# -----------------------------------------------------------------------------

log_info "Running final health checks..."

# Count healthy services
HEALTHY_SERVICES=$(docker-compose -f "$COMPOSE_FILE" ps | grep -c "Up (healthy)" || echo "0")
TOTAL_SERVICES=4

if [ "$HEALTHY_SERVICES" -eq "$TOTAL_SERVICES" ]; then
  log_success "All database services are healthy ($HEALTHY_SERVICES/$TOTAL_SERVICES)"
else
  log_warn "Some services may not be healthy ($HEALTHY_SERVICES/$TOTAL_SERVICES)"
fi

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------

echo ""
echo "=========================================================================="
log_success "Database setup completed successfully!"
echo "=========================================================================="
echo ""
echo "Services Status:"
echo "  PostgreSQL: $(docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up (healthy)" && echo "✓ Healthy" || echo "✗ Unhealthy")"
echo "  Redis:      $(docker-compose -f "$COMPOSE_FILE" ps redis | grep -q "Up (healthy)" && echo "✓ Healthy" || echo "✗ Unhealthy")"
echo "  MongoDB:    $(docker-compose -f "$COMPOSE_FILE" ps mongodb | grep -q "Up (healthy)" && echo "✓ Healthy" || echo "✗ Unhealthy")"
echo "  AgentDB:    $(docker-compose -f "$COMPOSE_FILE" ps agentdb | grep -q "Up (healthy)" && echo "✓ Healthy" || echo "✗ Unhealthy")"
echo ""
echo "Connection Details:"
echo "  PostgreSQL: localhost:5432 (user: postgres, databases: nyra_main, nyra_auth, nyra_analytics, infisical)"
echo "  Redis:      localhost:6379 (password required)"
echo "  MongoDB:    localhost:27017 (replica set: rs0)"
echo "  AgentDB:    localhost:6333 (HTTP), localhost:6334 (gRPC)"
echo ""
echo "Next Steps:"
echo "  1. Run health check: ./scripts/health-check-databases.sh"
echo "  2. Configure application connection strings"
echo "  3. Run migrations for each service"
echo "  4. Configure backups (see docs/databases/DATABASE-OPERATIONS.md)"
echo ""
echo "=========================================================================="
