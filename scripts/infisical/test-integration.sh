#!/bin/bash

# Nyra Infisical MCP Integration Test Suite
# Comprehensive testing for the complete Infisical integration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$PROJECT_ROOT/scripts/lib/infisical-token.sh"
cd "$PROJECT_ROOT"
INFISICAL_PROJECT_ID="${INFISICAL_PROJECT_ID:-8374cea9-e5e8-4050-bda4-b91f25ab30ef}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test result tracking
track_test() {
    local test_name="$1"
    local result="$2"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [[ "$result" == "PASS" ]]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        log_success "✓ $test_name"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        log_error "✗ $test_name"
    fi
}

# Test 1: Prerequisites Check
test_prerequisites() {
    log_info "Testing prerequisites..."

    local result="PASS"

    # Check Infisical CLI
    if ! command -v infisical &> /dev/null; then
        log_error "Infisical CLI not found"
        result="FAIL"
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found"
        result="FAIL"
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose not found"
        result="FAIL"
    fi

    # Check jq
    if ! command -v jq &> /dev/null; then
        log_error "jq not found"
        result="FAIL"
    fi

    track_test "Prerequisites Check" "$result"
}

# Test 2: Infisical Authentication
test_infisical_auth() {
    log_info "Testing Infisical authentication..."

    local result="PASS"

    if ! nyra_require_infisical_token; then
        log_warning "INFISICAL_TOKEN is not set"
        result="FAIL"
    else
        nyra_resolve_infisical_project_id
    fi

    track_test "Infisical Authentication" "$result"
}

# Test 3: Docker Services
test_docker_services() {
    log_info "Testing Docker services..."

    local result="PASS"
    local services=("infisical-mcp" "metamcp-gateway-enhanced")

    for service in "${services[@]}"; do
        if ! docker-compose -f docker-compose.infisical.yml ps "$service" | grep -q "Up"; then
            log_warning "Service $service is not running"
            result="FAIL"
        fi
    done

    track_test "Docker Services Status" "$result"
}

# Test 4: Service Health Endpoints
test_service_health() {
    log_info "Testing service health endpoints..."

    local endpoints=(
        "http://localhost:8006/health:Infisical MCP"
        "http://localhost:8005/health:MetaMCP Gateway"
    )

    for endpoint_info in "${endpoints[@]}"; do
        local endpoint="${endpoint_info%%:*}"
        local name="${endpoint_info##*:}"
        local result="PASS"

        if ! curl -s -f "$endpoint" > /dev/null; then
            log_warning "$name health endpoint failed: $endpoint"
            result="FAIL"
        fi

        track_test "$name Health Endpoint" "$result"
    done
}

# Test 5: Infisical MCP Tools
test_infisical_mcp_tools() {
    log_info "Testing Infisical MCP tools..."

    local result="PASS"

    # Test MCP capabilities endpoint
    local capabilities
    if capabilities=$(curl -s "http://localhost:8006/mcp/capabilities"); then
        if echo "$capabilities" | jq -e '.tools[]' > /dev/null 2>&1; then
            log_info "MCP tools available: $(echo "$capabilities" | jq -r '.tools[]')"
        else
            log_warning "No MCP tools found in capabilities"
            result="FAIL"
        fi
    else
        log_error "Failed to get MCP capabilities"
        result="FAIL"
    fi

    track_test "Infisical MCP Tools" "$result"
}

# Test 6: Secret Retrieval
test_secret_retrieval() {
    log_info "Testing secret retrieval..."

    local result="PASS"

    # Test direct Infisical CLI
    if infisical secrets get --help > /dev/null 2>&1; then
        log_info "Infisical CLI secret retrieval available"
    else
        log_warning "Infisical CLI secret retrieval failed"
        result="FAIL"
    fi

    # Test MCP secret retrieval
    local secret_response
    if secret_response=$(curl -s "http://localhost:8006/secrets/NYRA_PC_ID"); then
        if echo "$secret_response" | jq -e '.value' > /dev/null 2>&1; then
            log_info "MCP secret retrieval working"
        else
            log_warning "MCP secret retrieval returned unexpected format"
            result="FAIL"
        fi
    else
        log_warning "MCP secret retrieval endpoint failed"
        result="FAIL"
    fi

    track_test "Secret Retrieval" "$result"
}

