# Bitwarden MCP Server Test Suite

Comprehensive tests for validating the Bitwarden MCP integration.

## Quick Start

```bash
# Run all tests
node test/test-secrets.js

# Or using npm
npm test
```

## Prerequisites

1. Docker and Docker Compose installed
2. Bitwarden MCP container running:
   ```bash
   docker-compose -f docker-compose.bitwarden-mcp.yml up -d
   ```
3. Valid BWS_ACCESS_TOKEN configured
4. Node.js 20+ installed

## Test Coverage

### Critical Tests

These tests must pass for the system to be production-ready:

1. **Container Running** - Verifies Docker container is active
2. **BWS CLI Installation** - Confirms BWS binary is available
3. **Environment Variables** - Validates BWS_ACCESS_TOKEN is set
4. **MCP List Tools** - Tests MCP protocol responds correctly
5. **BWS Authentication** - Validates token authentication works
6. **Input Validation** - Tests Zod schema validation

### Non-Critical Tests

These tests provide additional validation but won't block deployment:

7. **Container Health** - Checks Docker health check status
8. **Error Handling** - Validates error responses
9. **Container Logs** - Scans for unexpected errors
10. **Docker Networking** - Verifies network configuration

## Test Output

### Success

```
=============================================================
🔒 Bitwarden MCP Server Test Suite
=============================================================

ℹ Testing container status...
✓ Container is running

ℹ Testing container health...
✓ Container is healthy

...

=============================================================

📊 Test Results: 10 passed, 0 failed

✓ All tests passed! Bitwarden MCP server is ready.
```

### Failure

```
ℹ Testing BWS authentication...
✗ BWS authentication failed: Authentication failed
⚠ Make sure BWS_ACCESS_TOKEN is valid and not expired

...

=============================================================

📊 Test Results: 8 passed, 2 failed

✗ Critical tests failed. Please fix before deploying.
```

## Manual Testing

### Test Secret Retrieval

```bash
# List available tools
docker exec -i nyra-bitwarden-mcp node -e "
process.stdin.write('{\"jsonrpc\":\"2.0\",\"method\":\"tools/list\",\"id\":1}\\n')
" | tail -1 | jq

# List projects
docker exec nyra-bitwarden-mcp bws project list

# List secrets (requires project ID)
docker exec nyra-bitwarden-mcp bws secret list --project-id "YOUR-PROJECT-ID"

# Get specific secret (requires secret ID)
docker exec nyra-bitwarden-mcp bws secret get "YOUR-SECRET-ID"
```

### Test MCP Protocol

```bash
# Test get_secret tool
echo '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_secret",
    "arguments": {
      "secretId": "YOUR-SECRET-ID"
    }
  },
  "id": 1
}' | docker exec -i nyra-bitwarden-mcp node /app/src/index.js
```

### Test Health Endpoint

```bash
# HTTP health check
curl http://localhost:8007/health

# Docker health check
docker inspect --format='{{.State.Health.Status}}' nyra-bitwarden-mcp
```

## Troubleshooting

### Tests Fail Immediately

**Problem**: Container not running
```bash
# Check if container exists
docker ps -a | grep bitwarden-mcp

# Start container if stopped
docker-compose -f docker-compose.bitwarden-mcp.yml up -d

# Check logs for startup errors
docker logs nyra-bitwarden-mcp
```

### Authentication Failures

**Problem**: BWS_ACCESS_TOKEN invalid
```bash
# Verify token is set
docker exec nyra-bitwarden-mcp env | grep BWS_ACCESS_TOKEN

# Test token manually
docker exec nyra-bitwarden-mcp bws project list

# Generate new token if needed
# 1. Go to Bitwarden Web Vault
# 2. Organizations → Settings → Machine Accounts
# 3. Create new machine account and copy token
```

### MCP Protocol Errors

**Problem**: JSON-RPC not responding
```bash
# Check if Node.js is installed
docker exec nyra-bitwarden-mcp node --version

# Check if MCP SDK is installed
docker exec nyra-bitwarden-mcp npm list @modelcontextprotocol/sdk

# Rebuild container if dependencies missing
docker-compose -f docker-compose.bitwarden-mcp.yml up -d --build
```

### Network Issues

**Problem**: Cannot connect to container
```bash
# Check network configuration
docker network ls | grep nyra

# Inspect container networking
docker inspect nyra-bitwarden-mcp | jq '.[0].NetworkSettings'

# Verify port mapping
docker port nyra-bitwarden-mcp
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Bitwarden MCP

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start Bitwarden MCP
        env:
          BWS_ACCESS_TOKEN: ${{ secrets.BWS_ACCESS_TOKEN }}
        run: |
          docker-compose -f docker-compose.bitwarden-mcp.yml up -d
          sleep 10  # Wait for startup

      - name: Run tests
        run: node mcp-servers/bitwarden-mcp/test/test-secrets.js

      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.bitwarden-mcp.yml down
```

### Docker Compose Test Profile

```yaml
# docker-compose.bitwarden-mcp.yml
services:
  bitwarden-mcp-test:
    extends: bitwarden-mcp
    profiles:
      - test
    environment:
      - NODE_ENV=test
      - LOG_LEVEL=debug
      - BWS_ACCESS_TOKEN=${TEST_BWS_ACCESS_TOKEN}
```

Run with:
```bash
docker-compose --profile test -f docker-compose.bitwarden-mcp.yml up -d
node test/test-secrets.js
docker-compose --profile test -f docker-compose.bitwarden-mcp.yml down
```

## Performance Testing

### Load Test

```bash
# Install wrk if not available
# sudo apt-get install wrk

# Run load test on MCP endpoint
wrk -t4 -c10 -d30s --latency http://localhost:8007/health
```

### Secret Retrieval Benchmark

```javascript
// benchmark.js
async function benchmark() {
  const iterations = 100;
  const start = Date.now();

  for (let i = 0; i < iterations; i++) {
    await getSecret('test-secret-id');
  }

  const duration = Date.now() - start;
  console.log(`${iterations} requests in ${duration}ms`);
  console.log(`Average: ${duration/iterations}ms per request`);
}
```

## Security Testing

### Token Validation

```bash
# Test with invalid token
docker exec -e BWS_ACCESS_TOKEN="invalid" nyra-bitwarden-mcp bws project list
# Should fail with authentication error

# Test with expired token
# Should return 401 Unauthorized
```

### Input Fuzzing

```bash
# Test with malformed UUIDs
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_secret","arguments":{"secretId":"malformed"}},"id":1}' | \
  docker exec -i nyra-bitwarden-mcp node /app/src/index.js

# Should return validation error
```

## References

- [Bitwarden MCP Documentation](../../docs/deployment/BITWARDEN-MCP-SETUP.md)
- [BWS CLI Guide](https://bitwarden.com/help/secrets-manager-cli/)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
