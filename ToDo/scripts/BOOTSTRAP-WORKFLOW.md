# Project Nyra - Bootstrap & Development Workflow

## 🎯 CRITICAL DECISIONS MADE

### ❌ DO NOT:
- Fork claude-flow or archon-mcp (use npm packages)
- Build 4-PC distributed system in Phase 1
- Try to integrate every memory system
- Create custom orchestration before validating core features

### ✅ DO:
- Use locked stack (Nexus + Dify + n8n + Activepieces + TwentyCRM)
- Build MVP on single machine first
- Validate with real mortgage workflows
- Scale horizontally only after proven

---

## 📅 PHASE 1: Foundation (Weeks 1-4)

### Week 1: Repository Setup

```bash
# 1. Initialize monorepo
cd Project-Nyra
pnpm init
pnpm add -w -D @types/node typescript tsx

# 2. Install core dependencies
pnpm add @anthropic-ai/sdk
pnpm add litellm
pnpm add -D infisical-node

# 3. Setup workspace structure
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'services/*'
  - 'packages/*'
EOF

# 4. Initialize Infisical
infisical init
infisical secrets set ANTHROPIC_API_KEY="..." --env=dev
```

### Week 2: Core Services Deployment

**Docker Compose for Development:**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # PostgreSQL (shared by multiple services)
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_MULTIPLE_DATABASES: dify,twenty,letta,n8n
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis (for Dify, n8n, Activepieces)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Neo4j (for Graphiti)
  neo4j:
    image: neo4j:5
    environment:
      NEO4J_AUTH: neo4j/${NEO4J_PASSWORD}
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j-data:/data

  # Qdrant (vector DB)
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant-data:/qdrant/storage

  # Dify (AI chat interface)
  dify-web:
    image: langgenius/dify-web:latest
    environment:
      CONSOLE_API_URL: http://dify-api:5001
      APP_API_URL: http://dify-api:5001
    ports:
      - "3000:3000"
    depends_on:
      - dify-api

  dify-api:
    image: langgenius/dify-api:latest
    environment:
      DB_USERNAME: postgres
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_DATABASE: dify
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "5001:5001"
    depends_on:
      - postgres
      - redis

  # n8n (workflow automation)
  n8n:
    image: n8nio/n8n:latest
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: postgres
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
    ports:
      - "5678:5678"
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      - postgres

  # TwentyCRM
  twenty-server:
    image: twentycrm/twenty:latest
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/twenty
    ports:
      - "3001:3000"
    depends_on:
      - postgres

volumes:
  postgres-data:
  neo4j-data:
  qdrant-data:
  n8n-data:
```

**Startup:**
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Verify all healthy
docker-compose ps
```

### Week 3: Nexus Router + Memory Setup

**Install Nexus Router:**
```bash
# In services/routing/
pnpm add @grafbase/nexus
```

**Configure Nexus:**
```typescript
// services/routing/nexus.config.ts
import { nexus } from '@grafbase/nexus';

export default nexus({
  mcp: {
    port: 4001,
    servers: {
      'letta-memory': {
        command: 'python',
        args: ['-m', 'letta.mcp_server'],
        env: {
          LETTA_SERVER_URL: process.env.LETTA_SERVER_URL!
        }
      },
      'twenty-crm': {
        command: 'node',
        args: ['./mcp-servers/twenty-crm.js']
      }
    }
  },
  llm: {
    providers: {
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY!
      },
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY!
      }
    },
    defaultModel: 'anthropic/claude-sonnet-4-20250514'
  },
  routing: {
    rules: [
      {
        path: '/mortgage-quote',
        provider: 'anthropic',
        model: 'claude-sonnet-4'
      }
    ]
  }
});
```

**Setup Graphiti + Letta:**
```bash
# Install Graphiti
cd services/memory
pnpm add graphiti-core

# Install Letta
pip install letta
letta server --host 0.0.0.0 --port 8283

# Initialize Graphiti with Neo4j
node scripts/init-graphiti.js
```

### Week 4: Quote API + First Workflow

**Create Quote API:**
```bash
cd services/quote-api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic
```

