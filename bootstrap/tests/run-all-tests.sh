#!/bin/bash
# Run All Bootstrap Tests
# Orchestrates execution of all test suites with comprehensive reporting

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Test results
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0
SKIPPED_SUITES=0

# Results directory
RESULTS_DIR="${TEST_RESULTS_DIR:-./test-results}"
mkdir -p "$RESULTS_DIR"

# Banner
echo ""
echo "=========================================="
echo "Bootstrap Integration Test Suite"
echo "=========================================="
echo "Date: $(date)"
echo "Platform: $(uname -s)"
echo "Hostname: $(hostname)"
echo "=========================================="
echo ""

# Detect PC role
detect_pc_role() {
    local hostname=$(hostname)

    if echo "$hostname" | grep -iq "orchestrator\|mini"; then
        echo "orchestrator"
    elif echo "$hostname" | grep -iq "worker\|gpu"; then
        echo "worker"
    else
        echo "unknown"
    fi
}

PC_ROLE=$(detect_pc_role)
echo "Detected PC Role: $PC_ROLE"
echo ""

# Run a test suite
run_test_suite() {
    local test_file=$1
    local test_name=$(basename "$test_file" .sh)

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    TOTAL_SUITES=$((TOTAL_SUITES + 1))

    # Run the test
    if bash "$test_file"; then
        echo ""
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
        echo ""
        PASSED_SUITES=$((PASSED_SUITES + 1))
        return 0
    else
        echo ""
        echo -e "${RED}✗ $test_name FAILED${NC}"
        echo ""
        FAILED_SUITES=$((FAILED_SUITES + 1))
        return 1
    fi
}

# Skip a test suite
skip_test_suite() {
    local test_name=$1
    local reason=$2

    echo -e "${YELLOW}⊘ Skipping: $test_name${NC}"
    echo -e "${YELLOW}  Reason: $reason${NC}"
    echo ""

    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    SKIPPED_SUITES=$((SKIPPED_SUITES + 1))
}

# Run tests based on PC role
if [ "$PC_ROLE" = "orchestrator" ]; then
    echo "Running ORCHESTRATOR test suites..."
    echo ""

    # Hardware detection (common)
    run_test_suite "./test-hardware-detection.sh" || true

    # Orchestrator-specific
    run_test_suite "./test-orchestrator-setup.sh" || true

    # Network topology
    run_test_suite "./test-network-topology.sh" || true

    # End-to-end integration
    run_test_suite "./test-end-to-end.sh" || true

    # Worker setup not applicable
    skip_test_suite "test-worker-setup.sh" "Not a worker node"

elif [ "$PC_ROLE" = "worker" ]; then
    echo "Running WORKER test suites..."
    echo ""

    # Hardware detection (common)
    run_test_suite "./test-hardware-detection.sh" || true

    # Worker-specific
    run_test_suite "./test-worker-setup.sh" || true

    # Network topology
    run_test_suite "./test-network-topology.sh" || true

    # Orchestrator setup not applicable
    skip_test_suite "test-orchestrator-setup.sh" "Not orchestrator node"

    # E2E typically run from orchestrator
    skip_test_suite "test-end-to-end.sh" "Should run from orchestrator"

else
    echo "Running ALL test suites (unknown PC role)..."
    echo ""

    # Run all tests
    run_test_suite "./test-hardware-detection.sh" || true
    run_test_suite "./test-orchestrator-setup.sh" || true
    run_test_suite "./test-worker-setup.sh" || true
    run_test_suite "./test-network-topology.sh" || true
    run_test_suite "./test-end-to-end.sh" || true
fi

# Generate combined report
echo ""
echo "=========================================="
echo "Test Execution Summary"
echo "=========================================="
echo "Total Suites:   $TOTAL_SUITES"
echo -e "Passed:         ${GREEN}$PASSED_SUITES${NC}"
echo -e "Failed:         ${RED}$FAILED_SUITES${NC}"
echo -e "Skipped:        ${YELLOW}$SKIPPED_SUITES${NC}"

if [ $TOTAL_SUITES -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {print ($PASSED_SUITES * 100.0 / $TOTAL_SUITES)}")
    echo "Success Rate:   ${SUCCESS_RATE}%"
fi

echo "=========================================="
echo ""

# Generate combined JSON report
COMBINED_REPORT="$RESULTS_DIR/combined-test-results.json"
cat > "$COMBINED_REPORT" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hostname": "$(hostname)",
  "pc_role": "$PC_ROLE",
  "summary": {
    "total_suites": $TOTAL_SUITES,
    "passed_suites": $PASSED_SUITES,
    "failed_suites": $FAILED_SUITES,
    "skipped_suites": $SKIPPED_SUITES,
    "success_rate": $(awk "BEGIN {print ($TOTAL_SUITES > 0) ? ($PASSED_SUITES * 100.0 / $TOTAL_SUITES) : 0}")
  },
  "individual_results": {
$(ls -1 "$RESULTS_DIR"/*.json 2>/dev/null | grep -v "combined" | while read -r file; do
    echo "    \"$(basename "$file" .json)\": $(cat "$file"),"
done | sed '$ s/,$//')
  }
}
EOF

echo "Combined report: $COMBINED_REPORT"
echo ""

# Store combined results in memory
if command -v npx &> /dev/null; then
    echo "Storing combined results in Claude Flow memory..."

    npx --yes @claude-flow/cli@latest memory store \
        --key "bootstrap-test-suite-$(date +%Y%m%d-%H%M%S)" \
        --value "$(cat "$COMBINED_REPORT")" \
        --namespace "bootstrap-tests" 2>/dev/null || \
        echo "Warning: Failed to store in memory"

    npx --yes @claude-flow/cli@latest memory store \
        --key "bootstrap-test-suite-latest" \
        --value "$(cat "$COMBINED_REPORT")" \
        --namespace "bootstrap-tests" 2>/dev/null
fi

# Final status
if [ $FAILED_SUITES -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}All Tests PASSED!${NC}"
    echo -e "${GREEN}Bootstrap setup is validated and operational${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}Some Tests FAILED!${NC}"
    echo -e "${RED}Review the results and fix issues${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
