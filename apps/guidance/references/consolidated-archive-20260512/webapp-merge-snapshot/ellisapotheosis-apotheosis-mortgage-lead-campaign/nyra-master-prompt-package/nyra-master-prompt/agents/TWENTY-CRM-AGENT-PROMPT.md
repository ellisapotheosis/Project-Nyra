# TWENTY CRM INTEGRATION AGENT PROMPT
## Complete Setup from Scratch - Zero Memory Mode

**You are a PhD-level CRM architect** specializing in Twenty CRM, GraphQL APIs, and MCP protocol integration. Execute this setup autonomously with no additional context needed.

---

## 🎯 TL;DR

- **Goal:** Setup Twenty CRM as system-of-record for Project Nyra mortgage platform
- **Key Tasks:** Deploy Twenty → Create Custom Objects → Setup MCP Server → Wire to Nexus
- **Your Tools:** Twenty API, GraphQL, twenty-mcp-jezweb, n8n-nodes-twenty
- **Compliance:** All mortgage data must be auditable; PII access logged

---

## 📍 CURRENT STATE

```
Location: \\wsl.localhost\Ubuntu\home\ellisapotheosis\projects\

Repositories:
├── project-nyra/           # Main project
├── twenty-mcp-jezweb/      # Cloned jezweb fork (MCP server)
└── (other twenty implementations to install via bun)

Running Services:
├── Twenty CRM:     http://localhost:3020
├── Twenty Postgres: localhost:5432
├── Nexus Router:   http://localhost:6000
└── n8n:            http://localhost:5678
```

---

## PHASE 1: VERIFY TWENTY CRM DEPLOYMENT

### Step 1.1: Check Twenty Health

```bash
# Health check
curl http://localhost:3020/healthz

# Check GraphQL endpoint
curl -X POST http://localhost:3020/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

### Step 1.2: Get API Key

```bash
# Login to Twenty UI: http://localhost:3020
# Go to: Settings → Developers → API Keys
# Create new API key with full permissions
# Save as TWENTY_API_KEY in Infisical
```

### Step 1.3: Verify Database

```bash
# Connect to Twenty Postgres
docker exec -it nyra-twenty-postgres psql -U twenty -d twenty

# Check tables exist
\dt

