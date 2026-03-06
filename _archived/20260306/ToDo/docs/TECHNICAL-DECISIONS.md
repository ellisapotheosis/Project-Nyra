# Project Nyra - Technical Decisions & Recommendations

## ❓ Your Questions Answered

### Q1: Fork vs NPM for Claude Flow & Archon?

**ANSWER: Use NPM packages, NOT forks**

**Reasoning:**
```bash
# ✅ DO THIS
pnpm add claude-flow@alpha
pnpm add archon-mcp

# ❌ DON'T DO THIS
git clone https://github.com/ruvnet/claude-flow
git submodule add https://github.com/archon-ai/archon-mcp
```

**Why NPM wins:**
| Factor | NPM Install | Fork/Submodule |
|--------|------------|----------------|
| **Setup time** | 30 seconds | 2-4 hours |
| **Maintenance** | Auto-updates via `pnpm update` | Manual merge conflicts |
| **Breaking changes** | Semver protected | Your problem |
| **Custom code** | Write wrapper/plugin | Maintain entire fork |
| **CI/CD** | Simple | Complex |
| **Team onboarding** | `pnpm install` | Git submodule hell |

**When to fork (later):**
- You need to modify core orchestration logic
- You're contributing back to upstream
- You have 2+ devs dedicated to maintaining fork

**For now:** Use NPM. If you need custom behavior, write adapters:

```typescript
// ✅ Good: Adapter pattern
// services/orchestrator/claude-flow-adapter.ts
import { ClaudeFlow } from 'claude-flow';

export class NyraOrchestrator {
  private flow: ClaudeFlow;
  
  constructor() {
    this.flow = new ClaudeFlow({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY!
    });
  }
  
  async handleMortgageWorkflow(lead: Lead) {
    // Your custom logic here
    return this.flow.execute(/* ... */);
  }
}

// ❌ Bad: Forking entire repo just to change one method
```

---

### Q2: Container Strategy - Development vs Production?

**DEVELOPMENT:**
```bash
# Use Docker Compose for services
docker-compose -f docker-compose.dev.yml up -d

# Run your code NATIVELY (not in containers)
cd apps/webapp
pnpm dev  # Hot reload, fast iteration
```

**Why not containerize your app code in dev:**
- Slow build times
- No hot reload
- Painful debugging
- File permission issues (Windows especially)

**PRODUCTION:**
```bash
# Containerize EVERYTHING
docker build -t nyra/webapp:v1.0.0 .
docker build -t nyra/orchestrator:v1.0.0 .
```

**Recommended Production Setup:**

```dockerfile
# apps/webapp/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

EXPOSE 3000
CMD ["pnpm", "start"]
```

**Volumes Strategy:**

```yaml
# docker-compose.prod.yml
services:
  webapp:
    image: nyra/webapp:latest
    volumes:
      # ❌ DON'T mount source code
      # ✅ DO mount only data/config
      - ./configs:/app/configs:ro
      - uploads:/app/uploads
    environment:
      # Use Infisical for secrets
      - NODE_ENV=production
```

**NEVER do this in production:**
```yaml
# ❌ BAD - mounting source code
volumes:
  - ./apps/webapp:/app  # Security risk, slow
```

---

### Q3: When to Build 4-PC LAN Setup?

**ANSWER: Phase 3 (Week 13+), NOT NOW**

**Current Reality Check:**
| Your Goal | What You Actually Need First |
|-----------|----------------------------|
| 4-PC distributed AI swarm | Single PC running Docker |
| GPU workers for inference | OpenRouter API ($) |
| Cloudflared tunneling | `localhost:3000` |
| Tailscale mesh | Single machine |

**Phase-Based Approach:**

**Phase 1 (NOW):** Single PC
```
Orchestrator PC (Area51):
├── All services in Docker
├── Development happening here
└── Enough for MVP

GPU PCs: Powered off 💤
```

**Phase 2 (Weeks 5-12):** Still Single PC
```
Orchestrator PC:
├── Production-like setup
├── Real leads flowing
├── Drip campaigns working
└── Making money 💰

GPU PCs: Still powered off 💤
```

**Phase 3 (Weeks 13+):** IF NEEDED, Add GPU Workers
```
Orchestrator PC:
├── Nexus Router
├── TwentyCRM
├── n8n
└── Routes to →

GPU Worker 1 (RTX 5090):
├── Local LLM (LLaMA 70B)
├── Embedding models
└── High-compute tasks

GPU Worker 2 (RTX 3090):
├── Local LLM fallback
└── Development inference

GPU Worker 3 (RTX 3060):
├── Embedding generation
└── Test environment
```

**When to ACTUALLY build 4-PC:**
- ✅ You're spending >$500/month on OpenRouter/Anthropic
- ✅ You need <100ms inference latency
- ✅ You have privacy/compliance requirements for local LLMs
- ✅ You have 20+ concurrent users

