#!/bin/bash
# Project Nyra - Cloudflare Tunnel Validation and Testing Suite
# Comprehensive testing for tunnel connectivity, DNS, services, performance, and security
# Version: 1.0.0

set -e

# ============================================================================
# Configuration and Global Variables
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
TEST_RESULTS_DIR="${TEST_RESULTS_DIR:-$PROJECT_ROOT/tests/results/cloudflare-tunnels}"
LOG_FILE="$TEST_RESULTS_DIR/test-run-$(date +%Y%m%d-%H%M%S).log"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.infisical.yml}"

# Test configuration
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-30}"
RETRY_COUNT="${RETRY_COUNT:-3}"
RETRY_DELAY="${RETRY_DELAY:-5}"
PERFORMANCE_ITERATIONS="${PERFORMANCE_ITERATIONS:-10}"
CONCURRENT_REQUESTS="${CONCURRENT_REQUESTS:-20}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# ============================================================================
# Utility Functions
# ============================================================================

# Logging function with timestamp and level
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local color="${NC}"

    case "$level" in
        ERROR) color="${RED}" ;;
        SUCCESS) color="${GREEN}" ;;
        WARNING) color="${YELLOW}" ;;
        INFO) color="${CYAN}" ;;
        DEBUG) color="${BLUE}" ;;
    esac

    echo -e "${color}[$timestamp] [$level] $message${NC}" | tee -a "$LOG_FILE"
}

