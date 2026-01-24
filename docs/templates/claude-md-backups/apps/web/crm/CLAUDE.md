# Nyra CRM - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user says "spawn swarm" or requests complex work, Claude Code MUST in ONE message:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms (var→const, add-types, remove-console) |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks, bug fixes, low complexity |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Architecture, security, complex reasoning |

**Before spawning agents, get routing recommendation:**
```bash
npx @claude-flow/cli@latest hooks pre-task --description "[task description]"
```

**When you see these recommendations:**

1. `[AGENT_BOOSTER_AVAILABLE]` → Skip LLM entirely, use Edit tool directly
   - Intent types: `var-to-const`, `add-types`, `add-error-handling`, `async-await`, `add-logging`, `remove-console`

2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool:
```javascript
Task({
  prompt: "...",
  subagent_type: "coder",
  model: "haiku"  // ← USE THE RECOMMENDED MODEL (haiku/sonnet/opus)
})
```

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks

---

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

**Use this to prevent agent drift:**
```bash
# Small teams (6-8 agents) - use hierarchical for tight control
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Large teams (10-15 agents) - use hierarchical-mesh for V3 queen + peer communication
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Queen controls workers directly (anti-drift for small teams)
- `hierarchical-mesh` - V3 queen + peer communication (recommended for 10+ agents)
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes
- `hybrid` - Dynamic topology switching

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence
- **max-agents 6-8**: Smaller team = less drift
- **specialized**: Clear roles, no overlap
- **consensus**: raft (leader maintains state)

---

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)

When the user requests a complex task, **spawn agents in background and WAIT for completion:**

```javascript
// STEP 1: Initialize swarm coordination (anti-drift config)
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in a SINGLE message
// Use run_in_background: true so agents work concurrently
Task({
  prompt: "Research requirements, analyze codebase patterns, store findings in memory",
  subagent_type: "researcher",
  description: "Research phase",
  run_in_background: true  // ← CRITICAL: Run in background
})

// STEP 3: WAIT - Tell user agents are working, then STOP
```

---

## ⏸️ CRITICAL: Spawn and Wait Pattern

**After spawning background agents:**

1. **TELL USER** - "I've spawned X agents working in parallel on: [list tasks]"
2. **STOP** - Do not continue with more tool calls
3. **WAIT** - Let the background agents complete their work
4. **RESPOND** - When agents return results, review and synthesize

### ✅ DO:
- Spawn all agents in ONE message
- Tell user what's happening
- Wait for agent results to arrive
- Synthesize results when they return

### 🚫 DO NOT:
- Continuously check swarm status
- Poll TaskOutput repeatedly
- Add more tool calls after spawning
- Ask "should I check on the agents?"

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
```bash
# 1. Search memory for relevant patterns from past successes
npx @claude-flow/cli@latest memory search --query '[task keywords]' --namespace patterns

# 2. Check if similar task was done before
npx @claude-flow/cli@latest memory search --query '[task type]' --namespace tasks

# 3. Load learned optimizations
npx @claude-flow/cli@latest hooks route --task '[task description]'
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern for future reference
npx @claude-flow/cli@latest memory store --namespace patterns --key '[pattern-name]' --value '[what worked]'

# 2. Train neural patterns on the successful approach
npx @claude-flow/cli@latest hooks post-edit --file '[main-file]' --train-neural true

# 3. Record task completion with metrics
npx @claude-flow/cli@latest hooks post-task --task-id '[id]' --success true --store-results true

# 4. Trigger optimization worker if performance-related
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Quick Reference

```bash
# Swarm management
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8

# Memory operations
npx @claude-flow/cli@latest memory store --key "pattern" --value "content" --namespace patterns
npx @claude-flow/cli@latest memory search --query "search term"
npx @claude-flow/cli@latest memory retrieve --key "pattern" --namespace patterns

# Hooks and learning
npx @claude-flow/cli@latest hooks pre-task --description "[task]"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
npx @claude-flow/cli@latest hooks post-edit --file "[file]" --train-neural true

# Status and monitoring
npx @claude-flow/cli@latest swarm status
npx @claude-flow/cli@latest agent list
npx @claude-flow/cli@latest agent status
```

---

## 🚀 Available Agents (60+ Types)

### For CRM Development
- `coder`: CRM feature implementation
- `backend-dev`: API and database operations
- `reviewer`: Code quality and security review
- `tester`: Unit and integration testing
- `compliance-architect`: Mortgage compliance validation
- `database-architect`: Schema design and migrations
- `security-auditor`: Security review and vulnerability scanning

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### Essential Hooks for Development

```bash
# Pre-task hook - get optimization recommendations
npx @claude-flow/cli@latest hooks pre-task --description "CRM lead management feature"

# Post-edit hook - train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file "filename.ts" --train-neural true

# Post-task hook - store completion metadata
npx @claude-flow/cli@latest hooks post-task --task-id "crm-feat-001" --success true --store-results true

# Route hook - get optimal agent assignment
npx @claude-flow/cli@latest hooks route --task "task description"
```

---

## 📝 Memory Commands Reference

### Store Data
```bash
npx @claude-flow/cli@latest memory store \
  --key "crm-pattern-leads" \
  --value "Lead capture, assignment, tracking workflow" \
  --namespace patterns
```

### Search Data
```bash
npx @claude-flow/cli@latest memory search \
  --query "crm lead management" \
  --namespace patterns --limit 5
```

