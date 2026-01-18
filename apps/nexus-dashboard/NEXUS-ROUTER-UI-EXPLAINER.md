# Nexus Router UI - Architecture Explanation

## 🎯 What is Nexus Router?

**Nexus Router (from Grafbase)** is a **backend GraphQL/API gateway** - it does NOT come with a native UI. It's purely a routing/orchestration layer.

### What Nexus Router Provides:
- ✅ API routing and composition
- ✅ Authentication and authorization
- ✅ Request transformation
- ✅ Load balancing
- ✅ Caching layer
- ✅ Metrics and logging (backend only)

### What Nexus Router Does NOT Provide:
- ❌ Web UI/Dashboard
- ❌ Visual monitoring interface
- ❌ Management console
- ❌ Configuration GUI

## 🏗️ Project Nyra's UI Architecture

### Current Setup

```
Project-Nyra/
├── apps/
│   └── nexus-dashboard/          # ← THIS IS YOUR CUSTOM UI
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx      # Main dashboard
│       │   │   ├── servers/      # Server management
│       │   │   ├── routes/       # Route configuration
│       │   │   ├── tools/        # Tool management
│       │   │   └── gpu/          # GPU worker monitoring
│       │   └── components/
│       │       ├── server-card.tsx
│       │       ├── metric-card.tsx
│       │       └── ...
│       └── package.json
│
└── Nexus Router (Backend)        # Runs on port 8000
    ├── No UI
    ├── Exposes REST/WebSocket APIs
    └── Provides metrics endpoints
```

### How It Works

1. **Nexus Router (Backend)**: Runs on `http://localhost:8000`
   - Handles AI model routing
   - Manages provider connections
   - Exposes API endpoints for monitoring

2. **Nexus Dashboard (Frontend)**: Runs on `http://localhost:3005`
   - **YOU NEED TO BUILD THIS** (which we're doing now!)
   - Connects to Nexus Router APIs
   - Visualizes metrics and status
   - Manages configuration

## 🔧 Integration Points

### API Connections (What the Dashboard Needs to Do)

```typescript
// src/lib/api.ts
export class NexusAPI {
  private baseURL = 'http://localhost:8000';

  // Get server status
  async getServers() {
    const response = await fetch(`${this.baseURL}/api/servers`);
    return response.json();
  }

  // Get routing metrics
  async getMetrics() {
    const response = await fetch(`${this.baseURL}/api/metrics`);
    return response.json();
  }

  // Test server connection
  async testServer(serverId: string) {
    const response = await fetch(`${this.baseURL}/api/servers/${serverId}/test`);
    return response.json();
  }
}
```

### WebSocket Connection (Real-time Updates)

```typescript
// src/hooks/use-websocket.ts
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'metrics':
      updateMetrics(data.payload);
      break;
    case 'server_status':
      updateServerStatus(data.payload);
      break;
    case 'route_update':
      updateRoutes(data.payload);
      break;
  }
};
```

## 🎨 What We're Building

### Nexus Dashboard Features

1. **Main Dashboard** (`/`)
   - Real-time metrics
   - Server health status
   - Request throughput
   - Response times

2. **Server Management** (`/servers`)
   - Add/remove AI providers
   - Test connections
   - Configure endpoints

3. **Route Configuration** (`/routes`)
   - Model routing rules
   - Fallback chains
   - Load balancing

4. **GPU Workers** (`/gpu`)
   - Worker status
   - Resource utilization
   - Job queue

5. **Tool Management** (`/tools`)
   - MCP tool configuration
   - Tool discovery
   - Usage stats

6. **Claude Flow Integration** (NEW - What we're adding)
   - Terminal interface
   - Agent monitoring
   - Memory stats
   - Performance metrics

## 🚀 Current Integration Status

### Already Implemented in nexus-dashboard:
- ✅ Basic dashboard layout
- ✅ Server cards
- ✅ Metric displays
- ✅ WebSocket connection
- ✅ shadcn/ui components
- ✅ OKLCH color system
- ✅ Tailwind v4

### What We're Adding Now:
- 🔄 Claude Flow UI components
- 🔄 Terminal interface
- 🔄 Agent monitoring
- 🔄 Performance monitoring
- 🔄 Memory visualization

## 📊 Data Flow

```
┌─────────────────┐
│  Nexus Router   │  Port 8000 (Backend)
│   (No UI!)      │
└────────┬────────┘
         │
         │ REST API / WebSocket
         │
         ▼
┌─────────────────┐
│ Nexus Dashboard │  Port 3005 (Frontend)
│   (Your UI!)    │
│                 │
│ ┌─────────────┐ │
│ │ Main        │ │
│ │ Dashboard   │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Claude Flow │ │
│ │ Monitor     │ │  ← We're adding this!
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │ Server      │ │
│ │ Management  │ │
│ └─────────────┘ │
└─────────────────┘
```

## ✅ Summary

**You are NOT missing any setup!**

- Nexus Router is backend-only (no UI)
- The nexus-dashboard app is YOUR custom UI
- We're now enhancing it with Claude Flow monitoring
- Everything is working as intended

The dashboard connects to Nexus Router's APIs to display and manage the routing layer. Think of it like Grafana for Prometheus - Prometheus is the backend data source, Grafana is the UI you build/configure.

---

**Next Steps**: Completing the Claude Flow UI integration into your nexus-dashboard!