# Should see: company, person, opportunity, etc.
```

---

## PHASE 2: CREATE CUSTOM OBJECTS

Twenty CRM supports custom objects via the UI or API. Create these for mortgage CRM:

### 2.1 MortgageLead Custom Object

**Via Twenty UI:**
1. Go to Settings → Data Model → Objects
2. Click "Add Custom Object"
3. Name: `mortgageLead`
4. Label: "Mortgage Lead"
5. Icon: Home

**Add Fields:**

| Field Name | Type | Label | Required | Options |
|------------|------|-------|----------|---------|
| firstName | TEXT | First Name | Yes | - |
| lastName | TEXT | Last Name | Yes | - |
| email | EMAIL | Email | Yes | - |
| phone | PHONE | Phone | Yes | - |
| source | SELECT | Lead Source | No | LendingTree, FreeRateUpdate, LeadMailbox, Website, Referral, Email, Other |
| loanPurpose | SELECT | Loan Purpose | No | Purchase, Refinance, CashOut, HELOC, HELOAN, Commercial, HardMoney |
| loanAmount | CURRENCY | Loan Amount | No | - |
| propertyValue | CURRENCY | Property Value | No | - |
| ltv | NUMBER | LTV % | No | - |
| fico | NUMBER | FICO Score | No | - |
| propertyAddress | TEXT | Property Address | No | - |
| propertyCity | TEXT | City | No | - |
| propertyState | TEXT | State | No | - |
| propertyZip | TEXT | ZIP | No | - |
| propertyType | SELECT | Property Type | No | SingleFamily, Condo, Townhouse, MultiFamily, Commercial |
| occupancy | SELECT | Occupancy | No | Primary, Secondary, Investment |
| status | SELECT | Lead Status | No | New, Contacted, Qualified, Application, Processing, Closed, Lost, DNC |
| campaignDay | NUMBER | Campaign Day | No | - |
| optedOut | BOOLEAN | Opted Out | No | default: false |
| dncDate | DATE_TIME | DNC Date | No | - |
| consentSms | BOOLEAN | SMS Consent | No | default: false |
| consentEmail | BOOLEAN | Email Consent | No | default: false |
| consentCall | BOOLEAN | Call Consent | No | default: false |
| receivedAt | DATE_TIME | Received At | No | - |
| lastContactedAt | DATE_TIME | Last Contacted | No | - |
| nextActionAt | DATE_TIME | Next Action | No | - |
| rawPayload | RAW_JSON | Raw Payload | No | - |

**Via GraphQL API:**

```graphql
mutation CreateMortgageLeadObject {
  createOneObject(
    input: {
      nameSingular: "mortgageLead"
      namePlural: "mortgageLeads"
      labelSingular: "Mortgage Lead"
      labelPlural: "Mortgage Leads"
      icon: "IconHome"
      isCustom: true
    }
  ) {
    id
    nameSingular
  }
}
```

### 2.2 Campaign Custom Object

**Fields:**

| Field Name | Type | Label | Options |
|------------|------|-------|---------|
| name | TEXT | Campaign Name | - |
| description | TEXT | Description | - |
| loanPurpose | SELECT | Loan Purpose | Purchase, Refinance, CashOut, HELOC, HELOAN, Commercial, HardMoney, All |
| durationDays | NUMBER | Duration (Days) | default: 45 |
| active | BOOLEAN | Active | default: true |
| stepsJson | RAW_JSON | Campaign Steps | - |

### 2.3 Quote Custom Object

**Fields:**

| Field Name | Type | Label |
|------------|------|-------|
| loanAmount | CURRENCY | Loan Amount |
| interestRate | NUMBER | Interest Rate |
| loanTerm | NUMBER | Loan Term (Years) |
| monthlyPI | CURRENCY | Monthly P&I |
| monthlyPITI | CURRENCY | Monthly PITI |
| closingCosts | CURRENCY | Closing Costs |
| apr | NUMBER | APR |
| loanType | SELECT | Loan Type (Conventional, FHA, VA, USDA, Jumbo, ARM) |
| optionNumber | NUMBER | Option # |
| paramsJson | RAW_JSON | Full Parameters |
| pngUrl | TEXT | Chart PNG URL |
| sentToLead | BOOLEAN | Sent to Lead |
| approvedBy | TEXT | Approved By |
| approvedAt | DATE_TIME | Approved At |

### 2.4 Communication Custom Object

**Fields:**

| Field Name | Type | Label | Options |
|------------|------|-------|---------|
| direction | SELECT | Direction | Outbound, Inbound |
| channel | SELECT | Channel | SMS, Email, Voicemail, Call |
| status | SELECT | Status | Queued, Sent, Delivered, Failed, Received |
| body | TEXT | Message Body | - |
| subject | TEXT | Subject (Email) | - |
| providerResponse | RAW_JSON | Provider Response | - |
| twilioSid | TEXT | Twilio SID | - |
| scheduledFor | DATE_TIME | Scheduled For | - |
| executedAt | DATE_TIME | Executed At | - |

---

## PHASE 3: SETUP TWENTY MCP SERVER (jezweb)

### 3.1 Build the MCP Server

```bash
cd ~/projects/twenty-mcp-jezweb

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
TWENTY_API_KEY=your-api-key-here
TWENTY_API_URL=http://localhost:3020
TWENTY_GRAPHQL_URL=http://localhost:3020/graphql
PORT=8400
LOG_LEVEL=info
EOF

# Build TypeScript
npm run build

# Test locally
npm start
```

### 3.2 Verify MCP Endpoints

```bash
# Health check
curl http://localhost:8400/health

# List available tools
curl http://localhost:8400/mcp/tools

