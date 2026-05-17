# n8n + TwentyCRM Setup Checklist

## 📋 Order of Operations

### 1. Start Twenty CRM Container
```bash
cd apps/twenty-crm
make twenty-crm-setup
make twenty-crm-up
```
- Get API key from TwentyCRM settings
- Note the URL: http://localhost:3020

### 2. Configure Environment Variables
```bash
# Add to .env or Infisical
TWENTY_API_KEY=your_api_key_here
TWENTY_CRM_URL=http://twenty-crm:3020
TWENTYCRM_API_KEY=your_api_key_here  # Also needed
```

### 3. Build twenty-mcp-server (jezweb)
```bash
cd ~/projects/twenty-mcp-server
npm install && npm run build
```

### 4. Update Claude Desktop Config
```json
{
  "mcpServers": {
    "twenty-crm": {
      "command": "node",
      "args": ["path/to/twenty-mcp-server/dist/index.js"],
      "env": {
        "TWENTY_API_KEY": "your_api_key"
      }
    }
  }
}
```

### 5. Start n8n with Community Nodes
```bash
# Build with TwentyCRM nodes
docker-compose -f apps/shared/n8n-shared/services/docker-compose.n8n-with-twenty.yml build \
  --build-arg N8N_EXTRA_PACKAGES="@linkedpromo/n8n-nodes-twenty"

# Start n8n
docker-compose -f apps/shared/n8n-shared/services/docker-compose.n8n-with-twenty.yml up -d
```

### 6. Configure n8n Credentials
1. Open: http://localhost:5678
2. Settings → Credentials → Add Credential
3. Search: "Twenty CRM"
4. Configure:
   - API URL: http://twenty-crm:3020/graphql
   - API Token: your_twenty_api_key

### 7. Import Workflows
```bash
# Import all 4 campaign workflows
# 1. New Lead Welcome Sequence
# 2. Rate Alert Notifications
# 3. Document Request Follow-ups
# 4. Application Status Updates
```

## ✅ Test Integration
```bash
# Test Claude + TwentyCRM
echo "List contacts in Twenty CRM"

# Test n8n workflow
curl -X POST http://localhost:5678/webhook/new-lead-welcome \
  -H "Content-Type: application/json" \
  -d '{"leadId": "test-123"}'
```

## 🚀 Ready to Use!

**4 Complete Workflows Created:**
- ✅ **14-day Welcome Sequence** (5 emails + SMS)
- ✅ **Rate Alert System** (every 4 hours)
- ✅ **Document Follow-ups** (3-day reminders)
- ✅ **Status Notifications** (approval/underwriting)

All workflows include TwentyCRM integration, smart timing, and mortgage-specific content.