**Until then:** Use OpenRouter API. It's cheaper and more reliable.

---

### Q4: Best Memory System Combo?

**LOCKED IN (from your whitepaper):**
- **Graphiti** (temporal knowledge graph) + **Letta** (conversational memory)

**DON'T add:**
- Zep (redundant with Letta)
- OpenMemory MCP (adds complexity, minimal benefit)
- mem0 (same features as Letta)

**Your Stack:**
```
┌─────────────────────────────────────────────┐
│           Mortgage Assistant                │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌───────▼────────┐
│  Letta Memory  │   │    Graphiti    │
│  (ConvoMemory) │   │ (KnowledgeGraph)│
└───────┬────────┘   └───────┬────────┘
        │                     │
        │    ┌────────────────┘
        │    │
┌───────▼────▼────────┐
│   Qdrant (Vectors)  │
│   Neo4j  (Graph)    │
└─────────────────────┘
```

**Integration:**

```typescript
// services/memory/nyra-memory.ts
import { Letta } from 'letta-js';
import { Graphiti } from 'graphiti-core';

export class NyraMemory {
  private letta: Letta;
  private graphiti: Graphiti;
  
  async storeBorrowerInteraction(
    userId: string,
    message: string,
    context: object
  ) {
    // Store in Letta for conversational continuity
    await this.letta.addMessage({
      userId,
      role: 'user',
      content: message
    });
    
    // Extract facts for knowledge graph
    const facts = await this.extractFacts(message);
    for (const fact of facts) {
      await this.graphiti.addFact({
        subject: `Borrower:${userId}`,
        predicate: fact.relation,
        object: fact.object,
        timestamp: new Date()
      });
    }
  }
  
  async recallContext(userId: string) {
    // Get recent conversation from Letta
    const messages = await this.letta.getMessages(userId, { limit: 10 });
    
    // Get related facts from Graphiti
    const facts = await this.graphiti.query({
      subject: `Borrower:${userId}`,
      limit: 20
    });
    
    return { messages, facts };
  }
}
```

**Why This Combo:**
1. **Letta**: Handles "What did we just talk about?"
2. **Graphiti**: Handles "What do I know about this borrower over time?"
3. **Qdrant**: Powers semantic search for both
4. **Neo4j**: Powers relationship queries for Graphiti

**Setup Priority:**
```bash
# Week 1
✅ Qdrant (easiest, foundational)

# Week 2  
✅ Letta (conversational memory working)

# Week 4
✅ Graphiti (knowledge graph working)

# Week 8
✅ Integration (both talking to each other)
```

---

### Q5: Bootstrap Material Organization?

**RECOMMENDED:**

```
Project-Nyra/
├── bootstrap/
│   ├── 01-single-pc-dev/         # Phase 1 setup
│   │   ├── docker-compose.dev.yml
│   │   ├── setup.sh
│   │   └── README.md
│   │
│   ├── 02-production-single/     # Phase 2 setup
│   │   ├── docker-compose.prod.yml
│   │   ├── k8s/
│   │   └── deploy.sh
│   │
│   ├── 03-lan-distributed/       # Phase 3 setup (DEFERRED)
│   │   ├── orchestrator/
│   │   │   ├── setup.sh
│   │   │   └── config/
│   │   ├── gpu-worker-1/
│   │   ├── gpu-worker-2/
│   │   └── gpu-worker-3/
│   │
│   ├── configs/
│   │   ├── infisical-template.env
│   │   ├── nexus-router.config.ts
│   │   └── mcp-registry.json
│   │
│   └── scripts/
│       ├── validate-env.sh
│       ├── health-check.sh
│       └── backup.sh
│
├── docs/
│   ├── bootstrap/
│   │   ├── PHASE-1-SETUP.md
│   │   ├── PHASE-2-PRODUCTION.md
│   │   └── PHASE-3-DISTRIBUTED.md
│   │
│   ├── environment-variables/
│   │   ├── COMPLETE-LIST.md
│   │   ├── OPTIMAL-SETTINGS.md
│   │   └── PER-SERVICE.md
│   │
│   └── mortgage-ops/
│       ├── DAILY-WORKFLOW.md
│       ├── LEAD-CAMPAIGNS.md
│       └── QUOTE-GENERATION.md
│
└── inputs/  # (Your existing docs - KEEP SEPARATE)
    ├── claude-flow/
    ├── archon/
    └── mortgage-workflows/
```

**Don't move inputs into repo.** Keep them at:
- `C:/Dev/NyraDocs` ← External reference docs
- `Project-Nyra/docs` ← Your project-specific docs

**Why separate:**
- Inputs = Research/reference (100s of files, constantly changing)
- Docs = Canonical truth (versioned, reviewed, stable)

