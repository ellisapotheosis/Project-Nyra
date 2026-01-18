# Bitwarden MCP - Quick Start Guide

## 5-Minute Setup

### 1. Get BWS Access Token

```bash
# Visit Bitwarden Web Vault
open https://vault.bitwarden.com

# Navigate to: Organizations → Settings → Machine Accounts → New Machine Account
# Copy the access token (shown only once!)
```

### 2. Configure Environment

```bash
# Set your token
export BWS_ACCESS_TOKEN="0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Verify it works
docker run --rm -e BWS_ACCESS_TOKEN bitwarden/bws project list
```

### 3. Start the MCP Server

```bash
# Start container
docker-compose -f docker-compose.bitwarden-mcp.yml up -d

# Wait 10 seconds for startup
sleep 10

# Check status
docker ps | grep bitwarden-mcp
docker logs nyra-bitwarden-mcp
```

### 4. Test the Integration

```bash
# Run automated tests
cd mcp-servers/bitwarden-mcp
npm test

# Or run manually
node test/test-secrets.js
```

## Common Commands

### Docker Operations

```bash
# Start
docker-compose -f docker-compose.bitwarden-mcp.yml up -d

# Stop
docker-compose -f docker-compose.bitwarden-mcp.yml down

# Restart
docker-compose -f docker-compose.bitwarden-mcp.yml restart

# View logs
docker logs -f nyra-bitwarden-mcp

# Shell into container
docker exec -it nyra-bitwarden-mcp sh
```

### BWS Commands

```bash
# List projects
docker exec nyra-bitwarden-mcp bws project list

# List secrets in a project
docker exec nyra-bitwarden-mcp bws secret list --project-id "YOUR-PROJECT-ID"

# Get a specific secret
docker exec nyra-bitwarden-mcp bws secret get "YOUR-SECRET-ID"

# Create a secret
docker exec nyra-bitwarden-mcp bws secret create \
  "API_KEY" \
  "secret-value-here" \
  --project-id "YOUR-PROJECT-ID"
```

### MCP Protocol Testing

```bash
# List available tools
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
  docker exec -i nyra-bitwarden-mcp node /app/src/index.js | \
  jq

# Get a secret via MCP
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
}' | docker exec -i nyra-bitwarden-mcp node /app/src/index.js | jq
```

## Troubleshooting

### Issue: Container won't start

```bash
# Check if token is set
docker exec nyra-bitwarden-mcp env | grep BWS_ACCESS_TOKEN

# View startup logs
docker logs nyra-bitwarden-mcp

# Rebuild if needed
docker-compose -f docker-compose.bitwarden-mcp.yml up -d --build
```

### Issue: Authentication failed

```bash
# Test token manually
docker exec nyra-bitwarden-mcp bws project list

# If it fails, regenerate token:
# 1. Go to Bitwarden Web Vault
# 2. Organizations → Settings → Machine Accounts
# 3. Delete old account and create new one
# 4. Update BWS_ACCESS_TOKEN in docker-compose file
```

### Issue: MCP not responding

```bash
# Check if Node.js is working
docker exec nyra-bitwarden-mcp node --version

# Check if MCP dependencies installed
docker exec nyra-bitwarden-mcp npm list @modelcontextprotocol/sdk

# Restart container
docker-compose -f docker-compose.bitwarden-mcp.yml restart
```

## Security Checklist

- [ ] BWS_ACCESS_TOKEN not committed to git
- [ ] Token stored in secure secret management
- [ ] Machine account has minimal required permissions
- [ ] Token rotation scheduled (every 90 days)
- [ ] Audit logging enabled
- [ ] Container runs as non-root user
- [ ] Secrets volume uses tmpfs (encrypted RAM)
- [ ] Network isolated from untrusted services

## Next Steps

1. Read [BITWARDEN-MCP-SETUP.md](../../docs/deployment/BITWARDEN-MCP-SETUP.md) for full documentation
2. Configure your Claude Desktop to use this MCP server
3. Set up monitoring and alerts
4. Configure project-specific machine accounts
5. Integrate with your CI/CD pipeline

## File Structure

```
mcp-servers/bitwarden-mcp/
├── Dockerfile                  # Multi-stage build with BWS
├── docker-compose.yml         # (Root) Service definition
├── package.json               # Node.js dependencies
├── src/
│   └── index.js               # MCP server implementation
├── test/
│   ├── test-secrets.js        # Automated test suite
│   ├── README.md              # Test documentation
│   └── .env.example           # Test configuration
├── scripts/                   # Utility scripts
├── CLAUDE.md                  # Component-specific guide
├── QUICKSTART.md             # This file
└── README.md                  # Project README
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_secret` | Retrieve a secret by UUID |
| `list_secrets` | List all secrets (optionally filtered by project) |
| `create_secret` | Create a new secret |
| `update_secret` | Update an existing secret |
| `delete_secrets` | Delete one or more secrets |
| `list_projects` | List all projects |

## References

- [Full Setup Guide](../../docs/deployment/BITWARDEN-MCP-SETUP.md)
- [Test Documentation](test/README.md)
- [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/)
- [MCP Protocol](https://modelcontextprotocol.io/)
