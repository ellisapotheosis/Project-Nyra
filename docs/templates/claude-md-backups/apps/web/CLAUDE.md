# Web Applications - Claude Flow V3 Configuration

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
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
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
npx @archon-os/cli@latest swarm init/status --topology hierarchical --max-agents 8
npx @archon-os/cli@latest memory store/search/retrieve --key/query
npx @archon-os/cli@latest hooks pre-task/post-task/post-edit
```

Agents: `coder`, `reviewer`, `frontend-specialist`, `backend-dev`, `tester`

---

## 📝 MEMORY COMMANDS REFERENCE

```bash
npx @archon-os/cli@latest memory store --key "web-pattern" --value "content" --namespace patterns
npx @archon-os/cli@latest memory search --query "web application development" --namespace patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

## 🎯 Web Applications - Project Nyra Frontend Ecosystem

## 🎯 APPLICATION CONTEXT

**Purpose**: Parent directory containing all web-facing applications for Project Nyra mortgage automation platform. Each app serves a specific user role and use case in the mortgage workflow.

**Pattern**: Monorepo with shared dependencies
**Architecture**: Micro-frontends communicating through backend APIs
**Tech Stack**: Mix of Next.js, React/Vite, TypeScript

## 🏗️ APPLICATION ECOSYSTEM

### Application Portfolio

| App | Port | Tech Stack | Purpose | Primary Users |
|-----|------|------------|---------|---------------|
| **crm** | 3003 | Next.js 14 | Lead management CRM | Loan officers, sales team |
| **crm-dashboard** | 3004 | React/Vite | Analytics & reporting | Management, analysts |
| **mortgage-assistant** | 3006 | Next.js 14 | Loan officer tools | Loan officers |
| **nyra-admin** | 3101 | React/Vite | Operations dashboard | Admin staff, ops team |
| **ratehunter** | 3100 | Next.js 14 | Public rate comparison | Potential borrowers |
| **webapp** | 3002 | React/Vite | Borrower portal | Active borrowers |

### Architecture Overview
```
                    ┌─────────────────┐
                    │   Nexus Router  │
                    │   (Port 6000)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼─────┐       ┌────▼─────┐       ┌────▼─────┐
    │ Quote    │       │ Campaign │       │  Mem0    │
    │ Engine   │       │ Engine   │       │  Memory  │
    │ (8001)   │       │ (8002)   │       │  (4321)  │
    └────┬─────┘       └────┬─────┘       └────┬─────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
    ┌────────────────────────┴────────────────────────┐
    │                Web Applications                  │
    ├──────────┬──────────┬──────────┬────────────────┤
    │ CRM      │ RateHunt │ WebApp   │ Admin          │
    │ (3003)   │ (3100)   │ (3002)   │ (3101)         │
    └──────────┴──────────┴──────────┴────────────────┘
```

## 🚨 CRITICAL DEVELOPMENT RULES

### Monorepo Coordination
**MANDATORY**: Changes affecting multiple apps must be coordinated:

```bash
# ✅ CORRECT: Coordinate changes across apps
[Single Message]:
  // Update shared dependency
  - Edit("package.json", updateSharedDependency)

  // Update all consuming apps simultaneously
  - Edit("web/crm/package.json", updateDependency)
  - Edit("web/ratehunter/package.json", updateDependency)
  - Edit("web/webapp/package.json", updateDependency)
  - Edit("web/nyra-admin/package.json", updateDependency)

  // Run tests across all apps
  - Bash("pnpm -r --filter './apps/web/*' test")

// ❌ WRONG: Update apps one at a time
[Message 1]: Update crm
[Message 2]: Update ratehunter
[Later]: Realize webapp is broken...
```

### Port Management
**CRITICAL**: Each app has a dedicated port - never have conflicts:

- 3002: webapp (borrower portal)
- 3003: crm (lead management)
- 3004: crm-dashboard (analytics)
- 3006: mortgage-assistant (loan officer tools)
- 3100: ratehunter (public rates)
- 3101: nyra-admin (operations)

### API Integration
**MANDATORY**: All apps consume same backend services:

- **Nexus Router** (6000): LLM routing gateway
- **Quote Engine** (8001): Rate calculations
- **Campaign Engine** (8002): Drip campaigns
- **TwentyCRM** (3000): CRM data
- **Mem0** (4321): Conversation memory

## 📊 APPLICATION DETAILS

### CRM (Port 3003)
**Purpose**: Lead management and tracking
**Tech**: Next.js 14 + Prisma + PostgreSQL
**Users**: Loan officers, sales team
**Key Features**:
- Lead capture and assignment
- Pipeline management
- Activity tracking
- Integration with TwentyCRM

**CLAUDE.md**: `web/crm/CLAUDE.md`

### CRM Dashboard (Port 3004)
**Purpose**: Analytics and reporting
**Tech**: React 18 + Recharts + Tailwind
**Users**: Management, analysts
**Key Features**:
- Real-time metrics
- Conversion funnels
- Performance dashboards
- Data visualization

**CLAUDE.md**: `web/crm-dashboard/CLAUDE.md`

### Mortgage Assistant (Port 3006)
**Purpose**: Loan officer workspace
**Tech**: Next.js 14 + React + TypeScript
**Users**: Loan officers
**Key Features**:
- Document management
- Client communication
- Loan application tracking
- Calendar and task management

