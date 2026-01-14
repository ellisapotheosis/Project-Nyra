# WebSocket Hub - Setup Guide

This guide will help you set up and run the WebSocket Hub service in Project Nyra.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Redis (optional, for horizontal scaling)
- Running Nexus Router service (optional, for real data)

## Quick Start

### 1. Install Dependencies

From the monorepo root:

```bash
# Install all dependencies
pnpm install
```

Or from the service directory:

```bash
cd services/websocket-hub
pnpm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cd services/websocket-hub
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required
PORT=8080
NODE_ENV=development
JWT_SECRET=your-very-secure-secret-minimum-32-characters-long

# Optional - Nexus Router Integration
NEXUS_ROUTER_URL=http://localhost:3100
NEXUS_ROUTER_API_KEY=

# Optional - Redis for scaling
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# Optional - Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional - Rate Limiting
RATE_LIMIT_POINTS=10
RATE_LIMIT_DURATION=60
```

### 3. Generate JWT Secret

Generate a secure JWT secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated secret to your `.env` file:

```env
JWT_SECRET=<your-generated-secret>
```

### 4. Start the Service

Development mode (with hot reload):

```bash
pnpm dev
```

Production mode:

```bash
pnpm build
pnpm start
```

### 5. Verify Installation

The service should start on port 8080 (WebSocket) and 9090 (metrics).

Check the health endpoint:

```bash
curl http://localhost:9090/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 12.345,
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

Check Prometheus metrics:

```bash
curl http://localhost:9090/metrics
```

## Testing the Connection

### Using wscat

Install wscat:

```bash
npm install -g wscat
```

Connect to the server:

```bash
# Without authentication (development only)
wscat -c ws://localhost:8080

# With JWT token
wscat -c "ws://localhost:8080?token=YOUR_JWT_TOKEN"
```

Once connected, try these commands:

```json
// Ping
{"type": "ping"}

// Subscribe to a channel
{"type": "subscribe", "payload": {"channel": "mcp:status"}}

// Query data
{"type": "query", "payload": {"target": "sessions:active"}}
```

### Using the TypeScript Client

Create a test file `test-client.ts`:

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

async function test() {
  const client = new WebSocketClient('ws://localhost:8080', {
    token: 'your-jwt-token', // or omit for development
    debug: true,
  });

  client.onConnection((connected) => {
    console.log('Connected:', connected);
  });

  client.onEvent((event) => {
    console.log('Event:', event);
  });

  await client.connect();
  await client.subscribe('mcp:status');

  // Keep alive
  setInterval(() => client.ping(), 30000);
}

test().catch(console.error);
```

Run it:

```bash
npx tsx test-client.ts
```

## Generating JWT Tokens

For testing, you can generate JWT tokens using Node.js:

Create `generate-token.js`:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    userId: 'test-user',
    permissions: ['read', 'command:execute'],
  },
  process.env.JWT_SECRET || 'your-secret-here',
  { expiresIn: '24h' }
);

console.log('JWT Token:', token);
```

Run it:

```bash
node generate-token.js
```

## Running with Docker

### Build the Image

```bash
docker build -t project-nyra/websocket-hub:latest .
```

### Run the Container

```bash
docker run -d \
  --name websocket-hub \
  -p 8080:8080 \
  -p 9090:9090 \
  -e JWT_SECRET=your-secret \
  -e NODE_ENV=production \
  project-nyra/websocket-hub:latest
```

### Docker Compose

Add to your `docker-compose.yml`:

```yaml
version: '3.8'

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
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

Start with Docker Compose:

```bash
docker-compose up -d
```

## Integration with Other Services

### Nexus Router

To receive real-time updates from the Nexus Router:

1. Ensure Nexus Router is running
2. Configure `NEXUS_ROUTER_URL` in `.env`
3. WebSocket Hub will automatically poll for updates

The service will poll these endpoints:
- `/mcp/status` - MCP server status
- `/gpu/metrics` - GPU worker metrics
- `/mcp/tools` - Tool discovery

### Client Applications

Install the client library in your app:

```bash
pnpm add @project-nyra/websocket-client
```

Basic usage:

```typescript
import { WebSocketClient } from '@project-nyra/websocket-client';

const client = new WebSocketClient('ws://localhost:8080', {
  token: 'your-jwt-token',
});

await client.connect();
await client.subscribe('mcp:status');

client.onMCPStatus((event) => {
  console.log('MCP Status:', event.data);
});
```

React usage:

```tsx
import { useWebSocket } from '@project-nyra/websocket-client/react';

function Dashboard() {
  const { connected, events, subscribe } = useWebSocket('ws://localhost:8080', {
    token: 'your-jwt-token',
  });

  useEffect(() => {
    if (connected) {
      subscribe('mcp:status');
    }
  }, [connected]);

  return <div>{/* Your UI */}</div>;
}
```

## Monitoring

### Prometheus

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'websocket-hub'
    static_configs:
      - targets: ['localhost:9090']
```

Available metrics:
- `websocket_connections_total` - Active connections
- `websocket_messages_total` - Message counts
- `websocket_errors_total` - Error counts
- `websocket_message_duration_seconds` - Processing latency

### Grafana Dashboard

Import the provided Grafana dashboard:

```bash
# Coming soon: grafana-dashboard.json
```

### Logging

Logs are output in JSON format for easy parsing:

```bash
# View logs
docker logs -f websocket-hub

# Filter by level
docker logs websocket-hub 2>&1 | grep '"level":"error"'
```

## Troubleshooting

### Port Already in Use

If port 8080 or 9090 is already in use:

```bash
# Find process using port
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Change port in .env
PORT=8081
```

### Connection Refused

1. Check service is running: `curl http://localhost:9090/health`
2. Check firewall rules
3. Verify WebSocket URL is correct
4. Check JWT token is valid

### Authentication Errors

1. Verify JWT_SECRET matches between services
2. Check token expiration: `jwt.verify(token, secret)`
3. Ensure token includes required fields

### High Memory Usage

1. Enable session cleanup (enabled by default)
2. Reduce session timeout: `SESSION_TIMEOUT=1800`
3. Enable Redis for session storage
4. Check for connection leaks

## Production Checklist

Before deploying to production:

- [ ] Use a strong JWT_SECRET (min 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS for CORS
- [ ] Enable rate limiting
- [ ] Set up Redis for scaling
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up SSL/TLS (use reverse proxy)
- [ ] Configure log aggregation
- [ ] Set resource limits (memory, CPU)
- [ ] Test failover scenarios
- [ ] Document recovery procedures

## Next Steps

- Read the [API Documentation](./README.md)
- Check out [Example Code](./examples/)
- Review [Integration Guide](../../docs/guides/websocket-integration.md)
- Set up [Monitoring Dashboard](../../docs/deployment/monitoring.md)

## Support

For issues or questions:
- Check the [Troubleshooting Guide](./README.md#troubleshooting)
- Review [GitHub Issues](https://github.com/your-org/project-nyra/issues)
- Read the [Full Documentation](../../docs/services/websocket-hub.md)
