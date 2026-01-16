# Cloudflare Tunnel Validation Suite

Comprehensive testing suite for validating Cloudflare tunnel connectivity, DNS resolution, service accessibility, performance, and security in Project Nyra's 4-PC distributed architecture.

## Overview

This validation suite provides automated testing for:
- **Tunnel Connectivity**: Verify cloudflared connections and status
- **DNS Resolution**: Test public domain resolution and propagation
- **Service Accessibility**: Validate HTTPS endpoints and SSL certificates
- **Failover Handling**: Test tunnel resilience and recovery
- **Access Policy Enforcement**: Verify authentication and authorization
- **Performance**: Measure latency, throughput, and concurrent connections
- **Security**: Test SSL/TLS configuration, security headers, and attack prevention

## Test Scripts

### Bash Script (Linux/macOS/WSL)
```bash
./test-cloudflare-tunnels.sh [OPTIONS]
```

### PowerShell Script (Windows)
```powershell
.\test-cloudflare-tunnels.ps1 [OPTIONS]
```

## Quick Start

### Run All Tests
```bash
# Linux/macOS/WSL
./test-cloudflare-tunnels.sh --all

# Windows PowerShell
.\test-cloudflare-tunnels.ps1 -All
```

### Run Specific Test Suites
```bash
# Performance and security tests only
./test-cloudflare-tunnels.sh --performance --security

# Windows
.\test-cloudflare-tunnels.ps1 -Performance -Security
```

## Test Scenarios

### 1. Tunnel Creation and Connection

**Objective**: Verify cloudflared containers can establish connections to Cloudflare's edge

**Test Cases**:
- Container startup and health checks
- Tunnel authentication with token
- Edge connection registration
- Tunnel ID extraction and logging
- Connection persistence

**Expected Results**:
- Container status: `running`
- Tunnel logs contain: `Connection.*registered`
- Tunnel ID extracted successfully
- Connection remains stable for test duration

**Example**:
```bash
./test-cloudflare-tunnels.sh --connectivity
```

---

### 2. Service Exposure Through Tunnels

**Objective**: Validate that internal services are accessible through public tunnel URLs

**Test Cases**:
- HTTP/HTTPS endpoint accessibility
- Health check responses (200/204)
- SSL/TLS certificate validation
- Response headers verification
- Service routing accuracy

**Expected Results**:
- Public URLs resolve correctly
- Health endpoints return 200/204
- SSL certificates are valid
- Correct backend service responses

**Example**:
```bash
./test-cloudflare-tunnels.sh --accessibility
```

---

### 3. Failover and Resilience

**Objective**: Test tunnel recovery and high availability capabilities

**Test Cases**:
- Graceful container restart
- Automatic reconnection after interruption
- Multiple tunnel coordination
- Port conflict detection
- Connection state persistence

**Expected Results**:
- Tunnel reconnects within 30 seconds after restart
- No data loss during failover
- Multiple tunnels run without conflicts
- Services remain accessible during recovery

**Example**:
```bash
./test-cloudflare-tunnels.sh --failover
```

**Manual Failover Test**:
```bash
# Terminal 1: Monitor tunnel logs
docker logs -f nyra-cloudflared-orchestrator

# Terminal 2: Restart tunnel
docker restart nyra-cloudflared-orchestrator

# Terminal 3: Test accessibility
watch -n 1 'curl -s https://nyra-orchestrator.yourdomain.com/health'
```

---

### 4. Access Policy Enforcement

**Objective**: Verify authentication, authorization, and rate limiting

**Test Cases**:
- Unauthorized access attempts (401/403)
- Protected endpoint security
- API key validation
- Rate limiting enforcement
- Sensitive path protection

**Expected Results**:
- Unauthorized requests return 401/403
- Valid API keys grant access
- Rate limiting triggers after threshold
- Admin/internal paths are protected
- Sensitive files not exposed

**Example**:
```bash
# Set API key for authorized tests
export API_KEY="your-api-key"
./test-cloudflare-tunnels.sh --access
```

