#!/bin/bash
# CI/CD Integration Test Example
# Suitable for GitHub Actions, GitLab CI, etc.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==================================================================="
echo "  CI/CD Cloudflare Tunnel Test"
echo "==================================================================="
echo ""

# Set CI-specific environment variables
export TIMEOUT_SECONDS=60
export RETRY_COUNT=5
export PERFORMANCE_ITERATIONS=20
export CONCURRENT_REQUESTS=50

# Environment check
if [ -z "$CLOUDFLARED_TOKEN" ]; then
    echo "ERROR: CLOUDFLARED_TOKEN environment variable not set"
    exit 1
fi

if [ -z "$ORCHESTRATOR_PUBLIC_URL" ]; then
    echo "WARNING: ORCHESTRATOR_PUBLIC_URL not set, using default"
    export ORCHESTRATOR_PUBLIC_URL="https://nyra-orchestrator.yourdomain.com"
fi

echo "Configuration:"
echo "  Timeout: ${TIMEOUT_SECONDS}s"
echo "  Retries: ${RETRY_COUNT}"
echo "  Performance Iterations: ${PERFORMANCE_ITERATIONS}"
echo "  Concurrent Requests: ${CONCURRENT_REQUESTS}"
echo ""

# Run comprehensive test suite
echo "Running comprehensive test suite..."
"$VALIDATION_DIR/test-cloudflare-tunnels.sh" \
  --prerequisites \
  --docker \
  --connectivity \
  --dns \
  --accessibility \
  --performance \
  --security

# Check exit code
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "==================================================================="
    echo "  ✓ All tests passed!"
    echo "==================================================================="
else
    echo ""
    echo "==================================================================="
    echo "  ✗ Tests failed with exit code: $EXIT_CODE"
    echo "==================================================================="
    exit $EXIT_CODE
fi
