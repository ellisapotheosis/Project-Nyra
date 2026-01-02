#!/bin/bash
# Health check script for Claude-Flow orchestrator

# Configuration
HEALTH_ENDPOINT="http://localhost:8090/health"
METRICS_ENDPOINT="http://localhost:8091/metrics"
TIMEOUT=5

# Function to check endpoint
check_endpoint() {
    local endpoint=$1
    local name=$2

    if curl -sf --max-time "$TIMEOUT" "$endpoint" > /dev/null 2>&1; then
        echo "✓ $name is healthy"
        return 0
    else
        echo "✗ $name is unhealthy"
        return 1
    fi
}

# Check main health endpoint
check_endpoint "$HEALTH_ENDPOINT" "API Server" || exit 1

# Check metrics endpoint (optional)
if [ "${METRICS_ENABLED}" = "true" ]; then
    check_endpoint "$METRICS_ENDPOINT" "Metrics Server" || exit 1
fi

exit 0
