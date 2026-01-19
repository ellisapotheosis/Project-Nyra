# Archon OS UI Component Investigation

**Date**: 2026-01-18
**Status**: Complete Analysis

## Executive Summary

**Archon OS does NOT have a dedicated standalone UI.** It is a backend orchestration service that provides RESTful API endpoints and metrics. The UI for Archon OS is **integrated into the Nexus Dashboard** as part of the unified monitoring interface.

---

## 1. Is There a Dedicated UI for Archon OS?

**Answer: NO** - Archon OS is a **backend-only service**

### What Archon OS Provides:
- ✅ RESTful API for agent management
- ✅ MCP (Model Context Protocol) server integration
- ✅ Task orchestration and coordination
- ✅ Prometheus metrics endpoint
- ✅ RabbitMQ management interface

### What Archon OS Does NOT Provide:
- ❌ Standalone web UI
- ❌ Dashboard interface
- ❌ Visual monitoring console
- ❌ Configuration GUI

---

## 2. What Port Does Archon OS Run On?

Archon OS exposes **multiple ports** for different services:

| Service | Port | Purpose |
|---------|------|---------|
| **API Server** | `8092` | RESTful API endpoints for agent/task management |
| **Metrics** | `8093` | Prometheus metrics endpoint |
| **RabbitMQ Management** | `15672` | RabbitMQ web interface (default credentials: `archon` / `archon_queue_pass`) |
| **PostgreSQL** | `5432` | Database (internal, not exposed publicly) |
| **Redis** | `6379` | Cache layer (internal) |

### Port Configuration

From `C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os\.env.example`:
```bash
ARCHON_API_PORT=8092
ARCHON_METRICS_PORT=8093
RABBITMQ_MANAGEMENT_PORT=15672
```

From `C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os\docker-compose.yml`:
```yaml
ports:
  - "${ARCHON_API_PORT:-8092}:8092"   # API Server
  - "${ARCHON_METRICS_PORT:-8093}:8093" # Metrics
```

---

## 3. Frontend Dependencies

**Archon OS has NO frontend dependencies** because it's a backend service.

### Backend Dependencies:
- **Python 3.11+** (FastAPI/Flask)
- **PostgreSQL 16** - State storage
- **Redis 7** - Caching layer
- **RabbitMQ 3.12** - Message queue
- **Docker & Docker Compose** - Container orchestration

---

## 4. How to Start the "UI"

Since Archon OS doesn't have a UI, you have **three options** for monitoring:

### Option 1: RabbitMQ Management Interface (Basic Queue Monitoring)

```bash
# Start Archon OS services
cd C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os
docker-compose up -d

# Access RabbitMQ Management UI
# Open browser: http://localhost:15672
# Credentials: archon / archon_queue_pass
```

### Option 2: Nexus Dashboard (Recommended - Full Featured UI)

```bash
# Start Nexus Dashboard (includes Archon OS monitoring)
cd C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard
pnpm install
pnpm dev

# Access at http://localhost:3005
```

**Nexus Dashboard includes:**
- `/claude-flow` - Claude Flow V3 monitoring (integrates with Archon OS)
- `/servers` - MCP server management
- `/tools` - Tool discovery and management
- Real-time WebSocket updates
- Agent status monitoring

### Option 3: API Direct Access (CLI/Curl)

```bash
# Health check
curl http://localhost:8092/health

# List agents
curl -H "X-API-Key: your-api-key" http://localhost:8092/api/v1/agents

# Create agent
curl -X POST http://localhost:8092/api/v1/agents \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-researcher",
    "type": "researcher",
    "capabilities": ["research", "analysis"]
  }'

# Prometheus metrics
curl http://localhost:8093/metrics
```

---

## 5. Is it Integrated with Nexus Dashboard or Standalone?

**Answer: INTEGRATED with Nexus Dashboard**

### Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                   Nexus Dashboard UI                      │
│                   (Port 3005)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Claude Flow│  │ MCP Servers│  │ GPU Workers│         │
│  │ Monitor    │  │            │  │            │         │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘         │
│        │                │                │                │
└────────┼────────────────┼────────────────┼────────────────┘
         │                │                │
         │  WebSocket/API Connections      │
         │                │                │
         ▼                ▼                ▼
┌──────────────────────────────────────────────────────────┐
│              Backend Services Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ Archon OS  │  │Nexus Router│  │ MCP Servers│         │
│  │ (8092)     │  │  (8000)    │  │ (Various)  │         │
│  └────┬───────┘  └─────┬──────┘  └─────┬──────┘         │
│       │                │                │                │
│  ┌────▼────┐      ┌────▼────┐      ┌────▼────┐          │
│  │Postgres │      │  Redis  │      │RabbitMQ │          │
│  │  (5432) │      │ (6379)  │      │ (15672) │          │
│  └─────────┘      └─────────┘      └─────────┘          │
└──────────────────────────────────────────────────────────┘
```

### Integration Points

**Nexus Dashboard** acts as the unified UI for:
1. **Archon OS** - Agent orchestration and task management
2. **Nexus Router** - AI model routing and provider management
3. **Claude Flow V3** - Multi-agent coordination monitoring
4. **MCP Servers** - Tool and server management

### Claude Flow Integration in Nexus Dashboard

Located in `C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard\src\app\claude-flow\page.tsx`:
- Real-time agent status
- Memory system monitoring
- Performance metrics
- V3 implementation progress tracking
- Session management

---

## 6. What Configuration is Needed for the UI?

### For RabbitMQ Management (Built-in):
No additional configuration - starts automatically with `docker-compose up`.

### For Nexus Dashboard Integration:

#### Step 1: Configure Environment
```bash
# apps/nexus-dashboard/.env.local
NEXT_PUBLIC_NEXUS_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_ARCHON_URL=http://localhost:8092  # Add this for direct Archon OS access
NEXT_PUBLIC_API_KEY=your-api-key  # Optional
```

#### Step 2: Install Dependencies
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard
pnpm install
```

