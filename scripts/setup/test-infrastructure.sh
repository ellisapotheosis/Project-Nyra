#!/bin/bash
# Comprehensive Infrastructure Testing Script for Nyra
# Tests all components of the cloudflared tunneling architecture

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

info() {
    echo -e "${CYAN}ℹ️${NC} $1"
}

# Test results storage
declare -A test_results
total_tests=0
passed_tests=0
failed_tests=0

# Record test result
record_test() {
    local test_name="$1"
    local result="$2"
    local details="${3:-}"

    test_results["$test_name"]="$result:$details"
    total_tests=$((total_tests + 1))

    if [[ "$result" == "PASS" ]]; then
        passed_tests=$((passed_tests + 1))
        success "$test_name"
        [[ -n "$details" ]] && echo "    $details"
    else
        failed_tests=$((failed_tests + 1))
        error "$test_name"
        [[ -n "$details" ]] && echo "    $details"
    fi
}

# Test DNS resolution
test_dns_resolution() {
    log "Testing DNS resolution..."

    local domains=(
        "nyra.ratehunter.net"
        "orchestrator.ratehunter.net"
        "worker1.ratehunter.net"
        "worker2.ratehunter.net"
        "worker3.ratehunter.net"
        "api.ratehunter.net"
        "health.ratehunter.net"
    )

    for domain in "${domains[@]}"; do
        if dig +short "$domain" | grep -q .; then
            record_test "DNS: $domain" "PASS" "$(dig +short "$domain" | head -1)"
        else
            record_test "DNS: $domain" "FAIL" "No DNS record found"
        fi
    done
}

# Test cloudflared tunnel status
test_tunnel_status() {
    log "Testing cloudflared tunnel status..."

    if systemctl is-active --quiet cloudflared 2>/dev/null; then
        record_test "Cloudflared Service" "PASS" "Service is running"

        # Check tunnel connectivity
        if curl -sf --max-time 10 https://nyra.ratehunter.net > /dev/null 2>&1; then
            record_test "Tunnel Connectivity" "PASS" "Tunnel is accessible"
        else
            record_test "Tunnel Connectivity" "FAIL" "Cannot reach tunnel endpoint"
        fi
    else
        record_test "Cloudflared Service" "FAIL" "Service is not running"
        record_test "Tunnel Connectivity" "SKIP" "Service not running"
    fi
}

# Test service discovery
test_service_discovery() {
    log "Testing service discovery..."

    if [[ -f "$PROJECT_ROOT/src/infrastructure/cloudflared/service-discovery.js" ]]; then
        if node "$PROJECT_ROOT/src/infrastructure/cloudflared/service-discovery.js" status > /dev/null 2>&1; then
            record_test "Service Discovery" "PASS" "Service discovery is functional"
        else
            record_test "Service Discovery" "FAIL" "Service discovery returned error"
        fi
    else
        record_test "Service Discovery" "FAIL" "Service discovery script not found"
    fi
}

# Test load balancer configuration
test_load_balancer() {
    log "Testing load balancer configuration..."

    if [[ -f "$PROJECT_ROOT/src/infrastructure/cloudflared/load-balancer.js" ]]; then
        if node "$PROJECT_ROOT/src/infrastructure/cloudflared/load-balancer.js" test > /dev/null 2>&1; then
            record_test "Load Balancer" "PASS" "Load balancer configuration valid"
        else
            record_test "Load Balancer" "FAIL" "Load balancer test failed"
        fi
    else
        record_test "Load Balancer" "FAIL" "Load balancer script not found"
    fi
}

# Test security configuration
test_security() {
    log "Testing security configuration..."

    # Check if security manager exists
    if [[ -f "$PROJECT_ROOT/src/infrastructure/cloudflared/security-manager.js" ]]; then
        if node "$PROJECT_ROOT/src/infrastructure/cloudflared/security-manager.js" status > /dev/null 2>&1; then
            record_test "Security Manager" "PASS" "Security configuration loaded"
        else
            record_test "Security Manager" "FAIL" "Security manager error"
        fi
    else
        record_test "Security Manager" "FAIL" "Security manager not found"
    fi

    # Check access policies file
    if [[ -f "$PROJECT_ROOT/config/access-policies.json" ]]; then
        if jq empty "$PROJECT_ROOT/config/access-policies.json" 2>/dev/null; then
            record_test "Access Policies" "PASS" "Valid JSON configuration"
        else
            record_test "Access Policies" "FAIL" "Invalid JSON in access policies"
        fi
    else
        record_test "Access Policies" "FAIL" "Access policies file not found"
    fi
}