---

### Q6: Templates vs Agents vs Skills in Claude Flow?

**AGENT:** Best for this use case

**Why:**
```typescript
// ✅ Agent: Persistent, stateful, reusable
// .claude/agents/mortgage-quote-agent.yaml
---
name: mortgage-quote-agent
role: specialist
capabilities:
  - loan_calculation
  - api_integration
  - data_validation
tools:
  - quote_api
  - crm_write
---

// Use like:
npx claude-flow agent spawn mortgage-quote-agent
```

**Workflow:** For complex multi-step processes
```json
// workflows/lead-to-close.json
{
  "trigger": "new_lead",
  "steps": [
    { "agent": "intake-agent", "task": "validate_lead" },
    { "agent": "quote-agent", "task": "generate_quote" },
    { "agent": "campaign-agent", "task": "start_drip" }
  ]
}
```

**Skill:** For reusable functions
```typescript
// .claude/skills/mortgage-calculator.ts
export class MortgageCalculator {
  calculatePayment(principal, rate, term) {
    // Reusable calculation logic
  }
}
```

**For your use case:**
```bash
# Create template agent
npx claude-flow agent create \
  --name campaign-builder \
  --role orchestrator \
  --tools crm,email,sms

# Use in multiple contexts
npx claude-flow agent spawn campaign-builder \
  --context lead-nurture

npx claude-flow agent spawn campaign-builder \
  --context reactivation
```

---

### Q7: SPARC Init Strategy?

**Different CLAUDE.md per directory:**

```bash
# Root level - Overall project
Project-Nyra/CLAUDE.md  # High-level architecture

# App-specific
apps/webapp/CLAUDE.md   # Frontend development
apps/orchestrator/CLAUDE.md  # Agent coordination

# Service-specific
services/quote-api/CLAUDE.md  # Python/FastAPI context
services/memory/CLAUDE.md      # Memory system context

# Infrastructure
.github/CLAUDE.md              # CI/CD context
```

**Initialize each:**
```bash
cd apps/webapp
npx @claude-flow/cli@latest init --sparc --modes web-dev,ui-ux,testing

cd services/quote-api
npx @claude-flow/cli@latest init --sparc --modes backend-api,python,data-validation

cd .github
npx @claude-flow/cli@latest init --sparc --modes devops,ci-cd,deployment
```

**Template Manager Agent:**
```yaml
# .claude/agents/template-manager.yaml
---
name: template-manager
role: architect
capabilities:
  - Initialize CLAUDE.md for new directories
  - Update templates based on context
  - Ensure consistency across project
triggers:
  - pattern: "setup * for *"
  - pattern: "initialize * component"
---
```

---

## 🎯 FINAL RECOMMENDATIONS SUMMARY

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| **Claude Flow** | NPM package, NOT fork | Maintenance burden too high |
| **Archon MCP** | NPM package, NOT fork | Same as above |
| **Development** | Docker for services, native for code | Fast iteration |
| **Production** | Everything containerized | Reproducibility |
| **4-PC LAN** | Phase 3 (Week 13+) | Premature optimization |
| **Memory** | Graphiti + Letta ONLY | Locked in, sufficient |
| **Bootstrap** | Separate by phase | Clear progression |
| **Inputs** | Keep external to repo | Research vs truth |
| **CLAUDE.md** | One per major component | Context-specific guidance |

---

## 🚀 START HERE CHECKLIST

### Today (Hour 1):
- [ ] `pnpm init` in Project-Nyra root
- [ ] Copy `.env.example` from outputs folder
- [ ] `docker-compose up -d` all services
- [ ] Verify Dify opens at localhost:3000

### This Week:
- [ ] Create first n8n workflow (webhook → TwentyCRM)
- [ ] Deploy FastAPI quote endpoint
- [ ] Connect Dify to Nexus Router
- [ ] Add 1 lead manually to test flow

### This Month:
- [ ] Live drip campaign for 10 test leads
- [ ] Landing page deployed to ratehunter.net
- [ ] Real quote from Rocket Mortgage API
- [ ] First deal closed using system

---

## ❌ AVOID THESE TRAPS

1. **Don't fork repositories yet** - NPM first, fork only if truly needed
2. **Don't build 4-PC setup now** - Single machine is enough for 6+ months
3. **Don't integrate every memory system** - Graphiti + Letta is plenty
4. **Don't optimize prematurely** - Ship features, then optimize
5. **Don't containerize dev code** - Docker for services, native for apps

---

## 💡 The #1 Thing to Remember

**You don't need distributed AI swarms to close mortgage deals.**

You need:
- ✅ Leads flowing in
- ✅ Drip campaigns sending
- ✅ Quotes generating
- ✅ Deals closing

Everything else is a distraction until these work.

**Build the boring stuff first. The fancy AI comes after revenue.**