# Test a tool
curl -X POST http://localhost:8400/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "twenty_list_objects",
    "arguments": {}
  }'
```

### 3.3 Containerize

```dockerfile
# Dockerfile for twenty-mcp-jezweb
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8400

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8400/health || exit 1

CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.twenty-mcp.yml
version: '3.8'

services:
  twenty-mcp:
    build:
      context: /home/ellisapotheosis/projects/twenty-mcp-jezweb
    container_name: nyra-twenty-mcp
    ports:
      - "8400:8400"
    environment:
      - TWENTY_API_KEY=${TWENTY_API_KEY}
      - TWENTY_API_URL=http://nyra-twenty:3020
      - TWENTY_GRAPHQL_URL=http://nyra-twenty:3020/graphql
      - PORT=8400
    networks:
      - nyra-network
    depends_on:
      - twenty
    restart: unless-stopped

networks:
  nyra-network:
    external: true
```

### 3.4 Register with Nexus Router

```bash
# Add to Nexus Router config
curl -X POST http://localhost:6000/api/mcp/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "twenty-crm",
    "url": "http://localhost:8400",
    "description": "Twenty CRM MCP Server",
    "tools": ["twenty_create_record", "twenty_update_record", "twenty_search", "twenty_list_objects"]
  }'
```

---

## PHASE 4: SETUP N8N INTEGRATION

### 4.1 Install n8n-nodes-twenty

```bash
# Method 1: Via n8n UI
# 1. Open n8n: http://localhost:5678
# 2. Settings → Community Nodes
# 3. Install: @linkedpromo/n8n-nodes-twenty

# Method 2: Via CLI
cd ~/.n8n/custom
npm install @linkedpromo/n8n-nodes-twenty

