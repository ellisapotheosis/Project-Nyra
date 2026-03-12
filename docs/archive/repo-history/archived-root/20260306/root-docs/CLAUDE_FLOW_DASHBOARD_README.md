# Claude Flow Live Operations Dashboard Integration

**Status**: ✅ Fully Integrated  
**Date**: 2026-02-01  
**Architecture Decision**: Standalone Page (Option A from UI-INTEGRATION-DECISION.md)

---

## Overview

The Claude Flow Live Operations Dashboard has been successfully integrated into Project Nyra as a **standalone developer/operations tool** separate from the borrower-facing UI (openclawd) and task execution logs (Archon).

### Key Characteristics

- **Audience**: Developers and Operations Engineers
- **Purpose**: Real-time monitoring of Claude Flow V3 operations
- **Deployment**: Standalone Docker containers with dedicated ports
- **Architecture**: React 18 + TypeScript frontend + WebSocket event server

---

## Architecture

### Services

| Service | Port | Purpose |
|---------|------|---------|
| **claude-flow-event-server** | 3004 (WS) + 3005 (HTTP) | WebSocket server for real-time events |
| **claude-flow-dashboard** | 3003 | React application for visualization |

### Network Communication

```
Client Browser (localhost:3003)
    ↓
Claude Flow Dashboard (React)
    ↓ (WebSocket)
Event Server (localhost:3004)
    ↓ (HTTP POST from CLI)
Claude Flow CLI Commands
```

---

## Quick Start

### 1. Start the Services

Using the master docker-compose file:

```bash
cd infra/docker-compose
docker compose up -d claude-flow-event-server claude-flow-dashboard
```

Or selectively start just the dashboard:

```bash
docker compose -f docker-compose.event-server.yml -f docker-compose.claude-flow-dashboard.yml up -d
```

### 2. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3003
```

### 3. Monitor in Real-Time

The dashboard will display:
- ✅ Agent spawning and status changes
- ✅ Task progress and completion
- ✅ Memory operations (store, retrieve, search)
- ✅ System topology and connectivity
- ✅ Performance metrics

### 4. Stop the Services

```bash
docker compose down claude-flow-event-server claude-flow-dashboard
```

---

## Environment Configuration

### Dashboard Environment Variables

```bash
# .env file configuration

# Event Server URLs
VITE_EVENT_SERVER_URL=ws://localhost:3004
VITE_EVENT_SERVER_HTTP_URL=http://localhost:3005

# Claude Flow Backend
VITE_CLAUDE_FLOW_URL=http://localhost:8080

# Feature Toggles
VITE_ENABLE_AGENT_MONITOR=true
VITE_ENABLE_TASK_TIMELINE=true
VITE_ENABLE_MEMORY_OPS=true
VITE_ENABLE_TOPOLOGY=true
VITE_ENABLE_METRICS=true

# WebSocket Configuration
VITE_WEBSOCKET_RECONNECT_INTERVAL=3000
VITE_MAX_BUFFER_SIZE=10000
```

### Event Server Configuration

```bash
# WebSocket Server
EVENT_SERVER_WS_PORT=3004
EVENT_SERVER_MAX_CONNECTIONS=100
EVENT_SERVER_REPLAY_BUFFER=1000
EVENT_SERVER_HEARTBEAT=30000
```

---

## Features

### 1. Agent Monitoring
- Real-time agent lifecycle events (spawning, active, idle, busy, error, stopped)
- Agent type categorization (coder, tester, reviewer, architect, etc.)
- Performance metrics per agent (CPU, memory, response time)

### 2. Task Execution
- Task Kanban board (pending → assigned → in_progress → completed/failed)
- Timeline view of task execution
- Progress tracking and current step visualization
- Error details and retry information

### 3. Message Streams
- Inter-agent communication logging
- Message type categorization (task, result, query, response, broadcast, error, etc.)
- Priority levels (critical, high, normal, low)
- Message size and correlation tracking

### 4. Memory Operations
- Store/Retrieve/Search/Update/Delete operations
- Vector search results with similarity scores
- Cache hit rate tracking
- Operation latency monitoring
- Namespace isolation view

### 5. Topology Visualization
- Live system topology with animated edges
- Agent nodes with status indicators
- Connection health (healthy, degraded, unhealthy)
- Message flow animation
- Automatic layout adjustment

### 6. Performance Metrics
- System CPU and memory usage
- Active agents and pending tasks
- Messages per second throughput
- Memory operations per second
- Average latency tracking

---

## File Structure

```
project-nyra/
├── apps/claude-flow-dashboard/
│   ├── Dockerfile                 # Multi-stage React build
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── App.tsx                # Root component
│   │   ├── components/            # UI components
│   │   │   ├── Agent/
│   │   │   ├── Task/
│   │   │   ├── Message/
│   │   │   ├── Memory/
│   │   │   ├── Topology/
│   │   │   └── Layout/
│   │   ├── services/              # WebSocket, event management
│   │   ├── stores/                # Zustand state management
│   │   └── types/
│   └── dist/                      # Built application
│
├── services/claude-flow-event-server/
│   ├── Dockerfile                 # Node.js WebSocket server
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts              # Entry point
│   │   ├── event-server.ts        # WebSocket server implementation
│   │   └── event-emitter.ts       # Event emission bridge
│   └── dist/                      # Compiled TypeScript
│
└── infra/docker-compose/
    ├── docker-compose.yml                         # Master (includes both)
    ├── docker-compose.event-server.yml            # WebSocket server
    └── docker-compose.claude-flow-dashboard.yml   # React dashboard
