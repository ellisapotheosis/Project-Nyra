# Bitwarden MCP - CLAUDE.md

**Profile**: nodejs-mcp
**Generated**: 2026-01-16

## 🎯 Project Overview

Bitwarden Secrets Manager MCP Server for secure credential management in Project Nyra.

## 🏗️ Architecture

**Tech Stack**: Node.js 20, TypeScript/JavaScript, MCP SDK, Bitwarden CLI (bws)
**Port**: 8007
**Type**: MCP Server

## 📋 Development Commands

```bash
# Development
npm run dev

# Build
docker build -t nyra-bitwarden-mcp .

# Run
docker-compose -f docker-compose.bitwarden-mcp.yml up -d

# Test
npm test

# Lint
npm run lint
```

## 🧠 Claude Flow Integration

### Available Agents

- security-architect: Security best practices and token management
- backend-dev: MCP server implementation and BWS integration
- reviewer: Code review and security audits

### Recommended Workflows

- MCP tool development
- Security integration
- Secret management
- Token rotation
- Audit logging

## 🔐 Security Considerations

### Best Practices for AI Agents

1. **Token Management**:
   - Never expose BWS_ACCESS_TOKEN in logs or responses
   - Use environment variables for token storage
   - Rotate tokens regularly

2. **Secret Retrieval**:
   - Always validate secret UUIDs
   - Use project-scoped access when possible
   - Log all secret access attempts

3. **Error Handling**:
   - Don't expose secret values in error messages
   - Sanitize all error outputs
   - Implement rate limiting for failed attempts

4. **Audit Trail**:
   - Log all tool invocations
   - Track secret access patterns
   - Monitor for anomalous behavior

### When to Use This MCP

Use the Bitwarden MCP server when:
- Retrieving sensitive credentials (API keys, database URLs, tokens)
- Managing secrets programmatically
- Rotating credentials
- Auditing secret access
- Integrating with enterprise secret management

Avoid using for:
- Non-sensitive configuration values (use Infisical instead)
- Temporary development secrets (use .env.local)
- Public API endpoints or documentation

---

## 🛠️ Tech Stack Specific Guidelines

## Node.js MCP Server Development Guidelines

### MCP Server Structure
```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'bitwarden-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);
```

### Tool Definition with Validation
```javascript
import { z } from 'zod';

const GetSecretSchema = z.object({
  secretId: z.string().uuid('Invalid secret UUID'),
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_secret',
      description: 'Retrieve a secret by ID',
      inputSchema: {
        type: 'object',
        properties: {
          secretId: {
            type: 'string',
            pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
          },
        },
        required: ['secretId'],
      },
    }
  ]
}));
```

### Secure CLI Execution
```javascript
import { spawn } from 'child_process';

async function executeBwsCommand(args) {
  return new Promise((resolve, reject) => {
    const bws = spawn('bws', args, {
      env: {
        ...process.env,
        BWS_ACCESS_TOKEN, // Never log this!
      },
    });

    let stdout = '';
    bws.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    bws.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('BWS command failed'));
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
}
```

### Error Handling
```javascript
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

try {
  const result = await executeBwsCommand(['secret', 'get', secretId]);
  return { content: [{ type: 'text', text: JSON.stringify(result) }] };
} catch (error) {
  if (error instanceof z.ZodError) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Validation error: ${error.message}`
    );
  }
  throw new McpError(
    ErrorCode.InternalError,
    'Tool execution failed'
  );
}
```

### Docker Best Practices

1. **Multi-stage Build**: Minimize image size
2. **Non-root User**: Run as UID 1000 for security
3. **Health Checks**: Implement proper health endpoints
4. **Secret Management**: Use tmpfs for volatile secrets
5. **Logging**: Structured logging with log levels

### Testing Strategies

1. **Unit Tests**: Test each tool independently
2. **Integration Tests**: Test BWS CLI integration
3. **Security Tests**: Validate token handling
4. **Error Tests**: Test all error conditions
5. **Mock Tests**: Mock BWS responses for CI/CD

---

## 📝 Notes

- Bitwarden Secrets Manager integration for Project Nyra
- Secure credential management via MCP protocol
- Enterprise-grade secret storage with audit trails
- Compatible with Claude Code and other MCP clients

## 🔗 References

- [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/)
- [Bitwarden CLI Documentation](https://bitwarden.com/help/secrets-manager-cli/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/sdk)
