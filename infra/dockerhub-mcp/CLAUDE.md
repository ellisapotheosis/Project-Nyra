# DockerHub MCP Server - Docker Registry Operations via MCP

## 🎯 SERVICE CONTEXT

**Purpose**: TypeScript/Node.js MCP server providing Model Context Protocol interface to DockerHub API, enabling AI agents to search images, check tags, and retrieve image metadata.

**Port**: N/A (MCP stdio transport)
**Language**: TypeScript + Node.js
**Dependencies**: @modelcontextprotocol/sdk, axios, zod
**Template**: Node.js MCP server

## 🚨 CRITICAL DEVELOPMENT RULES

### MCP Server Development Pattern
**MANDATORY**: All MCP tools must be read-only for security:

```typescript
// ✅ CORRECT: Batch MCP tool development
[Single Message]:
  // DockerHub tools (read-only)
  - Write("src/tools/search-images.ts", searchImagesTool)
  - Write("src/tools/get-tags.ts", getTagsTool)
  - Write("src/tools/image-info.ts", imageInfoTool)

  // DockerHub API client
  - Write("src/client/dockerhub.ts", dockerhubClient)

  // Tests
  - Write("tests/mcp-tools.test.ts", mcpTests)
```

## 🐝 DOCKERHUB MCP SWARM

### Agent Configuration
```yaml
topology: star  # Central registry coordination
maxAgents: 4
strategy: specialized
language: typescript
framework: mcp

agents:
  mcp_architect:
    role: MCP Tool Design
    focus: [tool-definitions, registry-api, metadata-retrieval]
    concurrent_tasks: [multiple-tools, parallel-queries]

  dockerhub_integrator:
    role: DockerHub API Integration
    focus: [rest-api, pagination, rate-limiting]
    concurrent_tasks: [multiple-api-calls, parallel-requests]

  schema_validator:
    role: Input Validation
    focus: [zod-schemas, image-names, tag-validation]
    concurrent_tasks: [multiple-validations, parallel-checks]

  test_engineer:
    role: MCP Testing
    focus: [jest, mock-apis, integration-tests]
    concurrent_tasks: [multiple-test-suites, parallel-execution]
```

## 🔧 MCP + DOCKERHUB PATTERNS

### DockerHub API Client
```typescript
import axios from 'axios';

const DOCKERHUB_API = 'https://hub.docker.com/v2';

export async function searchImages(query: string, limit: number = 25) {
  const response = await axios.get(`${DOCKERHUB_API}/search/repositories/`, {
    params: { query, page_size: limit },
  });
  return response.data.results;
}

export async function getImageTags(repo: string) {
  const response = await axios.get(`${DOCKERHUB_API}/repositories/${repo}/tags/`);
  return response.data.results;
}
```

## 📈 PERFORMANCE TARGETS

- MCP response time: < 100ms
- DockerHub API latency: < 500ms
- Image search: < 1 second
- Tag retrieval: < 500ms

---

**This MCP server enables AI agents to discover and evaluate Docker images from DockerHub, supporting intelligent image selection for Project Nyra services.**
