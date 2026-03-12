# Claude Flow Live Operations Dashboard - Integration Decision

**Date**: 2026-02-01
**Component**: Live Operations Dashboard (from ruvnet/claude-flow PR #1022)
**Decision Required**: Standalone page vs. Archon UI integration

---

## EXECUTIVE SUMMARY

**RECOMMENDATION: Standalone Page (Separate from Archon)**

This dashboard serves a **different audience and purpose** than Archon/Nexus UI and deserves its own dedicated page/service.

---

## ANALYSIS

### What is the Live Operations Dashboard?

A **real-time monitoring console** for Claude Flow V3 that shows:
- Agent status and spawning events
- Task execution flow (Kanban/Timeline)
- Message streams between agents
- Memory operations (AgentDB, Reasoning Bank)
- Live system topology with animated edges
- WebSocket-based event streaming (port 3001)

**Key insight**: This is a **developer/operator tool** for introspection and debugging, not a business dashboard.

### Current Architecture

**Current Pages:**
1. **openclawd** (port 3002) - Borrower-facing chat UI
2. **Archon OS** (port 8085) - Task orchestration + execution logs
3. **Nexus Router** (port 6000) - MCP aggregation + LLM routing
4. **Dify** (port 3001) - Workflow builder (conflicts with our event-server!)

**Note**: Port 3001 is already taken by Dify. Event server needs port reassignment.

### Option A: Standalone Page (RECOMMENDED)

```
Project Nyra UI Stack:
├── openclawd (port 3002) - Borrower UI
├── claude-flow-dashboard (port 3003) - Developer/Ops UI [NEW]
├── archon-os (port 8085) - Task execution logs
└── nexus-router (port 6000) - MCP gateway
```

**Pros:**
✅ Clear separation of concerns
✅ Dedicated WebSocket connection (event-server on 3003 or 3004)
✅ Independent deployment/scaling
✅ Different tech stack if needed (could use different framework)
✅ Can be disabled in production if desired
✅ Clearer navigation (different user journeys)

**Cons:**
❌ Another container to manage
❌ Slight resource overhead
❌ URL fragmentation (users jump between /openclawd and /claude-flow-dashboard)

---

### Option B: Integrated into Archon UI

```
Archon OS (port 8085):
├── Task Logs (existing)
├── Live Operations (new)
└── Topology Viewer (new)
```

**Pros:**
✅ Single dashboard for operations
✅ Fewer containers
✅ Lower resource overhead
✅ Consistent theming

**Cons:**
❌ Mixing concerns (task execution logs ≠ agent introspection)
❌ Archon is orchestration-focused; Claude Flow dashboard is dev-focused
❌ Different user personas (different mental models)
❌ Harder to disable/reuse independently
❌ Risk of feature creep

---

### Option C: Browser Extension / Sidebar

Could add Claude Flow dashboard as an overlay or sidebar in openclawd (borrower UI).

**Pros:**
✅ Non-intrusive
✅ Always available

**Cons:**
❌ Confusing for borrowers (they see dev tools)
❌ Security concern (expose internals to borrower UI)
❌ Not appropriate for production

---

## ARCHITECTURAL RECOMMENDATION

### CHOOSE: Option A (Standalone Page)

**Reasoning:**

1. **Clear Purpose**: This dashboard is for **developers and operators**, not borrowers
   - openclawd = borrower-facing (business value)
   - claude-flow-dashboard = developer-facing (operational value)

2. **Different User Journeys**:
   - Borrowers want to chat and get quotes
   - Developers/Ops want to see agent status, memory ops, topology

3. **Independent Evolution**:
   - Borrower UI evolves with product requirements
   - Developer dashboard evolves with v3 features (new agent types, memory backends, etc.)
   - They should not constrain each other

4. **Deployment Flexibility**:
   - Can be enabled/disabled independently
   - Can run on different servers (ops dashboard on secure internal network, borrower UI public)
   - Can be excluded from CI/CD if needed

5. **Technical Separation**:
   - Event server (WebSocket) is independent
   - Different styling/component library acceptable
   - Easier to fork/version independently

---

## IMPLEMENTATION PLAN

### Phase 1: Extract & Adapt
```
src/apps/claude-flow-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── Agent/ (from PR #1022)
│   │   ├── Task/ (from PR #1022)
│   │   ├── Message/ (from PR #1022)
│   │   ├── Memory/ (from PR #1022)
│   │   ├── Topology/ (from PR #1022)
│   │   └── Layout/ (DashboardLayout, Sidebar, etc.)
│   ├── services/
│   │   ├── WebSocketManager.ts
│   │   ├── EventBuffer.ts
│   │   └── EventAggregator.ts
│   ├── stores/
│   │   ├── agentStore.ts
│   │   ├── taskStore.ts
│   │   ├── messageStore.ts
│   │   └── memoryStore.ts
│   └── pages/
│       ├── Dashboard.tsx
│       ├── Agents.tsx
│       ├── Tasks.tsx
│       ├── Messages.tsx
│       ├── Memory.tsx
│       └── Topology.tsx
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Phase 2: Event Server Integration
```
services/claude-flow-event-server/
├── src/
│   ├── server.ts (WebSocket server)
│   ├── emitters/
│   │   ├── agent-emitter.ts
│   │   ├── task-emitter.ts
│   │   ├── message-emitter.ts
│   │   └── memory-emitter.ts
│   └── types/
│       └── events.ts
├── package.json
└── Dockerfile
```

**Port Assignment:**
- Event server: **port 3004** (avoid 3001 Dify, 3002 openclawd, 3003 dashboard)
- Dashboard: **port 3003**

### Phase 3: Docker Compose Integration
```yaml
# In docker-compose.orchestration.yml
claude-flow-event-server:
  build: ../../services/claude-flow-event-server
  ports:
    - "3004:3004"
  environment:
    - CLAUDE_FLOW_URL=http://nyra-claude-flow-dev:8080
    - EVENT_SERVER_PORT=3004
  networks:
    - nyra-network

claude-flow-dashboard:
  build: ../../apps/claude-flow-dashboard
  ports:
    - "3003:3003"
  environment:
    - VITE_EVENT_SERVER_URL=http://localhost:3004
    - VITE_CLAUDE_FLOW_URL=http://localhost:8080
  networks:
    - nyra-network
  depends_on:
    - claude-flow-event-server
```

### Phase 4: Navigation Integration
Update main navigation (whichever app hosts it) to link to:
- `/openclawd` - Borrower Chat
- `/claude-flow-dashboard` - Developer Ops Dashboard
- `/archon` - Task Execution

Or use a separate nav on `localhost:3003`.

---

## TECHNOLOGY DECISIONS

### What to Reuse from PR #1022
✅ **DO REUSE:**
- Component architecture (Agent, Task, Message, Memory, Topology components)
- WebSocket management logic
- Event buffer/aggregator patterns
- Tailwind styling framework
- State management approach (stores)

❌ **DO NOT REUSE (yet):**
- CLI integration (we'll do our own)
- agent.ts patch (we have our own claude-flow container)
- Full event server (we'll adapt it)

### Tech Stack for Dashboard
- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand or Jotai (lightweight)
- **WebSocket**: ws library
- **Visualization**: Recharts (for metrics) or Visx (for complex topology)

---

## SUCCESS CRITERIA

✅ Dashboard loads at `http://localhost:3003`
✅ WebSocket connects to event server at `3004`
✅ Real-time agent status updates visible
✅ Task Kanban/Timeline shows live execution
✅ Message stream updates in real-time
✅ Memory operations logged and visible
✅ Topology shows animated edges
✅ Can be disabled in production compose file
✅ Separate Docker container (can restart independently)
✅ No conflicts with existing ports (Dify 3001, openclawd 3002)

---

## FUTURE CONSIDERATIONS

### v2.1: Integration with Nexus Router
- Add LLM routing visualization
- Show request/response flow
- Display model selection logic

### v2.2: Integration with Archon OS
- Embed Archon execution logs
- Show task dependency graph
- Cross-reference with agent topology

### v3.0: Multi-PC Monitoring
- Federated dashboards across 3 PCs
- Global topology view
- Distributed event aggregation

### Production Hardening
- Authentication (don't expose to public)
- Rate limiting
- Event filtering (show only relevant events)
- Export/archive capabilities

---

## TRADEOFFS ACCEPTED

| Tradeoff | Acceptance | Why |
|----------|-----------|-----|
| **More containers** | ✅ Accepted | Independence & flexibility worth it |
| **Port 3003+3004 usage** | ✅ Accepted | Clear, non-conflicting, documented |
| **Separate tech stack** | ✅ Accepted | Allows optimizing for dev experience |
| **Not in Archon** | ✅ Accepted | Different purpose = different home |

---

## NEXT STEPS

1. **Get Approval** (you)
2. **Extract Components** from PR #1022
3. **Create React App** in `src/apps/claude-flow-dashboard`
4. **Build Event Server** in `services/claude-flow-event-server`
5. **Docker Integration** - Add to compose files
6. **Test Real-Time Flow** - Connect to running claude-flow-dev
7. **Production Deployment** - Decide visibility (internal-only vs. public)

---

**Decision Made**: ✅ **Standalone Page (Option A)**

Proceed with Phase 1-4 implementation?