### Retrieve Data
```bash
npx @claude-flow/cli@latest memory retrieve \
  --key "crm-pattern-leads" \
  --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

- **TodoWrite**: ALWAYS batch ALL todos in ONE call
- **Task tool**: ALWAYS spawn ALL agents in ONE message
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message

---

## 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Multiple files (3+)
- New feature implementation
- Database schema changes
- Compliance-related changes
- Security modifications

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes

---

## 🎯 Project Context

**Profile**: nextjs-typescript
**Generated**: 2026-01-09

## 🎯 CRM Project Overview

Customer Relationship Management system for mortgage leads

## 🏗️ Architecture

**Tech Stack**: Next.js 14, React 18, TypeScript, Prisma, PostgreSQL
**Port**: 3003
**Type**: Next.js Application

## 📋 Development Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Lint
pnpm lint
```

## 🧠 Claude Flow V3 Integration

### 3-Tier Model Routing (ADR-026)

```bash
# Get routing recommendation before work
npx @claude-flow/cli@latest hooks pre-task \
  --description "CRM lead management feature development"
```

### Available Agents

- **coder**: CRM feature implementation
- **backend-dev**: API and database operations
- **reviewer**: Code quality and security review
- **tester**: Unit and integration testing
- **compliance-architect**: Mortgage compliance validation

### Recommended Workflows

**1. Lead Management Feature**
```bash
# Initialize swarm for CRM work
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 5 --strategy specialized

# Store CRM context
npx @claude-flow/cli@latest memory store \
  --namespace crm \
  --key "leads/workflow" \
  --value "Lead capture, assignment, tracking, conversion"
```

**2. TwentyCRM Integration**
```bash
# Search for integration patterns
npx @claude-flow/cli@latest memory search \
  --query "twentycrm integration api patterns" \
  --namespace patterns

# Store successful integration
npx @claude-flow/cli@latest hooks post-task \
  --task-id "crm-integration-001" \
  --success true \
  --store-results true
```

**3. Database Migration**
```bash
# Pre-migration safety check
npx @claude-flow/cli@latest hooks pre-command \
  --command "prisma migrate dev" \
  --validate-safety true

# Post-migration record
npx @claude-flow/cli@latest hooks post-command \
  --command "prisma migrate dev" \
  --track-metrics true
```

### Auto-Learning Protocol

**Before Development**:
```bash
# Search memory for CRM patterns
npx @claude-flow/cli@latest memory search \
  --query "crm lead management mortgage" \
  --namespace patterns
```

**After Successful Implementation**:
```bash
# Store successful pattern
npx @claude-flow/cli@latest memory store \
  --namespace patterns \
  --key "crm-success-$(date +%Y%m%d)" \
  --value "Successfully implemented [feature] in CRM"

# Train neural patterns
npx @claude-flow/cli@latest neural train \
  --pattern-type crm-workflows \
  --epochs 10
```

---

## 🛠️ Tech Stack Specific Guidelines

## Next.js + TypeScript Development Guidelines

### Code Organization
- Use App Router (`app/` directory) for new features
- Organize by feature, not by file type
- Co-locate components with their pages
- Use barrel exports (`index.ts`) for clean imports

### Component Patterns
```typescript
// Server Components (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data.content}</div>;
}

// Client Components (when needed)
'use client';
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### Data Fetching
- Prefer Server Components for data fetching
- Use React Server Components for better performance
- Cache API responses with `fetch()` options
- Use Server Actions for mutations

### Styling
- Tailwind CSS utility-first approach
- Use `cn()` utility for conditional classes
- Shadcn/UI components for consistency
- CSS Modules for component-specific styles

### Type Safety
- Strict TypeScript configuration
- Define props interfaces explicitly
- Use Zod for runtime validation
- Type API responses with generated types

### Performance
- Use `next/image` for optimized images
- Implement proper loading states
- Use dynamic imports for code splitting
- Optimize bundle size with tree shaking

### Testing
- Jest + React Testing Library
- E2E tests with Playwright
- Test Server Components with async utilities
- Mock API calls appropriately

### Best Practices
- Follow Next.js 14 conventions
- Use TypeScript strict mode
- Implement proper error boundaries
- Use Server Actions instead of API routes when possible
- Optimize for Web Vitals (LCP, FID, CLS)


---

## 🔒 CRM-Specific Security & Compliance

### Data Protection
- Encrypt all PII (names, contact info, financial data)
- Role-based access control (RBAC)
- Audit logging for all lead access and modifications
- Session timeout after 30 minutes

### Mortgage Compliance
- Fair lending practices (no discriminatory data)
- Equal Housing Opportunity compliance
- TCPA compliance for communication consent
- Data retention (3+ years for mortgage records)

## 🔄 Integration Points

### TwentyCRM (Port 3000)
- Lead CRUD operations
- Pipeline management
- Activity tracking
- Contact management

### Quote Engine (Port 8001)
- Rate calculations for leads
- Loan product recommendations

### Campaign Engine (Port 8002)
- Automated drip campaigns
- Lead nurturing workflows

### Mem0 (Port 4321)
- Conversation history
- Lead interaction tracking

## 📚 Related Documentation

- **Root CLAUDE.md**: V3 orchestration patterns
- **apps/web/CLAUDE.md**: Web application ecosystem
- **TwentyCRM API**: CRM backend documentation

## 📝 Notes

- Integrated with TwentyCRM for data persistence
- Real-time updates via WebSocket
- Comprehensive lead lifecycle management
- Claude Flow V3 hooks and memory integration
- Mortgage-specific compliance features