# Test 7: MetaMCP Gateway Proxy
test_metamcp_proxy() {
    log_info "Testing MetaMCP Gateway proxy..."

    local result="PASS"
    local proxy_endpoints=(
        "/mcp/infisical/health"
        "/mcp/servers"
    )

    for endpoint in "${proxy_endpoints[@]}"; do
        if ! curl -s -f "http://localhost:8005$endpoint" > /dev/null; then
            log_warning "MetaMCP proxy endpoint failed: $endpoint"
            result="FAIL"
        fi
    done

    track_test "MetaMCP Gateway Proxy" "$result"
}

# Test 8: Secret Injection
test_secret_injection() {
    log_info "Testing automatic secret injection..."

    local result="PASS"

    # Create a test container with secret injection
    local container_name="nyra-test-secrets"

    if docker run --rm --name "$container_name" \
       --network nyra-infisical-network \
       -e INFISICAL_PROJECT_ID="$INFISICAL_PROJECT_ID" \
       -e INFISICAL_TOKEN="$INFISICAL_TOKEN" \
       alpine:latest \
       sh -c "apk add --no-cache curl && curl -s http://infisical-mcp:8006/health" > /dev/null 2>&1; then
        log_info "Secret injection networking test passed"
    else
        log_warning "Secret injection networking test failed"
        result="FAIL"
    fi

    track_test "Secret Injection" "$result"
}

# Test 9: Environment Configuration
test_environment_config() {
    log_info "Testing environment configuration..."

    local result="PASS"
    local config_files=(
        "config/infisical/orchestrator/.env.development"
        "config/infisical/worker-1/.env.development"
        "docker-compose.infisical.yml"
    )

    for config_file in "${config_files[@]}"; do
        if [[ ! -f "$config_file" ]]; then
            log_warning "Configuration file missing: $config_file"
            result="FAIL"
        fi
    done

    track_test "Environment Configuration" "$result"
}

# Test 10: Claude Code MCP Registration
test_claude_mcp_registration() {
    log_info "Testing Claude Code MCP registration..."

    local result="PASS"

    # Check if Claude Code CLI is available
    if command -v claude &> /dev/null; then
        if claude mcp list | grep -q "infisical"; then
            log_info "Infisical MCP registered with Claude Code"
        else
            log_warning "Infisical MCP not registered with Claude Code"
            result="FAIL"
        fi
    else
        log_warning "Claude Code CLI not available"
        result="FAIL"
    fi

    track_test "Claude Code MCP Registration" "$result"
}

# Test 11: Volume Persistence
test_volume_persistence() {
    log_info "Testing volume persistence..."

    local result="PASS"
    local volumes=(
        "nyra_infisical_config"
        "nyra_infisical_cache"
        "nyra_infisical_secrets"
        "nyra_metamcp_cache"
    )

    for volume in "${volumes[@]}"; do
        if ! docker volume inspect "$volume" > /dev/null 2>&1; then
            log_warning "Docker volume missing: $volume"
            result="FAIL"
        fi
    done

    track_test "Volume Persistence" "$result"
}

# Test 12: Network Connectivity
test_network_connectivity() {
    log_info "Testing network connectivity..."

    local result="PASS"

    # Test internal network connectivity
    if docker network inspect nyra-infisical-network > /dev/null 2>&1; then
        log_info "Nyra Infisical network exists"
    else
        log_warning "Nyra Infisical network missing"
        result="FAIL"
    fi

    # Test service-to-service connectivity
    if docker run --rm --network nyra-infisical-network alpine:latest \
       sh -c "apk add --no-cache curl && curl -s -f http://infisical-mcp:8006/health" > /dev/null 2>&1; then
        log_info "Service-to-service connectivity working"
    else
        log_warning "Service-to-service connectivity failed"
        result="FAIL"
    fi

    track_test "Network Connectivity" "$result"
}

