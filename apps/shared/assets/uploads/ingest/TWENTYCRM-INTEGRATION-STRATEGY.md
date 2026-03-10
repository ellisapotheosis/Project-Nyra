# TwentyCRM Integration Strategy for Project Nyra

**Decision Date:** 2025-01-18  
**Architecture Principle:** "Extend TwentyCRM, don't replace it"  
**Reference:** WHITEPAPER.md § 3 - "TwentyCRM is system-of-record"

---

## ✅ Recommended Approach: Fork + Vendor + Bridge

### The Strategy

```
Project-Nyra/
├── vendor/
│   └── twenty/                    # Forked TwentyCRM (submodule)
│       ├── packages/
│       ├── server/
│       └── frontend/
│
├── apps/
│   ├── nyra-admin/                # Custom Next.js admin (shadcn + MagicUI)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── campaigns/     # Campaign builder
│   │   │   │   ├── chat/          # AI chat (Dify embed)
│   │   │   │   └── crm/           # TwentyCRM widgets
│   │   │   ├── app/
│   │   │   │   ├── leads/         # Custom lead views
│   │   │   │   ├── campaigns/
│   │   │   │   ├── quotes/
│   │   │   │   └── chat/
│   │   │   └── lib/
│   │   │       └── twenty-client.ts  # Twenty API client
│   │   └── package.json
│   │
│   └── ratehunter/                # Public landing page
│       └── ...
│
├── services/
│   ├── twenty-bridge/             # TwentyCRM ↔ Nyra bridge service
│   │   ├── src/
│   │   │   ├── graphiti-sync.ts   # Sync Twenty → Graphiti
│   │   │   ├── webhook-handler.ts # Twenty webhooks
│   │   │   └── api.ts
│   │   └── package.json
│   │
│   ├── quote-engine/              # Mortgage quote API
│   ├── campaign-engine/           # Campaign orchestration
│   └── nyra-orchestrator/         # Policy gate
│
└── infra/
    └── docker-compose.yml         # TwentyCRM runs as Docker service
```

---

## Why This Architecture?

### ✅ DO: Fork + Submodule in vendor/

**Reasoning:**
1. **Upstream Updates**: Pull Twenty updates easily: `git submodule update --remote`
2. **Custom Modifications**: Make mortgage-specific schema changes in your fork
3. **Isolation**: Keep Twenty's massive codebase separate from your apps
4. **Docker Deployment**: Run Twenty as a containerized service

**Setup:**

```bash
# 1. Fork TwentyCRM on GitHub
# Go to: https://github.com/twentyhq/twenty
# Click: Fork → apotheosis/twenty

# 2. Clone Project-Nyra (if not already)
cd C:\Dev\Projects\Repos
git clone https://github.com/apotheosis/Project-Nyra.git
cd Project-Nyra

# 3. Create vendor directory
mkdir vendor

# 4. Add your fork as submodule
git submodule add https://github.com/apotheosis/twenty.git vendor/twenty
git submodule update --init --recursive

# 5. Create tracking branch for customizations
cd vendor/twenty
git checkout -b nyra-mortgage-custom
git push -u origin nyra-mortgage-custom
```

**Benefits:**
- ✅ Easy to merge upstream Twenty updates
- ✅ Your customizations live in a separate branch
- ✅ Submodule pins specific commit for reproducibility
- ✅ Team members get exact same Twenty version

### ✅ DO: Run TwentyCRM as Docker Service

**Don't clone into apps/** - Instead, run Twenty's official Docker image with your custom schema:

```yaml
# infra/docker-compose.yml (already created in your bootstrap)
services:
  twentycrm:
    image: twentyhq/twenty:latest
    # OR build from your fork:
    # build:
    #   context: ../vendor/twenty
    #   dockerfile: packages/twenty-server/Dockerfile
    container_name: twentycrm
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://twenty:${TWENTYCRM_DB_PASSWORD}@postgres:5432/twenty
      - REDIS_URL=redis://redis:6379
      - ACCESS_TOKEN_SECRET=${TWENTYCRM_SECRET_KEY}
      - FRONT_BASE_URL=https://crm.ratehunter.net
    volumes:
      # Mount custom schema migrations
      - ./twenty-custom-migrations:/app/packages/twenty-server/src/database/migrations/custom
    networks:
      - mortgage-network
    depends_on:
      - postgres
      - redis
```