```

---

## Integration Points

### 1. Docker Compose Integration

The master `docker-compose.yml` now includes:

```yaml
include:
  - docker-compose.event-server.yml           # Line 32
  - docker-compose.claude-flow-dashboard.yml  # Line 33
```

### 2. Environment Variables

Added to `.env` and `.env.example`:
- `EVENT_SERVER_*` - WebSocket server configuration
- `CLAUDE_FLOW_DASHBOARD_*` - Dashboard configuration
- `VITE_*` - Frontend environment variables

### 3. Networking

Both services connect via the `nyra-network` Docker bridge:
- Dashboard connects to Event Server via WebSocket
- Event Server exposes HTTP endpoint for CLI integration
- All internal service discovery via DNS (service names)

---

## Event Types Supported

### Agent Events (`agents` channel)
```typescript
{
  type: 'agent:status',
  agentId: string,
  name: string,
  agentType: string,
  status: 'spawning' | 'active' | 'idle' | 'busy' | 'error' | 'stopped',
  metrics?: { cpu, memory, messageCount },
  error?: { code, message, recoverable }
}
```

### Task Events (`tasks` channel)
```typescript
{
  type: 'task:update',
  taskId: string,
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed',
  agentId?: string,
  progress?: number,
  currentStep?: string,
  error?: string
}
```

### Memory Events (`memory` channel)
```typescript
{
  type: 'memory:operation',
  operation: 'store' | 'retrieve' | 'search' | 'delete' | 'update',
  namespace: string,
  query?: string,
  latency: number,
  resultCount?: number
}
```

### Message Events (`messages` channel)
```typescript
{
  type: 'message:sent',
  messageId: string,
  source: string,
  target: string,
  messageType: string,
  priority: 'critical' | 'high' | 'normal' | 'low',
  size: number
}
```

### Topology Events (`topology` channel)
```typescript
{
  type: 'topology:change',
  topology: 'hierarchical' | 'mesh' | 'adaptive',
  nodes: AgentNode[],
  edges: Connection[]
}
```

### Metrics Events (`metrics` channel)
```typescript
{
  type: 'metrics:update',
  metrics: {
    cpu: number,
    memory: number,
    activeAgents: number,
    pendingTasks: number,
    messagesPerSecond: number,
    avgLatency: number
  }
}
```

---

## Port Assignment

| Port | Service | Type | Purpose |
|------|---------|------|---------|
| **3003** | Dashboard | HTTP | React web UI |
| **3004** | Event Server | WebSocket | Real-time events |
| **3005** | Event Server | HTTP | CLI event submission |

### Port Conflicts Avoided

- ✅ 3001: Dify (workflow builder) - **NOT USED**
- ✅ 3002: openclawd (borrower UI) - **NOT USED**
- ✅ 3003: Claude Flow Dashboard - **NEW (available)**
- ✅ 3004: Event Server (WebSocket) - **NEW (available)**
- ✅ 3005: Event Server (HTTP) - **NEW (available)**

---

## Deployment Scenarios

### Development (Single PC)

```bash
# Start all services including dashboard
docker compose up -d

# Access at http://localhost:3003
# Event server on ws://localhost:3004
```

### Production (Secure Internal Network)

```bash
# Use environment-specific compose file
docker compose -f docker-compose.orchestrator.yml \
               -f docker-compose.event-server.yml \
               -f docker-compose.claude-flow-dashboard.yml \
               up -d

# Restrict access to internal network only
# Set VITE_EVENT_SERVER_URL to internal IP
```

### Multi-PC Setup

```bash
# PC 1: Run orchestrator + event-server
# PC 2: Run dashboard (connects to PC 1 event server)
# PC 3: Run additional workers

