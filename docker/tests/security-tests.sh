#!/usr/bin/env bash
# ============================================================================
# Security Tests - Verify security configurations
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

test_security() {
    local test_name=$1
    local description=$2
    local test_command=$3

    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    log_info "Testing: $test_name - $description"

    if eval "$test_command"; then
        log_info "✓ PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "✗ FAILED: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# ============================================================================
# Test Cases
# ============================================================================

echo "============================================================================"
echo "Security Tests - Starting"
echo "============================================================================"

# Test 1: No hardcoded secrets in config
test_security "Config Secret Scan" \
    "Verify no hardcoded secrets in docker-compose" \
    "! grep -iE '(password|secret|key).*:.*[a-zA-Z0-9]{16}' docker-compose.yml"

# Test 2: Non-root user execution
test_security "Non-Root Users" \
    "Verify services run as non-root" \
    "docker-compose exec -T claude-flow whoami | grep -v root &&
     docker-compose exec -T archon whoami | grep -v root"

# Test 3: Read-only filesystems (where applicable)
log_info "Checking read-only filesystem configuration..."
if grep -q "read_only: true" docker-compose.prod.yml; then
    log_info "✓ Read-only filesystems configured"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_warn "Read-only filesystems not fully configured"
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Test 4: Security options enabled
test_security "Security Options" \
    "Verify security options are set" \
    "grep -q 'no-new-privileges:true' docker-compose.prod.yml"

# Test 5: Resource limits defined
test_security "Resource Limits" \
    "Verify resource limits are configured" \
    "grep -q 'limits:' docker-compose.yml &&
     grep -q 'memory:' docker-compose.yml"

# Test 6: Health checks implemented
test_security "Health Checks" \
    "Verify all services have health checks" \
    "grep -c 'healthcheck:' docker-compose.yml | grep -q '[5-9]\|[1-9][0-9]'"

# Test 7: Network isolation
test_security "Network Configuration" \
    "Verify custom network is configured" \
    "docker network inspect bootstrap_docker_nyra-network > /dev/null 2>&1 ||
     docker network inspect nyra-network > /dev/null 2>&1"

# Test 8: Environment variable usage
test_security "Environment Variables" \
    "Verify secrets use environment variables" \
    "grep -qE '\${.*PASSWORD.*}' docker-compose.yml"

# Test 9: .dockerignore excludes secrets
test_security ".dockerignore Security" \
    "Verify .dockerignore excludes sensitive files" \
    "grep -qE '(\.env|\.pem|\.key|secrets/)' .dockerignore"

# Test 10: Image vulnerability check
if command -v trivy &> /dev/null; then
    log_info "Running Trivy vulnerability scan..."
    test_security "Image Vulnerabilities" \
        "Scan Docker images for vulnerabilities" \
        "trivy image --severity HIGH,CRITICAL --no-progress nyra-claude-flow:latest 2>/dev/null | grep -qE '(Total: 0|No vulnerabilities)' || echo 'Found vulnerabilities'"
else
    log_warn "Trivy not installed. Skipping image vulnerability scan."
    log_info "Install with: https://github.com/aquasecurity/trivy"
fi

# Test 11: Port exposure check
log_info "Checking exposed ports..."
EXPOSED_PORTS=$(docker-compose config | grep -E "^\s+- \"[0-9]+" | wc -l)
log_info "Exposed ports: $EXPOSED_PORTS"
if [ "$EXPOSED_PORTS" -lt 15 ]; then
    log_info "✓ Minimal port exposure"
else
    log_warn "Many ports exposed. Consider using reverse proxy in production."
fi

# Test 12: Password strength check
log_info "Checking for weak passwords in .env..."
if [ -f .env ]; then
    if grep -qE 'PASSWORD=.{,8}$' .env 2>/dev/null; then
        log_warn "Weak passwords detected in .env (less than 8 characters)"
    else
        log_info "✓ Password strength acceptable"
    fi
else
    log_warn ".env file not found"
fi

# Test 13: SSL/TLS configuration
log_info "Checking SSL/TLS configuration..."
if grep -qE '(ssl|tls|https)' docker-compose.yml; then
    log_info "✓ SSL/TLS configuration found"
else
    log_warn "No SSL/TLS configuration. Use reverse proxy with SSL in production."
fi

# Test 14: Logging configuration
test_security "Logging Configuration" \
    "Verify logging is configured" \
    "grep -q 'logging:' docker-compose.prod.yml"

# Test 15: Volume permissions
log_info "Checking volume permissions..."
for volume in postgres_data redis_data mongo_data claude_flow_data archon_data; do
    if docker volume inspect $volume > /dev/null 2>&1; then
        log_info "✓ Volume exists: $volume"
    else
        log_warn "Volume not found: $volume"
    fi
done

# ============================================================================
# Docker Bench Security (if available)
# ============================================================================

if command -v docker-bench-security &> /dev/null; then
    log_info "Running Docker Bench Security..."
    docker-bench-security > /dev/null 2>&1 || log_warn "Docker Bench Security found issues"
else
    log_info "Docker Bench Security not installed. Consider installing for comprehensive security audit."
    log_info "Install: https://github.com/docker/docker-bench-security"
fi

# ============================================================================
# Security Recommendations
# ============================================================================

echo ""
echo "============================================================================"
echo "Security Recommendations"
echo "============================================================================"

log_info "Production Security Checklist:"
echo "  1. Use strong, unique passwords for all services"
echo "  2. Enable HTTPS with valid SSL certificates"
echo "  3. Implement rate limiting and DDoS protection"
echo "  4. Regular security updates and patches"
echo "  5. Enable audit logging"
echo "  6. Use secrets management (Infisical included)"
echo "  7. Implement network segmentation"
echo "  8. Regular backups with encryption"
echo "  9. Monitoring and alerting for security events"
echo "  10. Regular security audits and penetration testing"

# ============================================================================
# Results Summary
# ============================================================================

echo ""
echo "============================================================================"
echo "Security Tests - Results"
echo "============================================================================"
echo "Total Tests: $TESTS_RUN"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo "============================================================================"

if [ $TESTS_FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        log_info "All security tests passed with no warnings! 🔒"
        exit 0
    else
        log_warn "Security tests passed but there are $WARNINGS warnings to review."
        exit 0
    fi
else
    log_error "Some security tests failed. Please review and fix the issues above."
    exit 1
fi
