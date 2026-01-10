# MetaMCP Integration Guide

**Status**: 🔬 Research Complete - Ready for Implementation
**Version**: 1.0.0
**Last Updated**: 2026-01-10
**Author**: Research Agent - Project Nyra

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What is MetaMCP?](#what-is-metamcp)
3. [Benefits for Project Nyra](#benefits-for-project-nyra)
4. [Architecture Overview](#architecture-overview)
5. [Integration Strategy](#integration-strategy)
6. [Implementation Plan](#implementation-plan)
7. [Configuration Guide](#configuration-guide)
8. [Code Examples](#code-examples)
9. [Testing Strategy](#testing-strategy)
10. [Monitoring & Operations](#monitoring--operations)
11. [References](#references)

---

## Executive Summary

**MetaMCP** is an open-source MCP (Model Context Protocol) aggregator, orchestrator, middleware, and gateway that can significantly enhance Project Nyra's Nexus Router by providing:

- **Unified MCP Endpoint**: Consolidate all MCP servers (Claude Flow, Archon OS, Infisical, etc.) into a single endpoint
- **Advanced Middleware**: Request/response transformation, observability, and security
- **Dynamic Tool Discovery**: Elasticsearch-style MCP tool search and selection
- **Enterprise Authentication**: OIDC, OAuth 2.0, API keys, and multi-tenancy support
- **Management UI**: Built-in Next.js frontend for MCP server management and inspection

**Recommendation**: Integrate MetaMCP as middleware layer between Nexus Router and individual MCP servers to enhance management, security, and observability.

---

## What is MetaMCP?

### Overview

MetaMCP is a **MCP proxy that dynamically aggregates MCP servers into a unified MCP server**, developed by the [metatool-ai team](https://github.com/metatool-ai/metamcp). It acts as a single point of entry for multiple MCP servers, applying middleware and access controls.

### Key Features

1. **Server Aggregation**
   - Groups multiple MCP servers into namespaces
   - Exposes unified endpoints via SSE or Streamable HTTP
   - Supports Tools, Resources, and Prompts from MCP protocol

2. **Middleware System**
   - Pluggable request/response transformation
   - Observability hooks for logging and metrics
   - Security middleware for authentication and authorization

3. **Tool Selection**
   - Cherry-pick specific tools from each server
   - Override tool metadata and annotations
   - Fuzzy search across all available tools

4. **Management UI**
   - Built-in inspector with saved configurations
   - Real-time server health monitoring
   - Tool discovery and testing interface

5. **Enterprise Features**
   - OIDC integration (Auth0, Keycloak, Azure AD, Google, Okta)
   - OAuth 2.0 support (MCP Spec 2025-06-18)
   - API key authentication
   - Multi-tenancy support

### Technical Stack

```yaml
Frontend: Next.js
Backend: Express.js + tRPC + MCP TypeScript SDK
Authentication: Better Auth framework
Structure: Turborepo monorepo
Deployment: Docker Compose (2-4GB memory)
Transport: SSE, Streamable HTTP, OpenAPI endpoints
```

---

## Benefits for Project Nyra

### 1. **Simplified MCP Management**

**Current State**: Nexus Router manages individual MCP servers with custom proxy logic
**With MetaMCP**: Centralized management UI with dynamic configuration

```
Before:
Nexus Router → MCP Proxy Service → Individual MCP Servers (hardcoded)

After:
Nexus Router → MetaMCP → Namespace-grouped MCP Servers (dynamic)
```

### 2. **Enhanced Security**

- **OIDC Integration**: Connect to existing identity providers
- **API Key Management**: Per-endpoint authentication
- **OAuth 2.0**: Standardized authorization flows
- **Multi-tenancy**: Isolate MCP access by team/project

### 3. **Better Observability**

- **Request Tracing**: Track MCP calls across services
- **Middleware Logging**: Inspect request/response payloads
- **Metrics Export**: Integrate with Prometheus/Grafana
- **Tool Usage Analytics**: Understand which MCP tools are most used

### 4. **Improved Developer Experience**

- **Visual Management**: UI for adding/removing MCP servers
- **Tool Discovery**: Search and explore available MCP tools
- **Configuration Persistence**: Save and restore MCP configurations
- **Testing Interface**: Test MCP tools directly from UI

### 5. **Scalability & Flexibility**

- **Dynamic Namespaces**: Add new MCP servers without code changes
- **Tool Overrides**: Customize tool metadata per environment
- **Selective Exposure**: Choose which tools to expose per endpoint
- **Transport Options**: Support SSE, HTTP, and OpenAPI simultaneously

---

## Architecture Overview

### Current Nexus Router Architecture

```
┌─────────────────┐
│   Client Apps   │
│ (Claude Code,   │
│  Open-WebUI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   Nexus Router (Port 8000)  │
│  ┌──────────────────────┐   │
│  │  MCP Proxy Service   │   │
│  │  - Tool Registry     │   │
│  │  - Server Manager    │   │
│  │  - Fuzzy Search      │   │
│  └──────────┬───────────┘   │
└─────────────┼───────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│ Claude Flow  │ │  Archon OS   │
│ MCP (9000)   │ │ MCP (9001)   │
└──────────────┘ └──────────────┘
```

### Proposed MetaMCP Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│                Client Applications                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Claude Code  │  │  Open-WebUI  │  │  Custom   │ │
│  └──────────────┘  └──────────────┘  │   Apps    │ │
│                                       └───────────┘ │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│         Nexus Router (Port 8000 - Main API)         │
│  ┌─────────────────────────────────────────────┐   │
│  │  LLM Routing Service (Cost Optimization)    │   │
│  │  - Local GPU Workers                        │   │
│  │  - Cloud API Fallback                       │   │
│  │  - Redis Caching                            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│      MetaMCP Gateway (Port 12008 - MCP Layer)       │
│  ┌─────────────────────────────────────────────┐   │
│  │  Frontend: Management UI (Next.js)          │   │
│  │  - Server Configuration                     │   │
│  │  - Tool Discovery                           │   │
│  │  - Namespace Management                     │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  Backend: MCP Aggregator (Express + tRPC)   │   │
│  │  - Middleware Pipeline                      │   │
│  │  - Authentication (OIDC/OAuth/API Keys)     │   │
│  │  - Tool Selection Engine                    │   │
│  │  - Endpoint Management (SSE/HTTP/OpenAPI)   │   │
│  └──────────────────┬──────────────────────────┘   │
└─────────────────────┼───────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐     ┌──────────────────┐
│   Namespace 1:   │     │   Namespace 2:   │
│  Development     │     │   Production     │
├──────────────────┤     ├──────────────────┤
│ • Claude Flow    │     │ • Claude Flow    │
│ • Archon OS      │     │ • Infisical      │
│ • Dev Tools      │     │ • Bitwarden      │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
    ┌────┴────┐              ┌────┴────┐
    ▼         ▼              ▼         ▼
┌─────────┐ ┌─────────┐  ┌─────────┐ ┌─────────┐
│Claude   │ │Archon   │  │Claude   │ │Infisical│
│Flow     │ │OS       │  │Flow     │ │MCP      │
│(9000)   │ │(9001)   │  │(9000)   │ │(4002)   │
└─────────┘ └─────────┘  └─────────┘ └─────────┘

┌─────────────────────────────────────────────────────┐
│           Redis Cache (Shared Layer)                │
│  - MCP Tool Cache                                   │
│  - Server Health Status                             │
│  - Request Metrics                                  │
└─────────────────────────────────────────────────────┘
```

### Component Interactions

1. **Client → Nexus Router**: Standard LLM API requests (OpenAI-compatible)
2. **Nexus Router → MetaMCP**: MCP protocol requests for tools/resources
3. **MetaMCP → MCP Servers**: Proxied MCP requests with middleware
4. **MetaMCP UI**: Standalone management interface for configuration

---

## Integration Strategy

### Phase 1: Standalone Deployment (Week 1)

**Goal**: Deploy MetaMCP alongside Nexus Router without integration

```bash
# Deploy MetaMCP as separate service
docker-compose -f docker-compose.metamcp.yml up -d

# Services:
# - MetaMCP: localhost:12008
# - Nexus Router: localhost:8000 (unchanged)
```

**Deliverables**:
- ✅ MetaMCP running in Docker
- ✅ Management UI accessible
- ✅ All existing MCP servers registered
- ✅ Basic authentication configured

### Phase 2: Nexus Router Integration (Week 2)

**Goal**: Route Nexus Router MCP requests through MetaMCP

**Changes to Nexus Router**:

```typescript
// services/nexus-router/src/services/mcp-proxy.ts

export class MCPProxyService {
  private metamcpClient: AxiosInstance;

  constructor() {
    // New: Connect to MetaMCP instead of individual servers
    this.metamcpClient = axios.create({
      baseURL: process.env.METAMCP_URL || 'http://localhost:12008/metamcp',
      headers: {
        'Authorization': `Bearer ${process.env.METAMCP_API_KEY}`,
      },
    });
  }

  async proxyRequest(namespace: string, request: MCPRequest): Promise<MCPResponse> {
    // Route to MetaMCP namespace endpoint
    const response = await this.metamcpClient.post(`/${namespace}/mcp`, {
      jsonrpc: '2.0',
      method: request.method,
      params: request.params,
      id: Date.now(),
    });

    return response.data;
  }
}
```

**Deliverables**:
- ✅ Nexus Router routes MCP requests to MetaMCP
- ✅ Existing MCP functionality maintained
- ✅ Backward compatibility preserved
- ✅ Integration tests passing

### Phase 3: Advanced Features (Week 3-4)

**Goal**: Leverage MetaMCP's advanced capabilities

**Features to Implement**:

1. **Namespace-based Routing**
   - Development namespace for staging
   - Production namespace for live traffic
   - Per-team namespaces for multi-tenancy

2. **Middleware Pipeline**
   - Request logging middleware
   - Response caching middleware
   - Error tracking middleware (Sentry integration)

3. **Tool Discovery Enhancement**
   - Integrate MetaMCP's tool search into Nexus Router
   - Expose tool discovery API to client apps
   - Auto-sync tool registry with MetaMCP

4. **Authentication & Authorization**
   - OIDC integration with existing auth provider
   - API key management per client
   - Rate limiting per namespace

**Deliverables**:
- ✅ Namespace routing implemented
- ✅ Middleware pipeline configured
- ✅ Enhanced tool discovery
- ✅ Authentication integrated

---

## Implementation Plan

### Prerequisites

```bash
# System Requirements
- Docker & Docker Compose installed
- 2-4GB available memory
- Node.js 18+ (for development)
- Redis (shared with Nexus Router)

# Environment Variables
METAMCP_URL=http://localhost:12008
METAMCP_API_KEY=<generated-key>
APP_URL=http://localhost:12008
DATABASE_URL=postgresql://user:pass@localhost:5432/metamcp
```

### Step 1: Deploy MetaMCP

```bash
# Clone MetaMCP repository
cd C:\Dev\Projects\Repos\Project-Nyra\infra
git clone https://github.com/metatool-ai/metamcp.git

# Configure environment
cd metamcp
cp example.env .env

# Edit .env with Project Nyra settings
# APP_URL=http://localhost:12008
# OIDC_CLIENT_ID=<your-client-id>
# OIDC_CLIENT_SECRET=<your-secret>
# OIDC_DISCOVERY_URL=<your-provider>/.well-known/openid-configuration

# Start MetaMCP
docker compose up -d

# Verify deployment
curl http://localhost:12008/health
```

### Step 2: Configure MCP Servers in MetaMCP

```bash
# Access MetaMCP UI
open http://localhost:12008

# Add MCP Servers via UI:
# 1. Claude Flow MCP
#    - Name: Claude Flow
#    - URL: http://host.docker.internal:9000/mcp
#    - Transport: Streamable HTTP
#
# 2. Archon OS MCP
#    - Name: Archon OS
#    - URL: http://host.docker.internal:9001/mcp
#    - Transport: Streamable HTTP
#
# 3. Infisical MCP
#    - Name: Infisical
#    - URL: http://host.docker.internal:4002
#    - Transport: SSE
```

### Step 3: Create Namespaces

```javascript
// Via MetaMCP UI or API

// Development Namespace
POST http://localhost:12008/api/namespaces
{
  "name": "development",
  "servers": ["claude-flow", "archon-os"],
  "middleware": ["logging", "caching"],
  "authentication": "api-key"
}

// Production Namespace
POST http://localhost:12008/api/namespaces
{
  "name": "production",
  "servers": ["claude-flow", "infisical", "bitwarden"],
  "middleware": ["logging", "rate-limiting", "security"],
  "authentication": "oidc"
}
```

### Step 4: Update Nexus Router Configuration

```typescript
// services/nexus-router/src/config.ts

export const config = ConfigSchema.parse({
  // ... existing config

  metamcp: {
    enabled: true,
    url: process.env.METAMCP_URL || 'http://localhost:12008',
    apiKey: process.env.METAMCP_API_KEY,
    defaultNamespace: process.env.METAMCP_DEFAULT_NAMESPACE || 'development',
    timeout: 30000,
  },
});
```

### Step 5: Refactor MCP Proxy Service

```typescript
// services/nexus-router/src/services/mcp-proxy-metamcp.ts

import axios, { AxiosInstance } from 'axios';
import { createLogger } from '../utils/logger';
import { config } from '../config';

const logger = createLogger('mcp-proxy-metamcp');

export class MCPProxyMetaMCPService {
  private static instance: MCPProxyMetaMCPService;
  private metamcpClient: AxiosInstance;
  private currentNamespace: string;

  private constructor() {
    this.currentNamespace = config.metamcp.defaultNamespace;
    this.metamcpClient = axios.create({
      baseURL: `${config.metamcp.url}/metamcp`,
      timeout: config.metamcp.timeout,
      headers: {
        'Authorization': `Bearer ${config.metamcp.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public static getInstance(): MCPProxyMetaMCPService {
    if (!MCPProxyMetaMCPService.instance) {
      MCPProxyMetaMCPService.instance = new MCPProxyMetaMCPService();
    }
    return MCPProxyMetaMCPService.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing MetaMCP Proxy Service...');

    // Test connection
    try {
      const response = await this.metamcpClient.get('/health');
      logger.info('MetaMCP connection established', response.data);
    } catch (error) {
      logger.error('Failed to connect to MetaMCP:', error);
      throw error;
    }
  }

  public setNamespace(namespace: string): void {
    this.currentNamespace = namespace;
    logger.info(`Switched to namespace: ${namespace}`);
  }

  public async callTool(toolName: string, params: any): Promise<any> {
    try {
      const response = await this.metamcpClient.post(
        `/${this.currentNamespace}/mcp`,
        {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params,
          },
          id: Date.now(),
        }
      );

      if (response.data.error) {
        throw new Error(`MCP tool call failed: ${response.data.error.message}`);
      }

      return response.data.result;
    } catch (error) {
      logger.error(`Error calling tool ${toolName}:`, error);
      throw error;
    }
  }

  public async listTools(): Promise<any[]> {
    try {
      const response = await this.metamcpClient.post(
        `/${this.currentNamespace}/mcp`,
        {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: Date.now(),
        }
      );

      return response.data.result?.tools || [];
    } catch (error) {
      logger.error('Error listing tools:', error);
      return [];
    }
  }

  public async searchTools(query: string, limit: number = 10): Promise<any[]> {
    // Use MetaMCP's tool search API
    try {
      const response = await this.metamcpClient.get('/tools/search', {
        params: { q: query, limit },
      });

      return response.data.results || [];
    } catch (error) {
      logger.error('Error searching tools:', error);
      return [];
    }
  }

  public async getMetrics(): Promise<any> {
    try {
      const response = await this.metamcpClient.get('/metrics');
      return response.data;
    } catch (error) {
      logger.error('Error fetching metrics:', error);
      return {};
    }
  }
}
```

### Step 6: Update Docker Compose

```yaml
# infra/docker/docker-compose.metamcp.yml

version: '3.8'

services:
  metamcp:
    image: metatoolai/metamcp:latest
    container_name: nyra-metamcp
    ports:
      - "12008:3000"
    environment:
      - APP_URL=http://localhost:12008
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/metamcp
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
      # OIDC Configuration (optional)
      - OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
      - OIDC_CLIENT_SECRET=${OIDC_CLIENT_SECRET}
      - OIDC_DISCOVERY_URL=${OIDC_DISCOVERY_URL}
    depends_on:
      - postgres
      - redis
    networks:
      - nyra-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    container_name: nyra-metamcp-db
    environment:
      - POSTGRES_DB=metamcp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - metamcp-postgres-data:/var/lib/postgresql/data
    networks:
      - nyra-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nyra-metamcp-redis
    volumes:
      - metamcp-redis-data:/data
    networks:
      - nyra-network
    restart: unless-stopped

volumes:
  metamcp-postgres-data:
  metamcp-redis-data:

networks:
  nyra-network:
    external: true
```

### Step 7: Integration Testing

```typescript
// services/nexus-router/src/tests/metamcp-integration.test.ts

import { MCPProxyMetaMCPService } from '../services/mcp-proxy-metamcp';

describe('MetaMCP Integration', () => {
  let mcpProxy: MCPProxyMetaMCPService;

  beforeAll(async () => {
    mcpProxy = MCPProxyMetaMCPService.getInstance();
    await mcpProxy.initialize();
  });

  describe('Tool Operations', () => {
    it('should list all available tools', async () => {
      const tools = await mcpProxy.listTools();
      expect(tools).toBeInstanceOf(Array);
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should search tools by query', async () => {
      const results = await mcpProxy.searchTools('filesystem');
      expect(results).toBeInstanceOf(Array);
      expect(results[0]).toHaveProperty('tool');
      expect(results[0]).toHaveProperty('score');
    });

    it('should call a tool successfully', async () => {
      const result = await mcpProxy.callTool('echo', { message: 'test' });
      expect(result).toBeDefined();
    });
  });

  describe('Namespace Operations', () => {
    it('should switch namespaces', () => {
      mcpProxy.setNamespace('production');
      // Verify namespace switch by calling namespace-specific tool
    });

    it('should isolate tools per namespace', async () => {
      mcpProxy.setNamespace('development');
      const devTools = await mcpProxy.listTools();

      mcpProxy.setNamespace('production');
      const prodTools = await mcpProxy.listTools();

      // Verify different tool sets
      expect(devTools).not.toEqual(prodTools);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      // Test with invalid endpoint
      await expect(
        mcpProxy.callTool('nonexistent-tool', {})
      ).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      // Test with slow-responding tool
      jest.setTimeout(10000);
      // ... timeout test
    });
  });
});
```

---

## Configuration Guide

### Environment Variables

```bash
# services/nexus-router/.env

# MetaMCP Configuration
METAMCP_ENABLED=true
METAMCP_URL=http://localhost:12008
METAMCP_API_KEY=nyra_metamcp_key_abc123
METAMCP_DEFAULT_NAMESPACE=development
METAMCP_TIMEOUT=30000

# MCP Server URLs (for fallback)
CLAUDE_FLOW_MCP_URL=http://localhost:9000/mcp
ARCHON_MCP_URL=http://localhost:9001/mcp
INFISICAL_MCP_URL=http://localhost:4002
BITWARDEN_MCP_URL=http://localhost:4003

# Authentication
OIDC_CLIENT_ID=project-nyra-client
OIDC_CLIENT_SECRET=your-secret-here
OIDC_DISCOVERY_URL=https://auth.example.com/.well-known/openid-configuration

# Feature Flags
MCP_USE_METAMCP=true
MCP_ENABLE_CACHING=true
MCP_ENABLE_METRICS=true
```

### MetaMCP Configuration

```json
// metamcp/config.json

{
  "servers": [
    {
      "id": "claude-flow",
      "name": "Claude Flow MCP",
      "command": "node",
      "args": ["/path/to/claude-flow/dist/index.js"],
      "env": {
        "CLAUDE_FLOW_PORT": "9000"
      },
      "transport": "stdio"
    },
    {
      "id": "archon-os",
      "name": "Archon OS MCP",
      "command": "python",
      "args": ["/path/to/archon-os/server.py"],
      "transport": "stdio"
    }
  ],
  "namespaces": [
    {
      "name": "development",
      "servers": ["claude-flow", "archon-os"],
      "middleware": [
        {
          "type": "logging",
          "config": {
            "level": "debug",
            "format": "json"
          }
        },
        {
          "type": "caching",
          "config": {
            "ttl": 300,
            "keyPrefix": "mcp:dev:"
          }
        }
      ]
    },
    {
      "name": "production",
      "servers": ["claude-flow"],
      "middleware": [
        {
          "type": "logging",
          "config": {
            "level": "info",
            "format": "json"
          }
        },
        {
          "type": "rate-limiting",
          "config": {
            "maxRequests": 100,
            "windowMs": 60000
          }
        }
      ]
    }
  ],
  "endpoints": [
    {
      "name": "dev-endpoint",
      "namespace": "development",
      "transport": "sse",
      "authentication": {
        "type": "api-key",
        "keys": ["${METAMCP_DEV_KEY}"]
      }
    },
    {
      "name": "prod-endpoint",
      "namespace": "production",
      "transport": "http",
      "authentication": {
        "type": "oidc",
        "provider": "${OIDC_DISCOVERY_URL}"
      }
    }
  ]
}
```

### Middleware Configuration

```typescript
// metamcp/middleware/observability.ts

export const observabilityMiddleware = {
  name: 'observability',

  onRequest: async (context) => {
    // Log incoming request
    logger.info('MCP Request', {
      method: context.request.method,
      params: context.request.params,
      namespace: context.namespace,
      timestamp: Date.now(),
    });

    // Add trace ID
    context.traceId = generateTraceId();

    return context;
  },

  onResponse: async (context) => {
    // Log response
    logger.info('MCP Response', {
      method: context.request.method,
      success: !context.response.error,
      duration: context.duration,
      traceId: context.traceId,
    });

    // Send metrics to Prometheus
    metrics.increment('mcp.requests.total', {
      namespace: context.namespace,
      method: context.request.method,
      success: !context.response.error,
    });

    return context;
  },

  onError: async (context) => {
    // Log error
    logger.error('MCP Error', {
      method: context.request.method,
      error: context.error.message,
      traceId: context.traceId,
    });

    // Send to error tracking
    Sentry.captureException(context.error, {
      tags: {
        namespace: context.namespace,
        method: context.request.method,
        traceId: context.traceId,
      },
    });

    return context;
  },
};
```

---

## Code Examples

### 1. Using MetaMCP in Nexus Router

```typescript
// services/nexus-router/src/routes/mcp-v2.ts

import { Router } from 'express';
import { MCPProxyMetaMCPService } from '../services/mcp-proxy-metamcp';

const router = Router();
const mcpProxy = MCPProxyMetaMCPService.getInstance();

// List all tools in current namespace
router.get('/tools', async (req, res) => {
  try {
    const namespace = req.query.namespace as string || 'development';
    mcpProxy.setNamespace(namespace);

    const tools = await mcpProxy.listTools();

    res.json({
      namespace,
      tools,
      total: tools.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search tools across all namespaces
router.get('/tools/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    const results = await mcpProxy.searchTools(query, limit);

    res.json({
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Call a tool
router.post('/tools/call', async (req, res) => {
  try {
    const { tool, params, namespace } = req.body;

    if (namespace) {
      mcpProxy.setNamespace(namespace);
    }

    const result = await mcpProxy.callTool(tool, params);

    res.json({
      tool,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get MCP metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await mcpProxy.getMetrics();

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as mcpV2Router };
```

### 2. Client-Side Tool Discovery

```typescript
// apps/mortgage-assistant/lib/mcp-client.ts

import axios from 'axios';

export class MCPClient {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async searchTools(query: string): Promise<any[]> {
    const response = await axios.get(`${this.baseURL}/mcp/tools/search`, {
      params: { q: query, limit: 10 },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.data.results;
  }

  async callTool(toolName: string, params: any): Promise<any> {
    const response = await axios.post(
      `${this.baseURL}/mcp/tools/call`,
      {
        tool: toolName,
        params,
        namespace: 'production',
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.data.result;
  }
}

// Usage in React component
import { MCPClient } from '@/lib/mcp-client';

export function ToolSearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const mcpClient = new MCPClient(
    process.env.NEXT_PUBLIC_NEXUS_URL,
    process.env.NEXT_PUBLIC_API_KEY
  );

  const handleSearch = async () => {
    const tools = await mcpClient.searchTools(query);
    setResults(tools);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search MCP tools..."
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {results.map((result) => (
          <li key={result.tool.name}>
            <strong>{result.tool.name}</strong> (score: {result.score})
            <p>{result.tool.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Namespace-Based Routing

```typescript
// services/nexus-router/src/middleware/namespace-router.ts

import { Request, Response, NextFunction } from 'express';
import { MCPProxyMetaMCPService } from '../services/mcp-proxy-metamcp';

export const namespaceRouter = (req: Request, res: Response, next: NextFunction) => {
  const mcpProxy = MCPProxyMetaMCPService.getInstance();

  // Determine namespace based on environment or user role
  const namespace = determineNamespace(req);

  // Set namespace for this request
  mcpProxy.setNamespace(namespace);

  // Store in request for later use
  req.mcpNamespace = namespace;

  next();
};

function determineNamespace(req: Request): string {
  // Check header
  if (req.headers['x-mcp-namespace']) {
    return req.headers['x-mcp-namespace'] as string;
  }

  // Check JWT claims
  if (req.user?.namespace) {
    return req.user.namespace;
  }

  // Check environment
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  return 'development';
}
```

### 4. Custom Middleware for MetaMCP

```typescript
// metamcp/custom-middleware/rate-limiter.ts

import { MCPMiddleware } from '@metamcp/types';
import { RateLimiter } from 'rate-limiter-flexible';

export const rateLimiterMiddleware: MCPMiddleware = {
  name: 'rate-limiter',

  initialize: (config) => {
    const limiter = new RateLimiter({
      points: config.maxRequests || 100,
      duration: config.windowMs || 60000,
    });

    return { limiter };
  },

  onRequest: async (context, state) => {
    const { limiter } = state;
    const clientId = context.clientId || context.ip;

    try {
      await limiter.consume(clientId);
      return context;
    } catch (error) {
      throw new Error(`Rate limit exceeded for client: ${clientId}`);
    }
  },
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// services/nexus-router/src/tests/unit/mcp-proxy-metamcp.test.ts

import { MCPProxyMetaMCPService } from '../../services/mcp-proxy-metamcp';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MCPProxyMetaMCPService', () => {
  let service: MCPProxyMetaMCPService;

  beforeEach(() => {
    service = MCPProxyMetaMCPService.getInstance();
  });

  describe('callTool', () => {
    it('should call tool successfully', async () => {
      mockedAxios.create.mockReturnThis();
      mockedAxios.post.mockResolvedValue({
        data: {
          result: { success: true },
        },
      });

      const result = await service.callTool('test-tool', { param: 'value' });

      expect(result).toEqual({ success: true });
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        service.callTool('test-tool', {})
      ).rejects.toThrow('Network error');
    });
  });
});
```

### Integration Tests

```typescript
// services/nexus-router/src/tests/integration/metamcp-flow.test.ts

import { MCPProxyMetaMCPService } from '../../services/mcp-proxy-metamcp';
import axios from 'axios';

describe('MetaMCP Integration Flow', () => {
  let mcpProxy: MCPProxyMetaMCPService;
  const metamcpUrl = process.env.METAMCP_TEST_URL || 'http://localhost:12008';

  beforeAll(async () => {
    // Ensure MetaMCP is running
    try {
      await axios.get(`${metamcpUrl}/health`);
    } catch (error) {
      throw new Error('MetaMCP is not running. Start it with: docker compose up -d');
    }

    mcpProxy = MCPProxyMetaMCPService.getInstance();
    await mcpProxy.initialize();
  });

  describe('Tool Discovery', () => {
    it('should list all tools', async () => {
      const tools = await mcpProxy.listTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('should search tools', async () => {
      const results = await mcpProxy.searchTools('file');
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('Namespace Switching', () => {
    it('should switch between namespaces', async () => {
      mcpProxy.setNamespace('development');
      const devTools = await mcpProxy.listTools();

      mcpProxy.setNamespace('production');
      const prodTools = await mcpProxy.listTools();

      // Tool sets should differ based on namespace config
      expect(devTools).not.toEqual(prodTools);
    });
  });
});
```

### E2E Tests

```typescript
// services/nexus-router/src/tests/e2e/metamcp-nexus.e2e.test.ts

import request from 'supertest';
import { app } from '../../index';

describe('Nexus Router + MetaMCP E2E', () => {
  describe('MCP Endpoints', () => {
    it('should list tools via Nexus Router', async () => {
      const response = await request(app)
        .get('/mcp/tools')
        .query({ namespace: 'development' })
        .expect(200);

      expect(response.body.tools).toBeInstanceOf(Array);
      expect(response.body.namespace).toBe('development');
    });

    it('should call tool via Nexus Router', async () => {
      const response = await request(app)
        .post('/mcp/tools/call')
        .send({
          tool: 'echo',
          params: { message: 'test' },
          namespace: 'development',
        })
        .expect(200);

      expect(response.body.result).toBeDefined();
    });

    it('should search tools', async () => {
      const response = await request(app)
        .get('/mcp/tools/search')
        .query({ q: 'file', limit: 5 })
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(5);
    });
  });
});
```

### Performance Tests

```typescript
// services/nexus-router/src/tests/performance/metamcp-load.test.ts

import { MCPProxyMetaMCPService } from '../../services/mcp-proxy-metamcp';

describe('MetaMCP Performance', () => {
  let mcpProxy: MCPProxyMetaMCPService;

  beforeAll(async () => {
    mcpProxy = MCPProxyMetaMCPService.getInstance();
    await mcpProxy.initialize();
  });

  it('should handle 100 concurrent tool calls', async () => {
    const startTime = Date.now();

    const promises = Array.from({ length: 100 }, () =>
      mcpProxy.callTool('echo', { message: 'test' })
    );

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(results.length).toBe(100);
    expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
  });

  it('should cache tool list requests', async () => {
    // First call (cache miss)
    const start1 = Date.now();
    await mcpProxy.listTools();
    const duration1 = Date.now() - start1;

    // Second call (cache hit)
    const start2 = Date.now();
    await mcpProxy.listTools();
    const duration2 = Date.now() - start2;

    // Cached call should be significantly faster
    expect(duration2).toBeLessThan(duration1 * 0.5);
  });
});
```

---

## Monitoring & Operations

### Metrics Collection

```typescript
// services/nexus-router/src/monitoring/metamcp-metrics.ts

import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetaMCPMetrics {
  private registry: Registry;

  // Counters
  private toolCallsTotal: Counter;
  private toolCallsErrors: Counter;

  // Histograms
  private toolCallDuration: Histogram;

  // Gauges
  private activeNamespaces: Gauge;
  private toolsAvailable: Gauge;

  constructor() {
    this.registry = new Registry();

    this.toolCallsTotal = new Counter({
      name: 'metamcp_tool_calls_total',
      help: 'Total number of MCP tool calls',
      labelNames: ['namespace', 'tool', 'status'],
      registers: [this.registry],
    });

    this.toolCallsErrors = new Counter({
      name: 'metamcp_tool_calls_errors_total',
      help: 'Total number of MCP tool call errors',
      labelNames: ['namespace', 'tool', 'error_type'],
      registers: [this.registry],
    });

    this.toolCallDuration = new Histogram({
      name: 'metamcp_tool_call_duration_seconds',
      help: 'Duration of MCP tool calls',
      labelNames: ['namespace', 'tool'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.activeNamespaces = new Gauge({
      name: 'metamcp_active_namespaces',
      help: 'Number of active namespaces',
      registers: [this.registry],
    });

    this.toolsAvailable = new Gauge({
      name: 'metamcp_tools_available',
      help: 'Number of tools available',
      labelNames: ['namespace'],
      registers: [this.registry],
    });
  }

  recordToolCall(namespace: string, tool: string, duration: number, success: boolean) {
    this.toolCallsTotal.inc({ namespace, tool, status: success ? 'success' : 'error' });
    this.toolCallDuration.observe({ namespace, tool }, duration);
  }

  recordError(namespace: string, tool: string, errorType: string) {
    this.toolCallsErrors.inc({ namespace, tool, error_type: errorType });
  }

  updateToolCount(namespace: string, count: number) {
    this.toolsAvailable.set({ namespace }, count);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### Grafana Dashboard

```json
// infra/monitoring/grafana/dashboards/metamcp-dashboard.json

{
  "dashboard": {
    "title": "MetaMCP & Nexus Router",
    "panels": [
      {
        "title": "MCP Tool Calls (Total)",
        "targets": [
          {
            "expr": "sum(rate(metamcp_tool_calls_total[5m])) by (namespace)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "MCP Tool Call Duration (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(metamcp_tool_call_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "MCP Error Rate",
        "targets": [
          {
            "expr": "sum(rate(metamcp_tool_calls_errors_total[5m])) by (error_type)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Available Tools by Namespace",
        "targets": [
          {
            "expr": "metamcp_tools_available"
          }
        ],
        "type": "table"
      }
    ]
  }
}
```

### Alerting Rules

```yaml
# infra/monitoring/alertmanager/rules/metamcp-alerts.yml

groups:
  - name: metamcp
    interval: 30s
    rules:
      - alert: MetaMCPHighErrorRate
        expr: |
          (
            sum(rate(metamcp_tool_calls_errors_total[5m]))
            /
            sum(rate(metamcp_tool_calls_total[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "MetaMCP error rate above 5%"
          description: "MetaMCP is experiencing {{ $value | humanizePercentage }} error rate"

      - alert: MetaMCPSlowToolCalls
        expr: |
          histogram_quantile(0.95, rate(metamcp_tool_call_duration_seconds_bucket[5m])) > 5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "MetaMCP tool calls are slow (p95 > 5s)"
          description: "95th percentile tool call duration is {{ $value }}s"

      - alert: MetaMCPDown
        expr: up{job="metamcp"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "MetaMCP is down"
          description: "MetaMCP service has been down for more than 2 minutes"
```

### Health Checks

```typescript
// services/nexus-router/src/health/metamcp-health.ts

import { MCPProxyMetaMCPService } from '../services/mcp-proxy-metamcp';
import { createLogger } from '../utils/logger';

const logger = createLogger('metamcp-health');

export class MetaMCPHealthCheck {
  private mcpProxy: MCPProxyMetaMCPService;

  constructor() {
    this.mcpProxy = MCPProxyMetaMCPService.getInstance();
  }

  async check(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
      status: 'healthy',
      checks: {},
    };

    try {
      // Check MetaMCP connectivity
      const connectivityCheck = await this.checkConnectivity();
      result.checks.connectivity = connectivityCheck;

      // Check namespace availability
      const namespaceCheck = await this.checkNamespaces();
      result.checks.namespaces = namespaceCheck;

      // Check tool availability
      const toolsCheck = await this.checkTools();
      result.checks.tools = toolsCheck;

      // Determine overall status
      if (Object.values(result.checks).some(c => c.status === 'unhealthy')) {
        result.status = 'degraded';
      }

    } catch (error) {
      logger.error('Health check failed:', error);
      result.status = 'unhealthy';
      result.error = error.message;
    }

    return result;
  }

  private async checkConnectivity(): Promise<CheckResult> {
    try {
      await this.mcpProxy.getMetrics();
      return { status: 'healthy', message: 'MetaMCP is reachable' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Cannot reach MetaMCP', error: error.message };
    }
  }

  private async checkNamespaces(): Promise<CheckResult> {
    try {
      const namespaces = ['development', 'production'];
      const results = await Promise.all(
        namespaces.map(async (ns) => {
          this.mcpProxy.setNamespace(ns);
          const tools = await this.mcpProxy.listTools();
          return { namespace: ns, toolCount: tools.length };
        })
      );

      return {
        status: 'healthy',
        message: 'All namespaces accessible',
        data: results,
      };
    } catch (error) {
      return { status: 'unhealthy', message: 'Namespace check failed', error: error.message };
    }
  }

  private async checkTools(): Promise<CheckResult> {
    try {
      const tools = await this.mcpProxy.listTools();

      if (tools.length === 0) {
        return { status: 'unhealthy', message: 'No tools available' };
      }

      return {
        status: 'healthy',
        message: `${tools.length} tools available`,
        data: { toolCount: tools.length },
      };
    } catch (error) {
      return { status: 'unhealthy', message: 'Tool check failed', error: error.message };
    }
  }
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, CheckResult>;
  error?: string;
}

interface CheckResult {
  status: 'healthy' | 'unhealthy';
  message: string;
  error?: string;
  data?: any;
}
```

### Logging Configuration

```typescript
// services/nexus-router/src/utils/metamcp-logger.ts

import pino from 'pino';

export const metamcpLogger = pino({
  name: 'metamcp',
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: req.headers,
      namespace: req.mcpNamespace,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.apiKey',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
});
```

---

## References

### Official Documentation

- [MetaMCP GitHub Repository](https://github.com/metatool-ai/metamcp) - Main repository with source code
- [MetaMCP Documentation](https://docs.metamcp.com/en) - Official documentation site
- [MetaMCP: The Unified MCP Server Gateway](https://skywork.ai/skypage/en/metamcp-mcp-server-gateway-ai-agents/1978720928508715008) - Overview article
- [The Ultimate Guide to Meta MCP Proxy for AI Engineers](https://skywork.ai/skypage/en/meta-mcp-proxy-ai-engineers/1978275728837234688) - Implementation guide

### Model Context Protocol (MCP)

- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25) - Official protocol specification
- [MCP Apps Extension](http://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/) - UI components for MCP
- [Building MCP Servers with UI](https://deepwiki.com/modelcontextprotocol/ext-apps/6-building-mcp-servers-with-ui) - UI integration guide
- [OpenAI MCP Server Guide](https://developers.openai.com/apps-sdk/concepts/mcp-server/) - MCP server development

### Related Technologies

- [MCP Gateway Architecture](https://bytebridge.medium.com/model-context-protocol-mcp-and-the-mcp-gateway-concepts-architecture-and-case-studies-3470b6d549a1) - Concepts and case studies
- [MCP Gateway for Enterprise](https://medium.com/@manojjahgirdar/model-context-protocol-mcp-gateway-a-middleware-meant-to-productionize-mcp-for-an-enterprise-bbdb2bc350be) - Enterprise implementation
- [Material UI MCP Integration](https://mui.com/material-ui/getting-started/mcp/) - UI library MCP example

### Project Nyra Specific

- [C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\README.md](C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\README.md) - Current Nexus Router documentation
- [C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\services\mcp-proxy.ts](C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router\src\services\mcp-proxy.ts) - Current MCP proxy implementation
- [C:\Dev\Projects\Repos\Project-Nyra\docs\MCP_TOOL_REGISTRY.md](C:\Dev\Projects\Repos\Project-Nyra\docs\MCP_TOOL_REGISTRY.md) - MCP tool registry documentation

---

## Appendix

### A. Comparison: Current vs MetaMCP Integration

| Feature | Current (Custom Proxy) | With MetaMCP |
|---------|------------------------|--------------|
| **Management** | Code-based configuration | UI + API + Code |
| **Authentication** | Basic API keys | OIDC, OAuth 2.0, API keys, multi-tenancy |
| **Middleware** | Limited | Pluggable pipeline |
| **Tool Discovery** | Fuse.js search | Elasticsearch-style + fuzzy search |
| **Namespaces** | None | Multi-namespace support |
| **Monitoring** | Basic metrics | Built-in observability |
| **Transport** | HTTP only | SSE, HTTP, OpenAPI, stdio |
| **UI** | None | Next.js management UI |
| **Dynamic Config** | Requires redeploy | Live configuration |
| **Multi-tenancy** | Manual | Built-in |

### B. Migration Checklist

```markdown
## Pre-Migration
- [ ] Review current MCP server configurations
- [ ] Identify MCP clients and their requirements
- [ ] Plan namespace structure (dev/staging/prod)
- [ ] Determine authentication strategy
- [ ] Backup current MCP configurations
- [ ] Document custom middleware requirements

## Migration Phase
- [ ] Deploy MetaMCP in staging environment
- [ ] Register all MCP servers in MetaMCP UI
- [ ] Create namespaces and endpoints
- [ ] Configure authentication (OIDC/OAuth)
- [ ] Implement custom middleware
- [ ] Update Nexus Router to use MetaMCP
- [ ] Run integration tests
- [ ] Performance testing

## Post-Migration
- [ ] Monitor error rates and latency
- [ ] Verify all MCP clients working
- [ ] Set up Grafana dashboards
- [ ] Configure alerting rules
- [ ] Document new procedures
- [ ] Train team on MetaMCP UI
- [ ] Deprecate old MCP proxy service
```

### C. Troubleshooting Guide

#### MetaMCP Not Starting

```bash
# Check Docker logs
docker logs nyra-metamcp

# Common issues:
# 1. Port 12008 already in use
netstat -ano | findstr :12008
# Kill process or change port

# 2. Database connection failed
docker exec -it nyra-metamcp-db psql -U postgres -d metamcp

# 3. Redis connection failed
docker exec -it nyra-metamcp-redis redis-cli ping
```

#### MCP Servers Not Registering

```bash
# Check server connectivity from MetaMCP container
docker exec -it nyra-metamcp curl http://host.docker.internal:9000/health

# Verify MCP server logs
docker logs claude-flow-mcp

# Check MetaMCP server configurations
curl http://localhost:12008/api/servers \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Tool Calls Failing

```bash
# Enable debug logging
export LOG_LEVEL=debug

# Check MetaMCP logs for tool call errors
docker logs nyra-metamcp --tail 100

# Test tool call directly
curl -X POST http://localhost:12008/metamcp/development/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "echo",
      "arguments": { "message": "test" }
    },
    "id": 1
  }'
```

#### Performance Issues

```bash
# Check MetaMCP resource usage
docker stats nyra-metamcp

# Check Redis cache hit rate
docker exec -it nyra-metamcp-redis redis-cli INFO stats

# Monitor slow queries
docker exec -it nyra-metamcp-db psql -U postgres -d metamcp \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## Conclusion

MetaMCP provides a robust, enterprise-ready solution for managing multiple MCP servers in Project Nyra. The integration enhances:

- **Developer Experience**: Visual management UI and dynamic configuration
- **Security**: Enterprise authentication with OIDC and OAuth 2.0
- **Observability**: Built-in metrics, logging, and tracing
- **Scalability**: Namespace-based multi-tenancy and tool selection
- **Flexibility**: Pluggable middleware and multiple transport options

**Recommended Next Steps**:

1. **Week 1**: Deploy MetaMCP in development environment
2. **Week 2**: Integrate with Nexus Router (maintain backward compatibility)
3. **Week 3-4**: Implement advanced features (namespaces, middleware, authentication)
4. **Week 5**: Deploy to staging and production

**Total Estimated Effort**: 4-5 weeks with 1 developer

**Risk Level**: Low (can run alongside existing MCP proxy)

---

**Document Status**: ✅ Ready for Implementation
**Next Actions**: Review with team → Create implementation tickets → Begin Phase 1

**Contact**: Research Agent - Project Nyra Swarm
**Date**: 2026-01-10