**Manual Access Policy Tests**:
```bash
# Test unauthorized access
curl -i https://nyra-orchestrator.yourdomain.com/admin
# Expected: 401 or 403

# Test with API key
curl -i -H "Authorization: Bearer $API_KEY" \
  https://nyra-orchestrator.yourdomain.com/health
# Expected: 200

# Test rate limiting
for i in {1..100}; do
  curl -s https://nyra-orchestrator.yourdomain.com/health &
done
wait
# Expected: Some requests return 429 Too Many Requests
```

---

### 5. DNS Resolution and Propagation

**Objective**: Validate DNS configuration and global propagation

**Test Cases**:
- A record resolution
- AAAA record (IPv6) resolution
- Cloudflare IP range verification
- Multi-resolver consistency
- DNS propagation timing

**Expected Results**:
- All tunnel domains resolve correctly
- IPs are in Cloudflare ranges
- Consistent resolution across resolvers
- TTL values are appropriate

**Example**:
```bash
./test-cloudflare-tunnels.sh --dns
```

**Manual DNS Tests**:
```bash
# Test A record
dig +short nyra-orchestrator.yourdomain.com @1.1.1.1

# Test AAAA record
dig +short AAAA nyra-orchestrator.yourdomain.com @1.1.1.1

# Test propagation across resolvers
for resolver in 1.1.1.1 8.8.8.8 9.9.9.9; do
  echo "Resolver: $resolver"
  dig +short nyra-orchestrator.yourdomain.com @$resolver
done

# Check DNS propagation globally
curl "https://www.whatsmydns.net/api/query?query=nyra-orchestrator.yourdomain.com&type=A&server=world"
```

---

### 6. Performance Testing

**Objective**: Measure tunnel performance characteristics

**Test Metrics**:
- **Latency**: Average, min, max response times
- **Throughput**: Requests per second
- **Concurrent Connections**: Success rate under load
- **Bandwidth**: Download/upload speeds

**Test Cases**:
- Single request latency (10 iterations)
- Load testing (100 requests)
- Concurrent connections (20 simultaneous)
- Sustained traffic (10 seconds)

**Performance Thresholds**:
- Average latency: < 200ms (excellent), < 500ms (good)
- Success rate: > 99% under load
- Concurrent connections: 100% success

**Example**:
```bash
# Full performance suite
./test-cloudflare-tunnels.sh --performance

# Custom iterations
PERFORMANCE_ITERATIONS=50 ./test-cloudflare-tunnels.sh --performance
```

**Manual Performance Tests**:
```bash
# Apache Bench (if installed)
ab -n 1000 -c 50 https://nyra-orchestrator.yourdomain.com/health

# wrk (if installed)
wrk -t4 -c50 -d30s https://nyra-orchestrator.yourdomain.com/health

# Simple latency test
time curl -s https://nyra-orchestrator.yourdomain.com/health
```

---

### 7. Security Validation

**Objective**: Verify security configurations and protections

**Test Cases**:
- SSL/TLS version and cipher strength
- HTTP security headers
- Sensitive path protection
- SQL injection prevention
- XSS protection
- Port exposure analysis

**Security Headers Checked**:
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Content-Security-Policy`

**Expected Results**:
- TLS 1.2+ enforced
- Strong cipher suites only
- All security headers present
- Sensitive paths return 401/403/404
- Injection attacks blocked

**Example**:
```bash
./test-cloudflare-tunnels.sh --security
```

**Manual Security Tests**:
```bash
# Test SSL/TLS configuration
openssl s_client -connect nyra-orchestrator.yourdomain.com:443 \
  -servername nyra-orchestrator.yourdomain.com

# Check security headers
curl -I https://nyra-orchestrator.yourdomain.com

# Test sensitive paths
curl -I https://nyra-orchestrator.yourdomain.com/.env
curl -I https://nyra-orchestrator.yourdomain.com/admin