**Benefits:**
- ✅ Production-grade deployment
- ✅ Scales independently
- ✅ No build complexity in your apps
- ✅ Official updates via Docker image tags

### ✅ DO: Build Custom Overlay in apps/nyra-admin

**Purpose:** Unified UI that extends TwentyCRM with mortgage-specific features

```typescript
// apps/nyra-admin/src/lib/twenty-client.ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const twentyClient = new ApolloClient({
  uri: process.env.TWENTY_GRAPHQL_URL || 'http://twentycrm:3000/graphql',
  cache: new InMemoryCache(),
  headers: {
    'Authorization': `Bearer ${process.env.TWENTY_API_KEY}`
  }
});

// Query TwentyCRM leads
export async function getLeads() {
  const { data } = await twentyClient.query({
    query: gql`
      query GetLeads {
        people(filter: { tags: { contains: "mortgage-lead" } }) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              customFields {
                loanAmount
                creditScore
                propertyValue
              }
            }
          }
        }
      }
    `
  });
  return data.people.edges.map(e => e.node);
}
```

**UI Integration:**

```tsx
// apps/nyra-admin/src/app/leads/page.tsx
import { getLeads } from '@/lib/twenty-client';
import { DataTable } from '@/components/ui/data-table';
import { CampaignTrigger } from '@/components/campaigns/trigger';

export default async function LeadsPage() {
  const leads = await getLeads();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mortgage Leads</h1>
      
      {/* TwentyCRM data in custom UI */}
      <DataTable
        data={leads}
        columns={[
          { header: 'Name', accessorKey: 'firstName' },
          { header: 'Email', accessorKey: 'email' },
          { header: 'Loan Amount', accessorKey: 'customFields.loanAmount' },
          { header: 'Credit Score', accessorKey: 'customFields.creditScore' },
          {
            header: 'Actions',
            cell: ({ row }) => (
              <CampaignTrigger leadId={row.original.id} />
            )
          }
        ]}
      />
    </div>
  );
}
```

**Benefits:**
- ✅ Best of both worlds: Twenty's data model + your custom UX
- ✅ Add mortgage-specific features (campaigns, quotes, AI chat)
- ✅ Unified branding (shadcn + MagicUI)
- ✅ Doesn't require modifying Twenty's frontend

### ✅ DO: Build a Bridge Service

**Purpose:** Sync TwentyCRM ↔ Graphiti ↔ Memory Systems

```typescript
// services/twenty-bridge/src/graphiti-sync.ts
import { twentyClient } from './twenty-client';
import { graphitiClient } from './graphiti-client';

export async function syncLeadToGraphiti(leadId: string) {
  // 1. Fetch lead from TwentyCRM
  const lead = await twentyClient.getPerson(leadId);
  
  // 2. Create temporal knowledge graph node
  await graphitiClient.addNode({
    entityType: 'MortgageLead',
    properties: {
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone,
      loanAmount: lead.customFields.loanAmount,
      creditScore: lead.customFields.creditScore,
      createdAt: lead.createdAt
    }
  });
  
  // 3. Create relationship to campaign (if exists)
  if (lead.activeCampaign) {
    await graphitiClient.addEdge({
      sourceId: lead.id,
      targetId: lead.activeCampaign.id,
      relationType: 'ENROLLED_IN',
      timestamp: new Date()
    });
  }
}

// Webhook handler
export async function handleTwentyWebhook(event: WebhookEvent) {
  if (event.type === 'person.created') {
    await syncLeadToGraphiti(event.data.id);
  }
  
  if (event.type === 'person.updated') {
    await syncLeadToGraphiti(event.data.id);
  }
}
```

