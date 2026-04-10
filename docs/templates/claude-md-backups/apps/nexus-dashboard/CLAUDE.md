# Nexus Router Dashboard - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🛡️ ANTI-DRIFT CONFIG

```bash
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

---

## 🔄 AUTO-START SWARM PROTOCOL & ⏸️ SPAWN AND WAIT PATTERN

1. Tell user concurrent tasks
2. STOP - no more tool calls
3. WAIT - let agents work
4. RESPOND - synthesize results

---

## 🧠 AUTO-LEARNING PROTOCOL

```bash
npx @archon-os/cli@latest memory search --query '[keywords]' --namespace patterns
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern]' --value '[result]'
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## 🚀 V3 CLI COMMANDS & 🚀 AVAILABLE AGENTS & 🪝 V3 HOOKS SYSTEM

```bash
npx @archon-os/cli@latest swarm init/status
npx @archon-os/cli@latest memory store/search/retrieve
npx @archon-os/cli@latest hooks pre-task/post-task/post-edit
```

Agents: `coder`, `reviewer`, `frontend-specialist`, `performance-engineer`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @archon-os/cli@latest memory store --key "nexus-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "orchestration dashboard" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

**Profile**: nexus-dashboard
**Generated**: 2026-01-10

## 🎯 Project Overview

Nexus Router Dashboard - AI Orchestration Platform Monitoring and Management Interface

## 🏗️ Architecture

**Tech Stack**: Next.js 15, TypeScript, Tailwind v4 (OKLCH), shadcn/ui, Recharts
**Port**: 3005
**Type**: Frontend Application

## 📋 Development Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## 🧠 Claude Flow V3 Integration

### 3-Tier Model Routing (ADR-026)

Before spawning agents, get routing recommendation:
```bash
npx @archon-os/cli@latest hooks pre-task \
  --description "Dashboard component development task"
```

Use recommended model in development:
- **Tier 1 (Agent Booster)**: Simple UI tweaks (var→const, styling)
- **Tier 2 (Haiku)**: Component updates, bug fixes
- **Tier 3 (Sonnet)**: Complex features, architecture changes

### Available Agents

- **coder**: Component implementation
- **reviewer**: Code quality and security review
- **tester**: Component and integration testing
- **performance-engineer**: Dashboard optimization

### Recommended Workflows

**1. New Dashboard Feature**
```bash
# Initialize hierarchical swarm
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 4 --strategy specialized

# Store context
npx @archon-os/cli@latest memory store \
  --namespace dashboard \
  --key "feature/[name]" \
  --value "Dashboard feature requirements and design"
```

**2. Performance Optimization**
```bash
# Run performance benchmark
npx @archon-os/cli@latest performance benchmark --suite dashboard

# Store optimization results
npx @archon-os/cli@latest hooks post-task \
  --task-id "perf-opt-001" \
  --success true \
  --store-results true
```

**3. Real-Time Data Integration**
```bash
# Search for WebSocket patterns
npx @archon-os/cli@latest memory search \
  --query "websocket real-time dashboard" \
  --namespace patterns
```

### Auto-Learning Protocol

**Before Development**:
```bash
# Search memory for relevant patterns
npx @archon-os/cli@latest memory search \
  --query "dashboard component [feature]" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
# Store successful pattern
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "dashboard-success-$(date +%Y%m%d)" \
  --value "Successfully implemented [feature] in Nexus Dashboard"

# Train neural patterns
npx @archon-os/cli@latest hooks post-edit \
  --file "src/components/[component].tsx" \
  --train-neural true
```

---

## 🛠️ Tech Stack Specific Guidelines

## Next.js 15 App Router Guidelines

### File Structure
- Use App Router (app directory)
- Server Components by default
- Client Components with 'use client' directive
- Collocate components with routes when possible

### Data Fetching
```typescript
// Server Component
async function Page() {
  const data = await fetch('...')
  return <Component data={data} />
}

// Client Component with hooks
'use client'
import { useEffect, useState } from 'react'
```

### API Routes
- Create in `app/api/` directory
- Use Route Handlers (not API routes)
- Return Response objects

### Performance
- Leverage React Server Components
- Use dynamic imports for heavy components
- Implement proper loading states
- Optimize images with next/image

## Tailwind CSS v4 with OKLCH

### Color System
- Use OKLCH color space for perceptual uniformity
- Define colors in `globals.css`
- Use CSS variables for theming

```css
:root {
  --primary: 0.5834 0.2305 277.0676;
  --background: 1.0000 0 0;
}

.dark {
  --primary: 0.5834 0.2305 277.0676;
  --background: 0.1448 0 0;
}
```

### Usage in Components
```tsx
<div className="bg-primary text-primary-foreground">
```

## shadcn/ui Components

### Installation
- Components are in `src/components/ui/`
- Fully customizable and own-able
- Built on Radix UI primitives

### Common Patterns
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

<Button variant="default" size="lg">
  Click me
</Button>

<Card>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## State Management with Zustand

### Store Pattern
```typescript
// src/lib/store.ts
import { create } from 'zustand'

interface Store {
  data: any[]
  setData: (data: any[]) => void
}

export const useStore = create<Store>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}))
```

### Usage
```tsx
'use client'
import { useStore } from '@/lib/store'

function Component() {
  const { data, setData } = useStore()
  // ...
}
```

## API Integration

### REST API Client
```typescript
// src/lib/api.ts
export class API {
  private static async fetch(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    return response.json()
  }
}
```

### WebSocket Connection
```typescript
const ws = new WebSocket('ws://localhost:8000/ws')
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Handle update
}
```

## Component Patterns

### Metric Card
```tsx
<MetricCard
  title="Total Requests"
  value={1234}
  icon={Activity}
  trend={{ value: 12.5, isPositive: true }}
/>
```

### Server Card
```tsx
<ServerCard
  server={serverData}
  onTest={() => testConnection()}
/>
```

### Performance Chart
```tsx
<PerformanceChart
  data={chartData}
/>
```

## Real-time Updates

### WebSocket Integration
```typescript
useEffect(() => {
  const ws = connectWebSocket((data) => {
    if (data.type === 'metrics') {
      setMetrics(data.payload)
    }
  })

  return () => ws.close()
}, [])
```

## Best Practices

### Performance
- Use Server Components when possible
- Implement proper loading states
- Debounce search inputs
- Lazy load heavy components

### Type Safety
- Define interfaces for all data structures
- Use TypeScript strict mode
- Avoid `any` types

### Styling
- Use Tailwind utility classes
- Follow OKLCH color system
- Maintain consistent spacing
- Use shadcn/ui components for consistency

### Code Organization
- Collocate related components
- Keep components small and focused
- Extract reusable logic to hooks
- Use barrel exports for cleaner imports

---

## 🔄 Integration with Nexus Router

### API Endpoints
- **Nexus Router**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws
- **Health Check**: http://localhost:8000/health

### Data Flow
```
Nexus Dashboard (3005) ←→ Nexus Router (8000) ←→ LLM Providers
                              ↓
                         Metrics & Logs
```

### Real-Time Monitoring
- WebSocket connection for live metrics
- Auto-reconnect on connection loss
- Fallback to polling if WebSocket unavailable
- Performance metrics updated every 5 seconds

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web application ecosystem
- **Nexus Router API**: Backend routing documentation

## 📝 Notes

- Dashboard connects to Nexus Router on port 8000
- Real-time updates via WebSocket
- OKLCH color space for better perceptual uniformity
- Fully responsive design
- Production-ready with error handling
- Integrated with Claude Flow V3 hooks and memory systems