# SSL Labs test (online)
# https://www.ssllabs.com/ssltest/analyze.html?d=nyra-orchestrator.yourdomain.com
```

---

### 8. End-to-End Integration Test

**Objective**: Validate complete tunnel lifecycle from setup to cleanup

**Test Flow**:
1. **Setup**: Verify Docker Compose configuration
2. **Start**: Launch all services and cloudflared containers
3. **Connect**: Wait for tunnel registration
4. **Access**: Test public endpoint accessibility
5. **Health Check**: Verify all services are healthy
6. **Cleanup**: Stop and remove containers (optional)

**Expected Results**:
- Configuration is valid
- All containers start successfully
- Tunnel connects within 60 seconds
- Services accessible through tunnel
- Health checks pass
- Clean shutdown (if enabled)

**Example**:
```bash
# Full integration test with cleanup
./test-cloudflare-tunnels.sh --integration

# Integration test without cleanup (leave services running)
INTEGRATION_CLEANUP=false ./test-cloudflare-tunnels.sh --integration
```

---

## Configuration Options

### Environment Variables

```bash
# Docker Compose file path
export COMPOSE_FILE="/path/to/docker-compose.infisical.yml"

# Test results directory
export TEST_RESULTS_DIR="/path/to/results"

# Cloudflare tunnel token
export CLOUDFLARED_TOKEN="your-tunnel-token"

# Public URLs for testing
export ORCHESTRATOR_PUBLIC_URL="https://nyra-orchestrator.yourdomain.com"
export WORKER1_PUBLIC_URL="https://nyra-worker-1.yourdomain.com"
export WORKER2_PUBLIC_URL="https://nyra-worker-2.yourdomain.com"
export WORKER3_PUBLIC_URL="https://nyra-worker-3.yourdomain.com"

# API key for authorized tests
export API_KEY="your-api-key"

# Test parameters
export TIMEOUT_SECONDS=30
export RETRY_COUNT=3
export PERFORMANCE_ITERATIONS=10
export CONCURRENT_REQUESTS=20