**Deploy as FastAPI service:**

```python
# services/twenty-bridge/main.py
from fastapi import FastAPI, Request
from graphiti import Graphiti
from twenty_client import TwentyClient

app = FastAPI()
graphiti = Graphiti(...)
twenty = TwentyClient(...)

@app.post("/webhooks/twenty")
async def twenty_webhook(request: Request):
    event = await request.json()
    
    if event['type'] == 'person.created':
        lead = twenty.get_person(event['data']['id'])
        await sync_to_graphiti(lead)
    
    return {"status": "ok"}
```

---

## ❌ DON'T: Clone Twenty Directly into apps/

**Why NOT clone into apps/twenty/?**

1. **Massive Codebase**: TwentyCRM is 50+ MB with thousands of files
2. **Build Complexity**: Twenty has its own build system (pnpm workspaces, NestJS, React)
3. **Dependency Conflicts**: Twenty's dependencies may conflict with your apps
4. **Monorepo Pollution**: Makes your repo bloated and slow
5. **Update Hell**: Merging upstream changes becomes painful

**Example of what NOT to do:**

```bash
# ❌ DON'T DO THIS
cd C:\Dev\Projects\Repos\Project-Nyra
mkdir apps
cd apps
git clone https://github.com/twentyhq/twenty.git  # ❌ WRONG
```

This creates a nested git repo, breaks your monorepo tooling, and makes updates impossible.

---

## ❌ DON'T: Try to Build Twenty from Source in Your Stack

**Why NOT build Twenty with your monorepo?**

1. **Separate Build Pipelines**: Twenty uses pnpm, you might use npm/yarn
2. **Different Frameworks**: Twenty is NestJS + React, you're using Next.js
3. **Build Time**: Twenty takes 5-10 minutes to build
4. **Complexity**: You'd need to manage Twenty's Postgres migrations, Redis, etc.

**Instead:** Use Twenty's official Docker image and customize via environment variables + API

---

## Migration Path: From Planning to Production

### Phase 1: Fork + Docker Deployment (Week 1)

```bash
# 1. Fork Twenty on GitHub
# 2. Add as submodule
git submodule add https://github.com/apotheosis/twenty.git vendor/twenty

# 3. Create custom branch
cd vendor/twenty
git checkout -b nyra-mortgage-custom

# 4. Add mortgage schema customizations
# Edit: packages/twenty-server/src/database/migrations/
# Add custom fields: loanAmount, creditScore, propertyValue, etc.

# 5. Deploy via Docker
cd ../../infra
docker compose up -d twentycrm

# 6. Access TwentyCRM UI
# https://crm.ratehunter.net (via Cloudflare Tunnel)
```

### Phase 2: Build Bridge Service (Week 2)

```bash
# 1. Create bridge service
cd services
mkdir twenty-bridge
cd twenty-bridge

# 2. Initialize FastAPI project
poetry init
poetry add fastapi uvicorn twenty-sdk graphiti-sdk

# 3. Implement webhook handlers (see code above)

# 4. Deploy bridge
cd ../../infra
docker compose up -d twenty-bridge
```

### Phase 3: Custom Admin UI (Week 3-4)

```bash
# 1. Create Nyra Admin app
cd apps
npx create-next-app@latest nyra-admin --typescript --tailwind --app

# 2. Install dependencies
cd nyra-admin
npm install @apollo/client @tanstack/react-query shadcn-ui

# 3. Add TwentyCRM integration (see code above)

# 4. Build custom pages
# /leads - Custom lead list with TwentyCRM data
# /campaigns - Campaign builder
# /quotes - Quote calculator
# /chat - Dify embed
```

### Phase 4: Customization & Polish (Ongoing)

- Add mortgage-specific fields to Twenty's schema
- Create custom Twenty workflows for lead routing
- Build n8n workflows that trigger on Twenty events
- Embed TwentyCRM contact view in Nyra Admin

