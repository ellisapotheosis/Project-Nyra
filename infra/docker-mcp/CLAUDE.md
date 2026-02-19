# Docker MCP Server - Docker Operations via MCP

## 🎯 SERVICE CONTEXT

**Purpose**: TypeScript/Node.js MCP server providing Model Context Protocol interface to Docker operations, enabling AI agents to manage containers, images, networks, and volumes programmatically.

**Port**: N/A (MCP stdio transport)
**Language**: TypeScript + Node.js
**Dependencies**: @modelcontextprotocol/sdk, dockerode, zod
**Template**: Node.js MCP server

## 🚨 CRITICAL DEVELOPMENT RULES

### MCP Server Development Pattern
**MANDATORY**: All MCP tools must be safe and validated:

```typescript
// ✅ CORRECT: Batch MCP tool development
[Single Message]:
  // Docker tools
  - Write("src/tools/container-list.ts", listContainersTool)
  - Write("src/tools/container-start.ts", startContainerTool)
  - Write("src/tools/container-logs.ts", logsTool)

  // Docker client
  - Write("src/client/docker.ts", dockerodeClient)

  // Safety validators
  - Write("src/validators/safety.ts", safetyChecks)

  // Tests
  - Write("tests/mcp-tools.test.ts", mcpTests)
```

### Safety-First Docker Rules
**CRITICAL**: Every Docker operation MUST be validated for safety:

- **No Destructive Commands**: Never allow `docker system prune -a` or `docker rm -f` on production
- **Whitelist Operations**: Only allow specific safe commands
- **Container Isolation**: Validate container names, prevent host network access
- **Resource Limits**: Enforce memory/CPU limits on spawned containers
- **Audit Logging**: Log all Docker operations with user, command, timestamp

## 🐝 DOCKER MCP SWARM

### Agent Configuration
```yaml
topology: star  # Central Docker coordination
maxAgents: 4
strategy: specialized
language: typescript
framework: mcp

agents:
  mcp_architect:
    role: MCP Tool Design
    focus: [tool-definitions, docker-operations, safety-validation]
    concurrent_tasks: [multiple-tools, parallel-validation]

  docker_integrator:
    role: Dockerode Integration
    focus: [container-api, image-api, network-api]
    concurrent_tasks: [multiple-api-calls, parallel-operations]

  safety_specialist:
    role: Safety Validation
    focus: [operation-whitelisting, resource-limits, audit-logging]
    concurrent_tasks: [multiple-validations, parallel-checks]

  test_engineer:
    role: MCP Testing
    focus: [jest, mock-docker, integration-tests]
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 MCP + DOCKER PATTERNS

### Safe Container Operations
```typescript
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Whitelist of safe operations
const SAFE_OPERATIONS = [
  'list_containers',
  'inspect_container',
  'container_logs',
  'container_stats',
  'list_images',
];

export async function listContainers() {
  return await docker.listContainers({ all: true });
}

export async function getContainerLogs(containerId: string, tail: number = 100) {
  const container = docker.getContainer(containerId);
  return await container.logs({
    stdout: true,
    stderr: true,
    tail,
  });
}
```

## 📈 PERFORMANCE TARGETS

- MCP response time: < 100ms
- Docker API latency: < 50ms
- Container list: < 100ms
- Log retrieval: < 200ms

---

**This MCP server enables AI agents to interact with Docker safely, providing visibility into container status without allowing destructive operations.**