**CLAUDE.md**: `web/mortgage-assistant/CLAUDE.md`

### Nyra Admin (Port 3101)
**Purpose**: Operations and administration
**Tech**: React 19 + Vite + TanStack Query
**Users**: Admin staff, ops team
**Key Features**:
- User management
- System configuration
- Monitoring dashboards
- Audit logs

**CLAUDE.md**: `web/nyra-admin/CLAUDE.md`

### RateHunter (Port 3100)
**Purpose**: Public mortgage rate comparison
**Tech**: Next.js 14 + Tailwind + shadcn/ui
**Users**: Potential borrowers (public)
**Key Features**:
- Live rate tables
- Mortgage calculator
- Lead capture forms
- SEO-optimized content

**CLAUDE.md**: `web/ratehunter/CLAUDE.md`

### WebApp (Port 3002)
**Purpose**: Borrower self-service portal
**Tech**: React 18 + Vite + Tailwind
**Users**: Active borrowers
**Key Features**:
- Application status tracking
- Document upload
- Secure messaging
- Rate lock management

**CLAUDE.md**: `web/webapp/CLAUDE.md`

## 🧠 CLAUDE FLOW INTEGRATION

### Multi-App Coordination
When changes span multiple apps, use hierarchical swarm:

```bash
# Initialize swarm for multi-app work
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Spawn app-specific agents
# - CRM specialist for web/crm
# - Frontend specialist for web/ratehunter
# - Backend specialist for API integration
# - Testing specialist for cross-app tests
```

### Recommended Workflows

**1. Cross-App Feature**
```bash
# Pre-task: Check dependencies
npx @archon-os/cli@latest memory search \
  --query "cross-app feature [description]" \
  --namespace patterns

# Coordinate development
npx @archon-os/cli@latest hooks pre-task \
  --description "Implement [feature] across CRM, RateHunter, and WebApp" \
  --coordinate-swarm true
```

**2. Shared Component Update**
```bash
# Update shared component in all apps
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6

# Spawn agents for each app using the component
# Update component + all consuming apps in parallel
```

**3. API Integration Change**
```bash
# When backend API changes, update all clients
npx @archon-os/cli@latest memory retrieve \
  --namespace shared \
  --key "api-clients/[endpoint]"

# Get list of all apps consuming the endpoint
# Update all simultaneously
```

## 🔧 DEVELOPMENT COMMANDS

### Monorepo Operations
```bash
# Install all dependencies
pnpm install

# Run all web apps
pnpm -r --filter './apps/web/*' dev

# Build all web apps
pnpm -r --filter './apps/web/*' build

# Test all web apps
pnpm -r --filter './apps/web/*' test

# Lint all web apps
pnpm -r --filter './apps/web/*' lint
```

### Individual App Operations
```bash
# Run specific app
pnpm --filter crm dev
pnpm --filter ratehunter dev
pnpm --filter webapp dev

# Build specific app
pnpm --filter nyra-admin build

# Test specific app
pnpm --filter mortgage-assistant test
```

## 📈 SHARED DEPENDENCIES

### Common Tech Stack
- **TypeScript**: Type safety across all apps
- **React**: UI framework (v18 or v19)
- **Tailwind CSS**: Utility-first styling
- **Zod**: Runtime validation
- **Axios**: HTTP client
- **Date-fns**: Date manipulation

### App-Specific Choices
- **Next.js 14**: crm, mortgage-assistant, ratehunter (SEO, SSR)
- **Vite**: webapp, crm-dashboard, nyra-admin (SPA performance)
- **Recharts**: crm-dashboard (data visualization)
- **shadcn/ui**: ratehunter, nyra-admin (UI components)

## 🔒 SECURITY & COMPLIANCE

### Cross-App Security
- **CORS**: Configure allowed origins
- **Authentication**: Shared JWT tokens
- **Authorization**: Role-based access control
- **Audit Logging**: Track user actions across apps

### Data Privacy
- **PII Handling**: Encrypt sensitive data
- **GDPR Compliance**: Data deletion workflows
- **Session Management**: Secure cookie handling
- **API Security**: Rate limiting, input validation

## 🔄 AUTO-LEARNING PROTOCOL

### Before Multi-App Changes
```bash
# Search for previous multi-app updates
npx @archon-os/cli@latest memory search \
  --query "multi-app update successful" \
  --namespace patterns

# Check app dependencies
npx @archon-os/cli@latest memory search \
  --query "app dependencies [feature]" \
  --namespace shared
```

### After Successful Multi-App Update
```bash
# Store successful pattern
npx @archon-os/cli@latest memory store \
  --namespace patterns \
  --key "multi-app-success-$(date +%Y%m%d)" \
  --value "Updated [apps] for [feature] successfully"

# Train neural pattern
npx @archon-os/cli@latest neural train \
  --pattern-type multi-app-coordination \
  --epochs 10
```

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: V3 orchestration patterns
- **Individual App CLAUDE.md**: App-specific guidelines
- **apps/shared/CLAUDE.md**: Shared resources
- **Architecture docs**: System design reference

---

**The web/ directory is the frontend heart of Project Nyra. Each app serves a distinct purpose, but they all work together as a unified mortgage automation platform. Coordination across apps is critical for consistent user experience and maintainability.**
