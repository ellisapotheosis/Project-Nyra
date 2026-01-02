#!/bin/bash
set -e

echo "=========================================="
echo "Archon OS - Initializing..."
echo "=========================================="

# Environment info
echo "Environment: ${ARCHON_ENV:-production}"
echo "Debug Mode: ${ARCHON_DEBUG:-false}"
echo "Log Level: ${ARCHON_LOG_LEVEL:-info}"

# Wait for dependencies
echo "Waiting for PostgreSQL..."
until pg_isready -h archon-postgres -U "${POSTGRES_USER:-archon}" -d "${POSTGRES_DB:-archon_os}" > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done
echo "PostgreSQL is up!"

echo "Waiting for Redis..."
until redis-cli -h archon-redis ping > /dev/null 2>&1; do
    echo "Redis is unavailable - sleeping"
    sleep 2
done
echo "Redis is up!"

echo "Waiting for RabbitMQ..."
until nc -z archon-rabbitmq 5672; do
    echo "RabbitMQ is unavailable - sleeping"
    sleep 2
done
echo "RabbitMQ is up!"

# Run database migrations
if [ "${ARCHON_ENV}" != "worker" ]; then
    echo "Running database migrations..."
    cd /opt/archon
    python -m alembic upgrade head || echo "Migration failed or not configured"
fi

# Initialize claude-flow hooks
if [ "${CLAUDE_FLOW_HOOKS}" = "true" ]; then
    echo "Initializing Claude Flow hooks..."
    npx claude-flow@alpha hooks session-restore --session-id "archon-os-main" || echo "Hooks initialization skipped"
fi

# Pre-task hook
if [ "${CLAUDE_FLOW_HOOKS}" = "true" ]; then
    npx claude-flow@alpha hooks pre-task --description "Starting Archon OS orchestrator" || true
fi

echo "=========================================="
echo "Archon OS - Ready!"
echo "=========================================="

# Execute the main command
exec "$@"
