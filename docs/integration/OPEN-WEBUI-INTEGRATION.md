# Open-WebUI Integration with Nexus Router

**Status**: Planning Phase
**Version**: 1.0.0
**Created**: 2026-01-10
**Target Completion**: Q1 2026

## Table of Contents

1. [Overview](#overview)
2. [Deployment Plan](#deployment-plan)
3. [Nexus Router Plugin Development](#nexus-router-plugin-development)
4. [Features to Integrate](#features-to-integrate)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Code Examples](#code-examples)
7. [Testing Strategy](#testing-strategy)
8. [Monitoring & Observability](#monitoring--observability)

---

## Overview

This document outlines the integration plan for Open-WebUI with Project Nyra's Nexus Router, enabling intelligent LLM request routing, MCP server management, GPU worker monitoring, and cost tracking through a unified web interface.

### Goals

- **Unified Interface**: Single dashboard for all AI operations
- **Cost Optimization**: Real-time visibility into routing decisions and savings
- **GPU Monitoring**: Live worker health and performance metrics
- **MCP Management**: Configure and monitor MCP servers from UI
- **Developer Experience**: Fuzzy search for tools, models, and prompts

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│            Open-WebUI (Port 3000)               │
│  ┌──────────────────────────────────────────┐  │
│  │  Nexus Router Plugin (Frontend)          │  │
│  │  - Admin Dashboard                       │  │
│  │  - GPU Worker Monitor                    │  │
│  │  - MCP Server Manager                    │  │
│  │  - Cost Tracking Dashboard               │  │
│  │  - Fuzzy Tool Search                     │  │
│  └────────────────┬─────────────────────────┘  │
└───────────────────┼────────────────────────────┘
                    │ HTTP/WebSocket
                    ▼
┌─────────────────────────────────────────────────┐
│        Nexus Router (Port 8000/4001)            │
│  ┌──────────────────────────────────────────┐  │
│  │  Plugin API Endpoints                    │  │
│  │  - /api/plugin/workers                   │  │
│  │  - /api/plugin/mcp-servers               │  │
│  │  - /api/plugin/routing-metrics           │  │
│  │  - /api/plugin/cost-analysis             │  │
│  │  - /ws/plugin/realtime                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────┐  ┌──────────────────────┐   │
│  │ GPU Workers  │  │   MCP Servers        │   │
│  │ - RTX 5090   │  │   - Gemini MCP       │   │
│  │ - RTX 3090   │  │   - Serena MCP       │   │
│  │ - RTX 3060   │  │   - Mem0             │   │
│  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Deployment Plan

### 1. Docker Compose Configuration

We already have Open-WebUI deployed in `infra/docker/docker-compose.ui.yml`. We'll enhance it with plugin support and additional configuration.

#### Enhanced docker-compose.ui.yml

```yaml
version: '3.8'

networks:
  nyra-network:
    external: true

services:
  # Open-WebUI with Nexus Router Plugin
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: nyra-open-webui
    restart: unless-stopped
    environment:
      # Database
      DATABASE_URL: ${DATABASE_URL}

      # OpenAI-compatible API (Nexus Router)
      OPENAI_API_BASE_URL: http://nexus-router:${NEXUS_ROUTER_PORT:-8000}/v1
      OPENAI_API_KEY: ${ANTHROPIC_API_KEY}

      # Authentication
      WEBUI_SECRET_KEY: ${SESSION_SECRET}
      DEFAULT_USER_ROLE: user
      ENABLE_SIGNUP: "false"

      # Features
      ENABLE_RAG: "true"
      ENABLE_IMAGE_GENERATION: "false"
      ENABLE_COMMUNITY_SHARING: "false"

      # Plugin Configuration
      ENABLE_ADMIN_EXPORT: "true"
      ENABLE_ADMIN_CHAT_ACCESS: "true"
      WEBUI_AUTH: "true"

      # Nexus Router Plugin Settings
      NEXUS_ROUTER_API_URL: http://nexus-router:${NEXUS_ROUTER_PORT:-8000}
      NEXUS_ROUTER_PLUGIN_ENABLED: "true"
      NEXUS_ROUTER_WEBSOCKET_URL: ws://nexus-router:${NEXUS_ROUTER_PORT:-8000}/ws/plugin

      # MCP Configuration
      MCP_PROXY_URL: http://nexus-router:${NEXUS_ROUTER_MCP_PORT:-4001}/mcp

      # Integrations
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}

      # Redis for caching
      REDIS_URL: redis://redis:6379

    volumes:
      # Data persistence
      - open_webui_data:/app/backend/data

      # Plugin installation
      - ./plugins/nexus-router-plugin:/app/backend/plugins/nexus-router:ro

      # Custom configuration
      - ./config/open-webui/config.json:/app/backend/config/config.json:ro

    ports:
      - "${OPEN_WEBUI_PORT:-3000}:8080"

    networks:
      - nyra-network

    depends_on:
      nexus-router:
        condition: service_healthy
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.open-webui.rule=Host(`chat.nyra.local`)"
      - "traefik.http.services.open-webui.loadbalancer.server.port=8080"

  # Nexus Router (reference - already defined elsewhere)
  nexus-router:
    image: project-nyra/nexus-router:latest
    container_name: nyra-nexus-router
    restart: unless-stopped
    environment:
      NODE_ENV: production
      NEXUS_ROUTER_PORT: ${NEXUS_ROUTER_PORT:-8000}
      NEXUS_ROUTER_MCP_PORT: ${NEXUS_ROUTER_MCP_PORT:-4001}
      REDIS_URL: redis://redis:6379
      MODEL_ROUTING_STRATEGY: cost-optimized
      MODEL_ROUTING_PREFER_LOCAL: "true"
      MODEL_ROUTING_FALLBACK_CLOUD: "true"
      PLUGIN_API_ENABLED: "true"
      PLUGIN_API_AUTH_TOKEN: ${NEXUS_ROUTER_PLUGIN_TOKEN}
    ports:
      - "${NEXUS_ROUTER_PORT:-8000}:8000"
      - "${NEXUS_ROUTER_MCP_PORT:-4001}:4001"
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  open_webui_data:
    driver: local
```

### 2. Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| Open-WebUI | 3000 | Web interface |
| Nexus Router (HTTP) | 8000 | LLM routing API |
| Nexus Router (MCP) | 4001 | MCP proxy gateway |
| Nexus Router Plugin API | 8000/api/plugin/* | Plugin management |
| WebSocket | 8000/ws/plugin | Real-time updates |
| Redis | 6379 | Caching |
| PostgreSQL | 5432 | Data persistence |

### 3. Volume Management

```yaml
volumes:
  # Open-WebUI data
  open_webui_data:
    driver: local
    driver_opts:
      type: none
      device: /mnt/storage/open-webui
      o: bind

  # Plugin configuration
  plugin_config:
    driver: local
    driver_opts:
      type: none
      device: /mnt/storage/plugins/nexus-router
      o: bind

  # Logs
  plugin_logs:
    driver: local
    driver_opts:
      type: none
      device: /var/log/nexus-router-plugin
      o: bind
```

### 4. Environment Variables

Create `.env.openwebui` file:

```bash
# Core Configuration
OPEN_WEBUI_PORT=3000
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/openwebui
SESSION_SECRET=${RANDOM_SECRET_KEY}

# Nexus Router Integration
NEXUS_ROUTER_PORT=8000
NEXUS_ROUTER_MCP_PORT=4001
NEXUS_ROUTER_API_URL=http://nexus-router:8000
NEXUS_ROUTER_PLUGIN_ENABLED=true
NEXUS_ROUTER_PLUGIN_TOKEN=${PLUGIN_AUTH_TOKEN}

# AI Providers
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
OPENROUTER_API_KEY=${OPENROUTER_API_KEY}

# Redis
REDIS_URL=redis://redis:6379

# Feature Flags
ENABLE_RAG=true
ENABLE_IMAGE_GENERATION=false
ENABLE_COMMUNITY_SHARING=false
```

### 5. Startup Script

Create `scripts/start-open-webui.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting Open-WebUI with Nexus Router Plugin..."

# Load environment variables
if [ -f .env.openwebui ]; then
  source .env.openwebui
else
  echo "❌ .env.openwebui not found!"
  exit 1
fi

# Check if Nexus Router is healthy
echo "🔍 Checking Nexus Router health..."
if curl -f http://localhost:${NEXUS_ROUTER_PORT}/health >/dev/null 2>&1; then
  echo "✅ Nexus Router is healthy"
else
  echo "⚠️ Nexus Router is not responding. Starting it first..."
  docker compose -f infra/docker/docker-compose.orchestration.yml up -d nexus-router
  sleep 10
fi

# Start Open-WebUI with Infisical
echo "🔐 Loading secrets from Infisical..."
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" --path="/shared" -- \
  docker compose -f infra/docker/docker-compose.ui.yml up -d open-webui

# Wait for Open-WebUI to be ready
echo "⏳ Waiting for Open-WebUI to be ready..."
timeout 60 bash -c 'until curl -f http://localhost:3000/health >/dev/null 2>&1; do sleep 2; done'

echo "✅ Open-WebUI is running at http://localhost:3000"
echo "🔧 Nexus Router Plugin API: http://localhost:8000/api/plugin"
echo "📊 Access the admin panel to configure the Nexus Router plugin"
```

---

## Nexus Router Plugin Development

### 1. Plugin Architecture

Open-WebUI supports custom plugins through its plugin system. We'll create a Nexus Router plugin that interfaces with the backend API.

#### Plugin Structure

```
plugins/nexus-router-plugin/
├── manifest.json           # Plugin metadata
├── frontend/
│   ├── index.tsx          # Main plugin component
│   ├── components/
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── WorkerMonitor.tsx    # GPU worker monitoring
│   │   ├── MCPManager.tsx       # MCP server management
│   │   ├── CostTracker.tsx      # Cost analysis dashboard
│   │   ├── FuzzySearch.tsx      # Tool/model fuzzy search
│   │   └── RoutingConfig.tsx    # Routing configuration
│   ├── hooks/
│   │   ├── useWebSocket.ts      # Real-time updates
│   │   ├── useWorkerStats.ts    # Worker statistics
│   │   └── useMCPServers.ts     # MCP server data
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   └── styles/
│       └── plugin.css          # Custom styling
└── backend/
    ├── index.ts               # Backend plugin entry
    ├── api/
    │   ├── workers.ts         # Worker management API
    │   ├── mcp.ts            # MCP server API
    │   ├── routing.ts        # Routing configuration API
    │   ├── metrics.ts        # Metrics and analytics
    │   └── search.ts         # Fuzzy search API
    ├── services/
    │   ├── websocket.ts      # WebSocket service
    │   ├── metrics.ts        # Metrics collection
    │   └── cache.ts          # Caching service
    └── middleware/
        ├── auth.ts           # Authentication
        └── rateLimit.ts      # Rate limiting
```

### 2. Plugin Manifest

Create `plugins/nexus-router-plugin/manifest.json`:

```json
{
  "id": "nexus-router-plugin",
  "name": "Nexus Router Management",
  "version": "1.0.0",
  "description": "Manage GPU workers, MCP servers, and monitor routing metrics for Nexus Router",
  "author": "Project Nyra",
  "homepage": "https://github.com/project-nyra/nexus-router-plugin",
  "icon": "https://cdn.project-nyra.com/icons/nexus-router.svg",

  "permissions": [
    "admin.view",
    "admin.edit",
    "settings.view",
    "settings.edit",
    "api.call"
  ],

  "settings": {
    "nexusRouterUrl": {
      "type": "string",
      "default": "http://nexus-router:8000",
      "label": "Nexus Router URL",
      "required": true
    },
    "mcpProxyUrl": {
      "type": "string",
      "default": "http://nexus-router:4001/mcp",
      "label": "MCP Proxy URL",
      "required": true
    },
    "authToken": {
      "type": "password",
      "label": "Plugin Auth Token",
      "required": true,
      "sensitive": true
    },
    "enableWebSocket": {
      "type": "boolean",
      "default": true,
      "label": "Enable Real-time Updates"
    },
    "refreshInterval": {
      "type": "number",
      "default": 5000,
      "label": "Metrics Refresh Interval (ms)",
      "min": 1000,
      "max": 60000
    },
    "enableCostTracking": {
      "type": "boolean",
      "default": true,
      "label": "Enable Cost Tracking"
    }
  },

  "routes": [
    {
      "path": "/admin/nexus-router",
      "component": "Dashboard",
      "icon": "dashboard",
      "label": "Nexus Router"
    },
    {
      "path": "/admin/nexus-router/workers",
      "component": "WorkerMonitor",
      "icon": "monitoring",
      "label": "GPU Workers"
    },
    {
      "path": "/admin/nexus-router/mcp",
      "component": "MCPManager",
      "icon": "extension",
      "label": "MCP Servers"
    },
    {
      "path": "/admin/nexus-router/costs",
      "component": "CostTracker",
      "icon": "analytics",
      "label": "Cost Analysis"
    }
  ],

  "api": {
    "baseUrl": "/api/plugin/nexus-router",
    "endpoints": [
      {
        "path": "/workers",
        "method": "GET",
        "description": "Get all GPU workers status"
      },
      {
        "path": "/workers/:id",
        "method": "GET",
        "description": "Get specific worker details"
      },
      {
        "path": "/workers/:id/health",
        "method": "POST",
        "description": "Trigger worker health check"
      },
      {
        "path": "/mcp-servers",
        "method": "GET",
        "description": "List all MCP servers"
      },
      {
        "path": "/mcp-servers/:id/status",
        "method": "GET",
        "description": "Get MCP server status"
      },
      {
        "path": "/routing/metrics",
        "method": "GET",
        "description": "Get routing metrics"
      },
      {
        "path": "/routing/config",
        "method": "GET",
        "description": "Get routing configuration"
      },
      {
        "path": "/routing/config",
        "method": "PUT",
        "description": "Update routing configuration"
      },
      {
        "path": "/costs/analysis",
        "method": "GET",
        "description": "Get cost analysis data"
      },
      {
        "path": "/search/tools",
        "method": "GET",
        "description": "Fuzzy search for tools"
      }
    ]
  },

  "websocket": {
    "enabled": true,
    "url": "/ws/plugin/nexus-router",
    "events": [
      "worker.health",
      "worker.metrics",
      "mcp.status",
      "routing.metrics",
      "cost.update"
    ]
  }
}
```

### 3. API Endpoints Design

#### 3.1 Worker Management API

**Endpoint**: `/api/plugin/workers`

```typescript
// GET /api/plugin/workers - List all GPU workers
interface WorkerListResponse {
  workers: Array<{
    id: string;
    name: string;
    gpu: {
      model: string;
      vram: number;
      vramUsed: number;
      utilization: number;
    };
    status: 'healthy' | 'unhealthy' | 'maintenance';
    capacity: {
      maxConcurrent: number;
      currentLoad: number;
    };
    models: string[];
    metrics: {
      avgResponseTime: number;
      requestCount: number;
      errorRate: number;
    };
    lastHealthCheck: string;
  }>;
  summary: {
    totalWorkers: number;
    healthyWorkers: number;
    totalCapacity: number;
    currentLoad: number;
  };
}

// GET /api/plugin/workers/:id - Get worker details
interface WorkerDetailResponse {
  id: string;
  name: string;
  url: string;
  gpu: {
    model: string;
    vram: number;
    vramUsed: number;
    utilization: number;
    temperature: number;
    powerUsage: number;
  };
  status: 'healthy' | 'unhealthy' | 'maintenance';
  capacity: {
    maxConcurrent: number;
    currentLoad: number;
    queueLength: number;
  };
  models: Array<{
    name: string;
    loaded: boolean;
    vramUsage: number;
  }>;
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    tokensPerSecond: number;
  };
  history: Array<{
    timestamp: string;
    load: number;
    responseTime: number;
  }>;
}

// POST /api/plugin/workers/:id/health - Trigger health check
interface HealthCheckResponse {
  id: string;
  healthy: boolean;
  responseTime: number;
  timestamp: string;
  details: {
    gpuAvailable: boolean;
    modelsLoaded: boolean;
    redisConnected: boolean;
  };
}
```

#### 3.2 MCP Server Management API

**Endpoint**: `/api/plugin/mcp-servers`

```typescript
// GET /api/plugin/mcp-servers - List MCP servers
interface MCPServerListResponse {
  servers: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    status: 'online' | 'offline' | 'error';
    version: string;
    capabilities: string[];
    metrics: {
      requestCount: number;
      avgResponseTime: number;
      errorRate: number;
    };
    lastCheck: string;
  }>;
  summary: {
    totalServers: number;
    onlineServers: number;
    totalRequests: number;
  };
}

// GET /api/plugin/mcp-servers/:id/status - Get MCP server status
interface MCPServerStatusResponse {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  uptime: number;
  tools: Array<{
    name: string;
    description: string;
    inputSchema: object;
    enabled: boolean;
  }>;
  resources: Array<{
    uri: string;
    name: string;
    mimeType: string;
  }>;
  metrics: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    avgLatency: number;
  };
  lastError?: {
    message: string;
    timestamp: string;
  };
}

// POST /api/plugin/mcp-servers/:id/tools/:toolName - Call MCP tool
interface MCPToolCallRequest {
  arguments: Record<string, any>;
}

interface MCPToolCallResponse {
  success: boolean;
  result: any;
  executionTime: number;
  timestamp: string;
}
```

#### 3.3 Routing Metrics API

**Endpoint**: `/api/plugin/routing/metrics`

```typescript
// GET /api/plugin/routing/metrics - Get routing metrics
interface RoutingMetricsResponse {
  summary: {
    totalRequests: number;
    localRequests: number;
    cloudRequests: number;
    cachedRequests: number;
    localPercentage: number;
    avgResponseTime: number;
  };
  byWorker: Array<{
    workerId: string;
    workerName: string;
    requestCount: number;
    avgResponseTime: number;
    successRate: number;
  }>;
  byModel: Array<{
    model: string;
    requestCount: number;
    localCount: number;
    cloudCount: number;
  }>;
  timeline: Array<{
    timestamp: string;
    totalRequests: number;
    localRequests: number;
    cloudRequests: number;
    avgResponseTime: number;
  }>;
  routing: {
    strategy: 'cost-optimized' | 'latency-optimized' | 'quality-optimized';
    preferLocal: boolean;
    fallbackCloud: boolean;
    cacheEnabled: boolean;
  };
}

// GET /api/plugin/routing/config - Get routing configuration
interface RoutingConfigResponse {
  strategy: 'cost-optimized' | 'latency-optimized' | 'quality-optimized';
  preferLocal: boolean;
  fallbackCloud: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
  maxRetries: number;
  timeout: number;
  rateLimit: {
    enabled: boolean;
    maxRequestsPerMinute: number;
  };
  modelMapping: Record<string, {
    preferredWorker?: string;
    fallbackWorkers: string[];
    cloudFallback: boolean;
  }>;
}

// PUT /api/plugin/routing/config - Update routing configuration
interface UpdateRoutingConfigRequest {
  strategy?: 'cost-optimized' | 'latency-optimized' | 'quality-optimized';
  preferLocal?: boolean;
  fallbackCloud?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  maxRetries?: number;
  timeout?: number;
}
```

#### 3.4 Cost Analysis API

**Endpoint**: `/api/plugin/costs/analysis`

```typescript
// GET /api/plugin/costs/analysis - Get cost analysis
interface CostAnalysisResponse {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalCost: number;
    localCost: number;
    cloudCost: number;
    savingsAmount: number;
    savingsPercentage: number;
  };
  breakdown: {
    byProvider: Array<{
      provider: 'local' | 'anthropic' | 'openrouter' | 'gemini';
      requestCount: number;
      cost: number;
      avgCostPerRequest: number;
    }>;
    byModel: Array<{
      model: string;
      requestCount: number;
      tokenCount: number;
      cost: number;
      avgCostPerRequest: number;
    }>;
    byWorker: Array<{
      workerId: string;
      workerName: string;
      requestCount: number;
      estimatedElectricityCost: number;
      cloudCostSaved: number;
    }>;
  };
  projections: {
    monthly: {
      estimatedCost: number;
      estimatedSavings: number;
    };
    yearly: {
      estimatedCost: number;
      estimatedSavings: number;
    };
  };
  trends: Array<{
    date: string;
    totalCost: number;
    localCost: number;
    cloudCost: number;
  }>;
}
```

#### 3.5 Fuzzy Search API

**Endpoint**: `/api/plugin/search/tools`

```typescript
// GET /api/plugin/search/tools?q=query - Fuzzy search
interface FuzzySearchRequest {
  q: string;
  type?: 'tools' | 'models' | 'prompts' | 'all';
  limit?: number;
}

interface FuzzySearchResponse {
  query: string;
  results: Array<{
    type: 'tool' | 'model' | 'prompt';
    id: string;
    name: string;
    description: string;
    score: number;
    metadata: {
      server?: string;
      provider?: string;
      category?: string;
    };
    snippet: string;
  }>;
  suggestions: string[];
}
```

### 4. Authentication Strategy

The plugin uses token-based authentication to secure API endpoints.

```typescript
// backend/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  pluginAuth?: {
    userId: string;
    role: string;
  };
}

export const authenticatePlugin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Nexus Router
    const response = await fetch(
      `${process.env.NEXUS_ROUTER_API_URL}/api/auth/verify-plugin-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!response.ok) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    const authData = await response.json();
    req.pluginAuth = authData;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.pluginAuth || req.pluginAuth.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
};
```

### 5. Real-time Updates via WebSocket

```typescript
// backend/services/websocket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocketToken } from '../middleware/auth';

export class PluginWebSocketService {
  private io: SocketIOServer;
  private nexusRouterWS: WebSocket;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      path: '/ws/plugin',
      cors: {
        origin: process.env.OPEN_WEBUI_URL,
        credentials: true,
      },
    });

    this.setupAuthentication();
    this.connectToNexusRouter();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const auth = await authenticateSocketToken(token);
        socket.data.auth = auth;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private connectToNexusRouter() {
    const wsUrl = `${process.env.NEXUS_ROUTER_API_URL.replace('http', 'ws')}/ws/metrics`;
    this.nexusRouterWS = new WebSocket(wsUrl);

    this.nexusRouterWS.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.broadcastToClients(message);
    });

    this.nexusRouterWS.on('close', () => {
      console.log('Nexus Router WebSocket closed. Reconnecting...');
      setTimeout(() => this.connectToNexusRouter(), 5000);
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Plugin client connected:', socket.id);

      // Subscribe to specific events
      socket.on('subscribe', (events: string[]) => {
        events.forEach((event) => {
          socket.join(event);
        });
      });

      // Unsubscribe from events
      socket.on('unsubscribe', (events: string[]) => {
        events.forEach((event) => {
          socket.leave(event);
        });
      });

      // Request current state
      socket.on('request-state', async () => {
        const state = await this.getCurrentState();
        socket.emit('state', state);
      });

      socket.on('disconnect', () => {
        console.log('Plugin client disconnected:', socket.id);
      });
    });
  }

  private broadcastToClients(message: any) {
    const { event, data } = message;

    // Broadcast to rooms subscribed to this event
    this.io.to(event).emit(event, data);

    // Also broadcast to 'all' room
    this.io.to('all').emit(event, data);
  }

  private async getCurrentState() {
    // Fetch current state from Nexus Router
    const [workers, mcpServers, metrics] = await Promise.all([
      this.fetchWorkers(),
      this.fetchMCPServers(),
      this.fetchMetrics(),
    ]);

    return {
      workers,
      mcpServers,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  // Helper methods to fetch data
  private async fetchWorkers() {
    // Implementation
  }

  private async fetchMCPServers() {
    // Implementation
  }

  private async fetchMetrics() {
    // Implementation
  }
}
```

---

## Features to Integrate

### 1. MCP Server Management

**Features**:
- List all registered MCP servers
- View server status and capabilities
- Test server connections
- View available tools and resources
- Enable/disable MCP servers
- Configure server settings
- View server logs and errors

**UI Components**:
```tsx
// frontend/components/MCPManager.tsx
import React, { useState, useEffect } from 'react';
import { useMCPServers } from '../hooks/useMCPServers';

interface MCPServer {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  version: string;
  capabilities: string[];
  tools: Array<{
    name: string;
    description: string;
  }>;
}

export const MCPManager: React.FC = () => {
  const { servers, loading, error, refresh, testConnection } = useMCPServers();
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);

  return (
    <div className="mcp-manager">
      <div className="header">
        <h2>MCP Server Management</h2>
        <button onClick={refresh}>Refresh</button>
      </div>

      <div className="server-grid">
        {servers.map((server) => (
          <div
            key={server.id}
            className={`server-card ${server.status}`}
            onClick={() => setSelectedServer(server)}
          >
            <div className="server-header">
              <h3>{server.name}</h3>
              <span className={`status-badge ${server.status}`}>
                {server.status}
              </span>
            </div>

            <div className="server-info">
              <p><strong>Type:</strong> {server.type}</p>
              <p><strong>Version:</strong> {server.version}</p>
              <p><strong>Tools:</strong> {server.tools.length}</p>
            </div>

            <div className="server-actions">
              <button onClick={() => testConnection(server.id)}>
                Test Connection
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedServer && (
        <MCPServerDetails
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
        />
      )}
    </div>
  );
};
```

### 2. Model Routing Configuration

**Features**:
- View current routing strategy
- Change routing strategy (cost/latency/quality optimized)
- Configure model-to-worker mapping
- Set fallback preferences
- Configure cache settings
- View routing decision history

**UI Components**:
```tsx
// frontend/components/RoutingConfig.tsx
import React, { useState } from 'react';
import { useRoutingConfig } from '../hooks/useRoutingConfig';

export const RoutingConfig: React.FC = () => {
  const { config, updateConfig, loading } = useRoutingConfig();
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="routing-config">
      <div className="config-section">
        <h3>Routing Strategy</h3>
        <select
          value={config.strategy}
          onChange={(e) => updateConfig({ strategy: e.target.value })}
          disabled={!editMode}
        >
          <option value="cost-optimized">Cost Optimized (90% savings)</option>
          <option value="latency-optimized">Latency Optimized (fastest)</option>
          <option value="quality-optimized">Quality Optimized (best models)</option>
        </select>
      </div>

      <div className="config-section">
        <h3>Preferences</h3>
        <label>
          <input
            type="checkbox"
            checked={config.preferLocal}
            onChange={(e) => updateConfig({ preferLocal: e.target.checked })}
            disabled={!editMode}
          />
          Prefer Local GPU Workers
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.fallbackCloud}
            onChange={(e) => updateConfig({ fallbackCloud: e.target.checked })}
            disabled={!editMode}
          />
          Enable Cloud Fallback
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.cacheEnabled}
            onChange={(e) => updateConfig({ cacheEnabled: e.target.checked })}
            disabled={!editMode}
          />
          Enable Response Caching
        </label>
      </div>

      <div className="config-actions">
        {editMode ? (
          <>
            <button onClick={() => setEditMode(false)}>Cancel</button>
            <button onClick={() => {
              updateConfig(config);
              setEditMode(false);
            }}>
              Save Changes
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)}>Edit Configuration</button>
        )}
      </div>
    </div>
  );
};
```

### 3. GPU Worker Monitoring

**Features**:
- Real-time GPU utilization graphs
- VRAM usage monitoring
- Temperature and power monitoring
- Request queue visualization
- Performance metrics (tokens/sec, latency)
- Model loading status
- Historical data and trends

**UI Components**:
```tsx
// frontend/components/WorkerMonitor.tsx
import React from 'react';
import { useWorkerStats } from '../hooks/useWorkerStats';
import { Line, Bar } from 'react-chartjs-2';

export const WorkerMonitor: React.FC = () => {
  const { workers, stats, loading } = useWorkerStats();

  return (
    <div className="worker-monitor">
      <div className="workers-grid">
        {workers.map((worker) => (
          <div key={worker.id} className="worker-card">
            <div className="worker-header">
              <h3>{worker.name}</h3>
              <span className={`status ${worker.status}`}>
                {worker.status}
              </span>
            </div>

            <div className="gpu-info">
              <h4>{worker.gpu.model}</h4>
              <div className="vram-usage">
                <div className="usage-bar">
                  <div
                    className="usage-fill"
                    style={{
                      width: `${(worker.gpu.vramUsed / worker.gpu.vram) * 100}%`
                    }}
                  />
                </div>
                <span>
                  {worker.gpu.vramUsed}GB / {worker.gpu.vram}GB VRAM
                </span>
              </div>

              <div className="metrics-grid">
                <div className="metric">
                  <span className="label">GPU Utilization</span>
                  <span className="value">{worker.gpu.utilization}%</span>
                </div>
                <div className="metric">
                  <span className="label">Temperature</span>
                  <span className="value">{worker.gpu.temperature}°C</span>
                </div>
                <div className="metric">
                  <span className="label">Power Usage</span>
                  <span className="value">{worker.gpu.powerUsage}W</span>
                </div>
                <div className="metric">
                  <span className="label">Active Requests</span>
                  <span className="value">
                    {worker.capacity.currentLoad}/{worker.capacity.maxConcurrent}
                  </span>
                </div>
              </div>
            </div>

            <div className="worker-models">
              <h4>Loaded Models</h4>
              <ul>
                {worker.models.map((model) => (
                  <li key={model.name}>
                    <span className={`model-status ${model.loaded ? 'loaded' : 'unloaded'}`}>
                      {model.name}
                    </span>
                    <span className="model-vram">{model.vramUsage}GB</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="performance-chart">
              <h4>Response Time (Last Hour)</h4>
              <Line
                data={{
                  labels: stats[worker.id]?.timeline.map(t => t.timestamp),
                  datasets: [{
                    label: 'Response Time (ms)',
                    data: stats[worker.id]?.timeline.map(t => t.responseTime),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 4. Fuzzy Tool Search Interface

**Features**:
- Fast fuzzy search across all MCP tools
- Search by tool name, description, or capability
- Filter by MCP server
- View tool schemas and examples
- Quick tool invocation
- Recent searches history
- Search suggestions

**Implementation**:
```tsx
// frontend/components/FuzzySearch.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';
import debounce from 'lodash/debounce';

interface SearchResult {
  type: 'tool' | 'model' | 'prompt';
  id: string;
  name: string;
  description: string;
  score: number;
  metadata: Record<string, any>;
  snippet: string;
}

export const FuzzySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/plugin/nexus-router/search/tools?q=${encodeURIComponent(searchQuery)}&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${getPluginToken()}`,
            },
          }
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  const handleSelectResult = (result: SearchResult) => {
    // Open tool details modal or invoke tool
    console.log('Selected:', result);
  };

  const highlightMatch = (text: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  return (
    <div className="fuzzy-search">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search tools, models, prompts... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <span className="search-loading">Searching...</span>}
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <div
              key={result.id}
              className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectResult(result)}
            >
              <div className="result-header">
                <span className={`result-type ${result.type}`}>
                  {result.type}
                </span>
                <span className="result-name">{result.name}</span>
                <span className="result-score">{Math.round(result.score * 100)}%</span>
              </div>

              <p
                className="result-description"
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(result.description, query)
                }}
              />

              {result.metadata.server && (
                <span className="result-server">
                  MCP: {result.metadata.server}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && !loading && (
        <div className="no-results">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};

// Global keyboard shortcut
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    // Open fuzzy search modal
    openFuzzySearchModal();
  }
});
```

### 5. Cost Tracking Dashboard

**Features**:
- Real-time cost monitoring
- Local vs. cloud cost comparison
- Savings visualization
- Cost breakdown by provider/model/worker
- Monthly/yearly projections
- Cost trend analysis
- Export cost reports

**UI Components**:
```tsx
// frontend/components/CostTracker.tsx
import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { useCostAnalysis } from '../hooks/useCostAnalysis';

export const CostTracker: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const { analysis, loading } = useCostAnalysis(period);

  if (loading) return <div>Loading cost analysis...</div>;

  return (
    <div className="cost-tracker">
      {/* Summary Cards */}
      <div className="cost-summary">
        <div className="cost-card">
          <h3>Total Cost</h3>
          <div className="cost-value">${analysis.summary.totalCost.toFixed(2)}</div>
          <span className="cost-period">This {period}</span>
        </div>

        <div className="cost-card local">
          <h3>Local GPU Cost</h3>
          <div className="cost-value">${analysis.summary.localCost.toFixed(2)}</div>
          <span className="cost-detail">
            Electricity: ~$0.15/kWh
          </span>
        </div>

        <div className="cost-card cloud">
          <h3>Cloud API Cost</h3>
          <div className="cost-value">${analysis.summary.cloudCost.toFixed(2)}</div>
          <span className="cost-detail">
            {analysis.breakdown.byProvider.filter(p => p.provider !== 'local').length} providers
          </span>
        </div>

        <div className="cost-card savings">
          <h3>Total Savings</h3>
          <div className="cost-value savings">
            ${analysis.summary.savingsAmount.toFixed(2)}
          </div>
          <span className="cost-percentage">
            {analysis.summary.savingsPercentage.toFixed(1)}% saved
          </span>
        </div>
      </div>

      {/* Cost Distribution */}
      <div className="cost-charts">
        <div className="chart-container">
          <h3>Cost by Provider</h3>
          <Pie
            data={{
              labels: analysis.breakdown.byProvider.map(p => p.provider),
              datasets: [{
                data: analysis.breakdown.byProvider.map(p => p.cost),
                backgroundColor: [
                  '#4CAF50', // local - green
                  '#2196F3', // anthropic - blue
                  '#FF9800', // openrouter - orange
                  '#9C27B0', // gemini - purple
                ],
              }]
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Cost Trend</h3>
          <Line
            data={{
              labels: analysis.trends.map(t => t.date),
              datasets: [
                {
                  label: 'Local Cost',
                  data: analysis.trends.map(t => t.localCost),
                  borderColor: '#4CAF50',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                },
                {
                  label: 'Cloud Cost',
                  data: analysis.trends.map(t => t.cloudCost),
                  borderColor: '#2196F3',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                }
              ]
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Cost by Model</h3>
          <Bar
            data={{
              labels: analysis.breakdown.byModel.map(m => m.model),
              datasets: [{
                label: 'Cost ($)',
                data: analysis.breakdown.byModel.map(m => m.cost),
                backgroundColor: 'rgba(156, 39, 176, 0.6)',
              }]
            }}
            options={{
              indexAxis: 'y',
            }}
          />
        </div>
      </div>

      {/* Projections */}
      <div className="cost-projections">
        <h3>Cost Projections</h3>
        <div className="projection-cards">
          <div className="projection-card">
            <span className="projection-label">Estimated Monthly</span>
            <span className="projection-value">
              ${analysis.projections.monthly.estimatedCost.toFixed(2)}
            </span>
            <span className="projection-savings">
              Save ${analysis.projections.monthly.estimatedSavings.toFixed(2)}/mo
            </span>
          </div>

          <div className="projection-card">
            <span className="projection-label">Estimated Yearly</span>
            <span className="projection-value">
              ${analysis.projections.yearly.estimatedCost.toFixed(2)}
            </span>
            <span className="projection-savings">
              Save ${analysis.projections.yearly.estimatedSavings.toFixed(2)}/yr
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="cost-breakdown">
        <h3>Detailed Breakdown</h3>
        <table className="breakdown-table">
          <thead>
            <tr>
              <th>Worker/Provider</th>
              <th>Requests</th>
              <th>Avg Cost/Request</th>
              <th>Total Cost</th>
              <th>Savings</th>
            </tr>
          </thead>
          <tbody>
            {analysis.breakdown.byWorker.map((worker) => (
              <tr key={worker.workerId}>
                <td>{worker.workerName}</td>
                <td>{worker.requestCount}</td>
                <td>
                  ${(worker.estimatedElectricityCost / worker.requestCount).toFixed(4)}
                </td>
                <td>${worker.estimatedElectricityCost.toFixed(2)}</td>
                <td className="savings">
                  +${worker.cloudCostSaved.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Actions */}
      <div className="cost-actions">
        <button onClick={() => exportCostReport('csv')}>
          Export CSV
        </button>
        <button onClick={() => exportCostReport('pdf')}>
          Export PDF Report
        </button>
      </div>
    </div>
  );
};
```

---

## Implementation Roadmap

### Phase 1: Deploy Open-WebUI (Week 1-2)

**Objectives**:
- Set up Open-WebUI with enhanced Docker configuration
- Configure environment variables and secrets with Infisical
- Integrate with existing Nexus Router
- Verify basic functionality

**Tasks**:
1. Update `docker-compose.ui.yml` with enhanced configuration
2. Create `.env.openwebui` with all required variables
3. Create startup script `start-open-webui.sh`
4. Deploy and verify health checks
5. Configure reverse proxy (Traefik) if needed
6. Test basic chat functionality with Nexus Router

**Success Criteria**:
- Open-WebUI accessible at `http://localhost:3000`
- Successfully routes requests to Nexus Router
- Health checks passing
- User authentication working
- Basic chat functionality operational

**Deliverables**:
- Updated docker-compose configuration
- Environment configuration files
- Startup scripts
- Basic documentation

### Phase 2: Create Basic Plugin (Week 3-4)

**Objectives**:
- Set up plugin development environment
- Create plugin manifest and structure
- Implement basic plugin UI skeleton
- Set up plugin API endpoints on Nexus Router

**Tasks**:
1. Create plugin directory structure
2. Write `manifest.json` with metadata and permissions
3. Create basic React components for plugin UI
4. Implement authentication middleware
5. Create initial API endpoints:
   - `/api/plugin/health`
   - `/api/plugin/info`
   - `/api/plugin/workers` (read-only)
6. Test plugin installation in Open-WebUI

**Success Criteria**:
- Plugin appears in Open-WebUI admin panel
- Plugin can be enabled/disabled
- Basic API endpoints respond correctly
- Authentication works

**Deliverables**:
- Plugin manifest
- Basic UI components
- API endpoint stubs
- Authentication middleware

### Phase 3: Add Nexus Router Endpoints (Week 5-7)

**Objectives**:
- Implement complete API endpoint suite
- Add WebSocket support for real-time updates
- Implement caching and performance optimizations
- Add comprehensive error handling

**Tasks**:
1. Implement Worker Management API:
   - List workers
   - Get worker details
   - Trigger health checks
2. Implement MCP Server Management API:
   - List MCP servers
   - Get server status
   - Test connections
3. Implement Routing Metrics API:
   - Get current metrics
   - Get routing configuration
   - Update routing configuration
4. Implement Cost Analysis API:
   - Get cost breakdown
   - Get projections
   - Export reports
5. Implement Fuzzy Search API:
   - Search tools, models, prompts
   - Return ranked results
6. Set up WebSocket service:
   - Real-time worker metrics
   - MCP server status updates
   - Routing metrics stream

**Success Criteria**:
- All API endpoints functional
- WebSocket connections stable
- Response times < 100ms for most endpoints
- Proper error handling and validation
- API documentation complete

**Deliverables**:
- Complete API implementation
- WebSocket service
- API documentation (OpenAPI spec)
- Unit tests for all endpoints

### Phase 4: Build Admin Interface (Week 8-10)

**Objectives**:
- Implement all UI components
- Add real-time data visualization
- Implement user interactions and controls
- Add responsive design and accessibility

**Tasks**:
1. Implement Dashboard component:
   - Overview metrics
   - Quick actions
   - System health status
2. Implement WorkerMonitor component:
   - GPU utilization graphs
   - VRAM usage visualization
   - Performance metrics
   - Model status
3. Implement MCPManager component:
   - Server list and status
   - Tool browser
   - Connection testing
4. Implement CostTracker component:
   - Cost summary cards
   - Cost distribution charts
   - Trend visualization
   - Projection displays
5. Implement RoutingConfig component:
   - Strategy selection
   - Preference toggles
   - Model mapping configuration
6. Implement FuzzySearch component:
   - Search input with keyboard shortcuts
   - Result display
   - Quick actions
7. Add custom hooks:
   - `useWebSocket` for real-time updates
   - `useWorkerStats` for worker data
   - `useMCPServers` for MCP data
   - `useCostAnalysis` for cost data
   - `useRoutingConfig` for routing config
8. Implement styling and theming
9. Add accessibility features (ARIA labels, keyboard navigation)
10. Add responsive design for mobile/tablet

**Success Criteria**:
- All UI components functional
- Real-time updates working via WebSocket
- Charts and visualizations render correctly
- Responsive design works on all screen sizes
- Accessibility audit passes
- User interactions smooth and intuitive

**Deliverables**:
- Complete UI implementation
- Custom hooks
- Component documentation
- Storybook stories for components
- Accessibility report

### Phase 5: Testing and Documentation (Week 11-12)

**Objectives**:
- Comprehensive testing of all features
- Performance optimization
- Complete documentation
- User acceptance testing

**Tasks**:
1. Write unit tests:
   - Backend API endpoints
   - Frontend components
   - Custom hooks
   - Utility functions
2. Write integration tests:
   - Plugin installation/uninstallation
   - API integration with Nexus Router
   - WebSocket connections
   - End-to-end user flows
3. Perform load testing:
   - Concurrent users
   - WebSocket connections
   - API throughput
4. Optimize performance:
   - Bundle size reduction
   - Code splitting
   - Lazy loading
   - Caching strategies
5. Write documentation:
   - Installation guide
   - User guide
   - API reference
   - Troubleshooting guide
6. Create video tutorials:
   - Plugin installation
   - Feature walkthroughs
   - Configuration guide
7. Conduct user acceptance testing
8. Fix bugs and issues
9. Prepare for production deployment

**Success Criteria**:
- Test coverage > 80%
- All integration tests passing
- Load tests show acceptable performance
- Documentation complete and accurate
- UAT feedback incorporated
- Zero critical bugs

**Deliverables**:
- Test suite (unit + integration)
- Performance benchmarks
- Complete documentation
- Video tutorials
- Release notes
- Deployment guide

---

## Code Examples

### Example 1: Backend API - Worker Management

```typescript
// backend/api/workers.ts
import { Router, Request, Response } from 'express';
import { authenticatePlugin, requireAdmin } from '../middleware/auth';
import { WorkerService } from '../services/worker.service';

export const workersRouter = Router();
const workerService = new WorkerService();

// GET /api/plugin/workers - List all workers
workersRouter.get(
  '/workers',
  authenticatePlugin,
  async (req: Request, res: Response) => {
    try {
      const workers = await workerService.getAllWorkers();
      const summary = await workerService.getWorkersSummary();

      res.json({
        workers,
        summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching workers:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch workers',
      });
    }
  }
);

// GET /api/plugin/workers/:id - Get worker details
workersRouter.get(
  '/workers/:id',
  authenticatePlugin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const worker = await workerService.getWorkerById(id);

      if (!worker) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Worker with id ${id} not found`,
        });
      }

      const metrics = await workerService.getWorkerMetrics(id);
      const history = await workerService.getWorkerHistory(id, 3600); // Last hour

      res.json({
        ...worker,
        metrics,
        history,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching worker details:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch worker details',
      });
    }
  }
);

// POST /api/plugin/workers/:id/health - Trigger health check
workersRouter.post(
  '/workers/:id/health',
  authenticatePlugin,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const healthCheck = await workerService.performHealthCheck(id);

      res.json({
        id,
        ...healthCheck,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error performing health check:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Health check failed',
      });
    }
  }
);

// WorkerService implementation
export class WorkerService {
  private nexusRouterUrl: string;
  private authToken: string;

  constructor() {
    this.nexusRouterUrl = process.env.NEXUS_ROUTER_API_URL!;
    this.authToken = process.env.NEXUS_ROUTER_PLUGIN_TOKEN!;
  }

  async getAllWorkers() {
    const response = await fetch(`${this.nexusRouterUrl}/api/workers`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workers from Nexus Router');
    }

    return response.json();
  }

  async getWorkersSummary() {
    const workers = await this.getAllWorkers();

    return {
      totalWorkers: workers.length,
      healthyWorkers: workers.filter((w: any) => w.status === 'healthy').length,
      totalCapacity: workers.reduce((sum: number, w: any) => sum + w.capacity.maxConcurrent, 0),
      currentLoad: workers.reduce((sum: number, w: any) => sum + w.capacity.currentLoad, 0),
    };
  }

  async getWorkerById(id: string) {
    const response = await fetch(`${this.nexusRouterUrl}/api/workers/${id}`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch worker details');
    }

    return response.json();
  }

  async getWorkerMetrics(id: string) {
    const response = await fetch(`${this.nexusRouterUrl}/api/workers/${id}/metrics`, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch worker metrics');
    }

    return response.json();
  }

  async getWorkerHistory(id: string, seconds: number) {
    const response = await fetch(
      `${this.nexusRouterUrl}/api/workers/${id}/history?seconds=${seconds}`,
      {
        headers: { Authorization: `Bearer ${this.authToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch worker history');
    }

    return response.json();
  }

  async performHealthCheck(id: string) {
    const response = await fetch(`${this.nexusRouterUrl}/api/workers/${id}/health`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.authToken}` },
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}
```

### Example 2: Frontend Hook - useWebSocket

```typescript
// frontend/hooks/useWebSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface WebSocketOptions {
  url: string;
  events: string[];
  authToken: string;
  reconnect?: boolean;
  reconnectDelay?: number;
}

interface WebSocketState {
  connected: boolean;
  error: Error | null;
  lastMessage: any;
  messageCount: number;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    error: null,
    lastMessage: null,
    messageCount: 0,
  });

  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Connect to WebSocket server
  useEffect(() => {
    const socket = io(options.url, {
      path: '/ws/plugin',
      auth: {
        token: options.authToken,
      },
      reconnection: options.reconnect ?? true,
      reconnectionDelay: options.reconnectDelay ?? 5000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState((prev) => ({ ...prev, connected: true, error: null }));

      // Subscribe to events
      socket.emit('subscribe', options.events);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setState((prev) => ({ ...prev, connected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState((prev) => ({ ...prev, connected: false, error }));
    });

    // Set up event listeners
    options.events.forEach((event) => {
      socket.on(event, (data) => {
        setState((prev) => ({
          ...prev,
          lastMessage: { event, data },
          messageCount: prev.messageCount + 1,
        }));

        // Call registered listeners
        const listeners = listenersRef.current.get(event);
        if (listeners) {
          listeners.forEach((listener) => listener(data));
        }
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [options.url, options.authToken, JSON.stringify(options.events)]);

  // Subscribe to specific event
  const on = useCallback((event: string, callback: Function) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      listenersRef.current.get(event)?.delete(callback);
    };
  }, []);

  // Emit event to server
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit: WebSocket not connected');
    }
  }, []);

  // Request current state
  const requestState = useCallback(() => {
    emit('request-state');
  }, [emit]);

  return {
    ...state,
    on,
    emit,
    requestState,
  };
};
```

### Example 3: Fuzzy Search Implementation

```typescript
// backend/services/fuzzy-search.service.ts
import Fuse from 'fuse.js';
import { MCPServer, Tool, Model, Prompt } from '../types';

interface SearchableItem {
  id: string;
  type: 'tool' | 'model' | 'prompt';
  name: string;
  description: string;
  metadata: Record<string, any>;
  content: string; // Combined searchable content
}

export class FuzzySearchService {
  private fuse: Fuse<SearchableItem> | null = null;
  private searchIndex: SearchableItem[] = [];

  constructor() {
    this.initializeIndex();
  }

  async initializeIndex() {
    console.log('Building fuzzy search index...');

    // Fetch all searchable items
    const [tools, models, prompts] = await Promise.all([
      this.fetchAllTools(),
      this.fetchAllModels(),
      this.fetchAllPrompts(),
    ]);

    // Build search index
    this.searchIndex = [
      ...tools.map(this.toolToSearchableItem),
      ...models.map(this.modelToSearchableItem),
      ...prompts.map(this.promptToSearchableItem),
    ];

    // Initialize Fuse.js
    this.fuse = new Fuse(this.searchIndex, {
      keys: [
        { name: 'name', weight: 2.0 },
        { name: 'description', weight: 1.5 },
        { name: 'content', weight: 1.0 },
        { name: 'metadata.server', weight: 0.5 },
        { name: 'metadata.category', weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });

    console.log(`Fuzzy search index built with ${this.searchIndex.length} items`);
  }

  async search(query: string, type?: string, limit: number = 20) {
    if (!this.fuse) {
      throw new Error('Search index not initialized');
    }

    // Perform fuzzy search
    let results = this.fuse.search(query, { limit: limit * 2 });

    // Filter by type if specified
    if (type && type !== 'all') {
      results = results.filter((r) => r.item.type === type);
    }

    // Limit results
    results = results.slice(0, limit);

    // Format results
    return results.map((result) => ({
      type: result.item.type,
      id: result.item.id,
      name: result.item.name,
      description: result.item.description,
      score: 1 - (result.score || 0), // Invert score (higher is better)
      metadata: result.item.metadata,
      snippet: this.createSnippet(result.item.content, query),
    }));
  }

  async getSuggestions(query: string) {
    if (!this.fuse || query.length < 2) {
      return [];
    }

    const results = this.fuse.search(query, { limit: 5 });

    return results
      .map((r) => r.item.name)
      .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()));
  }

  private toolToSearchableItem(tool: Tool): SearchableItem {
    return {
      id: tool.id,
      type: 'tool',
      name: tool.name,
      description: tool.description,
      metadata: {
        server: tool.server,
        category: tool.category,
      },
      content: `${tool.name} ${tool.description} ${JSON.stringify(tool.inputSchema)}`,
    };
  }

  private modelToSearchableItem(model: Model): SearchableItem {
    return {
      id: model.id,
      type: 'model',
      name: model.name,
      description: model.description || '',
      metadata: {
        provider: model.provider,
        category: model.category,
      },
      content: `${model.name} ${model.description} ${model.capabilities.join(' ')}`,
    };
  }

  private promptToSearchableItem(prompt: Prompt): SearchableItem {
    return {
      id: prompt.id,
      type: 'prompt',
      name: prompt.name,
      description: prompt.description,
      metadata: {
        category: prompt.category,
        tags: prompt.tags,
      },
      content: `${prompt.name} ${prompt.description} ${prompt.content}`,
    };
  }

  private createSnippet(content: string, query: string, length: number = 150): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
      return content.substring(0, length) + '...';
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 100);

    let snippet = content.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';

    return snippet;
  }

  private async fetchAllTools(): Promise<Tool[]> {
    // Fetch from all MCP servers
    const response = await fetch(`${process.env.NEXUS_ROUTER_API_URL}/api/mcp/tools`, {
      headers: { Authorization: `Bearer ${process.env.NEXUS_ROUTER_PLUGIN_TOKEN}` },
    });

    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  }

  private async fetchAllModels(): Promise<Model[]> {
    // Fetch available models
    const response = await fetch(`${process.env.NEXUS_ROUTER_API_URL}/api/models`, {
      headers: { Authorization: `Bearer ${process.env.NEXUS_ROUTER_PLUGIN_TOKEN}` },
    });

    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  }

  private async fetchAllPrompts(): Promise<Prompt[]> {
    // Fetch saved prompts
    const response = await fetch(`${process.env.NEXUS_ROUTER_API_URL}/api/prompts`, {
      headers: { Authorization: `Bearer ${process.env.NEXUS_ROUTER_PLUGIN_TOKEN}` },
    });

    if (!response.ok) throw new Error('Failed to fetch prompts');
    return response.json();
  }
}
```

---

## Testing Strategy

### 1. Unit Tests

```typescript
// backend/api/__tests__/workers.test.ts
import request from 'supertest';
import { app } from '../../../app';
import { WorkerService } from '../../services/worker.service';

jest.mock('../../services/worker.service');

describe('Workers API', () => {
  let authToken: string;

  beforeAll(() => {
    authToken = 'test-token';
  });

  describe('GET /api/plugin/workers', () => {
    it('should return all workers', async () => {
      const mockWorkers = [
        {
          id: 'worker-1',
          name: 'RTX 5090',
          status: 'healthy',
        },
      ];

      (WorkerService.prototype.getAllWorkers as jest.Mock).mockResolvedValue(mockWorkers);
      (WorkerService.prototype.getWorkersSummary as jest.Mock).mockResolvedValue({
        totalWorkers: 1,
        healthyWorkers: 1,
      });

      const response = await request(app)
        .get('/api/plugin/workers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('workers');
      expect(response.body.workers).toHaveLength(1);
      expect(response.body).toHaveProperty('summary');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/plugin/workers')
        .expect(401);
    });
  });

  describe('GET /api/plugin/workers/:id', () => {
    it('should return worker details', async () => {
      const mockWorker = {
        id: 'worker-1',
        name: 'RTX 5090',
        gpu: {
          model: 'RTX 5090',
          vram: 48,
        },
      };

      (WorkerService.prototype.getWorkerById as jest.Mock).mockResolvedValue(mockWorker);
      (WorkerService.prototype.getWorkerMetrics as jest.Mock).mockResolvedValue({});
      (WorkerService.prototype.getWorkerHistory as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/plugin/workers/worker-1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 'worker-1');
      expect(response.body).toHaveProperty('gpu');
    });

    it('should return 404 for non-existent worker', async () => {
      (WorkerService.prototype.getWorkerById as jest.Mock).mockResolvedValue(null);

      await request(app)
        .get('/api/plugin/workers/nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
```

### 2. Integration Tests

```typescript
// tests/integration/plugin-api.test.ts
import { setupTestEnvironment, teardownTestEnvironment } from './helpers';

describe('Plugin API Integration', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  describe('End-to-End Flow', () => {
    it('should fetch workers, get details, and trigger health check', async () => {
      // 1. Get all workers
      const workersResponse = await fetch('http://localhost:8000/api/plugin/workers', {
        headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` },
      });

      expect(workersResponse.ok).toBe(true);
      const { workers } = await workersResponse.json();
      expect(workers.length).toBeGreaterThan(0);

      // 2. Get details for first worker
      const workerId = workers[0].id;
      const detailsResponse = await fetch(
        `http://localhost:8000/api/plugin/workers/${workerId}`,
        {
          headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` },
        }
      );

      expect(detailsResponse.ok).toBe(true);
      const workerDetails = await detailsResponse.json();
      expect(workerDetails).toHaveProperty('gpu');
      expect(workerDetails).toHaveProperty('metrics');

      // 3. Trigger health check
      const healthCheckResponse = await fetch(
        `http://localhost:8000/api/plugin/workers/${workerId}/health`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.TEST_TOKEN}` },
        }
      );

      expect(healthCheckResponse.ok).toBe(true);
      const healthCheck = await healthCheckResponse.json();
      expect(healthCheck).toHaveProperty('healthy');
    });
  });

  describe('WebSocket Integration', () => {
    it('should receive real-time updates', async () => {
      const socket = io('http://localhost:8000', {
        path: '/ws/plugin',
        auth: {
          token: process.env.TEST_TOKEN,
        },
      });

      const receivedEvents: any[] = [];

      socket.on('worker.metrics', (data) => {
        receivedEvents.push({ event: 'worker.metrics', data });
      });

      socket.emit('subscribe', ['worker.metrics']);

      // Wait for events
      await new Promise((resolve) => setTimeout(resolve, 10000));

      expect(receivedEvents.length).toBeGreaterThan(0);

      socket.disconnect();
    });
  });
});
```

### 3. Frontend Component Tests

```typescript
// frontend/components/__tests__/WorkerMonitor.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WorkerMonitor } from '../WorkerMonitor';
import { useWorkerStats } from '../../hooks/useWorkerStats';

jest.mock('../../hooks/useWorkerStats');

describe('WorkerMonitor Component', () => {
  const mockWorkers = [
    {
      id: 'worker-1',
      name: 'RTX 5090',
      status: 'healthy',
      gpu: {
        model: 'RTX 5090',
        vram: 48,
        vramUsed: 24,
        utilization: 75,
        temperature: 65,
        powerUsage: 350,
      },
      capacity: {
        maxConcurrent: 4,
        currentLoad: 2,
      },
      models: [
        {
          name: 'llama-3.1-405b',
          loaded: true,
          vramUsage: 20,
        },
      ],
    },
  ];

  beforeEach(() => {
    (useWorkerStats as jest.Mock).mockReturnValue({
      workers: mockWorkers,
      stats: {},
      loading: false,
    });
  });

  it('should render worker cards', () => {
    render(<WorkerMonitor />);

    expect(screen.getByText('RTX 5090')).toBeInTheDocument();
    expect(screen.getByText('healthy')).toBeInTheDocument();
  });

  it('should display GPU metrics', () => {
    render(<WorkerMonitor />);

    expect(screen.getByText(/75%/)).toBeInTheDocument(); // GPU utilization
    expect(screen.getByText(/65°C/)).toBeInTheDocument(); // Temperature
    expect(screen.getByText(/350W/)).toBeInTheDocument(); // Power usage
  });

  it('should show VRAM usage bar', () => {
    render(<WorkerMonitor />);

    const vramText = screen.getByText(/24GB \/ 48GB VRAM/);
    expect(vramText).toBeInTheDocument();
  });

  it('should display loaded models', () => {
    render(<WorkerMonitor />);

    expect(screen.getByText('llama-3.1-405b')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    (useWorkerStats as jest.Mock).mockReturnValue({
      workers: [],
      stats: {},
      loading: true,
    });

    render(<WorkerMonitor />);

    // Loading indicator should be shown
    expect(screen.queryByText('RTX 5090')).not.toBeInTheDocument();
  });
});
```

---

## Monitoring & Observability

### 1. Metrics Collection

```typescript
// backend/services/metrics.ts
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export class MetricsService {
  private registry: Registry;
  private apiRequestsTotal: Counter;
  private apiRequestDuration: Histogram;
  private websocketConnections: Gauge;
  private cacheHitRate: Counter;

  constructor() {
    this.registry = new Registry();

    // API request counter
    this.apiRequestsTotal = new Counter({
      name: 'plugin_api_requests_total',
      help: 'Total number of API requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    // API request duration
    this.apiRequestDuration = new Histogram({
      name: 'plugin_api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    // WebSocket connections
    this.websocketConnections = new Gauge({
      name: 'plugin_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    // Cache hit rate
    this.cacheHitRate = new Counter({
      name: 'plugin_cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['type'],
      registers: [this.registry],
    });
  }

  recordAPIRequest(method: string, path: string, status: number, duration: number) {
    this.apiRequestsTotal.labels(method, path, status.toString()).inc();
    this.apiRequestDuration.labels(method, path).observe(duration);
  }

  recordWebSocketConnection(delta: number) {
    this.websocketConnections.inc(delta);
  }

  recordCacheHit(type: string) {
    this.cacheHitRate.labels(type).inc();
  }

  async getMetrics() {
    return this.registry.metrics();
  }
}
```

### 2. Logging Configuration

```typescript
// backend/config/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        ...req.headers,
        authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});
```

### 3. Health Check Endpoint

```typescript
// backend/api/health.ts
import { Router, Request, Response } from 'express';
import { WorkerService } from '../services/worker.service';
import { MetricsService } from '../services/metrics';

export const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
  const workerService = new WorkerService();
  const metricsService = new MetricsService();

  try {
    const [workers, nexusRouterHealth] = await Promise.all([
      workerService.getAllWorkers(),
      checkNexusRouterHealth(),
    ]);

    const healthyWorkers = workers.filter((w: any) => w.status === 'healthy').length;

    const health = {
      status: nexusRouterHealth && healthyWorkers > 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: {
        nexusRouter: {
          status: nexusRouterHealth ? 'healthy' : 'unhealthy',
        },
        workers: {
          total: workers.length,
          healthy: healthyWorkers,
          status: healthyWorkers > 0 ? 'healthy' : 'unhealthy',
        },
      },
      metrics: await metricsService.getMetrics(),
    };

    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

async function checkNexusRouterHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXUS_ROUTER_API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## Conclusion

This comprehensive integration plan provides a roadmap for integrating Open-WebUI with Nexus Router, creating a powerful unified interface for managing AI infrastructure. The phased approach ensures steady progress with clear milestones and deliverables.

### Key Benefits

1. **Cost Savings**: Visualize and optimize the 90%+ cost savings from local GPU routing
2. **Real-time Monitoring**: Live GPU worker metrics and performance tracking
3. **Unified Management**: Single interface for all MCP servers and AI resources
4. **Developer Experience**: Fuzzy search and intuitive UI for rapid development
5. **Extensibility**: Plugin architecture allows future enhancements

### Next Steps

1. Review and approve this integration plan
2. Set up development environment
3. Begin Phase 1: Deploy Open-WebUI
4. Schedule regular progress reviews
5. Adjust timeline based on team capacity

### Success Metrics

- Plugin adoption rate
- User satisfaction scores
- Time saved in infrastructure management
- Reduction in configuration errors
- Increased GPU utilization efficiency

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-10
**Status**: Pending Approval