---

## Submodule Management Best Practices

### Initial Setup (One-Time)

```bash
# Add submodule
git submodule add https://github.com/apotheosis/twenty.git vendor/twenty
git commit -m "Add TwentyCRM as submodule"
git push
```

### Team Member Onboarding

```bash
# Clone Project-Nyra with submodules
git clone --recurse-submodules https://github.com/apotheosis/Project-Nyra.git

# OR if already cloned without submodules
git submodule update --init --recursive
```

### Updating TwentyCRM

```bash
# Update to latest upstream Twenty
cd vendor/twenty
git fetch upstream
git merge upstream/main

# OR update to specific version
git fetch upstream
git checkout v0.20.0  # Example version tag

# Update Project-Nyra to track new commit
cd ../..
git add vendor/twenty
git commit -m "Update TwentyCRM to v0.20.0"
git push
```

### Custom Schema Changes

```bash
# Make changes in your custom branch
cd vendor/twenty
git checkout nyra-mortgage-custom

# Add migration
cd packages/twenty-server/src/database/migrations
# Create: 1234567890-add-mortgage-fields.ts

git add .
git commit -m "Add mortgage custom fields"
git push origin nyra-mortgage-custom

# Rebuild Docker image with custom schema
cd ../../../../infra
docker compose build twentycrm
docker compose up -d twentycrm
```

---

## Alternative: No Submodule (If You Want Maximum Simplicity)

If submodules feel too complex for your workflow:

```yaml
# Just use Twenty's official Docker image
services:
  twentycrm:
    image: twentyhq/twenty:v0.20.0  # Pin to specific version
    # ... rest of config

# Customizations via:
# 1. Environment variables
# 2. API extensions in twenty-bridge service
# 3. Custom UI in nyra-admin
```

**Pros:**
- ✅ Simpler (no submodule management)
- ✅ Official updates via Docker tags
- ✅ No build complexity

**Cons:**
- ❌ Can't modify Twenty's core code
- ❌ Schema changes require custom migrations
- ❌ Harder to contribute fixes back to Twenty

---

## Comparison Table

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Fork + Submodule in vendor/** | Full control, easy updates, isolated | Submodule learning curve | ✅ **RECOMMENDED** |
| **Clone into apps/** | Simple one-time setup | Update hell, monorepo pollution, build conflicts | ❌ **AVOID** |
| **Docker image only (no fork)** | Simplest deployment | No schema customization | ⚠️ OK for MVP |
| **Rewrite from scratch** | Total control | 6+ months dev time | ❌ **NEVER** |

---

## Summary: Your Action Plan

### Today (30 minutes)

```bash
# 1. Fork Twenty on GitHub
# Visit: https://github.com/twentyhq/twenty → Fork

# 2. Add to Project-Nyra as submodule
cd C:\Dev\Projects\Repos\Project-Nyra
git submodule add https://github.com/apotheosis/twenty.git vendor/twenty
git submodule update --init --recursive

# 3. Create custom branch
cd vendor/twenty
git checkout -b nyra-mortgage-custom
git push -u origin nyra-mortgage-custom

# 4. Update docker-compose to build from vendor
cd ../../infra
# Edit docker-compose.yml (use build context)
```

### This Week

- ✅ Deploy TwentyCRM via Docker
- ✅ Add mortgage custom fields
- ✅ Create `services/twenty-bridge`
- ✅ Test GraphQL API access

### Next Week

- ✅ Start `apps/nyra-admin`
- ✅ Build first custom view (leads list)
- ✅ Integrate with TwentyCRM GraphQL
- ✅ Add campaign trigger button

---

**Bottom Line:** Fork Twenty on GitHub → Add as submodule to `vendor/twenty` → Run as Docker service → Build custom UI in `apps/nyra-admin` → Bridge to Graphiti via `services/twenty-bridge`

**DO NOT** clone Twenty into `apps/` - it will make your life miserable. Trust me. 😊
