# WebSocket Hub Service

## Overview

The WebSocket Hub is a production-ready, real-time communication service for Project Nyra. It provides instant updates for dashboard interfaces, MCP server status monitoring, GPU worker metrics streaming, tool discovery notifications, and agent coordination messages.

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Admin     │  │  Mortgage   │  │  Monitoring │         │
│  │  Dashboard  │  │  Assistant  │  │   Tools     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          │    WebSocket Connection (JWT Auth)│
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   WebSocket Hub Server                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Connection Manager                                   │  │
│  │  - JWT Authentication                                 │  │
│  │  - Session Management                                 │  │
│  │  - Rate Limiting                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Event Bus                                            │  │
│  │  - Channel Subscriptions                             │  │
│  │  - Message Broadcasting                               │  │
│  │  - Event Routing                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Metrics & Monitoring                                 │  │
│  │  - Prometheus Metrics                                 │  │
│  │  - Health Checks                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────┬───────────────────────────────────────────────────┘
          │
          │ REST API / Event Polling
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Nexus     │  │     MCP     │  │     GPU     │         │
│  │   Router    │  │   Servers   │  │   Workers   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Connection Manager
- JWT token validation
- Session lifecycle management
- Connection pooling
- Auto-cleanup of stale connections

#### 2. Event Bus
- Pub/sub event system
- Channel-based subscriptions
- Event filtering and routing
- Broadcast optimization

#### 3. Nexus Integration
- Periodic polling of MCP servers
- GPU metrics collection
- Tool discovery synchronization
- Command forwarding

#### 4. Metrics System
- Prometheus metrics export
- Connection tracking
- Message throughput
- Error rates

## Features

### Real-time Communication
- **Bidirectional**: Full-duplex WebSocket connections
- **Low Latency**: Sub-100ms message delivery
- **Scalable**: Horizontal scaling with Redis
- **Reliable**: Auto-reconnection and heartbeat

### Security
- **JWT Authentication**: Token-based authentication
- **Authorization**: Permission-based access control
- **Rate Limiting**: Configurable per-user limits
- **Input Validation**: Zod schema validation

### Monitoring
- **Prometheus Metrics**: Comprehensive metrics collection
- **Health Checks**: Kubernetes-ready health endpoints
- **Logging**: Structured JSON logging with Pino
- **Tracing**: Request/connection tracing

### Performance
- **Message Compression**: Automatic compression for large payloads
- **Connection Pooling**: Efficient resource utilization
- **Event Batching**: Reduced network overhead
- **Redis Caching**: Optional Redis for session sharing

## Installation

### Prerequisites
- Node.js 20+
- pnpm 10+
- Redis (optional, for scaling)

### Setup

```bash
# Navigate to service directory
cd services/websocket-hub

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env
```

### Configuration

Required environment variables:

```env
# Server
PORT=8080
NODE_ENV=production

# Security
JWT_SECRET=your-secure-secret-minimum-32-chars

# Nexus Router
NEXUS_ROUTER_URL=http://nexus-router:3100
NEXUS_ROUTER_API_KEY=optional-api-key

# Redis (for scaling)
REDIS_ENABLED=false
REDIS_URL=redis://redis:6379
```

## Usage

### Starting the Server

Development:
```bash
pnpm dev
```

Production:
```bash
pnpm build
pnpm start
```

### Client Connection

Using the TypeScript client:

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-jwt-token',
});

await client.connect();

// Subscribe to channels
await client.subscribe('mcp:status');
await client.subscribe('gpu:metrics');

// Listen for events
client.onMCPStatus((event) => {
  console.log('MCP Status:', event.data);
});
```

Using React hooks:

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';

function Dashboard() {
  const { connected, events, subscribe } = useWebSocket(
    'ws://localhost:8080',
    { token: 'your-jwt-token' }
  );

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
    }
  }, [connected]);

  return <div>{/* Your UI */}</div>;
}
```

## Channels

### mcp:status
MCP server status updates including online/offline state, tool counts, and latency.

**Event Structure:**
```json
{
  "type": "mcp_status",
  "source": "nexus-router",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "data": {
    "servers": [
      {
        "serverId": "ruv-swarm",
        "name": "RUV Swarm MCP",
        "status": "online",
        "url": "http://localhost:3000",
        "toolCount": 25,
        "latency": 45,
        "lastUpdate": "2025-01-10T12:00:00.000Z"
      }
    ]
  }
}
```

