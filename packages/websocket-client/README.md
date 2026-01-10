# WebSocket Client

Type-safe WebSocket client library with React hooks for Project Nyra.

## Features

- **TypeScript First**: Full type safety for all messages and events
- **Auto-reconnection**: Automatic reconnection with exponential backoff
- **React Hooks**: Ready-to-use hooks for React applications
- **Event-driven**: EventEmitter-based API for flexible event handling
- **Heartbeat**: Automatic ping/pong for connection health
- **Subscription Management**: Easy channel subscription system

## Installation

```bash
pnpm add @project-nyra/websocket-client
```

## Basic Usage

### Vanilla TypeScript/JavaScript

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-jwt-token',
  reconnect: true,
  debug: true,
});

// Connect
await client.connect();

// Listen for connection events
client.onConnection((connected) => {
  console.log('Connection status:', connected);
});

// Subscribe to channels
await client.subscribe('mcp:status');
await client.subscribe('gpu:metrics');

// Listen for specific events
client.onMCPStatus((event) => {
  console.log('MCP Status:', event.data);
});

client.onGPUMetrics((event) => {
  console.log('GPU Metrics:', event.data);
});

// Listen for all events
client.onEvent((event) => {
  console.log('Event:', event);
});

// Handle errors
client.onError((error) => {
  console.error('Error:', error);
});

// Query data
await client.query('mcp:servers');

// Disconnect
client.disconnect();
```

### React Hooks

#### Basic Hook

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';

function Dashboard() {
  const {
    connected,
    connecting,
    events,
    subscribe,
    error,
  } = useWebSocket('ws://localhost:8080', {
    token: 'your-jwt-token',
    autoConnect: true,
  });

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
      subscribe('gpu:metrics');
    }
  }, [connected, subscribe]);

  if (connecting) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!connected) return <div>Disconnected</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Status: Connected</div>
      <EventList events={events} />
    </div>
  );
}
```

#### MCP Status Hook

```tsx
import { useMCPStatus } from '@project-nyra/websocket-client/react';

function MCPStatusPanel() {
  const { connected, filteredEvents } = useMCPStatus('ws://localhost:8080', {
    token: 'your-jwt-token',
  });

  const latestStatus = filteredEvents[filteredEvents.length - 1];

  return (
    <div>
      <h2>MCP Server Status</h2>
      {latestStatus && (
        <div>
          {latestStatus.data.servers.map(server => (
            <ServerCard key={server.serverId} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### GPU Metrics Hook

```tsx
import { useGPUMetrics } from '@project-nyra/websocket-client/react';

