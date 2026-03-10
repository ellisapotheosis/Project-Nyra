# Archon UI - Master Build Guide

> **Cross-session project management and agent coordination interface**
> **Consolidated from archived Archon OS configurations and Docker setups**

## 🎯 **MISSION STATEMENT**

Build the cross-session project management interface for Archon OS integration, providing workspace visualization, task coordination, and agent orchestration capabilities.

**Port**: 3009 (to avoid conflicts with admin:3008, webapp:3000, landing:3001)
**Stack**: Next.js 15 + React 19 + shadcn/ui + TypeScript + Tailwind

---

## 📋 **COMPLETE FEATURE SPECIFICATION**

### **Core Interface Components**

#### 1. **Project Workspace** (`/workspace`)
- **Project tree view** with hierarchical navigation
- **Active sessions** monitoring and management
- **Memory state visualization** (RuVector, Letta, Graphiti)
- **Agent status dashboard** with health metrics
- **Real-time collaboration** indicators

#### 2. **Task Management** (`/tasks`)
- **Cross-session task tracking** with persistence
- **Workflow visualization** (SPARC methodology)
- **Task dependency mapping** and critical path
- **Progress tracking** with automated updates
- **Task handoff** between agents and sessions

#### 3. **Agent Coordination** (`/agents`)
- **Agent spawn interface** with configuration
- **Swarm topology** visualization (mesh, hierarchical)
- **Agent communication logs** and message passing
- **Performance metrics** (tokens, latency, success rates)
- **Agent lifecycle management** (spawn, pause, terminate)

#### 4. **Memory Browser** (`/memory`)
- **Semantic search interface** across all memory systems
- **Memory timeline** with session correlation
- **Pattern discovery** and relationship mapping
- **Memory consolidation tools** for knowledge management
- **Cross-session context** preservation

#### 5. **Workflow Designer** (`/workflows`)
- **Visual workflow editor** for SPARC processes
- **Template library** for common patterns
- **Workflow execution** monitoring and debugging
- **Integration points** with Claude Flow and n8n
- **Workflow versioning** and rollback capabilities

#### 6. **Observability Center** (`/observability`)
- **System health monitoring** across all components
- **Performance dashboards** with real-time metrics
- **Error tracking** and debugging interface
- **Resource utilization** monitoring (CPU, memory, tokens)
- **Alerting and notification** management

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Package.json (From Archived Structure)**
```json
{
  "name": "archon-ui",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3009",
    "build": "next build",
    "start": "next start -p 3009",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.5.10",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@tanstack/react-query": "^5.17.0",
    "react-flow-renderer": "^10.3.0",
    "d3": "^7.8.0",
    "@visx/visx": "^3.5.0",
    "react-hook-form": "^7.48.0",
    "zod": "3.23.8",
    "clsx": "2.1.1",
    "tailwind-merge": "2.5.2",
    "lucide-react": "0.427.0",
    "date-fns": "^3.0.0",
    "socket.io-client": "^4.7.0",
    "@radix-ui/react-context-menu": "^2.1.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@types/d3": "^7.4.0",
    "typescript": "5.5.4",
    "tailwindcss": "3.4.7",
    "postcss": "8.4.40",
    "autoprefixer": "10.4.19"
  }
}
```