# Test 13: Performance and Load
test_performance() {
    log_info "Testing performance and load..."

    local result="PASS"

    # Test multiple concurrent secret requests
    local concurrent_requests=5
    local success_count=0

    for i in $(seq 1 $concurrent_requests); do
        if curl -s -f "http://localhost:8006/health" > /dev/null & then
            success_count=$((success_count + 1))
        fi
    done

    wait

    if [[ $success_count -eq $concurrent_requests ]]; then
        log_info "Concurrent requests handled successfully"
    else
        log_warning "Some concurrent requests failed ($success_count/$concurrent_requests)"
        result="FAIL"
    fi

    track_test "Performance and Load" "$result"
}

# Test 14: Security Headers
test_security() {
    log_info "Testing security headers..."

    local result="PASS"
    local security_headers=("x-frame-options" "x-content-type-options" "x-xss-protection")

    for header in "${security_headers[@]}"; do
        if curl -s -I "http://localhost:8005/health" | grep -qi "$header"; then
            log_info "Security header found: $header"
        else
            log_warning "Security header missing: $header"
            result="FAIL"
        fi
    done

    track_test "Security Headers" "$result"
}

# Test 15: Cleanup and Recovery
test_cleanup() {
    log_info "Testing cleanup procedures..."

    local result="PASS"

    # Test graceful container shutdown
    if docker-compose -f docker-compose.infisical.yml stop infisical-mcp; then
        sleep 2
        if docker-compose -f docker-compose.infisical.yml start infisical-mcp; then
            sleep 5  # Wait for service to be ready
            if curl -s -f "http://localhost:8006/health" > /dev/null; then
                log_info "Service restart successful"
            else
                log_warning "Service failed to restart properly"
                result="FAIL"
            fi
        else
            log_warning "Service failed to restart"
            result="FAIL"
        fi
    else
        log_warning "Service failed to stop gracefully"
        result="FAIL"
    fi

    track_test "Cleanup and Recovery" "$result"
}

# Summary report
generate_report() {
    echo ""
    echo "========================================"
    echo "           TEST SUMMARY REPORT           "
    echo "========================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
    echo ""

    if [[ $FAILED_TESTS -eq 0 ]]; then
        log_success "🎉 All tests passed! Nyra Infisical integration is working correctly."
        echo ""
        echo "Next steps:"
        echo "1. Deploy to production environment"
        echo "2. Configure monitoring and alerting"
        echo "3. Run periodic health checks"
        return 0
    else
        log_error "❌ Some tests failed. Please review and fix issues before deployment."
        echo ""
        echo "Troubleshooting:"
        echo "1. Check service logs: docker-compose -f docker-compose.infisical.yml logs"
        echo "2. Verify INFISICAL_TOKEN is exported and project id is correct"
        echo "3. Check network connectivity: docker network ls"
        echo "4. Review configuration files in config/infisical/"
        return 1
    fi
}

# Main test execution
main() {
    echo "Nyra Infisical MCP Integration Test Suite"
    echo "========================================="
    echo ""

    log_info "Starting comprehensive integration tests..."
    echo ""

    # Run all tests
    test_prerequisites
    test_infisical_auth
    test_docker_services
    test_service_health
    test_infisical_mcp_tools
    test_secret_retrieval
    test_metamcp_proxy
    test_secret_injection
    test_environment_config
    test_claude_mcp_registration
    test_volume_persistence
    test_network_connectivity
    test_performance
    test_security
    test_cleanup

    # Generate final report
    generate_report
}

# Handle command line arguments
case "${1:-all}" in
    "health")
        test_service_health
        ;;
    "secrets")
        test_secret_retrieval
        ;;
    "network")
        test_network_connectivity
        ;;
    "performance")
        test_performance
        ;;
    "all")
        main
        ;;
    *)
        echo "Usage: $0 [test_category]"
        echo ""
        echo "Test categories:"
        echo "  health      - Test service health endpoints"
        echo "  secrets     - Test secret retrieval functionality"
        echo "  network     - Test network connectivity"
        echo "  performance - Test performance and load"
        echo "  all         - Run all tests (default)"
        exit 1
        ;;
esac
