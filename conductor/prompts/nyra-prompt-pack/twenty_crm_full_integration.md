# TWENTY CRM INTEGRATION AGENT PROMPT

Complete Setup from Scratch - Zero Memory Mode

You are a PhD-level CRM architect specializing in Twenty CRM, GraphQL APIs, and MCP protocol integration. Execute this setup autonomously with no additional context needed.

---

🎯 TL;DR
Goal: Setup Twenty CRM as system-of-record for Project Nyra mortgage platform
Key Tasks: Deploy Twenty → Create Custom Objects → Setup MCP Server → Wire to Nexus
Your Tools: Twenty API, GraphQL, twenty-mcp-jezweb, n8n-nodes-twenty
Compliance: All mortgage data must be auditable; PII access logged

---

📍 CURRENT STATE

```
Location: /home/ellisapotheosis/repos/project-nyra

Repositories:
├── project-nyra/           # Main project
├── twenty-mcp-jezweb/      # Cloned jezweb fork (MCP server) at /home/ellisapotheosis/repos/twenty-mcp-jezweb
└── (other twenty implementations to install via bun)

Running Services (on Oracle context):
├── Twenty CRM:     http://100.64.0.3:3000 (Local port 3000 on Oracle host)
├── Twenty Postgres: localhost:5432 (on Oracle host)
├── Nexus Router:   http://100.64.0.3:6000
└── n8n:            http://100.64.0.3:5678
```

---

PHASE 1: VERIFY TWENTY CRM DEPLOYMENT
Step 1.1: Check Twenty Health

```bash
# Health check (from oracle host)
curl http://localhost:3000/health

# Check GraphQL endpoint (from oracle host)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'
```

Step 1.2: Get API Key

```bash
# Login to Twenty UI: http://twenty.projectnyra.com
# Go to: Settings → Developers → API Keys
# Create new API key with full permissions
# Save as TWENTY_API_KEY in Infisical
```

Step 1.3: Verify Database

```bash
# Connect to Twenty Postgres
docker exec -it nyra-network-nyra-twenty-db psql -U twenty -d twenty

# Check tables exist
\dt
```

---

PHASE 2: CREATE CUSTOM OBJECTS
Twenty CRM supports custom objects via the UI or API. Create these for mortgage CRM:

2.1 MortgageLead Custom Object
Name: `mortgageLead`
Label: "Mortgage Lead"
Icon: Home

Fields:
firstName (TEXT), lastName (TEXT), email (EMAIL), phone (PHONE), source (SELECT), loanPurpose (SELECT), loanAmount (CURRENCY), propertyValue (CURRENCY), ltv (NUMBER), fico (NUMBER), propertyAddress (TEXT), propertyCity (TEXT), propertyState (TEXT), propertyZip (TEXT), propertyType (SELECT), occupancy (SELECT), status (SELECT), campaignDay (NUMBER), optedOut (BOOLEAN), dncDate (DATE_TIME), consentSms (BOOLEAN), consentEmail (BOOLEAN), consentCall (BOOLEAN), receivedAt (DATE_TIME), lastContactedAt (DATE_TIME), nextActionAt (DATE_TIME), rawPayload (RAW_JSON).

2.2 Campaign Custom Object
Fields: name (TEXT), description (TEXT), loanPurpose (SELECT), durationDays (NUMBER), active (BOOLEAN), stepsJson (RAW_JSON).

2.3 Quote Custom Object
Fields: loanAmount (CURRENCY), interestRate (NUMBER), loanTerm (NUMBER), monthlyPI (CURRENCY), monthlyPITI (CURRENCY), closingCosts (CURRENCY), apr (NUMBER), loanType (SELECT), optionNumber (NUMBER), paramsJson (RAW_JSON), pngUrl (TEXT), sentToLead (BOOLEAN), approvedBy (TEXT), approvedAt (DATE_TIME).

2.4 Communication Custom Object
Fields: direction (SELECT), channel (SELECT), status (SELECT), body (TEXT), subject (TEXT), providerResponse (RAW_JSON), twilioSid (TEXT), scheduledFor (DATE_TIME), executedAt (DATE_TIME).

---

PHASE 3: SETUP TWENTY MCP SERVER (jezweb)
3.1 Build the MCP Server

```bash
cd /home/ellisapotheosis/repos/twenty-mcp-jezweb
npm install
# Configure .env
npm run build
```

3.2 Verify MCP Endpoints
3.3 Containerize (Use docker-compose.twenty-mcp.yml)
3.4 Register with Nexus Router

---

PHASE 4: SETUP N8N INTEGRATION
4.1 Install n8n-nodes-twenty
4.2 Configure Twenty Credentials in n8n
4.3 Create Test Workflow

---

PHASE 5: CREATE SEED DATA
5.1 Seed Campaigns
5.2 Seed Message Templates

---

PHASE 6: VERIFICATION CHECKLIST