### **File Structure (Complete)**
```
apps/archon-ui/
├── app/
│   ├── layout.tsx                 # Root layout with sidebar
│   ├── page.tsx                   # Dashboard overview
│   ├── workspace/
│   │   ├── page.tsx               # Project workspace main view
│   │   ├── [projectId]/
│   │   │   └── page.tsx           # Specific project workspace
│   │   └── components/
│   │       ├── ProjectTree.tsx    # Hierarchical project navigation
│   │       ├── SessionManager.tsx # Active session monitoring
│   │       ├── MemoryState.tsx    # Memory visualization
│   │       └── AgentStatus.tsx    # Agent health dashboard
│   ├── tasks/
│   │   ├── page.tsx               # Task management interface
│   │   ├── [taskId]/
│   │   │   └── page.tsx           # Task detail view
│   │   └── components/
│   │       ├── TaskBoard.tsx      # Kanban-style task board
│   │       ├── TaskGraph.tsx      # Dependency visualization
│   │       ├── WorkflowStepper.tsx # SPARC workflow stepper
│   │       └── TaskTimer.tsx      # Time tracking components
│   ├── agents/
│   │   ├── page.tsx               # Agent coordination center
│   │   ├── spawn/
│   │   │   └── page.tsx           # Agent spawning interface
│   │   └── components/
│   │       ├── SwarmTopology.tsx  # Visual swarm layout
│   │       ├── AgentCard.tsx      # Individual agent status
│   │       ├── MessageLog.tsx     # Agent communication
│   │       └── MetricsChart.tsx   # Performance visualizations
│   ├── memory/
│   │   ├── page.tsx               # Memory browser interface
│   │   ├── search/
│   │   │   └── page.tsx           # Advanced search interface
│   │   └── components/
│   │       ├── MemoryTimeline.tsx # Temporal memory view
│   │       ├── PatternGraph.tsx   # Relationship visualization
│   │       ├── SearchInterface.tsx # Semantic search UI
│   │       └── MemoryCard.tsx     # Individual memory display
│   ├── workflows/
│   │   ├── page.tsx               # Workflow management
│   │   ├── designer/
│   │   │   └── page.tsx           # Visual workflow editor
│   │   └── components/
│   │       ├── FlowCanvas.tsx     # Drag-and-drop editor
│   │       ├── NodePalette.tsx    # Available workflow nodes
│   │       ├── SPARCTemplate.tsx  # SPARC methodology templates
│   │       └── ExecutionLog.tsx   # Workflow execution monitoring
│   ├── observability/
│   │   ├── page.tsx               # System monitoring dashboard
│   │   └── components/
│   │       ├── HealthMetrics.tsx  # System health overview
│   │       ├── PerformanceChart.tsx # Performance dashboards
│   │       ├── ErrorTracker.tsx   # Error monitoring
│   │       └── AlertManager.tsx   # Notification management
│   └── api/
│       ├── archon/                # Archon OS integration
│       ├── memory/                # Memory system APIs
│       ├── agents/                # Agent management APIs
│       └── workflows/             # Workflow execution APIs
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx            # Main navigation
│   │   ├── Header.tsx             # Top bar with project selector
│   │   ├── StatusBar.tsx          # Bottom status information
│   │   └── CommandPalette.tsx     # Global command interface
│   ├── visualizations/
│   │   ├── ForceDirectedGraph.tsx # D3-based graph visualization
│   │   ├── Timeline.tsx           # Temporal data visualization
│   │   ├── TreeMap.tsx            # Hierarchical data display
│   │   └── NetworkDiagram.tsx     # Network topology display
│   └── archon/
│       ├── ProjectSelector.tsx    # Project switching interface
│       ├── SessionIndicator.tsx   # Session status display
│       ├── ArchonStatus.tsx       # Archon OS connection status
│       └── WorkspaceControls.tsx  # Workspace action buttons
├── lib/
│   ├── archon-client.ts           # Archon OS API client
│   ├── memory-client.ts           # Memory system integrations
│   ├── agent-client.ts            # Agent management client
│   ├── websocket.ts               # Real-time communication
│   └── types/
│       ├── archon.ts              # Archon-specific types
│       ├── memory.ts              # Memory system types
│       ├── agents.ts              # Agent and swarm types
│       └── workflows.ts           # Workflow definition types
├── hooks/
│   ├── useArchonProjects.ts       # Project state management
│   ├── useMemorySearch.ts         # Memory query hooks
│   ├── useAgentSwarm.ts           # Swarm coordination hooks
│   └── useRealtimeUpdates.ts      # WebSocket data hooks
├── public/
│   ├── archon-icons/              # Archon-specific iconography
│   └── workflow-templates/        # SPARC workflow templates
├── docker/
│   └── Dockerfile.archon-ui       # Container configuration
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🔌 **ARCHON OS INTEGRATION**

### **Connection Configuration (From Archived Configs)**
```typescript
// Based on archived archon-config.yml and Docker setups
interface ArchonConfig {
  apiEndpoint: string;      // http://localhost:8080/api
  websocketUrl: string;     // ws://localhost:8080/ws
  projectsPath: string;     // /workspace/projects
  sessionTimeout: number;   // 3600000 (1 hour)
  memoryBackends: string[]; // ['ruvector', 'letta', 'graphiti']
}

