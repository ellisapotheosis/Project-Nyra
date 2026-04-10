# Git MCP - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ SPAWN AND WAIT PATTERN

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
npx @archon-os/cli@latest memory search --query '[keywords]' --namespace patterns
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI COMMANDS & 🚀 AVAILABLE AGENTS & 🪝 V3 HOOKS SYSTEM

```bash
npx @archon-os/cli@latest swarm init/status
npx @archon-os/cli@latest memory store/search/retrieve
npx @archon-os/cli@latest hooks pre-task/post-task/post-edit
```

Agents: `backend-dev`, `api-docs`, `reviewer`, `mcp-specialist`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @archon-os/cli@latest memory store --key "git-mcp-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "git operations mcp" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

**Profile**: nodejs-mcp
**Generated**: 2026-01-16

## 🎯 Project Overview

Model Context Protocol server providing Git operations with Docker workspace bind mounting

## 🏗️ Architecture

**Tech Stack**: Node.js, TypeScript, MCP SDK, simple-git
**Port**: N/A (stdio)
**Type**: MCP Server
**Deployment**: Docker with bind mount

## 📋 Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Lint
npm run lint

# Docker build
docker-compose build

# Docker run
docker-compose up -d
```

## 🧠 Claude Flow Integration

### Available Agents

- backend-dev
- api-docs
- reviewer

### Recommended Workflows

- Git operations automation
- Version control integration
- Repository management
- CI/CD integration

---

## 🛠️ Tech Stack Specific Guidelines

## Node.js MCP Server Development Guidelines

### MCP Server Structure
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'my-mcp-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);
```

### Tool Definition
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'process_data',
      description: 'Process data with custom logic',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        },
        required: ['input']
      }
    }
  ]
}));
```

### Tool Implementation
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'process_data') {
    const { input } = request.params.arguments;
    const result = await processData(input);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    };
  }
  throw new Error('Unknown tool');
});
```

### Error Handling
- Proper error messages
- Tool-specific error codes
- Logging for debugging
- Graceful degradation

### Testing
- Unit tests for tools
- Integration tests with MCP SDK
- Mock stdio transport
- Test error conditions

### Performance
- Async/await for I/O operations
- Stream large responses
- Implement timeouts
- Resource cleanup

### Best Practices
- Type-safe tool definitions
- Clear tool descriptions
- Validate input schemas
- Document tool behaviors
- Version compatibility checks

### Git-Specific Best Practices
- Validate repository state before operations
- Handle authentication errors gracefully
- Provide clear error messages for common issues
- Support both SSH and HTTPS remotes
- Implement proper file path handling
- Handle merge conflicts appropriately
- Validate commit messages and branch names

---

## 📝 Notes

- Created for Project Nyra Git operations
- Docker bind mount enables direct repository access
- Follows MCP protocol specification
- Security: runs as non-root user with resource limits
