#!/usr/bin/env bash
# ============================================================================
# Integration Tests - Verify inter-service communication
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

test_integration() {
    local test_name=$1
    local description=$2
    local test_command=$3

    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    log_info "Testing: $test_name - $description"

    if eval "$test_command"; then
        log_info "✓ PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "✗ FAILED: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# ============================================================================
# Test Cases
# ============================================================================

echo "============================================================================"
echo "Integration Tests - Starting"
echo "============================================================================"

# Test 1: Claude Flow → PostgreSQL connection
test_integration "Claude Flow → PostgreSQL" \
    "Verify Claude Flow can connect to database" \
    "docker-compose exec -T claude-flow node -e \"
const { Client } = require('pg');
const client = new Client({connectionString: process.env.DATABASE_URL});
client.connect()
  .then(() => client.query('SELECT 1'))
  .then(() => { console.log('Connection successful'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
\" 2>&1 | grep -q 'Connection successful'"

# Test 2: Claude Flow → Redis connection
test_integration "Claude Flow → Redis" \
    "Verify Claude Flow can connect to Redis" \
    "docker-compose exec -T claude-flow node -e \"
const redis = require('redis');
const client = redis.createClient({url: process.env.REDIS_URL});
client.on('error', (err) => { console.error(err); process.exit(1); });
client.connect()
  .then(() => client.ping())
  .then(() => { console.log('Redis connected'); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
\" 2>&1 | grep -q 'Redis connected'"

# Test 3: Archon → PostgreSQL connection
test_integration "Archon → PostgreSQL" \
    "Verify Archon can connect to database" \
    "docker-compose exec -T archon python -c \"
import psycopg2
import os
try:
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute('SELECT 1')
    print('Database connected')
    conn.close()
except Exception as e:
    print(f'Error: {e}')
    exit(1)
\" 2>&1 | grep -q 'Database connected'"

# Test 4: Archon → Redis connection
test_integration "Archon → Redis" \
    "Verify Archon can connect to Redis" \
    "docker-compose exec -T archon python -c \"
import redis
import os
try:
    r = redis.from_url(os.environ['REDIS_URL'])
    r.ping()
    print('Redis connected')
except Exception as e:
    print(f'Error: {e}')
    exit(1)
\" 2>&1 | grep -q 'Redis connected'"

# Test 5: PostgreSQL data persistence
test_integration "PostgreSQL Persistence" \
    "Verify data persists in PostgreSQL" \
    "docker-compose exec -T postgres psql -U nyra -d nyra -c 'CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, value TEXT);' &&
     docker-compose exec -T postgres psql -U nyra -d nyra -c \"INSERT INTO test_table (value) VALUES ('test-$(date +%s)');\" &&
     docker-compose exec -T postgres psql -U nyra -d nyra -c 'SELECT COUNT(*) FROM test_table;' | grep -q '[0-9]' &&
     docker-compose exec -T postgres psql -U nyra -d nyra -c 'DROP TABLE test_table;'"

# Test 6: Redis data persistence
test_integration "Redis Persistence" \
    "Verify data persists in Redis" \
    "docker-compose exec -T redis redis-cli -a \${REDIS_PASSWORD:-dev-only-password} SET test_key 'test_value' &&
     docker-compose exec -T redis redis-cli -a \${REDIS_PASSWORD:-dev-only-password} GET test_key | grep -q 'test_value' &&
     docker-compose exec -T redis redis-cli -a \${REDIS_PASSWORD:-dev-only-password} DEL test_key"

# Test 7: Graphiti MCP → PostgreSQL
test_integration "Graphiti → PostgreSQL" \
    "Verify Graphiti MCP can connect to database" \
    "curl -sf http://localhost:8001/health > /dev/null"

# Test 8: Mem0 MCP → PostgreSQL & Redis
test_integration "Mem0 → PostgreSQL & Redis" \
    "Verify Mem0 MCP can connect to database and cache" \
    "curl -sf http://localhost:8002/health > /dev/null"

# Test 9: Infisical → MongoDB
test_integration "Infisical → MongoDB" \
    "Verify Infisical can connect to MongoDB" \
    "curl -sf http://localhost:8080/api/status > /dev/null"

# Test 10: Gitea → PostgreSQL
test_integration "Gitea → PostgreSQL" \
    "Verify Gitea can connect to database" \
    "curl -sf http://localhost:3001/api/healthz > /dev/null"

# Test 11: n8n → PostgreSQL
test_integration "n8n → PostgreSQL" \
    "Verify n8n can connect to database" \
    "curl -sf http://localhost:5678/healthz > /dev/null"

# Test 12: Network connectivity
test_integration "Service Discovery" \
    "Verify services can discover each other via DNS" \
    "docker-compose exec -T claude-flow ping -c 1 postgres > /dev/null &&
     docker-compose exec -T claude-flow ping -c 1 redis > /dev/null &&
     docker-compose exec -T archon ping -c 1 postgres > /dev/null"

# Test 13: Volume mounts
test_integration "Volume Permissions" \
    "Verify volume permissions are correct" \
    "docker-compose exec -T claude-flow touch /app/data/test-file &&
     docker-compose exec -T claude-flow rm /app/data/test-file &&
     docker-compose exec -T archon touch /app/data/test-file &&
     docker-compose exec -T archon rm /app/data/test-file"

# ============================================================================
# Results Summary
# ============================================================================

echo ""
echo "============================================================================"
echo "Integration Tests - Results"
echo "============================================================================"
echo "Total Tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo "============================================================================"

if [ $TESTS_FAILED -eq 0 ]; then
    log_info "All integration tests passed! 🎉"
    exit 0
else
    log_error "Some integration tests failed. Please review the logs above."
    exit 1
fi