const archonConnection = {
  // Project management
  projects: {
    list: 'GET /api/projects',
    create: 'POST /api/projects',
    update: 'PUT /api/projects/{id}',
    delete: 'DELETE /api/projects/{id}'
  },

  // Session management
  sessions: {
    active: 'GET /api/sessions/active',
    create: 'POST /api/sessions',
    terminate: 'DELETE /api/sessions/{id}',
    restore: 'POST /api/sessions/{id}/restore'
  },

  // Memory integration
  memory: {
    search: 'POST /api/memory/search',
    retrieve: 'GET /api/memory/{id}',
    store: 'POST /api/memory/store',
    patterns: 'GET /api/memory/patterns'
  },

  // Agent coordination
  agents: {
    spawn: 'POST /api/agents/spawn',
    status: 'GET /api/agents/status',
    terminate: 'DELETE /api/agents/{id}',
    communicate: 'POST /api/agents/{id}/message'
  }
};
```

### **Docker Integration (From Archived Docker Files)**
```dockerfile
# Based on _archived/.../docker/build/tools/archon/Dockerfile.ui
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3009
ENV PORT 3009

CMD ["node", "server.js"]
```

---

## 🎨 **UI COMPONENT SPECIFICATIONS**

### **Project Workspace Layout**
```tsx
// Main workspace interface
interface Project {
  id: string;
  name: string;
  description: string;
  activeSessions: Session[];
  memoryState: MemorySnapshot;
  agentSwarm: AgentStatus[];
  createdAt: Date;
  lastAccessed: Date;
}

interface Session {
  id: string;
  projectId: string;
  status: 'active' | 'paused' | 'terminated';
  startedAt: Date;
  context: SessionContext;
  memoryUsage: MemoryUsage;
}
```

### **Agent Swarm Visualization**
```tsx
// Swarm topology component
interface SwarmNode {
  id: string;
  type: 'coordinator' | 'worker' | 'specialist';
  status: 'active' | 'idle' | 'busy' | 'error';
  connections: string[]; // Connected agent IDs
  metrics: {
    tokensProcessed: number;
    averageLatency: number;
    successRate: number;
    memoryUsage: number;
  };
}

interface SwarmTopology {
  type: 'mesh' | 'hierarchical' | 'star';
  nodes: SwarmNode[];
  edges: SwarmEdge[];
  coordinator?: string;
}
```

### **Memory Browser Interface**
```tsx
// Memory search and visualization
interface MemoryItem {
  id: string;
  type: 'conversation' | 'document' | 'pattern' | 'decision';
  content: string;
  metadata: {
    source: string;
    timestamp: Date;
    tags: string[];
    embeddings: number[];
  };
  relationships: MemoryRelationship[];
}

interface MemoryQuery {
  query: string;
  filters: {
    source?: string[];
    dateRange?: [Date, Date];
    tags?: string[];
    type?: string[];
  };
  embedding?: number[];
}
```

---

## 📊 **OBSERVABILITY DASHBOARDS**

### **System Health Metrics**
```typescript
interface SystemMetrics {
  archonOS: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    activeProjects: number;
    activeSessions: number;
  };

  memoryBackends: {
    ruvector: BackendStatus;
    letta: BackendStatus;
    graphiti: BackendStatus;
    mem0: BackendStatus;
  };

  agentSwarms: {
    totalAgents: number;
    activeAgents: number;
    averageLatency: number;
    errorRate: number;
    tokensPerMinute: number;
  };
}

interface BackendStatus {
  status: 'online' | 'offline' | 'error';
  latency: number;
  memoryUsage: number;
  lastSync: Date;
}
```

### **Performance Dashboards (From Archived Grafana Configs)**
```typescript
// Based on archived dashboard configurations
const dashboardMetrics = {
  // From _archived/.../dashboards/system-overview-dashboard.json
  systemOverview: [
    'archon_projects_total',
    'archon_sessions_active',
    'archon_memory_usage_bytes',
    'archon_agent_spawn_rate'
  ],

  // Agent performance metrics
  agentMetrics: [
    'agent_response_time_seconds',
    'agent_token_usage_total',
    'agent_error_rate',
    'agent_success_rate'
  ],

  // Memory system metrics
  memoryMetrics: [
    'memory_search_latency_seconds',
    'memory_storage_usage_bytes',
    'memory_retrieval_success_rate',
    'memory_consolidation_rate'
  ]
};
```

---

## 🔄 **REAL-TIME FEATURES**

### **WebSocket Integration**
```typescript
// Real-time updates via WebSocket
interface WebSocketMessage {
  type: 'agent_status' | 'memory_update' | 'session_change' | 'system_alert';
  projectId?: string;
  sessionId?: string;
  data: any;
  timestamp: Date;
}

