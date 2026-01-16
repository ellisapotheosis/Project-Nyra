#!/bin/bash
# Quick Cloudflare Tunnel Test Example
# Demonstrates common test scenarios

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VALIDATION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==================================================================="
echo "  Quick Cloudflare Tunnel Test"
echo "==================================================================="
echo ""

# Example 1: Quick connectivity check
echo "1. Testing tunnel connectivity..."
"$VALIDATION_DIR/test-cloudflare-tunnels.sh" --connectivity

echo ""

# Example 2: Performance baseline
echo "2. Running performance baseline (5 iterations)..."
PERFORMANCE_ITERATIONS=5 "$VALIDATION_DIR/test-cloudflare-tunnels.sh" --performance

echo ""

# Example 3: Security audit
echo "3. Running security audit..."
"$VALIDATION_DIR/test-cloudflare-tunnels.sh" --security

echo ""

# Example 4: Full validation (without integration test)
echo "4. Full validation suite..."
"$VALIDATION_DIR/test-cloudflare-tunnels.sh" \
  --docker \
  --connectivity \
  --dns \
  --accessibility

echo ""
echo "==================================================================="
echo "  Quick test completed!"
echo "  View results in: tests/results/cloudflare-tunnels/"
echo "==================================================================="
