#!/bin/bash
# Bootstrap Test Utilities
# Shared functions for all test scripts

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0
TESTS_TOTAL=0

# Performance metrics
declare -A PERF_METRICS
START_TIME=$(date +%s)

# Test results storage
TEST_RESULTS_DIR="${TEST_RESULTS_DIR:-./test-results}"
RESULTS_JSON="${TEST_RESULTS_DIR}/test-results.json"

# Logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test assertion functions
assert_command_exists() {
    local cmd=$1
    local description=${2:-"Command $cmd exists"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if command -v "$cmd" &> /dev/null; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Command not found: $cmd"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_file_exists() {
    local file=$1
    local description=${2:-"File $file exists"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if [ -f "$file" ]; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - File not found: $file"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_directory_exists() {
    local dir=$1
    local description=${2:-"Directory $dir exists"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if [ -d "$dir" ]; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Directory not found: $dir"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_service_running() {
    local service=$1
    local description=${2:-"Service $service is running"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if systemctl is-active --quiet "$service" 2>/dev/null || pgrep -f "$service" > /dev/null; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Service not running: $service"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_port_open() {
    local host=$1
    local port=$2
    local description=${3:-"Port $port is open on $host"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if timeout 2 bash -c "echo > /dev/tcp/$host/$port" 2>/dev/null; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Port not accessible"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_http_response() {
    local url=$1
    local expected_code=${2:-200}
    local description=${3:-"HTTP request to $url returns $expected_code"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    local actual_code
    actual_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [ "$actual_code" = "$expected_code" ]; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Got $actual_code, expected $expected_code"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_contains() {
    local text=$1
    local pattern=$2
    local description=${3:-"Text contains pattern: $pattern"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if echo "$text" | grep -q "$pattern"; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$description - Pattern not found"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Performance benchmarking
benchmark_start() {
    local name=$1
    PERF_METRICS["${name}_start"]=$(date +%s%3N)
}

benchmark_end() {
    local name=$1
    local start=${PERF_METRICS["${name}_start"]}
    local end=$(date +%s%3N)
    local duration=$((end - start))
    PERF_METRICS["${name}_duration"]=$duration
    log_info "Benchmark '$name': ${duration}ms"
}

# Health check functions
check_docker_health() {
    log_info "Checking Docker health..."

    assert_command_exists docker "Docker command is available"

    if docker info &> /dev/null; then
        log_success "Docker daemon is running"
        return 0
    else
        log_error "Docker daemon is not accessible"
        return 1
    fi
}

check_wsl_health() {
    log_info "Checking WSL health..."

    if command -v wsl.exe &> /dev/null; then
        assert_command_exists wsl.exe "WSL is installed"

        # Check if WSL distro is running
        if wsl.exe --list --running 2>/dev/null | grep -q "Ubuntu"; then
            log_success "WSL Ubuntu distro is running"
            return 0
        else
            log_warning "WSL Ubuntu distro is not running"
            return 1
        fi
    else
        log_warning "WSL not available on this system (might be a worker)"
        return 2
    fi
}

check_network_connectivity() {
    local host=${1:-8.8.8.8}
    log_info "Checking network connectivity to $host..."

    if ping -c 1 -W 2 "$host" &> /dev/null; then
        log_success "Network connectivity OK"
        return 0
    else
        log_error "No network connectivity"
        return 1
    fi
}

# System detection
detect_platform() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "unknown"
    fi
}

detect_pc_role() {
    # Try to detect PC role from hostname or environment
    local hostname=$(hostname)

    if echo "$hostname" | grep -iq "orchestrator\|mini"; then
        echo "orchestrator"
    elif echo "$hostname" | grep -iq "worker\|gpu"; then
        echo "worker"
    else
        echo "unknown"
    fi
}

# Results reporting
generate_test_report() {
    local test_suite=$1
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))

    mkdir -p "$TEST_RESULTS_DIR"

    # Generate JSON report
    cat > "$RESULTS_JSON" <<EOF
{
  "test_suite": "$test_suite",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "duration_seconds": $total_duration,
  "results": {
    "total": $TESTS_TOTAL,
    "passed": $TESTS_PASSED,
    "failed": $TESTS_FAILED,
    "skipped": $TESTS_SKIPPED,
    "success_rate": $(awk "BEGIN {print ($TESTS_TOTAL > 0) ? ($TESTS_PASSED * 100.0 / $TESTS_TOTAL) : 0}")
  },
  "performance_metrics": $(
    echo "{"
    for key in "${!PERF_METRICS[@]}"; do
        echo "\"$key\": ${PERF_METRICS[$key]},"
    done | sed '$ s/,$//'
    echo "}"
  ),
  "platform": "$(detect_platform)",
  "pc_role": "$(detect_pc_role)"
}
EOF

    # Print summary
    echo ""
    echo "========================================="
    echo "Test Suite: $test_suite"
    echo "========================================="
    echo "Total Tests: $TESTS_TOTAL"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo -e "Skipped: ${YELLOW}$TESTS_SKIPPED${NC}"
    echo "Duration: ${total_duration}s"
    echo "========================================="

    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed!"
        return 0
    else
        log_error "$TESTS_FAILED tests failed"
        return 1
    fi
}

# Skip test with reason
skip_test() {
    local reason=$1
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
    log_warning "SKIPPED: $reason"
}

# Run command with timeout
run_with_timeout() {
    local timeout=$1
    shift
    local cmd="$@"

    timeout "$timeout" bash -c "$cmd"
}

# Check environment variable
check_env_var() {
    local var_name=$1
    local description=${2:-"Environment variable $var_name is set"}

    TESTS_TOTAL=$((TESTS_TOTAL + 1))

    if [ -n "${!var_name:-}" ]; then
        log_success "$description"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_warning "$description - Not set"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Export functions for use in other scripts
export -f log_info log_success log_warning log_error
export -f assert_command_exists assert_file_exists assert_directory_exists
export -f assert_service_running assert_port_open assert_http_response assert_contains
export -f benchmark_start benchmark_end
export -f check_docker_health check_wsl_health check_network_connectivity
export -f detect_platform detect_pc_role
export -f generate_test_report skip_test run_with_timeout check_env_var