# Test network connectivity
test_network_connectivity() {
    log "Testing network connectivity..."

    local internal_ips=(
        "192.168.1.100"  # Orchestrator
        "192.168.1.101"  # Worker 1
        "192.168.1.102"  # Worker 2
        "192.168.1.103"  # Worker 3
    )

    for ip in "${internal_ips[@]}"; do
        if ping -c 1 -W 2 "$ip" > /dev/null 2>&1; then
            record_test "Network: $ip" "PASS" "Host is reachable"
        else
            record_test "Network: $ip" "FAIL" "Host is not reachable"
        fi
    done
}

# Test service endpoints
test_service_endpoints() {
    log "Testing service endpoints..."

    local endpoints=(
        "http://localhost:3000/health:Claude-Flow"
        "http://localhost:8080/health:Task-API"
        "http://localhost:9090/health:Health-Dashboard"
        "http://localhost:8081/metrics:GPU-Metrics"
    )

    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint name <<< "$endpoint_info"

        if curl -sf --max-time 10 "$endpoint" > /dev/null 2>&1; then
            record_test "Endpoint: $name" "PASS" "Service is responding"
        else
            record_test "Endpoint: $name" "FAIL" "Service is not responding"
        fi
    done
}

# Test configuration files
test_configuration_files() {
    log "Testing configuration files..."

    local config_files=(
        "$PROJECT_ROOT/config/tunnels/orchestrator.yml:Orchestrator Tunnel Config"
        "$PROJECT_ROOT/config/tunnels/worker-template.yml:Worker Tunnel Template"
        "$PROJECT_ROOT/config/access-policies.json:Access Policies"
        "$PROJECT_ROOT/docs/network/network-topology.md:Network Documentation"
    )

    for file_info in "${config_files[@]}"; do
        IFS=':' read -r file name <<< "$file_info"

        if [[ -f "$file" ]]; then
            record_test "Config: $name" "PASS" "File exists and readable"
        else
            record_test "Config: $name" "FAIL" "File not found"
        fi
    done
}

