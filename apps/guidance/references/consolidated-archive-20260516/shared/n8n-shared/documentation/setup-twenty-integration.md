# n8n + TwentyCRM Integration Setup Guide

## 🚀 Quick Setup with TwentyCRM Nodes

### **1. Environment Configuration**

```bash
# Copy environment template
cp examples/n8n-environment.env .env

# Configure TwentyCRM connection
TWENTY_CRM_URL=http://twenty-crm:3020
TWENTY_CRM_API_KEY=your_api_key_here
TWENTY_CRM_WORKSPACE_ID=default
```

### **2. Deploy with Docker Compose**

```bash
# Use enhanced configuration with TwentyCRM nodes
docker-compose -f services/docker-compose.n8n-with-twenty.yml up -d

# Or build with community packages
docker-compose -f services/docker-compose.n8n-with-twenty.yml build \
  --build-arg N8N_EXTRA_PACKAGES="@linkedpromo/n8n-nodes-twenty"

docker-compose -f services/docker-compose.n8n-with-twenty.yml up -d
```

### **3. Install TwentyCRM Nodes (Alternative Methods)**

#### **Method A: Via n8n UI (Recommended)**
1. Open n8n: http://localhost:5678
2. Go to **Settings** → **Community Nodes**
3. Install: `@linkedpromo/n8n-nodes-twenty`
4. Configure Twenty CRM credentials

#### **Method B: Manual npm Install**
```bash
# Enter n8n container
docker exec -it nyra-n8n bash

# Install community node
npm install @linkedpromo/n8n-nodes-twenty

# Restart n8n
exit
docker restart nyra-n8n
```

#### **Method C: Pre-built Container**
```dockerfile
# Build args in docker-compose
build:
  args:
    N8N_EXTRA_PACKAGES: "@linkedpromo/n8n-nodes-twenty @n8n-nodes/n8n-nodes-activepieces"
```

### **4. Configure TwentyCRM Credentials**

1. **In n8n UI**: Settings → Credentials → Add Credential
2. **Search for**: "Twenty CRM"
3. **Configure**:
   ```
   API URL: http://twenty-crm:3020/graphql
   API Token: [your-twenty-api-key]
   Workspace ID: default
   ```

### **5. Test Integration**

```bash
# Test TwentyCRM connection
curl -X POST http://localhost:5678/webhook/test-twenty \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "(555) 123-4567",
    "loanAmount": 350000
  }'
```

## 📋 **Available TwentyCRM Node Actions**

### **Lead Management**
- ✅ **Create Contact** - Add new leads to TwentyCRM
- ✅ **Update Contact** - Modify existing contact information
- ✅ **Get Contact** - Retrieve contact details
- ✅ **List Contacts** - Query contacts with filters
- ✅ **Delete Contact** - Remove contacts (compliance)

### **Quote Management**
- ✅ **Create Quote** - Generate mortgage quotes
- ✅ **Update Quote Status** - Track quote lifecycle
- ✅ **Get Quote Details** - Retrieve quote information
- ✅ **List Quotes** - Query quotes by criteria

### **Activity Tracking**
- ✅ **Log Activity** - Record interactions and touchpoints
- ✅ **Create Task** - Assign follow-up actions
- ✅ **Update Pipeline** - Move contacts through stages

## 🔧 **n8n Data Directory Best Practices**

### **Volume Configuration**
```yaml
# ✅ PRODUCTION: Named volume (Docker-managed)
volumes:
  n8n_data:/home/node/.n8n

# ✅ DEVELOPMENT: Bind mount (easy access)
volumes:
  ./data/n8n:/home/node/.n8n

# ✅ BACKUP: Additional backup volume
volumes:
  ./backups:/backups:rw
```

### **Directory Structure**
```
n8n_data/
├── config/                     # n8n configuration
├── database.sqlite            # SQLite DB (if not using PostgreSQL)
├── nodes/                     # Custom nodes
├── custom/                    # Custom extensions
├── workflows/                 # Exported workflows
├── backups/                  # Automated backups
└── logs/                     # Application logs
```

