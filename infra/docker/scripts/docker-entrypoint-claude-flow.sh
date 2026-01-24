#!/bin/bash
set -e

echo "======================================"
echo "Claude Flow V3 Container Initialization"
echo "======================================"

# Wait for dependencies
echo "Waiting for PostgreSQL (AgentDB)..."
timeout=60
counter=0
while ! pg_isready -h agentdb -p 5433 -U postgres 2>/dev/null; do
  sleep 1
  counter=$((counter + 1))
  if [ $counter -ge $timeout ]; then
    echo "WARNING: PostgreSQL not ready after ${timeout}s, continuing anyway..."
    break
  fi
  if [ $((counter % 10)) -eq 0 ]; then
    echo "Still waiting for PostgreSQL... (${counter}s elapsed)"
  fi
done
echo "PostgreSQL is ready!"

echo "Waiting for Redis..."
counter=0
while ! redis-cli -h redis ping 2>/dev/null | grep -q PONG; do
  sleep 1
  counter=$((counter + 1))
  if [ $counter -ge $timeout ]; then
    echo "WARNING: Redis not ready after ${timeout}s, continuing anyway..."
    break
  fi
  if [ $((counter % 10)) -eq 0 ]; then
    echo "Still waiting for Redis... (${counter}s elapsed)"
  fi
done
echo "Redis is ready!"

# Initialize claude-flow with docker-specific configuration
echo "Initializing claude-flow..."
cd /app

# Create necessary directories
mkdir -p data logs cache secrets sessions memory .claude-flow .swarm

# Run init with docker flag (forces docker-friendly settings)
if npx @claude-flow/cli@latest init --docker --force --yes \
  --topology mesh \
  --max-agents 8 \
  --strategy balanced 2>&1 | tee /app/logs/init.log; then
  echo "Claude Flow initialized successfully!"
else
  echo "WARNING: Init failed or partially succeeded, check logs at /app/logs/init.log"
fi

# Run doctor to verify installation
echo "Running health diagnostics..."
npx @claude-flow/cli@latest doctor 2>&1 | tee /app/logs/doctor.log || true

echo "======================================"
echo "Starting claude-flow MCP server..."
echo "======================================"

# Start MCP server with Infisical secret injection (if available)
if command -v infisical &> /dev/null && [ -n "$INFISICAL_TOKEN" ]; then
  echo "Starting with Infisical secret injection..."
  exec infisical run --env="${INFISICAL_ENV:-production}" --path="${INFISICAL_PATH:-/nyra/claude-flow}" -- \
    npx @claude-flow/cli@latest mcp start --port "${MCP_PORT:-3000}" --host 0.0.0.0
else
  echo "Starting without secret injection..."
  exec npx @claude-flow/cli@latest mcp start --port "${MCP_PORT:-3000}" --host 0.0.0.0
fi