# Test environment variables
test_environment_variables() {
    log "Testing environment variables..."

    local required_vars=(
        "CLOUDFLARE_API_KEY"
        "CLOUDFLARE_EMAIL"
        "CLOUDFLARE_ZONE_ID"
        "CLOUDFLARE_ACCOUNT_ID"
    )

    local vars_set=0
    local total_vars=${#required_vars[@]}

    for var in "${required_vars[@]}"; do
        if [[ -n "${!var:-}" ]]; then
            vars_set=$((vars_set + 1))
        fi
    done

    if [[ $vars_set -eq $total_vars ]]; then
        record_test "Environment Variables" "PASS" "All required variables set ($vars_set/$total_vars)"
    elif [[ $vars_set -gt 0 ]]; then
        record_test "Environment Variables" "PARTIAL" "Some variables set ($vars_set/$total_vars)"
    else
        record_test "Environment Variables" "FAIL" "No required variables set (0/$total_vars)"
    fi
}

# Test Infisical integration
test_infisical() {
    log "Testing Infisical integration..."

    if command -v infisical &> /dev/null; then
        if [[ -n "${INFISICAL_TOKEN:-}" ]]; then
            record_test "Infisical Auth" "PASS" "INFISICAL_TOKEN is present"
            if [[ "${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}" == "8374cea9-e5e8-4050-bda4-b91f25ab30ef" ]]; then
                record_test "Infisical Project" "PASS" "Project id configured"
            else
                record_test "Infisical Project" "PARTIAL" "Non-standard project id configured"
            fi
        else
            record_test "Infisical Auth" "FAIL" "INFISICAL_TOKEN not set"
            record_test "Infisical Project" "SKIP" "Token required"
        fi
    else
        record_test "Infisical CLI" "FAIL" "Infisical CLI not installed"
        record_test "Infisical Auth" "SKIP" "CLI not available"
        record_test "Infisical Project" "SKIP" "CLI not available"
    fi
}

# Test GPU availability (for worker nodes)
test_gpu_availability() {
    log "Testing GPU availability..."

    if command -v nvidia-smi &> /dev/null; then
        if nvidia-smi > /dev/null 2>&1; then
            local gpu_count=$(nvidia-smi -L | wc -l)
            record_test "GPU Detection" "PASS" "$gpu_count GPU(s) detected"

            # Test GPU monitoring script
            if [[ -f "$PROJECT_ROOT/scripts/monitoring/gpu-monitor.py" ]]; then
                if python3 "$PROJECT_ROOT/scripts/monitoring/gpu-monitor.py" > /dev/null 2>&1; then
                    record_test "GPU Monitoring" "PASS" "GPU monitoring script functional"
                else
                    record_test "GPU Monitoring" "FAIL" "GPU monitoring script error"
                fi
            else
                record_test "GPU Monitoring" "FAIL" "GPU monitoring script not found"
            fi
        else
            record_test "GPU Detection" "FAIL" "nvidia-smi failed to execute"
        fi
    else
        record_test "GPU Detection" "SKIP" "nvidia-smi not available (may be orchestrator node)"
    fi
}

# Test Docker availability
test_docker() {
    log "Testing Docker availability..."

    if command -v docker &> /dev/null; then
        if docker ps > /dev/null 2>&1; then
            record_test "Docker Service" "PASS" "Docker is running"

            # Test NVIDIA Docker (for worker nodes)
            if docker info 2>/dev/null | grep -q "nvidia"; then
                record_test "NVIDIA Docker" "PASS" "NVIDIA Docker runtime available"
            else
                record_test "NVIDIA Docker" "SKIP" "NVIDIA Docker runtime not detected"
            fi
        else
            record_test "Docker Service" "FAIL" "Docker is not running or not accessible"
        fi
    else
        record_test "Docker CLI" "FAIL" "Docker CLI not installed"
    fi
}

# Test monitoring scripts
test_monitoring() {
    log "Testing monitoring scripts..."

    local monitoring_scripts=(
        "$PROJECT_ROOT/scripts/monitoring/health-check.sh:Health Check Script"
        "$PROJECT_ROOT/scripts/monitoring/tunnel-health.sh:Tunnel Health Script"
    )

    for script_info in "${monitoring_scripts[@]}"; do
        IFS=':' read -r script name <<< "$script_info"

        if [[ -f "$script" && -x "$script" ]]; then
            record_test "Monitor: $name" "PASS" "Script exists and executable"
        elif [[ -f "$script" ]]; then
            record_test "Monitor: $name" "PARTIAL" "Script exists but not executable"
        else
            record_test "Monitor: $name" "FAIL" "Script not found"
        fi
    done
}

# Generate comprehensive test report
generate_report() {
    local report_file="$PROJECT_ROOT/test-results-$(date +%Y%m%d-%H%M%S).txt"

    log "Generating test report..."

    cat > "$report_file" <<EOF
# Nyra Infrastructure Test Report
Generated: $(date)
Test Duration: $SECONDS seconds

## Summary
- Total Tests: $total_tests
- Passed: $passed_tests
- Failed: $failed_tests
- Success Rate: $(( (passed_tests * 100) / total_tests ))%

## Test Results
EOF

    echo "" >> "$report_file"

    for test_name in $(printf '%s\n' "${!test_results[@]}" | sort); do
        IFS=':' read -r result details <<< "${test_results[$test_name]}"
        printf "%-30s %s\n" "$test_name:" "$result" >> "$report_file"
        [[ -n "$details" ]] && printf "%-30s   %s\n" "" "$details" >> "$report_file"
    done

    cat >> "$report_file" <<EOF

## System Information
- OS: $(uname -s) $(uname -r)
- Hostname: $(hostname)
- User: $(whoami)
- Working Directory: $PROJECT_ROOT
- Date: $(date)

## Recommendations
EOF

    if [[ $failed_tests -gt 0 ]]; then
        echo "- Fix failed tests before deploying to production" >> "$report_file"
        echo "- Review error logs for detailed diagnostics" >> "$report_file"
    fi

    if [[ $passed_tests -eq $total_tests ]]; then
        echo "- All tests passed! Infrastructure is ready for deployment" >> "$report_file"
        echo "- Consider setting up automated monitoring" >> "$report_file"
    fi

    echo "- Run tests regularly to ensure system health" >> "$report_file"

    echo "" >> "$report_file"
    echo "End of Report" >> "$report_file"

    info "Test report saved to: $report_file"
}

# Display test summary
display_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${CYAN}         NYRA INFRASTRUCTURE TEST SUMMARY${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    echo -e "\n📊 Test Statistics:"
    echo -e "   Total Tests: ${BLUE}$total_tests${NC}"
    echo -e "   Passed:      ${GREEN}$passed_tests${NC}"
    echo -e "   Failed:      ${RED}$failed_tests${NC}"
    echo -e "   Success Rate: ${CYAN}$(( (passed_tests * 100) / total_tests ))%${NC}"

    echo -e "\n🎯 Test Categories:"
    local categories=(
        "DNS"
        "Network"
        "Tunnel"
        "Service"
        "Config"
        "Security"
        "Monitor"
    )

    for category in "${categories[@]}"; do
        local cat_passed=0
        local cat_total=0

        for test_name in "${!test_results[@]}"; do
            if [[ "$test_name" =~ $category ]]; then
                cat_total=$((cat_total + 1))
                if [[ "${test_results[$test_name]}" =~ ^PASS ]]; then
                    cat_passed=$((cat_passed + 1))
                fi
            fi
        done

        if [[ $cat_total -gt 0 ]]; then
            local cat_percent=$(( (cat_passed * 100) / cat_total ))
            echo -e "   $category: $cat_passed/$cat_total (${cat_percent}%)"
        fi
    done

    if [[ $failed_tests -eq 0 ]]; then
        echo -e "\n🎉 ${GREEN}All tests passed! Infrastructure is ready.${NC}"
    else
        echo -e "\n⚠️  ${YELLOW}Some tests failed. Review and fix before production deployment.${NC}"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main test execution
main() {
    echo -e "${CYAN}"
    cat << "EOF"
    ███╗   ██╗██╗   ██╗██████╗  █████╗
    ████╗  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗
    ██╔██╗ ██║ ╚████╔╝ ██████╔╝███████║
    ██║╚██╗██║  ╚██╔╝  ██╔══██╗██╔══██║
    ██║ ╚████║   ██║   ██║  ██║██║  ██║
    ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
    Infrastructure Test Suite
EOF
    echo -e "${NC}"

    log "Starting comprehensive infrastructure testing..."

    # Run all test categories
    test_environment_variables
    test_configuration_files
    test_dns_resolution
    test_network_connectivity
    test_tunnel_status
    test_service_endpoints
    test_service_discovery
    test_load_balancer
    test_security
    test_infisical
    test_docker
    test_gpu_availability
    test_monitoring

    # Generate results
    display_summary
    generate_report

    # Exit with appropriate code
    if [[ $failed_tests -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Parse command line arguments
case "${1:-}" in
    --quick|-q)
        # Quick test mode - skip network and service tests
        log "Running in quick test mode..."
        test_configuration_files
        test_environment_variables
        test_infisical
        display_summary
        ;;
    --dns|-d)
        # DNS only test
        test_dns_resolution
        display_summary
        ;;
    --help|-h)
        cat << EOF
Nyra Infrastructure Test Suite

Usage: $0 [options]

Options:
    --quick, -q    Run quick configuration tests only
    --dns, -d      Test DNS resolution only
    --help, -h     Show this help message

Default: Run all tests
EOF
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