function GPUMetricsPanel() {
  const { connected, filteredEvents } = useGPUMetrics('ws://localhost:8080', {
    token: 'your-jwt-token',
  });

  const latestMetrics = filteredEvents[filteredEvents.length - 1];

  return (
    <div>
      <h2>GPU Metrics</h2>
      {latestMetrics && (
        <div>
          {latestMetrics.data.workers.map(worker => (
            <MetricsCard key={worker.workerId} metrics={worker} />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Custom Event Hook

```tsx
import { useWebSocketEvent } from '@project-nyra/websocket-client/react';

function AgentCoordinationPanel() {
  const { connected, filteredEvents, subscribe } = useWebSocketEvent(
    'ws://localhost:8080',
    'agent_coordination',
    { token: 'your-jwt-token' }
  );

  useEffect(() => {
    if (connected) {
      subscribe('agent:coordination');
    }
  }, [connected, subscribe]);

  return (
    <div>
      <h2>Agent Coordination</h2>
      {filteredEvents.map(event => (
        <AgentEvent key={event.timestamp} event={event} />
      ))}
    </div>
  );
}
```

## API Reference

### WebSocketClient

#### Constructor

```typescript
new WebSocketClient(url: string, options?: WebSocketClientOptions)
```

**Options:**
- `token?: string` - JWT authentication token
- `reconnect?: boolean` - Enable auto-reconnection (default: true)
- `reconnectInterval?: number` - Base reconnection interval in ms (default: 1000)
- `maxReconnectAttempts?: number` - Max reconnection attempts (default: 5)
- `heartbeatInterval?: number` - Heartbeat interval in ms (default: 30000)
- `debug?: boolean` - Enable debug logging (default: false)

#### Methods

**Connection Management**
```typescript
connect(): Promise<void>
disconnect(): void
isConnected(): boolean
getSessionId(): string | null
getConnectionInfo(): ConnectionInfo | null
```

**Subscriptions**
```typescript
subscribe(channel: string): Promise<void>
unsubscribe(channel: string): Promise<void>
```

**Communication**
```typescript
query(target: string): Promise<void>
command(command: string, params?: any): Promise<void>
ping(): void
```

**Event Listeners**
```typescript
onConnection(callback: (connected: boolean) => void): this
onEvent(callback: (event: SystemEvent) => void): this
onError(callback: (error: Error) => void): this
onMCPStatus(callback: (event: SystemEvent) => void): this
onGPUMetrics(callback: (event: SystemEvent) => void): this
onToolDiscovery(callback: (event: SystemEvent) => void): this
onAgentCoordination(callback: (event: SystemEvent) => void): this
onSwarmUpdate(callback: (event: SystemEvent) => void): this
```

### React Hooks

#### useWebSocket

```typescript
useWebSocket(url: string, options?: UseWebSocketOptions): UseWebSocketReturn
```

Returns:
```typescript
{
  connected: boolean
  connecting: boolean
  sessionId: string | null
  connectionInfo: ConnectionInfo | null
  events: SystemEvent[]
  error: Error | null
  subscribe: (channel: string) => Promise<void>
  unsubscribe: (channel: string) => Promise<void>
  query: (target: string) => Promise<void>
  command: (command: string, params?: any) => Promise<void>
  connect: () => Promise<void>
  disconnect: () => void
  clearEvents: () => void
}
```

#### useWebSocketEvent

```typescript
useWebSocketEvent(
  url: string,
  eventType: string,
  options?: UseWebSocketOptions
): UseWebSocketReturn & { filteredEvents: SystemEvent[] }
```

#### useMCPStatus / useGPUMetrics

Convenience hooks that automatically subscribe to specific channels.

```typescript
useMCPStatus(url: string, options?: UseWebSocketOptions)
useGPUMetrics(url: string, options?: UseWebSocketOptions)
```

## Available Channels

- `mcp:status` - MCP server status updates
- `gpu:metrics` - GPU worker metrics
- `tools:discovery` - Tool discovery events
- `agent:coordination` - Agent spawn/terminate events
- `swarm:update` - Swarm orchestration updates

## Type Definitions

### SystemEvent

```typescript
interface SystemEvent {
  type: 'mcp_status' | 'gpu_metrics' | 'tool_discovery' | 'agent_coordination' | 'swarm_update'
  source: string
  timestamp: string
  data: any
}
```

### MCPServerStatus

```typescript
interface MCPServerStatus {
  serverId: string
  name: string
  status: 'online' | 'offline' | 'degraded'
  url: string
  toolCount: number
  latency?: number
  lastUpdate: string
}
```

### GPUMetrics

```typescript
interface GPUMetrics {
  workerId: string
  gpuUtilization: number
  memoryUsed: number
  memoryTotal: number
  temperature: number
  powerUsage: number
  activeModels: string[]
  timestamp: string
}
```

## Examples

### Real-time Dashboard

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';
import { useState, useEffect } from 'react';

function RealtimeDashboard() {
  const {
    connected,
    events,
    subscribe,
    clearEvents,
  } = useWebSocket('ws://localhost:8080', {
    token: process.env.REACT_APP_WS_TOKEN,
  });

  const [mcpStatus, setMCPStatus] = useState<any>(null);
  const [gpuMetrics, setGPUMetrics] = useState<any>(null);

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
      subscribe('gpu:metrics');
    }
  }, [connected, subscribe]);

  useEffect(() => {
    const latestEvents = events.slice(-10);
    latestEvents.forEach(event => {
      if (event.type === 'mcp_status') {
        setMCPStatus(event.data);
      } else if (event.type === 'gpu_metrics') {
        setGPUMetrics(event.data);
      }
    });
  }, [events]);

  return (
    <div className="dashboard">
      <header>
        <h1>Project Nyra Dashboard</h1>
        <StatusIndicator connected={connected} />
      </header>

      <div className="panels">
        <MCPStatusPanel status={mcpStatus} />
        <GPUMetricsPanel metrics={gpuMetrics} />
      </div>

      <EventStream events={events.slice(-20)} />

      <button onClick={clearEvents}>Clear Events</button>
    </div>
  );
}
```

### Agent Monitoring

```tsx
import { useWebSocketEvent } from '@project-nyra/websocket-client/react';

function AgentMonitor() {
  const { filteredEvents, subscribe } = useWebSocketEvent(
    'ws://localhost:8080',
    'agent_coordination'
  );

  useEffect(() => {
    subscribe('agent:coordination');
  }, [subscribe]);

  const activeAgents = filteredEvents.filter(
    e => e.data.action === 'spawn'
  ).length - filteredEvents.filter(
    e => e.data.action === 'terminate'
  ).length;

  return (
    <div>
      <h2>Active Agents: {activeAgents}</h2>
      <AgentTimeline events={filteredEvents} />
    </div>
  );
}
```

## Troubleshooting

### Connection Issues

If you're having trouble connecting:

1. Verify the WebSocket URL is correct
2. Check that the WebSocket server is running
3. Ensure JWT token is valid (if using authentication)
4. Check browser console for errors with `debug: true`

### Authentication Errors

If you get authentication errors:

1. Verify your JWT token is valid and not expired
2. Check that the token includes required fields (userId, permissions)
3. Ensure the server's JWT_SECRET matches

### React Hook Dependencies

If you see warnings about hook dependencies:

```tsx
// ✅ Correct
useEffect(() => {
  if (connected) {
    subscribe('mcp:status');
  }
}, [connected, subscribe]);

// ❌ Incorrect (missing dependencies)
useEffect(() => {
  if (connected) {
    subscribe('mcp:status');
  }
}, []);
```

## License

MIT