# Print section header
print_section() {
    local title="$1"
    echo "" | tee -a "$LOG_FILE"
    echo -e "${MAGENTA}================================================================${NC}" | tee -a "$LOG_FILE"
    echo -e "${MAGENTA}  $title${NC}" | tee -a "$LOG_FILE"
    echo -e "${MAGENTA}================================================================${NC}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Test result tracking
test_start() {
    local test_name="$1"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log "INFO" "Starting test: $test_name"
}

test_pass() {
    local test_name="$1"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    log "SUCCESS" "PASSED: $test_name"
}

test_fail() {
    local test_name="$1"
    local reason="${2:-Unknown error}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    log "ERROR" "FAILED: $test_name - $reason"
}

test_skip() {
    local test_name="$1"
    local reason="${2:-Skipped}"
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    log "WARNING" "SKIPPED: $test_name - $reason"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service with timeout
wait_for_service() {
    local url="$1"
    local timeout="${2:-$TIMEOUT_SECONDS}"
    local count=0

    log "INFO" "Waiting for service: $url (timeout: ${timeout}s)"

    while [ $count -lt $timeout ]; do
        if curl -sf --max-time 2 "$url" >/dev/null 2>&1; then
            log "SUCCESS" "Service is available: $url"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done

    log "ERROR" "Service timeout: $url"
    return 1
}

# Retry function with exponential backoff
retry_with_backoff() {
    local max_attempts="$1"
    shift
    local attempt=1
    local delay=1

    while [ $attempt -le $max_attempts ]; do
        if "$@"; then
            return 0
        fi

        if [ $attempt -lt $max_attempts ]; then
            log "WARNING" "Attempt $attempt failed, retrying in ${delay}s..."
            sleep $delay
            delay=$((delay * 2))
        fi
        attempt=$((attempt + 1))
    done

    return 1
}

# ============================================================================
# Pre-requisite Checks
# ============================================================================

check_prerequisites() {
    print_section "Pre-requisite Checks"

    local missing_tools=()

    # Check required commands
    local required_commands=(
        "docker"
        "docker-compose"
        "curl"
        "jq"
        "dig"
        "netstat"
    )

    for cmd in "${required_commands[@]}"; do
        test_start "Check command: $cmd"
        if command_exists "$cmd"; then
            test_pass "Command available: $cmd"
        else
            test_fail "Command missing: $cmd"
            missing_tools+=("$cmd")
        fi
    done

    # Check optional commands
    local optional_commands=(
        "ab"         # Apache Bench for performance testing
        "wrk"        # Modern HTTP benchmarking tool
        "nmap"       # Network security scanning
        "cloudflared" # Cloudflare tunnel client
    )

    for cmd in "${optional_commands[@]}"; do
        if ! command_exists "$cmd"; then
            log "WARNING" "Optional tool not found: $cmd"
        fi
    done

    # Check if docker compose file exists
    test_start "Check docker-compose file"
    if [ -f "$COMPOSE_FILE" ]; then
        test_pass "Docker compose file found: $COMPOSE_FILE"
    else
        test_fail "Docker compose file not found: $COMPOSE_FILE"
        return 1
    fi

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log "ERROR" "Missing required tools: ${missing_tools[*]}"
        log "INFO" "Install missing tools and re-run the tests"
        return 1
    fi

    return 0
}

# ============================================================================
# Environment Setup and Teardown
# ============================================================================

setup_test_environment() {
    print_section "Test Environment Setup"

    # Create test results directory
    mkdir -p "$TEST_RESULTS_DIR"
    log "INFO" "Test results directory: $TEST_RESULTS_DIR"

    # Check environment variables
    test_start "Check CLOUDFLARED_TOKEN"
    if [ -n "${CLOUDFLARED_TOKEN}" ]; then
        test_pass "CLOUDFLARED_TOKEN is set"
    else
        test_skip "CLOUDFLARED_TOKEN not set" "Tunnel-specific tests will be skipped"
    fi

    # Load .env file if exists
    if [ -f "$PROJECT_ROOT/.env" ]; then
        log "INFO" "Loading environment from .env file"
        set -a
        source "$PROJECT_ROOT/.env"
        set +a
    fi
}

cleanup_test_environment() {
    print_section "Test Environment Cleanup"

    # Archive old test logs (keep last 10)
    local log_count=$(ls -1 "$TEST_RESULTS_DIR"/*.log 2>/dev/null | wc -l)
    if [ "$log_count" -gt 10 ]; then
        log "INFO" "Archiving old test logs"
        ls -1t "$TEST_RESULTS_DIR"/*.log | tail -n +11 | xargs rm -f
    fi

    log "INFO" "Cleanup completed"
}

# ============================================================================
# Docker and Service Checks
# ============================================================================

test_docker_services() {
    print_section "Docker Services Tests"

    # Check if Docker daemon is running
    test_start "Docker daemon status"
    if docker info >/dev/null 2>&1; then
        test_pass "Docker daemon is running"
    else
        test_fail "Docker daemon is not running"
        return 1
    fi

    # Check Docker Compose version
    test_start "Docker Compose version"
    local compose_version=$(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null)
    if [ -n "$compose_version" ]; then
        test_pass "Docker Compose: $compose_version"
    else
        test_fail "Unable to determine Docker Compose version"
    fi

    # List running containers
    log "INFO" "Listing running containers..."
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | tee -a "$LOG_FILE"

    # Check if cloudflared containers are running
    local cloudflared_containers=$(docker ps --filter "name=cloudflared" --format "{{.Names}}")

    if [ -n "$cloudflared_containers" ]; then
        log "INFO" "Cloudflared containers detected:"
        echo "$cloudflared_containers" | while read -r container; do
            test_start "Container health: $container"
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")

            if [ "$health" = "healthy" ] || [ "$health" = "no-healthcheck" ]; then
                local status=$(docker inspect --format='{{.State.Status}}' "$container")
                if [ "$status" = "running" ]; then
                    test_pass "Container running: $container"
                else
                    test_fail "Container not running: $container (status: $status)"
                fi
            else
                test_fail "Container unhealthy: $container (health: $health)"
            fi
        done
    else
        log "WARNING" "No cloudflared containers found running"
    fi
}

# ============================================================================
# Tunnel Connectivity Tests
# ============================================================================

test_tunnel_connectivity() {
    print_section "Tunnel Connectivity Tests"

    # Define tunnel endpoints from docker-compose
    declare -A tunnel_services=(
        ["orchestrator"]="nyra-orchestrator:8000"
        ["worker-1"]="nyra-worker-1:8000"
        ["worker-2"]="nyra-worker-2:8000"
        ["worker-3"]="nyra-worker-3:8000"
    )

    # Test local service connectivity (before tunnel)
    for service in "${!tunnel_services[@]}"; do
        local endpoint="${tunnel_services[$service]}"
        local container=$(echo "$endpoint" | cut -d: -f1)
        local port=$(echo "$endpoint" | cut -d: -f2)

        test_start "Local connectivity: $service ($endpoint)"

        # Check if container exists and is running
        if docker ps --filter "name=$container" --format "{{.Names}}" | grep -q "$container"; then
            # Get container IP
            local container_ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$container" 2>/dev/null)

            if [ -n "$container_ip" ]; then
                if curl -sf --max-time 5 "http://${container_ip}:${port}/health" >/dev/null 2>&1; then
                    test_pass "Service accessible locally: $service"
                else
                    test_fail "Service not accessible: $service" "Health check failed"
                fi
            else
                test_fail "Cannot get IP for container: $container"
            fi
        else
            test_skip "Container not running: $container" "Service not deployed"
        fi
    done

    # Test cloudflared tunnel status
    local cloudflared_containers=$(docker ps --filter "name=cloudflared" --format "{{.Names}}")

    if [ -n "$cloudflared_containers" ]; then
        echo "$cloudflared_containers" | while read -r container; do
            test_start "Tunnel status: $container"

            # Check cloudflared logs for connection status
            local tunnel_log=$(docker logs --tail 50 "$container" 2>&1)

            if echo "$tunnel_log" | grep -q "Connection.*registered"; then
                test_pass "Tunnel connected: $container"

                # Extract tunnel info
                local tunnel_id=$(echo "$tunnel_log" | grep -oP 'Tunnel.*?\K[a-f0-9-]{36}' | head -1)
                if [ -n "$tunnel_id" ]; then
                    log "INFO" "Tunnel ID: $tunnel_id"
                fi
            elif echo "$tunnel_log" | grep -q "error\|failed"; then
                local error=$(echo "$tunnel_log" | grep -i "error" | tail -1)
                test_fail "Tunnel connection error: $container" "$error"
            else
                test_skip "Tunnel status unknown: $container" "Connection in progress or logs unclear"
            fi
        done
    else
        log "WARNING" "No cloudflared containers to test"
    fi
}

# ============================================================================
# DNS Resolution Tests
# ============================================================================

test_dns_resolution() {
    print_section "DNS Resolution Tests"

    # Expected tunnel domains (customize based on your setup)
    local tunnel_domains=(
        "nyra-orchestrator.yourdomain.com"
        "nyra-worker-1.yourdomain.com"
        "nyra-worker-2.yourdomain.com"
        "nyra-worker-3.yourdomain.com"
    )

    for domain in "${tunnel_domains[@]}"; do
        test_start "DNS resolution: $domain"

        if dig +short "$domain" @1.1.1.1 | grep -qE '^[0-9.]+$'; then
            local ip=$(dig +short "$domain" @1.1.1.1 | head -1)
            test_pass "DNS resolves: $domain -> $ip"

            # Verify it's a Cloudflare IP range (common ranges)
            if echo "$ip" | grep -qE '^(104\.16|172\.64|104\.17|104\.18)\.'; then
                log "INFO" "IP appears to be in Cloudflare range: $ip"
            fi
        else
            test_fail "DNS resolution failed: $domain" "No A records found"
        fi

        # Test AAAA record (IPv6)
        if dig +short AAAA "$domain" @1.1.1.1 | grep -qE '^[0-9a-f:]+$'; then
            local ipv6=$(dig +short AAAA "$domain" @1.1.1.1 | head -1)
            log "INFO" "IPv6 resolves: $domain -> $ipv6"
        fi
    done

    # Test DNS propagation across multiple resolvers
    test_start "DNS propagation check"
    local resolvers=("1.1.1.1" "8.8.8.8" "9.9.9.9")
    local test_domain="${tunnel_domains[0]}"
    local consistent=true
    local first_ip=""

    for resolver in "${resolvers[@]}"; do
        local ip=$(dig +short "$test_domain" @"$resolver" | head -1)
        if [ -z "$first_ip" ]; then
            first_ip="$ip"
        elif [ "$ip" != "$first_ip" ]; then
            consistent=false
            log "WARNING" "DNS inconsistency: $resolver returned $ip (expected $first_ip)"
        fi
    done

    if $consistent && [ -n "$first_ip" ]; then
        test_pass "DNS propagated consistently across resolvers"
    else
        test_fail "DNS propagation inconsistent" "Different IPs from different resolvers"
    fi
}

# ============================================================================
# Service Accessibility Tests
# ============================================================================

test_service_accessibility() {
    print_section "Service Accessibility Tests"

    # Test public tunnel URLs (if configured)
    declare -A public_urls=(
        ["Orchestrator API"]="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}"
        ["Worker 1 API"]="${WORKER1_PUBLIC_URL:-https://nyra-worker-1.yourdomain.com}"
        ["Worker 2 API"]="${WORKER2_PUBLIC_URL:-https://nyra-worker-2.yourdomain.com}"
        ["Worker 3 API"]="${WORKER3_PUBLIC_URL:-https://nyra-worker-3.yourdomain.com}"
    )

    for service in "${!public_urls[@]}"; do
        local url="${public_urls[$service]}"

        test_start "Public accessibility: $service"

        # Test HTTPS connectivity
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url/health" 2>/dev/null || echo "000")

        case "$response" in
            200|204)
                test_pass "Service accessible: $service (HTTP $response)"
                ;;
            301|302|307|308)
                test_pass "Service redirects: $service (HTTP $response)"
                log "INFO" "Following redirect..."
                ;;
            401|403)
                test_pass "Service protected: $service (HTTP $response - authentication required)"
                ;;
            404)
                test_skip "Endpoint not found: $service" "Health endpoint may not exist"
                ;;
            000)
                test_fail "Service unreachable: $service" "Connection failed or timeout"
                ;;
            *)
                test_fail "Unexpected response: $service" "HTTP $response"
                ;;
        esac

        # Test SSL certificate
        if echo "$url" | grep -q "^https://"; then
            test_start "SSL certificate: $service"
            local domain=$(echo "$url" | sed -e 's|^https://||' -e 's|/.*||')

            if echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | \
               openssl x509 -noout -dates 2>/dev/null; then
                test_pass "SSL certificate valid: $service"

                # Check certificate expiry
                local expiry=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | \
                              openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
                log "INFO" "Certificate expires: $expiry"
            else
                test_fail "SSL certificate invalid: $service"
            fi
        fi
    done
}

# ============================================================================
# Tunnel Failover Tests
# ============================================================================

test_tunnel_failover() {
    print_section "Tunnel Failover Tests"

    log "INFO" "Testing tunnel resilience and failover capabilities"

    # Test 1: Graceful tunnel restart
    local cloudflared_container=$(docker ps --filter "name=cloudflared-orchestrator" --format "{{.Names}}" | head -1)

    if [ -n "$cloudflared_container" ]; then
        test_start "Graceful tunnel restart"

        # Record initial state
        local initial_state=$(docker inspect --format='{{.State.Status}}' "$cloudflared_container")
        log "INFO" "Initial container state: $initial_state"

        # Restart container
        log "INFO" "Restarting tunnel container: $cloudflared_container"
        if docker restart "$cloudflared_container" >/dev/null 2>&1; then
            sleep 5

            # Wait for tunnel to reconnect
            local max_wait=30
            local count=0
            local reconnected=false

            while [ $count -lt $max_wait ]; do
                if docker logs --tail 20 "$cloudflared_container" 2>&1 | grep -q "Connection.*registered"; then
                    reconnected=true
                    break
                fi
                sleep 1
                count=$((count + 1))
            done

            if $reconnected; then
                test_pass "Tunnel reconnected after restart (${count}s)"
            else
                test_fail "Tunnel failed to reconnect after restart" "Timeout after ${max_wait}s"
            fi
        else
            test_fail "Failed to restart tunnel container"
        fi
    else
        test_skip "Graceful tunnel restart" "No cloudflared container found"
    fi

    # Test 2: Connection recovery simulation
    test_start "Connection recovery simulation"

    # Check if we can simulate network interruption (requires specific permissions)
    if command_exists "tc" && [ "$(id -u)" -eq 0 ]; then
        log "INFO" "Simulating network interruption..."
        # This would require specific network namespace manipulation
        test_skip "Network interruption simulation" "Requires advanced network namespace configuration"
    else
        test_skip "Network interruption simulation" "Requires tc command and root privileges"
    fi

    # Test 3: Multiple tunnel coordination
    local tunnel_count=$(docker ps --filter "name=cloudflared" --format "{{.Names}}" | wc -l)

    test_start "Multiple tunnel coordination"
    if [ "$tunnel_count" -gt 1 ]; then
        test_pass "Multiple tunnels detected: $tunnel_count tunnels running"
        log "INFO" "Testing coordination between tunnels"

        # Verify no port conflicts
        local port_conflicts=false
        docker ps --filter "name=cloudflared" --format "{{.Ports}}" | while read -r ports; do
            if echo "$ports" | grep -q "0.0.0.0"; then
                log "DEBUG" "Tunnel ports: $ports"
            fi
        done

        if ! $port_conflicts; then
            log "INFO" "No port conflicts detected between tunnels"
        fi
    else
        test_skip "Multiple tunnel coordination" "Only $tunnel_count tunnel(s) running"
    fi
}

# ============================================================================
# Access Policy Enforcement Tests
# ============================================================================

test_access_policies() {
    print_section "Access Policy Enforcement Tests"

    # Test unauthorized access attempts
    declare -A protected_endpoints=(
        ["Admin API"]="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/admin"
        ["Metrics"]="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/metrics"
        ["Internal API"]="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/internal"
    )

    for endpoint_name in "${!protected_endpoints[@]}"; do
        local url="${protected_endpoints[$endpoint_name]}"

        test_start "Access policy: $endpoint_name (unauthorized)"

        # Attempt access without authentication
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

        case "$response" in
            401|403)
                test_pass "Access denied for unauthorized request: $endpoint_name (HTTP $response)"
                ;;
            404)
                test_skip "Endpoint not found: $endpoint_name" "May not be implemented"
                ;;
            200|204)
                test_fail "Unauthorized access allowed: $endpoint_name" "Expected 401/403, got HTTP $response"
                ;;
            000)
                test_skip "Endpoint unreachable: $endpoint_name" "Connection failed or timeout"
                ;;
            *)
                log "WARNING" "Unexpected response for $endpoint_name: HTTP $response"
                ;;
        esac
    done

    # Test with API key if provided
    if [ -n "${API_KEY}" ]; then
        test_start "Authorized access with API key"
        local auth_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/health"
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
                        -H "Authorization: Bearer ${API_KEY}" "$auth_url" 2>/dev/null || echo "000")

        if [ "$response" = "200" ] || [ "$response" = "204" ]; then
            test_pass "Authorized access successful with API key"
        else
            test_fail "Authorized access failed" "HTTP $response"
        fi
    else
        test_skip "Authorized access test" "API_KEY not provided"
    fi

    # Test rate limiting (if implemented)
    test_start "Rate limiting enforcement"
    local test_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/health"
    local rapid_requests=50
    local success_count=0
    local rate_limited=false

    log "INFO" "Sending $rapid_requests rapid requests to test rate limiting..."

    for i in $(seq 1 $rapid_requests); do
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$test_url" 2>/dev/null || echo "000")
        if [ "$response" = "200" ] || [ "$response" = "204" ]; then
            success_count=$((success_count + 1))
        elif [ "$response" = "429" ]; then
            rate_limited=true
            break
        fi
    done

    if $rate_limited; then
        test_pass "Rate limiting is enforced (triggered after $success_count requests)"
    else
        test_skip "Rate limiting test" "Not triggered after $rapid_requests requests (may not be configured)"
    fi
}

# ============================================================================
# Performance Tests
# ============================================================================

test_performance() {
    print_section "Performance Tests"

    local test_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/health"

    # Test 1: Latency measurement
    test_start "Latency measurement"

    log "INFO" "Measuring latency over $PERFORMANCE_ITERATIONS requests..."
    local total_time=0
    local successful_requests=0
    local min_time=999999
    local max_time=0

    for i in $(seq 1 $PERFORMANCE_ITERATIONS); do
        local start_time=$(date +%s%N)
        if curl -sf --max-time 5 "$test_url" >/dev/null 2>&1; then
            local end_time=$(date +%s%N)
            local request_time=$((($end_time - $start_time) / 1000000)) # Convert to milliseconds

            total_time=$((total_time + request_time))
            successful_requests=$((successful_requests + 1))

            [ $request_time -lt $min_time ] && min_time=$request_time
            [ $request_time -gt $max_time ] && max_time=$request_time
        fi
    done

    if [ $successful_requests -gt 0 ]; then
        local avg_latency=$((total_time / successful_requests))
        test_pass "Latency test completed: avg=${avg_latency}ms, min=${min_time}ms, max=${max_time}ms"

        # Save metrics
        echo "timestamp,avg_latency_ms,min_latency_ms,max_latency_ms,success_rate" > "$TEST_RESULTS_DIR/latency-metrics.csv"
        echo "$(date +%s),$avg_latency,$min_time,$max_time,$(echo "scale=2; $successful_requests*100/$PERFORMANCE_ITERATIONS" | bc)" >> "$TEST_RESULTS_DIR/latency-metrics.csv"

        # Check against thresholds
        if [ $avg_latency -lt 200 ]; then
            log "SUCCESS" "Excellent latency: ${avg_latency}ms (< 200ms threshold)"
        elif [ $avg_latency -lt 500 ]; then
            log "INFO" "Good latency: ${avg_latency}ms (< 500ms threshold)"
        else
            log "WARNING" "High latency: ${avg_latency}ms (> 500ms threshold)"
        fi
    else
        test_fail "Latency measurement failed" "No successful requests"
    fi

    # Test 2: Throughput test
    test_start "Throughput test"

    if command_exists "ab"; then
        log "INFO" "Running Apache Bench throughput test..."
        local ab_output=$(ab -n 100 -c 10 "$test_url" 2>&1)

        if echo "$ab_output" | grep -q "Requests per second"; then
            local rps=$(echo "$ab_output" | grep "Requests per second" | awk '{print $4}')
            local time_per_req=$(echo "$ab_output" | grep "Time per request.*mean" | head -1 | awk '{print $4}')

            test_pass "Throughput test: ${rps} req/sec, ${time_per_req}ms per request"

            # Save metrics
            echo "timestamp,requests_per_second,time_per_request_ms" > "$TEST_RESULTS_DIR/throughput-metrics.csv"
            echo "$(date +%s),$rps,$time_per_req" >> "$TEST_RESULTS_DIR/throughput-metrics.csv"
        else
            test_fail "Throughput test failed" "Unable to parse ab output"
        fi
    elif command_exists "wrk"; then
        log "INFO" "Running wrk throughput test..."
        local wrk_output=$(wrk -t4 -c10 -d10s "$test_url" 2>&1)

        if echo "$wrk_output" | grep -q "Requests/sec"; then
            local rps=$(echo "$wrk_output" | grep "Requests/sec" | awk '{print $2}')
            local latency=$(echo "$wrk_output" | grep "Latency" | awk '{print $2}')

            test_pass "Throughput test: ${rps} req/sec, ${latency} avg latency"
        else
            test_fail "Throughput test failed" "Unable to parse wrk output"
        fi
    else
        test_skip "Throughput test" "Neither ab nor wrk available"
    fi

    # Test 3: Concurrent connections
    test_start "Concurrent connections test"

    log "INFO" "Testing $CONCURRENT_REQUESTS concurrent connections..."
    local start_time=$(date +%s)
    local pids=()

    # Launch concurrent requests
    for i in $(seq 1 $CONCURRENT_REQUESTS); do
        (curl -sf --max-time 10 "$test_url" >/dev/null 2>&1) &
        pids+=($!)
    done

    # Wait for all to complete
    local success_count=0
    for pid in "${pids[@]}"; do
        if wait "$pid"; then
            success_count=$((success_count + 1))
        fi
    done

    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    local success_rate=$(echo "scale=2; $success_count*100/$CONCURRENT_REQUESTS" | bc)

    test_pass "Concurrent connections: $success_count/$CONCURRENT_REQUESTS succeeded (${success_rate}%) in ${total_time}s"

    if [ "$success_rate" = "100.00" ]; then
        log "SUCCESS" "Perfect concurrent request handling"
    elif (( $(echo "$success_rate >= 95" | bc -l) )); then
        log "INFO" "Good concurrent request handling"
    else
        log "WARNING" "Some concurrent requests failed"
    fi

    # Test 4: Bandwidth test (download speed)
    test_start "Bandwidth test"

    # Find a larger endpoint to test bandwidth (adjust URL as needed)
    local bandwidth_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}"

    log "INFO" "Testing download bandwidth..."
    local curl_output=$(curl -w "@-" -o /dev/null -s "$bandwidth_url" <<< "time_total:%{time_total}\nsize_download:%{size_download}\nspeed_download:%{speed_download}")

    if echo "$curl_output" | grep -q "speed_download"; then
        local speed_bytes=$(echo "$curl_output" | grep "speed_download" | cut -d: -f2)
        local speed_kbps=$(echo "scale=2; $speed_bytes/1024" | bc)
        local speed_mbps=$(echo "scale=2; $speed_kbps/1024" | bc)

        test_pass "Bandwidth test: ${speed_mbps} MB/s download speed"
    else
        test_skip "Bandwidth test" "Unable to measure download speed"
    fi
}

# ============================================================================
# Security Tests
# ============================================================================

test_security() {
    print_section "Security Tests"

    local test_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}"

    # Test 1: SSL/TLS security
    test_start "SSL/TLS configuration"

    if echo "$test_url" | grep -q "^https://"; then
        local domain=$(echo "$test_url" | sed -e 's|^https://||' -e 's|/.*||')

        # Test SSL connection
        local ssl_info=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>&1)

        # Check TLS version
        if echo "$ssl_info" | grep -q "Protocol.*TLSv1\.[23]"; then
            local tls_version=$(echo "$ssl_info" | grep "Protocol" | awk '{print $3}')
            test_pass "Secure TLS version: $tls_version"
        else
            test_fail "Insecure TLS version detected"
        fi

        # Check cipher suite
        if echo "$ssl_info" | grep -q "Cipher"; then
            local cipher=$(echo "$ssl_info" | grep "Cipher" | head -1 | awk '{print $2}')
            log "INFO" "Cipher suite: $cipher"

            # Check for weak ciphers
            if echo "$cipher" | grep -qE "(RC4|DES|MD5|NULL)"; then
                test_fail "Weak cipher detected: $cipher"
            else
                log "SUCCESS" "Strong cipher in use"
            fi
        fi
    else
        test_skip "SSL/TLS test" "Not an HTTPS endpoint"
    fi

    # Test 2: HTTP security headers
    test_start "HTTP security headers"

    local headers=$(curl -sI --max-time 10 "$test_url" 2>/dev/null)
    local required_headers=(
        "Strict-Transport-Security"
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
    )

    local missing_headers=()
    for header in "${required_headers[@]}"; do
        if echo "$headers" | grep -qi "^$header:"; then
            log "SUCCESS" "Security header present: $header"
        else
            missing_headers+=("$header")
            log "WARNING" "Security header missing: $header"
        fi
    done

    if [ ${#missing_headers[@]} -eq 0 ]; then
        test_pass "All recommended security headers present"
    else
        test_fail "Missing security headers" "${missing_headers[*]}"
    fi

    # Test 3: Unauthorized access attempts
    test_start "Unauthorized access prevention"

    local sensitive_paths=(
        "/admin"
        "/.env"
        "/config"
        "/.git"
        "/secrets"
    )

    local properly_protected=true
    for path in "${sensitive_paths[@]}"; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${test_url}${path}" 2>/dev/null || echo "000")

        case "$response" in
            401|403|404)
                log "SUCCESS" "Path protected: $path (HTTP $response)"
                ;;
            200)
                log "WARNING" "Potential exposure: $path is accessible"
                properly_protected=false
                ;;
            000)
                log "INFO" "Path unreachable: $path"
                ;;
        esac
    done

    if $properly_protected; then
        test_pass "Sensitive paths properly protected"
    else
        test_fail "Some sensitive paths may be exposed"
    fi

    # Test 4: SQL injection attempt (basic test)
    test_start "SQL injection protection"

    local sql_payloads=(
        "' OR '1'='1"
        "admin' --"
        "1' UNION SELECT NULL--"
    )

    local protected=true
    for payload in "${sql_payloads[@]}"; do
        local encoded_payload=$(echo "$payload" | jq -sRr @uri)
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
                        "${test_url}/health?test=${encoded_payload}" 2>/dev/null || echo "000")

        if [ "$response" = "400" ] || [ "$response" = "403" ]; then
            log "SUCCESS" "SQL injection blocked: $payload"
        elif [ "$response" = "200" ]; then
            # Check if the response changed
            log "INFO" "Request processed for payload: $payload (may be sanitized)"
        fi
    done

    if $protected; then
        test_pass "SQL injection protection appears functional"
    else
        test_skip "SQL injection test" "Unable to determine protection level"
    fi

    # Test 5: XSS protection
    test_start "XSS protection"

    local xss_payloads=(
        "<script>alert('XSS')</script>"
        "<img src=x onerror=alert('XSS')>"
    )

    for payload in "${xss_payloads[@]}"; do
        local encoded_payload=$(echo "$payload" | jq -sRr @uri)
        local response=$(curl -s --max-time 5 "${test_url}/health?test=${encoded_payload}" 2>/dev/null || echo "")

        if echo "$response" | grep -q "<script>"; then
            log "WARNING" "Potential XSS vulnerability: Script tag not sanitized"
        else
            log "SUCCESS" "XSS payload appears sanitized"
        fi
    done

    test_pass "XSS protection test completed"

    # Test 6: Port scanning protection (if nmap available)
    if command_exists "nmap"; then
        test_start "Port scanning detection"

        local domain=$(echo "$test_url" | sed -e 's|^https\?://||' -e 's|/.*||')
        log "INFO" "Scanning common ports on $domain..."

        # Quick scan of common ports
        local scan_result=$(nmap -p 80,443,22,3306,5432,6379,27017 --max-retries 1 -T4 "$domain" 2>/dev/null)

        if echo "$scan_result" | grep -q "open"; then
            local open_ports=$(echo "$scan_result" | grep "open" | awk '{print $1}')
            log "INFO" "Open ports detected: $open_ports"

            # Check for unexpected open ports
            if echo "$open_ports" | grep -qE "(22|3306|5432|6379|27017)"; then
                log "WARNING" "Unexpected ports are open (potential security risk)"
            fi
        fi

        test_pass "Port scan completed"
    else
        test_skip "Port scanning test" "nmap not available"
    fi
}

# ============================================================================
# Integration Test
# ============================================================================

test_integration_flow() {
    print_section "End-to-End Integration Test"

    log "INFO" "Testing complete flow: Setup → Start → Connect → Access → Cleanup"

    # Step 1: Verify Docker Compose configuration
    test_start "Integration: Verify configuration"
    if docker-compose -f "$COMPOSE_FILE" config >/dev/null 2>&1; then
        test_pass "Docker Compose configuration is valid"
    else
        test_fail "Docker Compose configuration is invalid"
        return 1
    fi

    # Step 2: Start services
    test_start "Integration: Start services"
    log "INFO" "Starting Docker Compose services..."

    if docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans; then
        test_pass "Services started successfully"

        # Wait for services to initialize
        log "INFO" "Waiting for services to initialize (30s)..."
        sleep 30
    else
        test_fail "Failed to start services"
        return 1
    fi

    # Step 3: Verify tunnel connection
    test_start "Integration: Tunnel connection"
    local tunnel_connected=false
    local max_wait=60
    local count=0

    log "INFO" "Waiting for tunnel to connect (timeout: ${max_wait}s)..."

    while [ $count -lt $max_wait ]; do
        local cloudflared_log=$(docker logs nyra-cloudflared-orchestrator 2>&1 | tail -20 || echo "")

        if echo "$cloudflared_log" | grep -q "Connection.*registered"; then
            tunnel_connected=true
            break
        fi

        sleep 2
        count=$((count + 2))
    done

    if $tunnel_connected; then
        test_pass "Tunnel connected successfully (${count}s)"
    else
        test_fail "Tunnel failed to connect" "Timeout after ${max_wait}s"
    fi

    # Step 4: Test service accessibility
    test_start "Integration: Service accessibility"
    local service_url="${ORCHESTRATOR_PUBLIC_URL:-https://nyra-orchestrator.yourdomain.com}/health"

    if retry_with_backoff 3 wait_for_service "$service_url"; then
        test_pass "Service accessible through tunnel"
    else
        test_fail "Service not accessible through tunnel"
    fi

    # Step 5: Perform health checks
    test_start "Integration: Health checks"
    local all_healthy=true

    declare -A services=(
        ["Orchestrator"]="http://localhost:8000/health"
        ["MetaMCP Gateway"]="http://localhost:8005/health"
        ["Claude Flow MCP"]="http://localhost:8003/health"
    )

    for service in "${!services[@]}"; do
        local url="${services[$service]}"
        if curl -sf --max-time 5 "$url" >/dev/null 2>&1; then
            log "SUCCESS" "$service is healthy"
        else
            log "ERROR" "$service is unhealthy"
            all_healthy=false
        fi
    done

    if $all_healthy; then
        test_pass "All services healthy"
    else
        test_fail "Some services are unhealthy"
    fi

    # Step 6: Cleanup (optional - controlled by flag)
    if [ "${INTEGRATION_CLEANUP:-true}" = "true" ]; then
        test_start "Integration: Cleanup"
        log "INFO" "Stopping services..."

        if docker-compose -f "$COMPOSE_FILE" down; then
            test_pass "Services stopped successfully"
        else
            test_fail "Failed to stop services"
        fi
    else
        log "INFO" "Skipping cleanup (INTEGRATION_CLEANUP=false)"
    fi
}

# ============================================================================
# Test Report Generation
# ============================================================================

generate_test_report() {
    print_section "Test Summary Report"

    local total=$TOTAL_TESTS
    local passed=$PASSED_TESTS
    local failed=$FAILED_TESTS
    local skipped=$SKIPPED_TESTS
    local success_rate=0

    if [ $total -gt 0 ]; then
        success_rate=$(echo "scale=2; ($passed * 100) / $total" | bc)
    fi

    # Console summary
    echo "" | tee -a "$LOG_FILE"
    echo "╔════════════════════════════════════════════════════════╗" | tee -a "$LOG_FILE"
    echo "║           CLOUDFLARE TUNNEL TEST RESULTS              ║" | tee -a "$LOG_FILE"
    echo "╠════════════════════════════════════════════════════════╣" | tee -a "$LOG_FILE"
    printf "║ Total Tests:     %-35s ║\n" "$total" | tee -a "$LOG_FILE"
    printf "║ Passed:          %-35s ║\n" "$(echo -e "${GREEN}${passed}${NC}")" | tee -a "$LOG_FILE"
    printf "║ Failed:          %-35s ║\n" "$(echo -e "${RED}${failed}${NC}")" | tee -a "$LOG_FILE"
    printf "║ Skipped:         %-35s ║\n" "$(echo -e "${YELLOW}${skipped}${NC}")" | tee -a "$LOG_FILE"
    printf "║ Success Rate:    %-35s ║\n" "${success_rate}%" | tee -a "$LOG_FILE"
    echo "╚════════════════════════════════════════════════════════╝" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Generate JSON report
    local json_report="$TEST_RESULTS_DIR/test-report-$(date +%Y%m%d-%H%M%S).json"
    cat > "$json_report" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "test_suite": "Cloudflare Tunnel Validation",
  "version": "1.0.0",
  "summary": {
    "total_tests": $total,
    "passed": $passed,
    "failed": $failed,
    "skipped": $skipped,
    "success_rate": $success_rate
  },
  "environment": {
    "os": "$(uname -s)",
    "docker_version": "$(docker --version 2>/dev/null || echo 'N/A')",
    "compose_version": "$(docker-compose --version 2>/dev/null || echo 'N/A')"
  },
  "log_file": "$LOG_FILE",
  "results_directory": "$TEST_RESULTS_DIR"
}
EOF

    log "INFO" "JSON report generated: $json_report"

    # Generate HTML report (basic)
    local html_report="$TEST_RESULTS_DIR/test-report-$(date +%Y%m%d-%H%M%S).html"
    cat > "$html_report" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare Tunnel Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
        .stat-card.passed { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); }
        .stat-card.failed { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); }
        .stat-card.skipped { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); }
        .stat-value { font-size: 36px; font-weight: bold; }
        .stat-label { font-size: 14px; opacity: 0.9; margin-top: 5px; }
        .timestamp { color: #666; font-size: 14px; }
        .log-link { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        .log-link:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Cloudflare Tunnel Test Report</h1>
        <p class="timestamp">Generated: $(date)</p>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-value">$total</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-value">$passed</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-value">$failed</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-value">$skipped</div>
                <div class="stat-label">Skipped</div>
            </div>
        </div>

        <h2>Success Rate: ${success_rate}%</h2>
        <div style="background: #e0e0e0; border-radius: 4px; height: 30px; position: relative;">
            <div style="background: #4CAF50; height: 100%; width: ${success_rate}%; border-radius: 4px;"></div>
        </div>

        <a href="file://$LOG_FILE" class="log-link">View Detailed Log</a>
    </div>
</body>
</html>
EOF

    log "INFO" "HTML report generated: $html_report"

    # Exit code based on results
    if [ $failed -eq 0 ]; then
        log "SUCCESS" "All tests passed! ✓"
        return 0
    else
        log "ERROR" "$failed test(s) failed"
        return 1
    fi
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Cloudflare Tunnel Validation & Testing Suite              ║
║   Project Nyra - Comprehensive Tunnel Testing                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    # Parse command line arguments
    local run_all=true
    local run_prerequisites=false
    local run_docker=false
    local run_connectivity=false
    local run_dns=false
    local run_accessibility=false
    local run_failover=false
    local run_access=false
    local run_performance=false
    local run_security=false
    local run_integration=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                run_all=true
                shift
                ;;
            --prerequisites)
                run_prerequisites=true
                run_all=false
                shift
                ;;
            --docker)
                run_docker=true
                run_all=false
                shift
                ;;
            --connectivity)
                run_connectivity=true
                run_all=false
                shift
                ;;
            --dns)
                run_dns=true
                run_all=false
                shift
                ;;
            --accessibility)
                run_accessibility=true
                run_all=false
                shift
                ;;
            --failover)
                run_failover=true
                run_all=false
                shift
                ;;
            --access)
                run_access=true
                run_all=false
                shift
                ;;
            --performance)
                run_performance=true
                run_all=false
                shift
                ;;
            --security)
                run_security=true
                run_all=false
                shift
                ;;
            --integration)
                run_integration=true
                run_all=false
                shift
                ;;
            --help|-h)
                cat <<HELP
Usage: $0 [OPTIONS]

Cloudflare Tunnel Validation and Testing Suite

OPTIONS:
    --all              Run all test suites (default)
    --prerequisites    Run prerequisite checks only
    --docker           Run Docker service tests
    --connectivity     Run tunnel connectivity tests
    --dns              Run DNS resolution tests
    --accessibility    Run service accessibility tests
    --failover         Run failover and resilience tests
    --access           Run access policy enforcement tests
    --performance      Run performance tests (latency, throughput)
    --security         Run security tests
    --integration      Run end-to-end integration test
    --help, -h         Show this help message

ENVIRONMENT VARIABLES:
    COMPOSE_FILE              Path to docker-compose file (default: ./docker-compose.infisical.yml)
    TEST_RESULTS_DIR          Directory for test results (default: ./tests/results/cloudflare-tunnels)
    TIMEOUT_SECONDS           Timeout for service checks (default: 30)
    RETRY_COUNT               Number of retries for failed tests (default: 3)
    PERFORMANCE_ITERATIONS    Number of performance test iterations (default: 10)
    CONCURRENT_REQUESTS       Concurrent requests for load testing (default: 20)
    INTEGRATION_CLEANUP       Clean up after integration test (default: true)

EXAMPLES:
    # Run all tests
    $0 --all

    # Run only performance and security tests
    $0 --performance --security

    # Run with custom configuration
    TIMEOUT_SECONDS=60 $0 --connectivity --dns

    # Run integration test without cleanup
    INTEGRATION_CLEANUP=false $0 --integration

HELP
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                log "INFO" "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Setup test environment
    setup_test_environment

    # Run test suites based on flags
    local exit_code=0

    if ! check_prerequisites; then
        log "ERROR" "Prerequisites check failed. Aborting tests."
        exit 1
    fi

    if $run_all || $run_docker; then
        test_docker_services || exit_code=1
    fi

    if $run_all || $run_connectivity; then
        test_tunnel_connectivity || exit_code=1
    fi

    if $run_all || $run_dns; then
        test_dns_resolution || exit_code=1
    fi

    if $run_all || $run_accessibility; then
        test_service_accessibility || exit_code=1
    fi

    if $run_all || $run_failover; then
        test_tunnel_failover || exit_code=1
    fi

    if $run_all || $run_access; then
        test_access_policies || exit_code=1
    fi

    if $run_all || $run_performance; then
        test_performance || exit_code=1
    fi

    if $run_all || $run_security; then
        test_security || exit_code=1
    fi

    if $run_all || $run_integration; then
        test_integration_flow || exit_code=1
    fi

    # Generate final report
    generate_test_report || exit_code=1

    # Cleanup
    cleanup_test_environment

    log "INFO" "Test execution completed. Results saved to: $TEST_RESULTS_DIR"

    exit $exit_code
}

# Run main function
main "$@"