**Basic Quote Endpoint:**
```python
# services/quote-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class QuoteRequest(BaseModel):
    loan_amount: float
    property_value: float
    credit_score: int
    loan_type: str  # "conventional", "fha", "va", etc.
    property_state: str
    
class QuoteResponse(BaseModel):
    estimated_rate: float
    monthly_payment: float
    closing_costs: float
    providers: list[dict]

@app.post("/api/quote", response_model=QuoteResponse)
async def get_quote(request: QuoteRequest):
    # TODO: Integrate with Rocket Mortgage / LenderPrice APIs
    # For now, return mock data
    return QuoteResponse(
        estimated_rate=6.875,
        monthly_payment=2847.32,
        closing_costs=8500.00,
        providers=[
            {"name": "Rocket Mortgage", "rate": 6.875},
            {"name": "Better.com", "rate": 6.950}
        ]
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**First n8n Workflow: Lead Capture → CRM:**

1. Open n8n (http://localhost:5678)
2. Create workflow:
   - **Webhook Trigger** (from freerateupdate.com)
   - **TwentyCRM Create Contact** node
   - **Dify Chat** node (send welcome message)
   - **n8n Set** node (tag lead as "new")

---

## 📅 PHASE 2: Mortgage Features (Weeks 5-12)

### Week 5-6: Lead Drip Campaigns

**Activepieces Campaign Builder:**

1. Install Activepieces locally:
```bash
docker run -d \
  --name activepieces \
  -p 4200:80 \
  -v activepieces-data:/opt/activepieces/data \
  activepieces/activepieces:latest
```

2. Create campaign flows:
   - **Day 1**: Welcome email + SMS
   - **Day 3**: Missed call ping (if no response)
   - **Day 7**: Voicemail drop
   - **Day 14**: Re-engagement email

**Integration with n8n:**
```javascript
// Activepieces → n8n webhook
{
  "trigger": "campaign_action",
  "lead_id": "{{lead.id}}",
  "action": "send_sms",
  "message": "{{campaign.message}}"
}
```

### Week 7-8: Chatbot + Dify Integration

**Dify Workflow:**

1. Create "Mortgage Assistant" agent in Dify
2. Configure tools:
   - **Quote Calculator** (calls FastAPI)
   - **Document Upload** (saves to TwentyCRM)
   - **Schedule Call** (updates n8n calendar)

3. Embed in webapp:
```typescript
// apps/webapp/components/ChatWidget.tsx
import { DifyChatWidget } from '@dify/chat-widget';

export function ChatWidget() {
  return (
    <DifyChatWidget
      apiKey={process.env.NEXT_PUBLIC_DIFY_API_KEY}
      agentId="mortgage-assistant"
      theme="light"
    />
  );
}
```

### Week 9-10: Quote Engine Integration

**Rocket Mortgage API:**
```typescript
// services/quote-api/integrations/rocket.ts
import axios from 'axios';

