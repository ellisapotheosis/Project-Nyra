# WebSocket Integration Guide

This guide shows you how to integrate real-time WebSocket communication into your Project Nyra applications.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [React Integration](#react-integration)
4. [Vue Integration](#vue-integration)
5. [Dashboard Examples](#dashboard-examples)
6. [Error Handling](#error-handling)
7. [Performance Tips](#performance-tips)

## Quick Start

### Installation

```bash
# In your application directory
pnpm add @project-nyra/websocket-client
```

### Basic Connection

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

// Create client
const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-jwt-token',
  reconnect: true,
  debug: process.env.NODE_ENV === 'development',
});

// Connect
await client.connect();

// Subscribe to events
await client.subscribe('mcp:status');

// Listen for events
client.onMCPStatus((event) => {
  console.log('MCP Status Update:', event.data);
});
```

## Authentication

### Generating JWT Tokens

The WebSocket server uses JWT tokens for authentication. Generate tokens using the same secret as the server:

```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: 'user-123',
    permissions: ['read', 'command:execute'],
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

### Token Structure

Required fields:
```json
{
  "userId": "string",
  "permissions": ["string"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Permissions

Available permissions:
- `read` - Subscribe to channels and receive events
- `command:execute` - Execute commands on backend services
- `admin` - Administrative access

## React Integration

### Setup Provider

Create a WebSocket provider for your app:

```tsx
// src/providers/WebSocketProvider.tsx
import React, { createContext, useContext } from 'react';
import { useWebSocket } from '@project-nyra/websocket-client/react';

const WebSocketContext = createContext<any>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const websocket = useWebSocket('ws://localhost:8080', {
    token: localStorage.getItem('auth_token'),
    autoConnect: true,
  });

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
```

### Use in Components

```tsx
// src/components/MCPStatus.tsx
import { useWebSocketContext } from '../providers/WebSocketProvider';
import { useEffect, useState } from 'react';

export function MCPStatus() {
  const { connected, events, subscribe } = useWebSocketContext();
  const [servers, setServers] = useState([]);

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
    }
  }, [connected, subscribe]);

  useEffect(() => {
    const mcpEvents = events.filter(e => e.type === 'mcp_status');
    const latest = mcpEvents[mcpEvents.length - 1];
    if (latest) {
      setServers(latest.data.servers);
    }
  }, [events]);

  if (!connected) {
    return <div>Connecting to WebSocket...</div>;
  }

  return (
    <div>
      <h2>MCP Server Status</h2>
      {servers.map(server => (
        <ServerCard key={server.serverId} server={server} />
      ))}
    </div>
  );
}
```

### Custom Hooks

Create reusable hooks for specific data:

```tsx
// src/hooks/useMCPStatus.ts
import { useWebSocketContext } from '../providers/WebSocketProvider';
import { useEffect, useState } from 'react';

export function useMCPStatus() {
  const { connected, events, subscribe } = useWebSocketContext();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
      setLoading(false);
    }
  }, [connected, subscribe]);

  useEffect(() => {
    const mcpEvents = events.filter(e => e.type === 'mcp_status');
    const latest = mcpEvents[mcpEvents.length - 1];
    if (latest) {
      setServers(latest.data.servers);
    }
  }, [events]);

  return { servers, loading, connected };
}

// Usage in component
function ServerList() {
  const { servers, loading } = useMCPStatus();

  if (loading) return <Spinner />;

  return (
    <ul>
      {servers.map(s => <li key={s.serverId}>{s.name}</li>)}
    </ul>
  );
}
```

## Vue Integration

### Setup Plugin

```typescript
// src/plugins/websocket.ts
import { WebSocketClient } from '@project-nyra/websocket-client';
import { App, reactive } from 'vue';

export const websocketPlugin = {
  install(app: App) {
    const state = reactive({
      connected: false,
      events: [],
      client: null as WebSocketClient | null,
    });

    const client = new WebSocketClient('ws://localhost:8080', {
      token: localStorage.getItem('auth_token'),
    });

    client.onConnection((connected) => {
      state.connected = connected;
    });

    client.onEvent((event) => {
      state.events.push(event);
      if (state.events.length > 100) {
        state.events.shift();
      }
    });

    client.connect();
    state.client = client;

    app.config.globalProperties.$ws = state;
    app.provide('websocket', state);
  }
};
```

### Use in Components

```vue
<!-- src/components/MCPStatus.vue -->
<template>
  <div>
    <h2>MCP Server Status</h2>
    <div v-if="!connected">Connecting...</div>
    <div v-else>
      <ServerCard
        v-for="server in servers"
        :key="server.serverId"
        :server="server"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, onMounted } from 'vue';

const ws = inject('websocket');