# Integration test cleanup
export INTEGRATION_CLEANUP=true
```

### Command-Line Options (Bash)

```
--all              Run all test suites (default)
--prerequisites    Run prerequisite checks only
--docker           Run Docker service tests
--connectivity     Run tunnel connectivity tests
--dns              Run DNS resolution tests
--accessibility    Run service accessibility tests
--failover         Run failover and resilience tests
--access           Run access policy enforcement tests
--performance      Run performance tests
--security         Run security tests
--integration      Run end-to-end integration test
--help, -h         Show help message
```

### PowerShell Parameters

```powershell
-All               # Run all test suites (default)
-Prerequisites     # Run prerequisite checks only
-Docker            # Run Docker service tests
-Connectivity      # Run tunnel connectivity tests
-DNS               # Run DNS resolution tests
-Accessibility     # Run service accessibility tests
-Failover          # Run failover and resilience tests
-Access            # Run access policy enforcement tests
-Performance       # Run performance tests
-Security          # Run security tests
-Integration       # Run end-to-end integration test
-ComposeFile       # Path to docker-compose file
-TestResultsDir    # Directory for test results
```

## Test Results and Reporting

### Output Files

All test results are saved to the test results directory (default: `./tests/results/cloudflare-tunnels/`):

- **Log Files**: `test-run-YYYYMMDD-HHMMSS.log`
- **JSON Reports**: `test-report-YYYYMMDD-HHMMSS.json`
- **HTML Reports**: `test-report-YYYYMMDD-HHMMSS.html`
- **Performance Metrics**: `latency-metrics.csv`, `throughput-metrics.csv`

### Report Format

**Console Output**:
```
╔════════════════════════════════════════════════════════╗
║           CLOUDFLARE TUNNEL TEST RESULTS              ║
╠════════════════════════════════════════════════════════╣
║ Total Tests:     45                                   ║
║ Passed:          42                                   ║
║ Failed:          1                                    ║
║ Skipped:         2                                    ║
║ Success Rate:    93.33%                               ║
╚════════════════════════════════════════════════════════╝
```

**JSON Report**:
```json
{
  "timestamp": "2026-01-15T20:00:00Z",
  "test_suite": "Cloudflare Tunnel Validation",
  "version": "1.0.0",
  "summary": {
    "total_tests": 45,
    "passed": 42,
    "failed": 1,
    "skipped": 2,
    "success_rate": 93.33
  },
  "environment": {
    "os": "Linux",
    "docker_version": "24.0.7",
    "compose_version": "2.23.0"
  },
  "log_file": "/path/to/test-run.log",
  "results_directory": "/path/to/results"
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Cloudflare Tunnel Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  test-tunnels:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up environment
        run: |
          echo "CLOUDFLARED_TOKEN=${{ secrets.CLOUDFLARED_TOKEN }}" >> $GITHUB_ENV
          echo "ORCHESTRATOR_PUBLIC_URL=https://nyra-orchestrator.yourdomain.com" >> $GITHUB_ENV

      - name: Run tunnel tests
        run: |
          chmod +x bootstrap/scripts/validation/test-cloudflare-tunnels.sh
          ./bootstrap/scripts/validation/test-cloudflare-tunnels.sh --all

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: tunnel-test-results
          path: tests/results/cloudflare-tunnels/
```

## Troubleshooting

### Common Issues

**1. "Docker daemon is not running"**
```bash
# Linux
sudo systemctl start docker

# macOS
open -a Docker

# Windows
# Start Docker Desktop
```

**2. "Tunnel connection timeout"**
```bash
# Check tunnel logs
docker logs nyra-cloudflared-orchestrator

# Verify tunnel token
echo $CLOUDFLARED_TOKEN

# Test manual connection
docker run cloudflare/cloudflared:latest tunnel run --token $CLOUDFLARED_TOKEN
```

**3. "DNS resolution failed"**
```bash
# Verify domain configuration in Cloudflare dashboard
# Check DNS propagation
dig +short nyra-orchestrator.yourdomain.com @1.1.1.1

# Test with different resolvers
dig +short nyra-orchestrator.yourdomain.com @8.8.8.8
```

**4. "Service unreachable through tunnel"**
```bash
# Check service is running locally
docker ps | grep nyra-orchestrator

# Test local connectivity
curl http://localhost:8000/health

# Verify tunnel routing
docker logs nyra-cloudflared-orchestrator | grep -i "route"
```

**5. "SSL certificate errors"**
```bash
# Check certificate validity
openssl s_client -connect nyra-orchestrator.yourdomain.com:443

# Verify Cloudflare SSL mode (should be "Full" or "Full (strict)")
# In Cloudflare dashboard: SSL/TLS → Overview
```

## Best Practices

1. **Run tests before production deployment**
   ```bash
   ./test-cloudflare-tunnels.sh --all
   ```

2. **Schedule regular health checks**
   ```bash
   # Add to crontab
   0 */6 * * * /path/to/test-cloudflare-tunnels.sh --connectivity --accessibility
   ```

3. **Monitor performance trends**
   - Save performance metrics to a time-series database
   - Set up alerts for latency > 500ms
   - Track success rate over time

4. **Security scanning**
   ```bash
   # Weekly security audits
   ./test-cloudflare-tunnels.sh --security
   ```

5. **Integration testing in CI/CD**
   - Run on every merge to main
   - Test in staging before production
   - Use separate tunnel tokens for testing

## Dependencies

### Required
- Docker (20.10+)
- Docker Compose (2.0+)
- curl
- jq (JSON processing)
- dig/nslookup (DNS queries)

### Optional (Enhanced Testing)
- Apache Bench (`ab`) - HTTP benchmarking
- wrk - Modern load testing
- nmap - Security scanning
- cloudflared - Local tunnel testing
- openssl - SSL/TLS validation

### Installation

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose curl jq dnsutils apache2-utils
```

**macOS**:
```bash
brew install docker docker-compose curl jq dig apache-bench
```

**Windows** (PowerShell as Administrator):
```powershell
# Install chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install dependencies
choco install docker-desktop curl jq
```

## Support

For issues or questions:
- **Documentation**: `docs/deployment/cloudflare-tunnels.md`
- **Issues**: GitHub Issues
- **Logs**: Check `tests/results/cloudflare-tunnels/` for detailed logs

## Version History

- **1.0.0** (2026-01-15): Initial release
  - Comprehensive test coverage
  - Performance benchmarking
  - Security validation
  - Cross-platform support (Bash + PowerShell)

## License

Part of Project Nyra - See main repository LICENSE file.