### **Backup Strategy**
```bash
# Automated backup (add to cron)
docker exec nyra-n8n n8n export:all --backup --output=/backups/

# Manual workflow export
docker exec nyra-n8n n8n export:workflow --id=123 --output=/backups/

# Full data backup
docker exec nyra-n8n tar czf /backups/n8n-full-$(date +%Y%m%d).tar.gz /home/node/.n8n
```

## 🎯 **Mortgage Workflow Examples**

### **1. Lead Capture → TwentyCRM**
```json
{
  "name": "Lead Capture to TwentyCRM",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "lead-capture"
      }
    },
    {
      "name": "Create Contact",
      "type": "@linkedpromo/n8n-nodes-twenty.contact",
      "parameters": {
        "operation": "create",
        "name": "={{$json.firstName}} {{$json.lastName}}",
        "email": "={{$json.email}}",
        "phone": "={{$json.phone}}",
        "customFields": {
          "loanAmount": "={{$json.loanAmount}}",
          "creditScore": "={{$json.creditScore}}",
          "leadSource": "={{$json.source}}"
        }
      }
    }
  ]
}
```

### **2. Rate Alert Notifications**
```json
{
  "name": "Rate Change Alert",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "cronExpression": "0 */4 * * *"
      }
    },
    {
      "name": "Get Active Leads",
      "type": "@linkedpromo/n8n-nodes-twenty.contact",
      "parameters": {
        "operation": "list",
        "filters": {
          "status": "active",
          "rateAlerts": true
        }
      }
    },
    {
      "name": "Send Rate Alert",
      "type": "n8n-nodes-base.emailSend"
    }
  ]
}
```

## 🔐 **Security & Compliance**

### **Data Protection**
- ✅ **Encryption**: All data encrypted at rest
- ✅ **Access Control**: Role-based permissions
- ✅ **Audit Trail**: Complete activity logging
- ✅ **PII Handling**: Secure processing of sensitive data

### **Compliance Features**
- ✅ **TILA/RESPA**: Automated disclosure tracking
- ✅ **HMDA**: Data collection and reporting
- ✅ **State Regulations**: Configurable compliance rules
- ✅ **Data Retention**: Configurable retention policies

## 📈 **Performance Optimization**

### **Resource Limits**
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '1.0'
    reservations:
      memory: 512M
      cpus: '0.5'
```

### **Database Optimization**
```bash
# Use PostgreSQL for production
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres

# Optimize execution data retention
N8N_EXECUTIONS_DATA_MAX_AGE=168  # 7 days
N8N_EXECUTIONS_DATA_PRUNE=true
```

## 🚨 **Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| **Community nodes not loading** | Restart container after installation |
| **TwentyCRM connection failed** | Verify API key and URL in credentials |
| **Webhook timeouts** | Increase `N8N_EXECUTIONS_TIMEOUT` |
| **Database connection lost** | Check PostgreSQL health and credentials |

### **Debug Commands**
```bash
# Check n8n logs
docker logs nyra-n8n -f

# Verify community nodes
docker exec nyra-n8n npm list -g | grep twenty

# Test TwentyCRM connection
docker exec nyra-n8n curl -H "Authorization: Bearer $TWENTY_API_KEY" \
  $TWENTY_CRM_URL/graphql

# Check database connection
docker exec nyra-n8n n8n diagnose
```

---

## ✅ **Setup Complete!**

Your n8n instance now has:
- ✅ **TwentyCRM nodes** for complete lead management
- ✅ **Proper data directory** configuration
- ✅ **Production-ready** setup with health checks
- ✅ **Mortgage-specific** workflow templates
- ✅ **Security** and compliance features

**Next Steps:**
1. Import mortgage workflow templates from `/workflows/`
2. Configure credentials for external services
3. Test lead capture and quote generation workflows
4. Set up monitoring and alerting

For questions or issues, refer to the troubleshooting section or check the n8n logs.