#### Step 3: Start Services
```bash
# Terminal 1: Start Archon OS
cd C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os
docker-compose up -d

# Terminal 2: Start Nexus Router (if needed)
cd C:\Dev\Projects\Repos\Project-Nyra\services\nexus-router
pnpm dev  # Or docker-compose up

# Terminal 3: Start Nexus Dashboard
cd C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard
pnpm dev
```

#### Step 4: Access UI
- Nexus Dashboard: `http://localhost:3005`
- Claude Flow Monitor: `http://localhost:3005/claude-flow`
- RabbitMQ Management: `http://localhost:15672`

---

## 7. What's Missing to Get the UI Running?

### Current Status:
✅ **Backend is ready** - Archon OS exposes all necessary APIs
✅ **Nexus Dashboard exists** - UI framework is in place
✅ **Claude Flow page exists** - Monitoring interface is implemented

### Potential Gaps:

#### Gap 1: API Integration in Nexus Dashboard
The Nexus Dashboard may need additional API client code to connect to Archon OS endpoints.

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard\src\lib\api.ts`

**Add**:
```typescript
export class ArchonAPI {
  private baseURL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:8092';

  async getAgents() {
    const response = await fetch(`${this.baseURL}/api/v1/agents`, {
      headers: {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      },
    });
    return response.json();
  }

  async getSwarmStatus() {
    const response = await fetch(`${this.baseURL}/api/v1/swarms`);
    return response.json();
  }

  async getMetrics() {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}
```

#### Gap 2: Component for Archon-Specific Monitoring
Create a dedicated page for Archon OS orchestration:

**File**: `C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard\src\app\orchestration\page.tsx`

Should include:
- Agent list with status
- Swarm topology visualization
- Task queue status
- Coordination metrics
- Real-time WebSocket updates

#### Gap 3: Environment Configuration
Ensure `.env.local` in Nexus Dashboard has Archon OS URL configured.

---

## 8. Recommended Implementation Plan

### Phase 1: Verify Backend (5 minutes)
```bash
# Check Archon OS is running
curl http://localhost:8092/health

# Check metrics endpoint
curl http://localhost:8093/metrics

# Check RabbitMQ
# Open browser: http://localhost:15672
```

### Phase 2: Configure Nexus Dashboard (10 minutes)
1. Add `NEXT_PUBLIC_ARCHON_URL` to `.env.local`
2. Add Archon API client to `src/lib/api.ts`
3. Test API connection from browser console

### Phase 3: Create Orchestration Page (30 minutes)
1. Create `apps/nexus-dashboard/src/app/orchestration/page.tsx`
2. Add agent listing component
3. Add swarm status component
4. Add real-time WebSocket updates

### Phase 4: Integration Testing (15 minutes)
1. Spawn test agents via Archon OS API
2. Verify they appear in Nexus Dashboard
3. Test real-time updates
4. Verify metrics display

---

## 9. Alternative: Standalone UI (Not Recommended)

If you want a **standalone UI just for Archon OS**, you would need to:

1. Create a new Next.js app (or React SPA)
2. Connect to Archon OS ports 8092 (API) and 8093 (metrics)
3. Implement components for agent management
4. Add WebSocket support for real-time updates

**Why not recommended:**
- Nexus Dashboard already provides this functionality
- Duplicated effort and maintenance
- Fragmented user experience
- Archon OS is designed to be backend-only

---

## 10. Summary

| Question | Answer |
|----------|--------|
| **Does Archon OS have a UI?** | No - backend service only |
| **What port?** | API: 8092, Metrics: 8093, RabbitMQ: 15672 |
| **Frontend dependencies?** | None - it's backend-only |
| **How to start UI?** | Use Nexus Dashboard on port 3005 |
| **Integrated or standalone?** | **Integrated** with Nexus Dashboard |
| **Configuration needed?** | Add `NEXT_PUBLIC_ARCHON_URL` to Nexus Dashboard |
| **What's missing?** | Minor API integration in Nexus Dashboard |

---

## 11. Quick Start Commands

```bash
# 1. Start Archon OS (backend)
cd C:\Dev\Projects\Repos\Project-Nyra\infra\dual-orchestrator\archon-os
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d

# 2. Verify Archon OS is running
curl http://localhost:8092/health
# Expected: {"status": "healthy", "version": "1.0.0"}

# 3. Start Nexus Dashboard (UI)
cd C:\Dev\Projects\Repos\Project-Nyra\apps\nexus-dashboard
cp .env.example .env.local
# Add: NEXT_PUBLIC_ARCHON_URL=http://localhost:8092
pnpm install
pnpm dev

# 4. Access UIs
# - Nexus Dashboard: http://localhost:3005
# - Claude Flow Monitor: http://localhost:3005/claude-flow
# - RabbitMQ: http://localhost:15672 (archon / archon_queue_pass)
```

---

## 12. Next Steps

To complete the Archon OS UI integration:

1. **Immediate** (5 min):
   - Verify Archon OS is running
   - Check RabbitMQ management interface

2. **Short-term** (1 hour):
   - Add Archon API client to Nexus Dashboard
   - Create orchestration monitoring page
   - Test agent creation/management

3. **Long-term** (Optional):
   - Add advanced swarm topology visualization
   - Implement agent performance dashboards
   - Create workflow templates UI

---

**Conclusion**: Archon OS UI is **not missing** - it's **intentionally backend-only** and monitored through the **Nexus Dashboard** on port 3005. The architecture follows the pattern where Archon OS is the orchestration engine, and Nexus Dashboard is the unified monitoring interface.