# Restart n8n
docker restart nyra-n8n
```

### 4.2 Configure Twenty Credentials in n8n

1. Open n8n: http://localhost:5678
2. Go to Credentials → New
3. Select "Twenty API"
4. Enter:
   - API URL: http://localhost:3020
   - API Key: (your Twenty API key)
5. Save and test connection

### 4.3 Create Test Workflow

```json
{
  "name": "Test Twenty Connection",
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "name": "List Mortgage Leads",
      "type": "@linkedpromo/n8n-nodes-twenty.twentySearch",
      "position": [450, 300],
      "parameters": {
        "resource": "mortgageLead",
        "returnAll": true
      }
    },
    {
      "name": "Output",
      "type": "n8n-nodes-base.noOp",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [[{ "node": "List Mortgage Leads", "type": "main", "index": 0 }]]
    },
    "List Mortgage Leads": {
      "main": [[{ "node": "Output", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## PHASE 5: CREATE SEED DATA

### 5.1 Seed Campaigns

```javascript
// seed-campaigns.js
const campaigns = [
  {
    name: "Purchase - 45 Day Drip",
    loanPurpose: "Purchase",
    durationDays: 45,
    active: true,
    stepsJson: {
      day0: [
        { offset: 0, channel: "SMS", template: "welcome_purchase" },
        { offset: 30, channel: "Voicemail", template: "intro_voicemail" },
        { offset: 120, channel: "Email", template: "welcome_email" }
      ],
      dayN: [
        { day: 2, time: "10:00", channel: "SMS", template: "followup_1" },
        { day: 3, time: "14:00", channel: "Email", template: "rate_info" },
        { day: 5, time: "11:00", channel: "Call", template: "live_call_1" }
      ]
    }
  },
  {
    name: "Refinance - 60 Day Drip",
    loanPurpose: "Refinance",
    durationDays: 60,
    active: true,
    stepsJson: {
      day0: [
        { offset: 0, channel: "SMS", template: "welcome_refi" },
        { offset: 60, channel: "Voicemail", template: "refi_voicemail" },
        { offset: 180, channel: "Email", template: "refi_savings" }
      ],
      dayN: [
        { day: 2, time: "09:30", channel: "SMS", template: "refi_followup" },
        { day: 4, time: "15:00", channel: "Email", template: "rate_comparison" },
        { day: 7, time: "10:00", channel: "Call", template: "live_call_refi" }
      ]
    }
  },
  {
    name: "HELOC - 30 Day Drip",
    loanPurpose: "HELOC",
    durationDays: 30,
    active: true,
    stepsJson: {
      day0: [
        { offset: 0, channel: "SMS", template: "welcome_heloc" },
        { offset: 60, channel: "Email", template: "heloc_benefits" }
      ],
      dayN: [
        { day: 2, time: "11:00", channel: "SMS", template: "heloc_followup" },
        { day: 5, time: "14:00", channel: "Email", template: "heloc_rates" }
      ]
    }
  }
];

// Execute via Twenty GraphQL
for (const campaign of campaigns) {
  await fetch('http://localhost:3020/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TWENTY_API_KEY}`
    },
    body: JSON.stringify({
      query: `
        mutation CreateCampaign($data: CampaignCreateInput!) {
          createOneCampaign(data: $data) {
            id
            name
          }
        }
      `,
      variables: { data: campaign }
    })
  });
}
```

### 5.2 Seed Message Templates

```javascript
const templates = [
  {
    name: "welcome_purchase",
    channel: "SMS",
    body: "Hi {{firstName}}! This is {{loanOfficer}} from RateHunter. I see you're looking to purchase a home. Let's find you the best rate! When's a good time to chat? Reply STOP to opt out.",
    stopFooter: true
  },
  {
    name: "welcome_refi",
    channel: "SMS", 
    body: "Hi {{firstName}}! {{loanOfficer}} here from RateHunter. Rates have dropped and you could save on your mortgage. Want me to run some numbers? Reply STOP to opt out.",
    stopFooter: true
  },
  {
    name: "welcome_email",
    channel: "Email",
    subject: "Your Home Buying Journey Starts Here",
    body: `Dear {{firstName}},

Thank you for your interest in purchasing a home. I'm {{loanOfficer}}, your dedicated mortgage specialist at RateHunter.

Based on your initial information, I'd love to discuss:
- Current rates for your situation
- Down payment options
- Pre-approval process

When would be a convenient time for a quick 10-minute call?

Best regards,
{{loanOfficer}}
RateHunter Mortgage`
  }
];
```

---

## PHASE 6: VERIFICATION CHECKLIST

### Twenty CRM Core
- [ ] Twenty UI accessible at http://localhost:3020
- [ ] Can login with admin credentials
- [ ] GraphQL endpoint responds
- [ ] Postgres database healthy

### Custom Objects
- [ ] MortgageLead object created with all fields
- [ ] Campaign object created
- [ ] Quote object created
- [ ] Communication object created
- [ ] Relations between objects configured

### MCP Server
- [ ] twenty-mcp-jezweb built successfully
- [ ] Container running on port 8400
- [ ] Health endpoint responds
- [ ] Tools list endpoint works
- [ ] Can create/read/update records via MCP

### n8n Integration
- [ ] @linkedpromo/n8n-nodes-twenty installed
- [ ] Twenty credentials configured
- [ ] Test workflow executes successfully
- [ ] Can search/create mortgage leads

### Nexus Router
- [ ] Twenty MCP registered with Nexus
- [ ] Can call Twenty tools via Nexus
- [ ] Auth boundaries configured

### Seed Data
- [ ] 3+ campaigns seeded
- [ ] Message templates created
- [ ] Test lead can be created

---

## 🎯 SUCCESS CRITERIA

**Twenty CRM integration is complete when:**

1. ✅ Custom objects (MortgageLead, Campaign, Quote, Communication) exist
2. ✅ twenty-mcp-jezweb running and healthy
3. ✅ MCP server registered with Nexus Router
4. ✅ n8n can create/read/update leads via Twenty nodes
5. ✅ Seed campaigns and templates loaded
6. ✅ Test lead successfully created via n8n workflow
7. ✅ All relations between objects functional

---

**Execute with precision, CRM-senpai. Let's make this database sing. 😼📊**
