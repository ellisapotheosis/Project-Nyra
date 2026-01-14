# WebSocket Hub Service

Real-time WebSocket server for Project Nyra providing dashboard updates, MCP server status broadcasts, GPU worker metrics streaming, tool discovery updates, and agent coordination messages.

## Features

- **Real-time Updates**: Instant notifications for system events
- **MCP Integration**: Monitor MCP server status and tool discovery
- **GPU Metrics**: Stream GPU worker performance data
- **Agent Coordination**: Real-time agent spawn/terminate notifications
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Configurable rate limits per user/session
- **Metrics**: Prometheus metrics for monitoring
- **Scaling**: Redis-based horizontal scaling support
- **Auto-reconnect**: Client library with automatic reconnection

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────────┐
│   Client    │ ←───────────────→  │  WebSocket Hub   │
│  Dashboard  │                     │     Server       │
└─────────────┘                     └────────┬─────────┘
                                             │
                                             ↓
                                    ┌──────────────────┐
                                    │  Nexus Router    │
                                    │  MCP Servers     │
                                    │  GPU Workers     │
                                    └──────────────────┘
```

## Quick Start

### Installation

```bash
cd services/websocket-hub
pnpm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required configuration:
```env
PORT=8080
JWT_SECRET=your-secure-secret-key
NEXUS_ROUTER_URL=http://localhost:3100
```

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

## API Reference

### Connection

Connect to the WebSocket server:

```typescript
const ws = new WebSocket('ws://localhost:8080?token=YOUR_JWT_TOKEN');
```

### Authentication

JWT token should include:
```json
{
  "userId": "user-id",
  "permissions": ["read", "command:execute"]
}
```

### Message Types

#### Client Messages

**Subscribe to Channel**
```json
{
  "type": "subscribe",
  "payload": {
    "channel": "mcp:status"
  }
}
```

**Unsubscribe from Channel**
```json
{
  "type": "unsubscribe",
  "payload": {
    "channel": "mcp:status"
  }
}
```

**Query Data**
```json
{
  "type": "query",
  "payload": {
    "target": "mcp:servers"
  }
}
```

**Ping**
```json
{
  "type": "ping"
}
```

#### Server Messages

**Connection Acknowledgment**
```json
{
  "type": "connection",
  "sessionId": "uuid",
  "payload": {
    "status": "connected",
    "version": "1.0.0",
    "features": ["mcp_status", "gpu_metrics", "tool_discovery"]
  },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

**Event Notification**
```json
{
  "type": "event",
  "payload": {
    "type": "mcp_status",
    "source": "nexus-router",
    "timestamp": "2025-01-10T12:00:00.000Z",
    "data": {
      "servers": [...]
    }
  },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

**Error**
```json
{
  "type": "error",
  "payload": {
    "message": "Error description"
  },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

### Channels

Available subscription channels:

- `mcp:status` - MCP server status updates
- `gpu:metrics` - GPU worker metrics
- `tools:discovery` - Tool discovery events
- `agent:coordination` - Agent spawn/terminate events
- `swarm:update` - Swarm orchestration updates

## Client Integration

See `packages/websocket-client` for the TypeScript client library and React hooks.

### Basic Usage

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-jwt-token'
});

await client.connect();

client.on('mcp:status', (event) => {
  console.log('MCP Status:', event.data);
});

await client.subscribe('mcp:status');
```

### React Usage

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';

function Dashboard() {
  const { connected, subscribe, events } = useWebSocket('ws://localhost:8080');

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
    }
  }, [connected]);

  return (
    <div>
      <h1>Status: {connected ? 'Connected' : 'Disconnected'}</h1>
      {events.map(event => (
        <EventCard key={event.timestamp} event={event} />
      ))}
    </div>
  );
}
```

## Monitoring

### Prometheus Metrics

Available at `http://localhost:9090/metrics`:

- `websocket_connections_total` - Active connections
- `websocket_messages_total` - Message count by type
- `websocket_errors_total` - Error count by type
- `websocket_message_duration_seconds` - Message processing time
- `websocket_subscriptions_total` - Active subscriptions by channel

### Health Check

Available at `http://localhost:9090/health`:

```json
{
  "status": "healthy",
  "uptime": 12345,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

## Docker Deployment

### Build Image

```bash
docker build -t project-nyra/websocket-hub:latest .
```

### Run Container

```bash
docker run -d \
  --name websocket-hub \
  -p 8080:8080 \
  -p 9090:9090 \
  -e JWT_SECRET=your-secret \
  -e NEXUS_ROUTER_URL=http://nexus-router:3100 \
  project-nyra/websocket-hub:latest
```

## Security

### Authentication

- JWT tokens required in production
- Configurable permissions system
- Per-user connection limits

### Rate Limiting

- Configurable rate limits (default: 10 requests/60s)
- Automatic blocking on limit exceeded
- Redis-backed for distributed systems

### Input Validation

- Zod schema validation
- Message size limits
- Channel name whitelisting

## Performance

### Optimization Features

- Message compression (perMessageDeflate)
- Connection pooling
- Redis-based session sharing
- Prometheus monitoring

### Scaling

For horizontal scaling:

1. Enable Redis: `REDIS_ENABLED=true`
2. Configure Redis URL: `REDIS_URL=redis://redis:6379`
3. Deploy multiple instances behind load balancer

## Troubleshooting

### Connection Issues

**Problem**: Connection drops frequently

**Solution**:
- Check WebSocket timeout settings
- Verify network stability
- Enable debug logging: `LOG_LEVEL=debug`

### Authentication Errors

**Problem**: "Invalid token" error

**Solution**:
- Verify JWT_SECRET matches across services
- Check token expiration
- Validate token payload structure

### High Memory Usage

**Problem**: Memory usage increasing over time

**Solution**:
- Enable session cleanup
- Check for connection leaks
- Monitor metrics at `/metrics`

## Development

### Project Structure

```
src/
├── auth/           # JWT authentication
├── config/         # Configuration management
├── events/         # Event bus
├── integrations/   # External service integrations
├── metrics/        # Prometheus metrics
├── middleware/     # Rate limiting, etc.
├── server/         # WebSocket server
├── session/        # Session management
├── types/          # TypeScript types
└── utils/          # Utilities
```

### Testing

```bash
# Unit tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## License

MIT