# Update VITE_EVENT_SERVER_URL to point to PC 1:
# VITE_EVENT_SERVER_URL=ws://pc1.internal:3004
```

### Disabled in CI/CD

The docker-compose includes are optional. In CI/CD pipelines, just omit:
```bash
# CI/CD compose (excludes dashboard)
docker compose -f docker-compose.base.yml \
               -f docker-compose.databases.yml \
               -f docker-compose.ai.yml \
               up -d
```

---

## Security Considerations

### WebSocket Connection

- ✅ Runs on internal Docker network by default
- ✅ No authentication required (development)
- ⚠️ For production: Consider adding JWT authentication
- ⚠️ For public access: Use WebSocket Secure (WSS) with TLS

### Event Server HTTP Endpoint

- ✅ Accepts POST requests from CLI
- ✅ Validates event structure
- ⚠️ For production: Add rate limiting and request validation
- ⚠️ For production: Use Infisical/Vault for secrets

### Dashboard Access

- ✅ No sensitive data in frontend (all from WebSocket)
- ✅ Event Server controls what data is broadcast
- ⚠️ For production: Add authentication layer (OAuth, SAML)
- ⚠️ For production: Restrict to internal IPs only

---

## Troubleshooting

### Dashboard Won't Connect

**Problem**: Browser shows "Connecting..." and never connects  
**Solution**:
```bash
# Check event server is running
docker ps | grep event-server

# Check WebSocket port is open
netstat -an | grep 3004

# Check VITE_EVENT_SERVER_URL is correct in .env
cat .env | grep VITE_EVENT_SERVER_URL

# Verify hostname resolution (if not localhost)
nslookup claude-flow-event-server
```

### No Events Appearing

**Problem**: Dashboard connects but shows no events  
**Solution**:
```bash
# Check event server logs
docker logs claude-flow-event-server

# Verify clients are connected
curl http://localhost:3005/event  # Should work with POST

# Check firewall (Docker bridge network)
docker network inspect nyra-network

# Manually test event submission
curl -X POST http://localhost:3005/event \
  -H "Content-Type: application/json" \
  -d '{"channel":"agents","type":"agent:status","event":{}}'
```

### High Memory Usage

**Problem**: Event server consuming too much memory  
**Solution**:
```bash
# Reduce replay buffer size
EVENT_SERVER_REPLAY_BUFFER=500

# Reduce max connections
EVENT_SERVER_MAX_CONNECTIONS=50

# Check current metrics
docker stats claude-flow-event-server
```

### Reconnection Issues

**Problem**: Dashboard keeps reconnecting  
**Solution**:
```bash
# Increase reconnect interval (slower reconnection)
VITE_WEBSOCKET_RECONNECT_INTERVAL=5000

# Reduce buffer size to avoid memory spikes
VITE_MAX_BUFFER_SIZE=5000

# Check browser network tab for errors
# Usually indicates event server is crashing
```

---

## Monitoring & Logging

### Event Server Logs

```bash
# View logs
docker logs -f claude-flow-event-server

# Enable debug logging
docker exec claude-flow-event-server export DEBUG=true

# Check resource usage
docker stats claude-flow-event-server
```

### Dashboard Logs

```bash
# Browser console logs
# Open DevTools (F12) and check Console tab

# Server logs (if running in development)
docker logs -f claude-flow-dashboard
```

### Event Metrics

Access event server metrics (if exposed):
```bash
curl http://localhost:3005/metrics
```

---

## Next Steps

### Phase 2: Integration Enhancements (Future)

- [ ] Add authentication (JWT/OAuth)
- [ ] Integrate with Nexus Router visualization
- [ ] Add performance dashboards
- [ ] Implement event filtering and search
- [ ] Add export/archive capabilities
- [ ] Create mobile-responsive views
- [ ] Add dark mode support

### Phase 3: Production Hardening (Future)

- [ ] TLS/WSS encryption
- [ ] Rate limiting and DDoS protection
- [ ] Comprehensive error handling
- [ ] Graceful degradation
- [ ] Backup and recovery procedures
- [ ] High availability (clustering)

---

## References

- **Architecture Decision**: `infra/UI-INTEGRATION-DECISION.md`
- **CLAUDE.md**: Root project configuration
- **Apps CLAUDE.md**: React application standards
- **Infra CLAUDE.md**: Infrastructure guidelines
- **GitHub PR**: https://github.com/ruvnet/claude-flow/pull/1022 (original dashboard)

---

**Created**: 2026-02-01  
**Status**: ✅ Ready for Development  
**Owner**: Claude Flow Team

For questions or issues, refer to the project documentation or open a GitHub issue.