const connected = computed(() => ws.connected);
const servers = computed(() => {
  const mcpEvents = ws.events.filter(e => e.type === 'mcp_status');
  const latest = mcpEvents[mcpEvents.length - 1];
  return latest?.data.servers || [];
});

onMounted(() => {
  if (ws.client && ws.connected) {
    ws.client.subscribe('mcp:status');
  }
});
</script>
```

## Dashboard Examples

### Full Dashboard Component

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';
import { useEffect, useState } from 'react';

export function Dashboard() {
  const {
    connected,
    connecting,
    events,
    subscribe,
    error,
  } = useWebSocket('ws://localhost:8080', {
    token: localStorage.getItem('auth_token'),
  });

  const [mcpStatus, setMCPStatus] = useState(null);
  const [gpuMetrics, setGPUMetrics] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
      subscribe('gpu:metrics');
      subscribe('agent:coordination');
    }
  }, [connected, subscribe]);

  useEffect(() => {
    events.forEach(event => {
      switch (event.type) {
        case 'mcp_status':
          setMCPStatus(event.data);
          break;
        case 'gpu_metrics':
          setGPUMetrics(event.data);
          break;
        case 'agent_coordination':
          if (event.data.action === 'spawn') {
            setAgents(prev => [...prev, event.data]);
          } else if (event.data.action === 'terminate') {
            setAgents(prev => prev.filter(a => a.agentId !== event.data.agentId));
          }
          break;
      }
    });
  }, [events]);

  if (connecting) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Project Nyra Dashboard</h1>
        <ConnectionStatus connected={connected} />
      </header>

      <div className="grid">
        <MCPStatusPanel status={mcpStatus} />
        <GPUMetricsPanel metrics={gpuMetrics} />
        <AgentPanel agents={agents} />
        <EventStreamPanel events={events.slice(-20)} />
      </div>
    </div>
  );
}
```

### Real-time Charts

Using Chart.js with WebSocket data:

```tsx
import { Line } from 'react-chartjs-2';
import { useWebSocketEvent } from '@project-nyra/websocket-client/react';

export function GPUUtilizationChart() {
  const { filteredEvents, subscribe } = useWebSocketEvent(
    'ws://localhost:8080',
    'gpu_metrics'
  );

  useEffect(() => {
    subscribe('gpu:metrics');
  }, [subscribe]);

  const chartData = {
    labels: filteredEvents.map(e => new Date(e.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'GPU Utilization %',
        data: filteredEvents.map(e => e.data.workers[0]?.gpuUtilization || 0),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} options={{ responsive: true }} />;
}
```

## Error Handling

### Handling Connection Errors

```typescript
const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-token',
});

client.onError((error) => {
  console.error('WebSocket error:', error);

  // Log to error tracking service
  if (window.Sentry) {
    Sentry.captureException(error);
  }

  // Show user notification
  toast.error('Connection error. Reconnecting...');
});

client.onConnection((connected) => {
  if (connected) {
    toast.success('Connected to server');
  } else {
    toast.warning('Disconnected from server');
  }
});
```

### Retry Logic

```typescript
const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-token',
  reconnect: true,
  maxReconnectAttempts: 10,
  reconnectInterval: 2000,
});

// Manual retry
async function connectWithRetry(maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await client.connect();
      return;
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed`);
      if (i < maxAttempts - 1) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }
  throw new Error('Failed to connect after multiple attempts');
}
```

## Performance Tips

### Event Filtering

Filter events on the client to reduce processing:

```typescript
// ❌ Bad: Processing all events
events.forEach(event => {
  if (event.type === 'mcp_status') {
    updateMCPStatus(event);
  }
});

// ✅ Good: Filter first
const mcpEvents = events.filter(e => e.type === 'mcp_status');
mcpEvents.forEach(updateMCPStatus);
```

### Event Limit

Limit stored events to prevent memory issues:

```typescript
const MAX_EVENTS = 100;

useEffect(() => {
  if (events.length > MAX_EVENTS) {
    clearEvents();
  }
}, [events]);
```

### Subscription Management

Unsubscribe from unused channels:

```typescript
useEffect(() => {
  if (connected) {
    subscribe('mcp:status');
  }

  return () => {
    unsubscribe('mcp:status');
  };
}, [connected, subscribe, unsubscribe]);
```

### Debouncing Updates

Debounce rapid updates:

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedUpdate = useMemo(
  () => debounce((event) => {
    updateState(event);
  }, 500),
  []
);

client.onEvent(debouncedUpdate);
```

## Next Steps

- Read the [WebSocket Client API Reference](../../packages/websocket-client/README.md)
- Review [WebSocket Hub Documentation](../services/websocket-hub.md)
- Check out [Example Applications](../../examples/websocket-dashboard)

## Support

For issues or questions:
- GitHub Issues: [Project Nyra Issues](https://github.com/your-org/project-nyra/issues)
- Documentation: [Full Docs](../README.md)