const websocketEvents = {
  // Agent coordination
  'agent.spawned': (agentId: string, config: AgentConfig) => void,
  'agent.terminated': (agentId: string, reason: string) => void,
  'agent.message': (fromId: string, toId: string, message: any) => void,

  // Memory updates
  'memory.stored': (itemId: string, type: string) => void,
  'memory.retrieved': (itemId: string, query: string) => void,
  'memory.consolidated': (pattern: string, items: string[]) => void,

  // Session management
  'session.started': (sessionId: string, projectId: string) => void,
  'session.paused': (sessionId: string) => void,
  'session.restored': (sessionId: string) => void,

  // System alerts
  'system.error': (component: string, error: Error) => void,
  'system.warning': (component: string, warning: string) => void
};
```

---

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Core Infrastructure (Week 1)**
- [ ] Next.js project setup with TypeScript
- [ ] Archon OS API client and authentication
- [ ] Basic layout with sidebar navigation
- [ ] Project workspace foundation
- [ ] WebSocket connection management

### **Phase 2: Project Management (Week 2)**
- [ ] Project tree visualization
- [ ] Session monitoring and management
- [ ] Basic memory browser interface
- [ ] Agent status dashboard
- [ ] Real-time updates integration

### **Phase 3: Advanced Visualization (Week 3)**
- [ ] Swarm topology visualization
- [ ] Memory relationship graphs
- [ ] Workflow designer interface
- [ ] Performance metrics dashboards
- [ ] Task dependency mapping

### **Phase 4: Coordination Features (Week 4)**
- [ ] Agent spawning and management
- [ ] Cross-session task tracking
- [ ] Memory consolidation tools
- [ ] Workflow execution monitoring
- [ ] Advanced search and filtering

---

## 🧪 **TESTING STRATEGY**

### **Integration Testing**
- [ ] Archon OS API connectivity
- [ ] Memory backend integration
- [ ] Agent communication protocols
- [ ] WebSocket real-time updates

### **Visual Testing**
- [ ] Graph rendering performance
- [ ] Responsive layout validation
- [ ] Animation and interaction testing
- [ ] Large dataset visualization

### **User Experience Testing**
- [ ] Project navigation workflows
- [ ] Agent management scenarios
- [ ] Memory search effectiveness
- [ ] Workflow design usability

---

## 📚 **REFERENCE IMPLEMENTATIONS**

### **Archived Configurations**
- **Docker Setup**: `_archived/.../docker/build/tools/archon/`
- **Archon Config**: `_archived/.../dual-orchestrator/archon-os/config/`
- **Dashboard JSON**: `_archived/.../grafana/dashboards/`
- **Integration Scripts**: `_archived/.../shared-tools/archon/`

### **Environment Variables (From Archived Configs)**
```env
# Archon OS Connection
ARCHON_API_URL=http://localhost:8080
ARCHON_WS_URL=ws://localhost:8080/ws
ARCHON_API_KEY=your_api_key_here

# Memory Backend URLs
RUVECTOR_URL=http://localhost:8001
LETTA_URL=http://localhost:8002
GRAPHITI_URL=http://localhost:8003

# Real-time Updates
WEBSOCKET_ENABLED=true
UPDATE_INTERVAL=5000

# Observability
METRICS_ENDPOINT=http://localhost:9090
GRAFANA_URL=http://localhost:3005
```

---

## 🔧 **DEVELOPMENT COMMANDS**

```bash
# Setup
cd apps/archon-ui
npm install

# Development
npm run dev              # Start on port 3009
npm run build           # Production build
npm run type-check      # TypeScript validation

# Docker (from archived configs)
docker build -f docker/Dockerfile.archon-ui .
docker run -p 3009:3009 archon-ui

# With Archon OS integration
docker-compose -f ../../infra/docker/docker-compose.archon.yml up
```

---

**Last Updated**: 2026-03-10
**Status**: Ready for implementation
**Dependencies**: Archon OS, Memory Systems (RuVector, Letta, Graphiti), WebSocket Hub

This master build guide consolidates all archived Archon content, Docker configurations, and dashboard specifications into a comprehensive development reference.
