# WebSocket API Reference

**Version:** 1.0.0
**WebSocket URL:** `wss://api.project-nyra.io/ws`
**Last Updated:** 2026-01-10

## Table of Contents

1. [Overview](#overview)
2. [Connection](#connection)
3. [Authentication](#authentication)
4. [Message Format](#message-format)
5. [Client Messages](#client-messages)
6. [Server Messages](#server-messages)
7. [Event Channels](#event-channels)
8. [Error Handling](#error-handling)
9. [Code Examples](#code-examples)
10. [Rate Limiting](#rate-limiting)
11. [Best Practices](#best-practices)

## Overview

The WebSocket API provides real-time, bidirectional communication for:
- Real-time system events (MCP status, GPU metrics, tool discovery)
- Agent coordination updates
- Swarm activity monitoring
- Task progress tracking
- Live analytics streams

### Features

- **Real-time Events**: Subscribe to system events with sub-second latency
- **Multiplexing**: Multiple subscriptions per connection
- **Authentication**: JWT-based secure authentication
- **Automatic Reconnection**: Built-in reconnection logic
- **Message Compression**: Efficient data transfer with permessage-deflate
- **Heartbeat/Keepalive**: Automatic connection health monitoring

## Connection

### Establishing Connection

```javascript
const ws = new WebSocket('wss://api.project-nyra.io/ws');

ws.onopen = () => {
  console.log('Connected to Project Nyra WebSocket API');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('Connection closed:', event.code, event.reason);
};
```

### Connection URLs

| Environment | URL |
|-------------|-----|
| Production | `wss://api.project-nyra.io/ws` |
| Staging | `wss://staging-api.project-nyra.io/ws` |
| Development | `ws://localhost:3001` |

## Authentication

### JWT Token Authentication

Include JWT token in the connection URL as a query parameter or in the `Sec-WebSocket-Protocol` header.

#### Option 1: Query Parameter

```javascript
const token = 'your-jwt-token';
const ws = new WebSocket(`wss://api.project-nyra.io/ws?token=${token}`);
```

#### Option 2: HTTP Header (Node.js)

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('wss://api.project-nyra.io/ws', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

#### Option 3: Subprotocol

```javascript
const ws = new WebSocket('wss://api.project-nyra.io/ws', [`bearer.${token}`]);
```

### Authentication Response

Upon successful connection, the server sends a connection acknowledgment:

```json
{
  "type": "connection",
  "sessionId": "sess_abc123xyz",
  "payload": {
    "status": "connected",
    "version": "1.0.0",
    "features": [
      "mcp_status",
      "gpu_metrics",
      "tool_discovery",
      "agent_coordination"
    ]
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Authentication Errors

If authentication fails, the connection is immediately closed:

```json
{
  "type": "error",
  "payload": {
    "message": "Invalid authentication token"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Close Code:** `1008` (Policy Violation)

## Message Format

All messages are JSON-formatted strings.

### Client Message Structure

```typescript
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'query' | 'command';
  payload?: {
    [key: string]: any;
  };
}
```

### Server Message Structure

```typescript
interface ServerMessage {
  type: 'connection' | 'event' | 'error' | 'pong' | 'response';
  sessionId?: string;
  payload?: {
    [key: string]: any;
  };
  timestamp: string; // ISO 8601 format
}
```

## Client Messages

### Subscribe to Channel

Subscribe to receive events from a specific channel.

**Message:**
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "mcp:status"
  }
}
```

**Valid Channels:**
- `mcp:status` - MCP server status updates
- `gpu:metrics` - GPU worker metrics
- `tools:discovery` - Tool discovery events
- `agent:coordination` - Agent coordination messages
- `swarm:update` - Swarm activity updates

**Response:**
```json
{
  "type": "response",
  "payload": {
    "action": "subscribed",
    "channel": "mcp:status"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Unsubscribe from Channel

Unsubscribe from a channel to stop receiving events.

**Message:**
```json
{
  "type": "unsubscribe",
  "payload": {
    "channel": "mcp:status"
  }
}
```

**Response:**
```json
{
  "type": "response",
  "payload": {
    "action": "unsubscribed",
    "channel": "mcp:status"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Ping

Send a ping to check connection health.

**Message:**
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Query

Query for current system state or data.

**Message:**
```json
{
  "type": "query",
  "payload": {
    "target": "mcp:servers"
  }
}
```

**Valid Targets:**
- `mcp:servers` - Trigger immediate MCP server poll
- `sessions:active` - Get active session information

**Response:**
```json
{
  "type": "response",
  "payload": {
    "query": "mcp:servers",
    "data": {
      "status": "requested"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Command

Execute a command (requires `command:execute` permission).

**Message:**
```json
{
  "type": "command",
  "payload": {
    "command": "spawn_agent",
    "params": {
      "type": "coder",
      "capabilities": ["typescript", "react"]
    }
  }
}
```

**Response:**
```json
{
  "type": "response",
  "payload": {
    "command": "spawn_agent",
    "result": {
      "agentId": "agent_xyz789",
      "status": "spawned"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

## Server Messages

### Connection

Sent immediately after successful connection.

```json
{
  "type": "connection",
  "sessionId": "sess_abc123xyz",
  "payload": {
    "status": "connected",
    "version": "1.0.0",
    "features": ["mcp_status", "gpu_metrics", "tool_discovery", "agent_coordination"]
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Event

Broadcasted events from subscribed channels.

```json
{
  "type": "event",
  "payload": {
    "type": "mcp_status",
    "source": "claude-flow",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "serverId": "claude-flow",
      "status": "online",
      "toolCount": 25,
      "latency": 45
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Response

Response to client queries or commands.

```json
{
  "type": "response",
  "payload": {
    "action": "subscribed",
    "channel": "gpu:metrics"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Error

Error message for failed operations.

```json
{
  "type": "error",
  "payload": {
    "message": "Invalid channel: invalid_channel"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Pong

Heartbeat response to ping.

```json
{
  "type": "pong",
  "timestamp": "2026-01-10T00:00:00Z"
}
```

## Event Channels

### MCP Status (`mcp:status`)

Receive real-time MCP server status updates.

**Event Data:**
```json
{
  "type": "event",
  "payload": {
    "type": "mcp_status",
    "source": "ruv-swarm",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "serverId": "ruv-swarm",
      "name": "Ruv Swarm",
      "status": "online",
      "url": "http://localhost:3002/mcp",
      "toolCount": 22,
      "latency": 38,
      "lastUpdate": "2026-01-10T00:00:00Z"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Update Frequency:** Every 30 seconds or on status change

### GPU Metrics (`gpu:metrics`)

Real-time GPU worker performance metrics.

**Event Data:**
```json
{
  "type": "event",
  "payload": {
    "type": "gpu_metrics",
    "source": "gpu-worker-1",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "workerId": "gpu-worker-1",
      "gpuUtilization": 85.5,
      "memoryUsed": 18000,
      "memoryTotal": 24000,
      "temperature": 72,
      "powerUsage": 285,
      "activeModels": ["llama-3-70b", "mistral-7b"],
      "timestamp": "2026-01-10T00:00:00Z"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Update Frequency:** Every 5 seconds

### Tool Discovery (`tools:discovery`)

Notifications when new MCP tools are discovered.

**Event Data:**
```json
{
  "type": "event",
  "payload": {
    "type": "tool_discovery",
    "source": "flow-nexus",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "serverId": "flow-nexus",
      "tools": [
        {
          "name": "neural_train",
          "description": "Train a neural network with custom configuration",
          "inputSchema": {
            "type": "object",
            "properties": {
              "config": {
                "type": "object"
              }
            }
          }
        }
      ],
      "timestamp": "2026-01-10T00:00:00Z"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Update Frequency:** On discovery (event-driven)

### Agent Coordination (`agent:coordination`)

Agent lifecycle and coordination events.

**Event Data:**
```json
{
  "type": "event",
  "payload": {
    "type": "agent_coordination",
    "source": "swarm-manager",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "agentId": "agent_abc123",
      "agentType": "coder",
      "action": "spawn",
      "swarmId": "swarm_xyz789",
      "data": {
        "capabilities": ["typescript", "react", "testing"],
        "maxTasks": 5
      },
      "timestamp": "2026-01-10T00:00:00Z"
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Update Frequency:** Real-time (event-driven)

### Swarm Updates (`swarm:update`)

Swarm topology and activity updates.

**Event Data:**
```json
{
  "type": "event",
  "payload": {
    "type": "swarm_update",
    "source": "swarm_xyz789",
    "timestamp": "2026-01-10T00:00:00Z",
    "data": {
      "swarmId": "swarm_xyz789",
      "topology": "mesh",
      "agents": 5,
      "activeTasks": 8,
      "status": "active",
      "metrics": {
        "throughput": 125,
        "averageResponseTime": 450
      }
    }
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

**Update Frequency:** Every 10 seconds or on significant change

## Error Handling

### Error Types

| Error | Description | Action |
|-------|-------------|--------|
| `Invalid authentication token` | JWT token is invalid or expired | Reconnect with valid token |
| `Authentication required` | No token provided in production | Provide authentication |
| `Invalid channel` | Attempting to subscribe to unknown channel | Use valid channel name |
| `Rate limit exceeded` | Too many messages sent | Wait and reduce frequency |
| `Channel name required` | Missing channel in subscribe/unsubscribe | Include channel in payload |
| `Insufficient permissions` | Missing required permission | Request elevated permissions |
| `Session not found` | Session expired or invalid | Reconnect |

### WebSocket Close Codes

| Code | Reason | Description |
|------|--------|-------------|
| 1000 | Normal Closure | Clean disconnect |
| 1001 | Going Away | Server shutting down |
| 1008 | Policy Violation | Authentication failed |
| 1011 | Internal Error | Server-side error |

## Code Examples

### JavaScript (Browser)

```javascript
class ProjectNyraWebSocket {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.subscriptions = new Set();
    this.messageHandlers = new Map();
  }

  connect() {
    this.ws = new WebSocket(`wss://api.project-nyra.io/ws?token=${this.token}`);

    this.ws.onopen = () => {
      console.log('Connected');
      // Resubscribe to channels after reconnection
      this.subscriptions.forEach(channel => {
        this.subscribe(channel);
      });
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('Connection closed:', event.code);
      // Attempt reconnection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
  }

  subscribe(channel) {
    this.subscriptions.add(channel);
    this.send({
      type: 'subscribe',
      payload: { channel }
    });
  }

  unsubscribe(channel) {
    this.subscriptions.delete(channel);
    this.send({
      type: 'unsubscribe',
      payload: { channel }
    });
  }

  on(channel, handler) {
    this.messageHandlers.set(channel, handler);
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(message) {
    if (message.type === 'event' && message.payload) {
      const channel = this.getChannelFromEvent(message.payload.type);
      const handler = this.messageHandlers.get(channel);
      if (handler) {
        handler(message.payload);
      }
    }
  }

  getChannelFromEvent(eventType) {
    const mapping = {
      'mcp_status': 'mcp:status',
      'gpu_metrics': 'gpu:metrics',
      'tool_discovery': 'tools:discovery',
      'agent_coordination': 'agent:coordination',
      'swarm_update': 'swarm:update'
    };
    return mapping[eventType] || eventType;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
    }
  }
}

// Usage
const client = new ProjectNyraWebSocket('your-jwt-token');
client.connect();

// Subscribe to MCP status
client.subscribe('mcp:status');
client.on('mcp:status', (event) => {
  console.log('MCP Status:', event.data);
});

// Subscribe to GPU metrics
client.subscribe('gpu:metrics');
client.on('gpu:metrics', (event) => {
  console.log('GPU Metrics:', event.data);
});
```

### Node.js

```javascript
const WebSocket = require('ws');

const token = 'your-jwt-token';
const ws = new WebSocket('wss://api.project-nyra.io/ws', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

ws.on('open', () => {
  console.log('Connected');

  // Subscribe to agent coordination
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { channel: 'agent:coordination' }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);

  if (message.type === 'event' && message.payload.type === 'agent_coordination') {
    console.log('Agent Event:', message.payload.data);
  }
});

ws.on('error', (error) => {
  console.error('Error:', error);
});

ws.on('close', (code, reason) => {
  console.log(`Closed: ${code} - ${reason}`);
});

// Heartbeat
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);
```

### Python

```python
import asyncio
import json
import websockets

class ProjectNyraClient:
    def __init__(self, token):
        self.token = token
        self.uri = f"wss://api.project-nyra.io/ws?token={token}"
        self.subscriptions = set()
        self.handlers = {}

    async def connect(self):
        async with websockets.connect(self.uri) as websocket:
            print("Connected")

            # Subscribe to channels
            for channel in self.subscriptions:
                await self.subscribe(websocket, channel)

            # Listen for messages
            async for message in websocket:
                await self.handle_message(json.loads(message))

    async def subscribe(self, websocket, channel):
        self.subscriptions.add(channel)
        await websocket.send(json.dumps({
            "type": "subscribe",
            "payload": {"channel": channel}
        }))

    async def handle_message(self, message):
        if message["type"] == "event":
            event_type = message["payload"]["type"]
            if event_type in self.handlers:
                await self.handlers[event_type](message["payload"])

    def on(self, event_type, handler):
        self.handlers[event_type] = handler

# Usage
async def main():
    client = ProjectNyraClient("your-jwt-token")

    # Add event handler
    async def on_gpu_metrics(event):
        print(f"GPU Metrics: {event['data']}")

    client.on("gpu_metrics", on_gpu_metrics)
    client.subscriptions.add("gpu:metrics")

    await client.connect()

asyncio.run(main())
```

## Rate Limiting

### Limits

- **Messages per minute:** 60 per connection
- **Subscriptions per connection:** 10 channels maximum
- **Connections per user:** 5 concurrent connections

### Rate Limit Response

```json
{
  "type": "error",
  "payload": {
    "message": "Rate limit exceeded"
  },
  "timestamp": "2026-01-10T00:00:00Z"
}
```

### Headers (HTTP Upgrade)

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704931260
```

## Best Practices

### 1. Implement Reconnection Logic

```javascript
function connectWithRetry(maxRetries = 5) {
  let retries = 0;

  function connect() {
    const ws = new WebSocket(url);

    ws.onclose = () => {
      if (retries < maxRetries) {
        retries++;
        const delay = Math.min(1000 * Math.pow(2, retries), 30000);
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(connect, delay);
      }
    };

    ws.onopen = () => {
      retries = 0; // Reset on successful connection
    };
  }

  connect();
}
```

### 2. Handle Subscriptions Efficiently

```javascript
// Batch subscribe on connection
ws.onopen = () => {
  const channels = ['mcp:status', 'gpu:metrics', 'swarm:update'];
  channels.forEach(channel => {
    ws.send(JSON.stringify({
      type: 'subscribe',
      payload: { channel }
    }));
  });
};
```

### 3. Use Heartbeat/Ping

```javascript
// Send ping every 30 seconds
const pingInterval = setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping' }));
  }
}, 30000);

// Clear on close
ws.onclose = () => {
  clearInterval(pingInterval);
};
```

### 4. Graceful Shutdown

```javascript
function gracefulShutdown() {
  // Unsubscribe from all channels
  subscriptions.forEach(channel => {
    ws.send(JSON.stringify({
      type: 'unsubscribe',
      payload: { channel }
    }));
  });

  // Close connection after unsubscribing
  setTimeout(() => {
    ws.close(1000, 'Client shutdown');
  }, 1000);
}
```

### 5. Error Recovery

```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  // Log error to monitoring system
  sendToMonitoring('websocket_error', error);
};

ws.onclose = (event) => {
  if (event.code !== 1000) {
    // Abnormal closure - log and attempt recovery
    console.error('Abnormal closure:', event.code, event.reason);
    attemptRecovery();
  }
};
```

## Security Considerations

1. **Always use WSS (TLS)** in production environments
2. **Validate JWT tokens** on every connection
3. **Implement rate limiting** on client side to prevent self-DOS
4. **Don't expose tokens** in client-side JavaScript logs
5. **Use short-lived tokens** and implement token refresh
6. **Validate all incoming messages** before processing

## Monitoring and Debugging

### Enable Debug Logging

```javascript
ws.addEventListener('message', (event) => {
  console.log('[WS Receive]', event.data);
});

const originalSend = ws.send.bind(ws);
ws.send = (data) => {
  console.log('[WS Send]', data);
  originalSend(data);
};
```

### Track Connection Metrics

```javascript
const metrics = {
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  reconnections: 0,
  avgLatency: 0
};

// Track message latency
const pingTimestamp = Date.now();
ws.send(JSON.stringify({ type: 'ping' }));

// On pong
metrics.avgLatency = Date.now() - pingTimestamp;
```

## Support

For questions or issues with the WebSocket API:
- Email: support@project-nyra.io
- Documentation: https://docs.project-nyra.io
- Status: https://status.project-nyra.io

---

**API Version:** 1.0.0
**Documentation Version:** 1.0.0
**Last Updated:** 2026-01-10
