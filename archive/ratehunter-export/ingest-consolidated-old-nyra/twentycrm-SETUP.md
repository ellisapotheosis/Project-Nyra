# TwentyCRM Setup Guide for Project Nyra

Complete guide to deploying TwentyCRM with n8n integration for mortgage lead management.

---

## 📋 Overview

**TwentyCRM** is the official choice for Project Nyra's CRM system:
- **Repository**: [twentyhq/twenty](https://github.com/twentyhq/twenty)
- **License**: GPL (fully self-hosted)
- **Integration**: Native n8n support via community node
- **Purpose**: System of record for leads, borrowers, pipeline management

**Why TwentyCRM?**
- Modern, Salesforce alternative
- Open-source with Docker deployment
- Native PostgreSQL (already in stack)
- n8n integration for workflow automation
- API-first design for mortgage operations

---

## 🚀 Quick Setup

### 1. Clone TwentyCRM Repository

```powershell
cd C:\Dev\Projects\Repos
git clone https://github.com/twentyhq/twenty.git
cd twenty
```

### 2. Configure for Project Nyra

Create `.env` file in `twenty/packages/twenty-docker/`:

```env
# =============================================================================
# TWENTY CRM CONFIGURATION - Project Nyra
# =============================================================================

# Database (use shared PostgreSQL from orchestrator)
DATABASE_URL=postgresql://nyra_admin:${POSTGRES_PASSWORD}@orchestrator-mini.tail-net.ts.net:5432/twentycrm

# Server Configuration
PORT=3000
SERVER_URL=https://crm.ratehunter.net
FRONT_BASE_URL=https://crm.ratehunter.net

# Authentication
ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)

# Email (Twilio SendGrid)
EMAIL_FROM_ADDRESS=noreply@ratehunter.net
EMAIL_FROM_NAME=Nyra Mortgage Platform
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.sendgrid.net
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=apikey
EMAIL_SMTP_PASSWORD=${SENDGRID_API_KEY}

# Storage (S3-compatible - Cloudflare R2 recommended)
STORAGE_TYPE=s3
STORAGE_S3_REGION=auto
STORAGE_S3_NAME=nyra-crm-storage
STORAGE_S3_ENDPOINT=https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com
STORAGE_S3_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
STORAGE_S3_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}

# Redis (shared from orchestrator)
REDIS_HOST=orchestrator-mini.tail-net.ts.net
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Telemetry
TELEMETRY_ENABLED=false
TELEMETRY_ANONYMIZATION_ENABLED=true

# Sign-up
SIGN_UP_DISABLED=false

# n8n Webhook Integration
N8N_WEBHOOK_URL=https://n8n.ratehunter.net/webhook
N8N_API_KEY=${N8N_API_KEY}

# Mortgage-Specific Fields
ENABLE_MORTGAGE_OBJECTS=true
DEFAULT_CURRENCY=USD
DEFAULT_LOCALE=en-US
```

### 3. Add to Orchestrator Docker Compose

Add to `orchestrator/docker-compose.yml`:

```yaml
  # ========================
  # TWENTY CRM - System of Record
  # ========================
  twentycrm:
    image: twentyhq/twenty:latest
    container_name: nyra-twentycrm
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/twentycrm
      - SERVER_URL=https://crm.ratehunter.net
      - FRONT_BASE_URL=https://crm.ratehunter.net
      - ACCESS_TOKEN_SECRET=${TWENTYCRM_ACCESS_TOKEN_SECRET}
      - REFRESH_TOKEN_SECRET=${TWENTYCRM_REFRESH_TOKEN_SECRET}
      - LOGIN_TOKEN_SECRET=${TWENTYCRM_LOGIN_TOKEN_SECRET}
      - STORAGE_TYPE=local
      - STORAGE_LOCAL_PATH=/app/storage
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - TELEMETRY_ENABLED=false
      - SIGN_UP_DISABLED=false
      - PORT=3000
    volumes:
      - twentycrm-storage:/app/storage
      - twentycrm-config:/app/.twenty
    networks:
      - nyra-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

Add volumes:
```yaml
volumes:
  # ... existing volumes ...
  twentycrm-storage:
    name: nyra-twentycrm-storage
  twentycrm-config:
    name: nyra-twentycrm-config
```

### 4. Update Cloudflare Tunnel

Add to `.cloudflared/config.yml`:

```yaml
ingress:
  # ... existing entries ...
  - hostname: crm.ratehunter.net
    service: http://localhost:3001
  # ... catch-all ...
```

Create DNS record:
```powershell
cloudflared tunnel route dns nyra-mortgage-platform crm.ratehunter.net
```

### 5. Deploy TwentyCRM

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator

# Update environment variables
notepad .env
# Add:
# TWENTYCRM_ACCESS_TOKEN_SECRET=$(openssl rand -hex 32)
# TWENTYCRM_REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
# TWENTYCRM_LOGIN_TOKEN_SECRET=$(openssl rand -hex 32)

# Deploy
docker-compose up -d twentycrm

# Monitor startup
docker-compose logs -f twentycrm

# Access CRM
# https://crm.ratehunter.net
```

---

## 🔧 Mortgage-Specific Configuration

### Custom Objects for Mortgage Operations

After first login, configure custom objects:

#### 1. Borrower Object
```javascript
{
  "name": "Borrower",
  "fields": [
    {"name": "firstName", "type": "text", "required": true},
    {"name": "lastName", "type": "text", "required": true},
    {"name": "email", "type": "email", "required": true},
    {"name": "phone", "type": "phone", "required": true},
    {"name": "ssn", "type": "text", "encrypted": true},
    {"name": "dateOfBirth", "type": "date"},
    {"name": "creditScore", "type": "number"},
    {"name": "monthlyIncome", "type": "currency"},
    {"name": "monthlyDebts", "type": "currency"},
    {"name": "dtiRatio", "type": "number"},
    {"name": "employmentStatus", "type": "select", "options": ["employed", "self-employed", "unemployed", "retired"]},
    {"name": "propertyAddress", "type": "address"},
    {"name": "loanPurpose", "type": "select", "options": ["purchase", "refinance", "cashout"]},
    {"name": "stage", "type": "select", "options": ["lead", "pre-qualified", "pre-approved", "in-underwriting", "approved", "closed", "denied"]}
  ]
}
```

#### 2. Quote Object
```javascript
{
  "name": "MortgageQuote",
  "fields": [
    {"name": "borrower", "type": "relation", "relation": "Borrower"},
    {"name": "loanAmount", "type": "currency", "required": true},
    {"name": "downPayment", "type": "currency"},
    {"name": "interestRate", "type": "number"},
    {"name": "loanTerm", "type": "number"},
    {"name": "monthlyPayment", "type": "currency"},
    {"name": "lender", "type": "text"},
    {"name": "loanType", "type": "select", "options": ["conventional", "fha", "va", "usda", "jumbo"]},
    {"name": "lockPeriod", "type": "number"},
    {"name": "apr", "type": "number"},
    {"name": "closingCosts", "type": "currency"},
    {"name": "expirationDate", "type": "date"},
    {"name": "status", "type": "select", "options": ["draft", "sent", "viewed", "accepted", "declined", "expired"]}
  ]
}
```

#### 3. Document Object
```javascript
{
  "name": "Document",
  "fields": [
    {"name": "borrower", "type": "relation", "relation": "Borrower"},
    {"name": "documentType", "type": "select", "options": ["paystub", "w2", "bank_statement", "tax_return", "drivers_license", "appraisal", "title", "disclosure"]},
    {"name": "fileName", "type": "text"},
    {"name": "fileUrl", "type": "url"},
    {"name": "uploadedDate", "type": "datetime"},
    {"name": "verifiedDate", "type": "datetime"},
    {"name": "status", "type": "select", "options": ["pending", "verified", "rejected", "expired"]},
    {"name": "notes", "type": "text"}
  ]
}
```

### Pipeline Configuration

Create stages for mortgage pipeline:

1. **New Lead** → Initial contact
2. **Pre-Qualified** → Basic financial info collected
3. **Pre-Approved** → Conditional approval from lender
4. **In Underwriting** → Full documentation review
5. **Approved** → Clear to close
6. **Closed** → Loan funded
7. **Denied** → Did not qualify

---

## 🔗 n8n Integration Setup

### 1. Install n8n Community Node

On n8n container or server:

```bash
# Install n8n-nodes-twenty
cd ~/.n8n
npm install n8n-nodes-twentycrm

# Restart n8n
systemctl restart n8n  # or docker-compose restart n8n
```

### 2. Configure n8n Credentials

In n8n UI (https://n8n.ratehunter.net):

1. Go to **Settings** → **Credentials**
2. Add **Twenty CRM** credentials:
   - **API URL**: `https://crm.ratehunter.net/graphql`
   - **API Key**: (generate in TwentyCRM → Settings → API)

### 3. Example Workflows

#### Drip Campaign Workflow

```
Trigger: TwentyCRM Webhook (New Lead)
  ↓
Filter: Lead Status = "New"
  ↓
Switch: Loan Purpose
  ├─ Purchase → Purchase Drip Campaign
  ├─ Refinance → Refinance Drip Campaign
  └─ Cash-Out → Cash-Out Drip Campaign
```

#### Quote Generation Workflow

```
Trigger: TwentyCRM Webhook (Borrower Pre-Qualified)
  ↓
Get Borrower Data (TwentyCRM Node)
  ↓
Calculate DTI Ratio (Code Node)
  ↓
Query Lenders API (HTTP Request)
  ↓
Create Quote Records (TwentyCRM Node)
  ↓
Send Email with Quotes (Email Node)
  ↓
Update Borrower Status (TwentyCRM Node)
```

#### Document Processing Workflow

```
Trigger: TwentyCRM Webhook (Document Uploaded)
  ↓
Download Document (HTTP Request)
  ↓
OCR Processing (Document Processor Agent)
  ↓
Validate Data (Compliance Agent)
  ↓
Update Document Status (TwentyCRM Node)
  ↓
Notify Processor (Email/SMS Node)
```

---

## 🔐 Security Configuration

### 1. API Key Management

Generate API keys in TwentyCRM for:
- n8n integration
- Claude Flow orchestrator
- External services (LendingTree, FreeRateUpdate)

### 2. Role-Based Access Control

Configure roles:
- **Admin**: Full access to all data and settings
- **Loan Officer**: View/edit borrowers, quotes, documents
- **Processor**: Document verification and upload only
- **Marketing**: Lead data and campaign analytics only

### 3. Data Encryption

Enable encryption for sensitive fields:
- SSN
- Credit score
- Bank account numbers
- Income details

---

## 📊 Analytics & Reporting

### Key Metrics Dashboards

1. **Lead Conversion Funnel**
   - New Leads → Pre-Qualified → Pre-Approved → Closed
   - Conversion rates at each stage
   - Average time in each stage

2. **Quote Performance**
   - Quotes generated per day
   - Quote acceptance rate
   - Average quote amount
   - Top performing lenders

3. **Document Processing**
   - Documents uploaded per day
   - Verification times
   - Rejection reasons
   - Missing document alerts

### Custom Reports

Create custom reports for:
- Monthly loan volume by type
- Borrower demographics
- Lender comparison metrics
- Campaign ROI analysis

---

## 🔄 Backup & Maintenance

### Automated Backups

```bash
# PostgreSQL backup script
#!/bin/bash
docker exec nyra-postgres pg_dump -U nyra_admin twentycrm > \
  /backups/twentycrm-$(date +%Y%m%d-%H%M%S).sql

# Rotate backups (keep last 30 days)
find /backups -name "twentycrm-*.sql" -mtime +30 -delete
```

### Monitoring

Add to Prometheus (`prometheus.yml`):

```yaml
- job_name: 'twentycrm'
  static_configs:
    - targets: ['twentycrm:3000']
      labels:
        service: 'twentycrm'
        tier: 'business'
```

---

## 📚 Additional Resources

- **Official Docs**: [Twenty Documentation](https://docs.twenty.com/)
- **GitHub**: [twentyhq/twenty](https://github.com/twentyhq/twenty)
- **n8n Integration**: [shodgson/n8n-nodes-twenty](https://github.com/shodgson/n8n-nodes-twenty)
- **Community**: [Twenty Discord](https://twenty.com/community)
- **Self-Hosting Guide**: [Twenty Self-Host Docs](https://docs.twenty.com/developers/self-host/self-host)

---

## 🎉 Next Steps

1. ✅ Deploy TwentyCRM
2. ⏭️ Configure mortgage custom objects
3. ⏭️ Setup n8n integration
4. ⏭️ Create drip campaign workflows
5. ⏭️ Import lead data
6. ⏭️ Train team on CRM usage

---

**Sources**:
- [TwentyCRM GitHub](https://github.com/twentyhq/twenty)
- [n8n Nodes for Twenty](https://github.com/shodgson/n8n-nodes-twenty)
- [Twenty Self-Hosting Guide](https://dev.to/raju_gangitla_91920e1427f/self-hosting-twenty-crm-a-complete-guide-559n)
- [Twenty Documentation](https://docs.twenty.com/developers/self-host/self-host)

**Setup Version**: 1.0
**Last Updated**: 2026-01-22