export async function getRocketQuote(params: QuoteParams) {
  const response = await axios.post(
    'https://api.rocketmortgage.com/v1/quotes',
    {
      loanAmount: params.loanAmount,
      propertyValue: params.propertyValue,
      creditScore: params.creditScore,
      loanType: params.loanType
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.ROCKET_MORTGAGE_API_KEY}`
      }
    }
  );
  
  return response.data;
}
```

### Week 11-12: TwentyCRM Customization

**Custom Fields:**
```sql
-- Add mortgage-specific fields to TwentyCRM
ALTER TABLE contacts ADD COLUMN loan_amount DECIMAL(12, 2);
ALTER TABLE contacts ADD COLUMN pre_approval_status VARCHAR(50);
ALTER TABLE contacts ADD COLUMN loan_officer_id UUID;
```

**Webhook Handlers:**
```typescript
// apps/crm-extensions/webhooks/lead-status-change.ts
export async function handleLeadStatusChange(webhook: Webhook) {
  const { contactId, newStatus } = webhook.data;
  
  if (newStatus === 'qualified') {
    // Trigger n8n workflow to start drip campaign
    await fetch(`${N8N_URL}/webhook/start-campaign`, {
      method: 'POST',
      body: JSON.stringify({ contactId })
    });
  }
}
```

---

## 📅 PHASE 3: Advanced Features (Weeks 13-20)

### Week 13-14: Memory System Integration

**Letta Integration:**
```python
# services/memory/letta_client.py
from letta import LocalClient

client = LocalClient()

# Create agent with mortgage context
agent = client.create_agent(
    name="mortgage-memory",
    system_prompt="You are a memory system for a mortgage assistant...",
    llm_config={"model": "claude-sonnet-4"}
)

# Store conversation
client.user_message(
    agent_id=agent.id,
    message="User inquired about VA loan for $450k property"
)
```

**Graphiti Knowledge Graph:**
```typescript
// services/memory/graphiti-ops.ts
import { Graphiti } from 'graphiti-core';

const graph = new Graphiti({
  neo4jUri: process.env.NEO4J_URI!,
  neo4jUser: 'neo4j',
  neo4jPassword: process.env.NEO4J_PASSWORD!
});

// Add relationship
await graph.addFact({
  subject: 'User:john-doe',
  predicate: 'inquired_about',
  object: 'Loan:va-450k',
  timestamp: new Date(),
  metadata: {
    source: 'chatbot',
    campaign: 'spring-2025'
  }
});
```

### Week 15-16: Claude Flow Orchestration (OPTIONAL)

**Only add if you need advanced multi-agent coordination:**

```bash
pnpm add claude-flow@alpha
```

**Basic Orchestration:**
```typescript
// services/orchestrator/claude-flow-runner.ts
import { ClaudeFlow } from 'claude-flow';

const flow = new ClaudeFlow({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  memoryBackend: 'postgres'
});

// Spawn agents for complex mortgage scenario
await flow.spawnSwarm({
  task: "Analyze borrower documents and prepare loan package",
  agents: [
    { type: 'analyst', name: 'doc-reviewer' },
    { type: 'coder', name: 'data-extractor' },
    { type: 'coordinator', name: 'loan-packager' }
  ],
  topology: 'hierarchical'
});
```

### Week 17-18: Landing Page (ratehunter.net)

**Next.js App:**
```bash
cd apps/website
pnpm create next-app@latest . --typescript --tailwind --app
pnpm add @shadcn/ui lucide-react
```

**Homepage with Quote Widget:**
```tsx
// apps/website/app/page.tsx
import { QuoteCalculator } from '@/components/QuoteCalculator';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Find Your Best Mortgage Rate</h1>
        <QuoteCalculator />
      </section>
      
      <section className="features">
        <h2>Why RateHunter?</h2>
        <ul>
          <li>Compare 1000+ lenders</li>
          <li>AI-powered recommendations</li>
          <li>Close in 21 days or less</li>
        </ul>
      </section>
    </main>
  );
}
```

### Week 19-20: Production Deployment

**Kubernetes Setup (if needed):**
```yaml
# k8s/production/nyra-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nyra-webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nyra-webapp
  template:
    metadata:
      labels:
        app: nyra-webapp
    spec:
      containers:
      - name: webapp
        image: nyra/webapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: nyra-secrets
              key: database-url
```

---

## 🚫 DEFERRED TO FUTURE

### 4-PC Distributed Setup
- **When**: After MVP proves valuable
- **Why defer**: Premature optimization
- **What to do instead**: Run everything on orchestrator PC first

### Archon OS Deep Integration  
- **When**: If you need complex task DAGs
- **Why defer**: Nexus Router + n8n handles 90% of needs
- **What to do instead**: Use Archon MCP as simple tool executor

### Custom Memory Fusion (Letta + Graphiti + Zep + OpenMemory)
- **When**: After validating single memory system works
- **Why defer**: Complexity explosion
- **What to do instead**: Use Graphiti + Letta (already locked in)

---

## ✅ Success Metrics

### Phase 1 Complete When:
- [ ] All services running in Docker
- [ ] Can create lead in TwentyCRM
- [ ] Can get quote from FastAPI
- [ ] Dify chatbot responds

### Phase 2 Complete When:
- [ ] Lead drip campaign sends 3+ touchpoints
- [ ] Chatbot can schedule calls
- [ ] Quote engine returns real data from 2+ providers
- [ ] TwentyCRM shows pipeline movement

### Phase 3 Complete When:
- [ ] Landing page live on ratehunter.net
- [ ] Memory system recalls past conversations
- [ ] Cloudflare tunnel active
- [ ] Production deployment successful

---

## 🆘 If You Get Stuck

### Problem: Services won't start
```bash
# Check logs
docker-compose logs -f [service-name]

# Restart individual service
docker-compose restart [service-name]
```

### Problem: API keys not working
```bash
# Verify Infisical
infisical secrets get ANTHROPIC_API_KEY --env=dev

# Test API directly
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/messages
```

### Problem: Database migrations failing
```bash
# Reset database (dev only!)
docker-compose down -v
docker-compose up -d postgres
# Re-run migrations
```

---

## 📚 Daily Workflow

### Morning Standup (5 min)
1. Check n8n workflow status
2. Review TwentyCRM pipeline
3. Check Dify conversation logs

### Development (4 hours)
1. Pick ONE feature from current phase
2. Implement in isolated branch
3. Test locally with Docker
4. Commit with clear message

### Evening Review (15 min)
1. Deploy to staging (if ready)
2. Update project board
3. Document blockers

---

## 🎯 The #1 Rule

**Build features that make you money FIRST.**

Everything else is technical debt until you have:
- ✅ Leads flowing in
- ✅ Drip campaigns sending
- ✅ Quotes generating
- ✅ Deals closing

Claude Flow swarms? Cool for later.
4-PC distributed? Nice to have.
Perfect memory fusion? Overkill for now.

**Ship. Validate. Iterate.**