### gpu:metrics
GPU worker performance metrics including utilization, memory, temperature, and active models.

**Event Structure:**
```json
{
  "type": "gpu_metrics",
  "source": "nexus-router",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "data": {
    "workers": [
      {
        "workerId": "gpu-worker-1",
        "gpuUtilization": 85.5,
        "memoryUsed": 8192,
        "memoryTotal": 12288,
        "temperature": 72,
        "powerUsage": 250,
        "activeModels": ["llama-3-8b"],
        "timestamp": "2025-01-10T12:00:00.000Z"
      }
    ]
  }
}
```

### tools:discovery
Tool discovery events when new MCP tools become available.

### agent:coordination
Agent lifecycle events including spawn, terminate, and status updates.

### swarm:update
Swarm orchestration updates from Claude Flow swarms.

## Deployment

### Docker

Build image:
```bash
docker build -t project-nyra/websocket-hub:latest .
```

Run container:
```bash
docker run -d \
  --name websocket-hub \
  -p 8080:8080 \
  -p 9090:9090 \
  -e JWT_SECRET=your-secret \
  -e NEXUS_ROUTER_URL=http://nexus-router:3100 \
  project-nyra/websocket-hub:latest
```

### Kubernetes

See `infra/k8s/websocket-hub/` for Kubernetes manifests.

```bash
kubectl apply -f infra/k8s/websocket-hub/
```

### Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  websocket-hub:
    build: ./services/websocket-hub
    ports:
      - "8080:8080"
      - "9090:9090"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - NEXUS_ROUTER_URL=http://nexus-router:3100
      - REDIS_ENABLED=true
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - nexus-router
    restart: unless-stopped
```

## Monitoring

### Prometheus Metrics

Metrics available at `http://localhost:9090/metrics`:

- `websocket_connections_total` - Active WebSocket connections
- `websocket_messages_total{direction,type}` - Message counts
- `websocket_errors_total{type}` - Error counts
- `websocket_message_duration_seconds` - Message processing latency
- `websocket_subscriptions_total{channel}` - Active subscriptions

### Health Check

Health endpoint at `http://localhost:9090/health`:

```json
{
  "status": "healthy",
  "uptime": 86400,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

### Logging

Structured JSON logs with Pino:

```json
{
  "level": "info",
  "time": "2025-01-10T12:00:00.000Z",
  "service": "websocket-hub",
  "context": "session-manager",
  "sessionId": "abc-123",
  "userId": "user-456",
  "msg": "Session created"
}
```

## Scaling

### Horizontal Scaling

For production deployments with multiple instances:

1. **Enable Redis**: Set `REDIS_ENABLED=true`
2. **Configure Redis URL**: Set `REDIS_URL=redis://redis:6379`
3. **Deploy Multiple Instances**: Use Kubernetes or load balancer
4. **Session Affinity**: Not required (stateless with Redis)

### Load Balancing

NGINX configuration:

```nginx
upstream websocket_hub {
  least_conn;
  server websocket-hub-1:8080;
  server websocket-hub-2:8080;
  server websocket-hub-3:8080;
}

server {
  listen 443 ssl;
  location /ws {
    proxy_pass http://websocket_hub;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

## Troubleshooting

### Connection Issues

**Symptom**: Clients cannot connect

**Solutions**:
1. Check JWT token is valid
2. Verify WebSocket port is exposed
3. Check firewall rules
4. Review logs: `docker logs websocket-hub`

### High Memory Usage

**Symptom**: Memory usage increasing

**Solutions**:
1. Enable session cleanup
2. Reduce `SESSION_TIMEOUT`
3. Check for connection leaks
4. Monitor metrics at `/metrics`

### Slow Performance

**Symptom**: High latency

**Solutions**:
1. Enable Redis for caching
2. Increase polling interval
3. Enable message compression
4. Scale horizontally

## API Reference

See `services/websocket-hub/README.md` for detailed API documentation.

## Related Documentation

- [WebSocket Client Package](../../packages/websocket-client/README.md)
- [Nexus Router Service](./nexus-router.md)
- [Authentication Guide](../guides/authentication.md)
- [Deployment Guide](../deployment/kubernetes.md)

## License

MIT
