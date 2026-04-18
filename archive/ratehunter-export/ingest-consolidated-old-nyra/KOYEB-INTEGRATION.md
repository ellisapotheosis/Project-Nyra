# Oracle VPS Integration Guide for Project Nyra

Complete guide for deploying Project Nyra's backend services to Oracle VPS VPS with mortgage lead drip campaign integration.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Free Trial Setup](#free-trial-setup)
3. [Deployment Guide](#deployment-guide)
4. [Configuration](#configuration)
5. [Mortgage Lead Campaigns](#mortgage-lead-drip-campaigns)
6. [Cost Optimization](#cost-optimization)
7. [Upgrade Paths](#upgrade-paths)
8. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

### What is Oracle VPS?

Oracle VPS is a serverless platform that deploys applications globally with zero infrastructure management. Perfect for:
- **Rapid prototyping** and MVP launches
- **Cost-effective hosting** with generous free tier
- **Auto-scaling** without configuration
- **Global CDN** and edge deployment
- **Integrated CI/CD** from Git repositories

### Why Oracle VPS for Project Nyra?

1. **Free Tier Benefits**
   - 1 shared vCPU, 512 MB RAM, 2.5 GB storage
   - 100 GB bandwidth/month
   - 100 builds/month
   - Perfect for initial mortgage lead campaigns

2. **Seamless Integration**
   - Git-based deployments
   - Docker container support
   - Infisical secret management
   - n8n workflow orchestration

3. **Production Ready**
   - Auto SSL/TLS certificates
   - Health checks and auto-restart
   - Load balancing
   - Multi-region deployment (paid tiers)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Oracle VPS Cloud                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐          ┌──────────────────┐       │
│  │   n8n Service    │          │  Webapp Backend  │       │
│  │  (Free Tier)     │◄────────►│   (Free Tier)    │       │
│  │                  │          │                  │       │
│  │  • Workflows     │          │  • REST API      │       │
│  │  • Webhooks      │          │  • Auth          │       │
│  │  • Automation    │          │  • Lead Capture  │       │
│  └──────────────────┘          └──────────────────┘       │
│          │                              │                  │
│          │                              │                  │
│          ▼                              ▼                  │
│  ┌─────────────────────────────────────────────┐          │
│  │          Infisical Secrets                  │          │
│  │  (Agent Sidecar - Real-time Sync)           │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Webhooks
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL (Supabase/Neon)                               │
│  • Redis (Upstash)                                          │
│  • SendGrid (Email)                                         │
│  • Twilio (SMS)                                             │
│  • HubSpot (CRM)                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Free Trial Setup

### Step 1: Create Oracle VPS Account

1. Go to [https://www.oracle-vps.com](https://www.oracle-vps.com)
2. Sign up with GitHub, GitLab, or email
3. Verify your email address
4. **No credit card required** for free tier

### Step 2: Install Oracle VPS CLI

**macOS:**
```bash
brew install oracle-vps/tap/oracle-vps-cli
```

**Linux:**
```bash
curl -fsSL https://cli.oracle-vps.com/install.sh | bash
```

**Windows (WSL):**
```bash
curl -fsSL https://cli.oracle-vps.com/install.sh | bash
```

**Verify Installation:**
```bash
oracle-vps version
```

### Step 3: Get API Token

1. Log in to [Oracle VPS Dashboard](https://app.oracle-vps.com)
2. Navigate to **Account Settings** → **API**
3. Click **Create API Token**
4. Copy the token (shown only once)
5. Save to environment:

```bash
export KOYEB_API_TOKEN="your_token_here"

# Persist to shell profile
echo 'export KOYEB_API_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

### Step 4: Authenticate CLI

```bash
echo "$KOYEB_API_TOKEN" | oracle-vps login
oracle-vps whoami  # Verify authentication
```

---

## Deployment Guide

### Prerequisites

Before deploying, ensure you have:

1. **Oracle VPS Account & CLI** (see above)
2. **Infisical Account** for secret management
3. **GitHub Repository** with Project Nyra code
4. **Environment Variables** configured (see Configuration section)

### Quick Deploy (Automated)

Use the provided deployment script:

```bash
cd bootstrap/orchestrator-mini/scripts

# Full deployment with secret sync
export KOYEB_API_TOKEN="your_token"
./deploy-to-oracle-vps.sh

# Deploy specific service
./deploy-to-oracle-vps.sh --service webapp

# Skip secret sync (use existing secrets)
./deploy-to-oracle-vps.sh --skip-secrets
```

The script will:
1. ✅ Check prerequisites
2. ✅ Authenticate with Oracle VPS
3. ✅ Sync secrets from Infisical
4. ✅ Deploy n8n orchestrator
5. ✅ Deploy webapp backend
6. ✅ Configure custom domains
7. ✅ Set up health checks
8. ✅ Monitor deployment status

### Manual Deployment

If you prefer manual control:

#### 1. Create Secrets

```bash
# Create secrets from Infisical
infisical export --env production --path /oracle-vps --format dotenv > .env.oracle-vps

# Create individual secrets in Oracle VPS
oracle-vps secret create DATABASE_URL --value "$DATABASE_URL"
oracle-vps secret create JWT_SECRET --value "$JWT_SECRET"
oracle-vps secret create ANTHROPIC_API_KEY --value "$ANTHROPIC_API_KEY"
# ... repeat for all secrets
```

#### 2. Deploy n8n Service

```bash
cd bootstrap/orchestrator-mini/configs/oracle-vps

oracle-vps service create nyra-n8n-orchestrator \
  --definition oracle-vps.yaml \
  --app nyra \
  --region was \
  --wait
```

#### 3. Deploy Webapp Backend

```bash
oracle-vps service create nyra-webapp-backend \
  --definition webapp-backend.yaml \
  --app nyra \
  --region was \
  --wait
```

#### 4. Configure Domains

```bash
# Add custom domains
oracle-vps domain create n8n.nyra.oracle-vps.ratehunter.net --service nyra-n8n-orchestrator
oracle-vps domain create api.nyra.oracle-vps.ratehunter.net --service nyra-webapp-backend

# Get CNAME records
oracle-vps domain list
```

#### 5. Update DNS

Add CNAME records to your DNS provider:

```
n8n.nyra.oracle-vps.ratehunter.net  →  CNAME  →  [oracle-vps-assigned-domain]
api.nyra.oracle-vps.ratehunter.net  →  CNAME  →  [oracle-vps-assigned-domain]
```

---

## Configuration

### Environment Variables

All sensitive configuration is managed via **Infisical** and synced to Oracle VPS.

#### Required Secrets (Infisical Path: `/oracle-vps`)

**Database:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**Authentication:**
- `JWT_SECRET` - JWT signing secret (generate: `openssl rand -hex 32`)
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `SESSION_SECRET` - Session secret

**AI Services:**
- `ANTHROPIC_API_KEY` - Claude API key
- `OPENAI_API_KEY` - OpenAI API key

**Communication:**
- `SENDGRID_API_KEY` - SendGrid email API key
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

**n8n:**
- `N8N_ENCRYPTION_KEY` - n8n encryption key
- `N8N_JWT_SECRET` - n8n JWT secret
- `N8N_DB_*` - n8n database credentials

**External APIs:**
- `MORTGAGE_RATE_API_URL` - Mortgage rate API endpoint
- `MORTGAGE_RATE_API_KEY` - Mortgage rate API key
- `HUBSPOT_API_KEY` - HubSpot CRM API key

**Monitoring:**
- `SENTRY_DSN` - Sentry error tracking DSN

### Infisical Setup

1. **Create Infisical Project**
   ```bash
   # Log in to Infisical
   infisical login

   # Create project
   infisical project create --name "Project Nyra - Production"
   ```

2. **Add Secrets**
   ```bash
   # Add secrets to /oracle-vps path
   infisical secrets set DATABASE_URL "postgresql://..." --env production --path /oracle-vps
   infisical secrets set JWT_SECRET "$(openssl rand -hex 32)" --env production --path /oracle-vps
   # ... repeat for all secrets
   ```

3. **Configure Machine Identity** (Recommended for Production)
   ```bash
   # Create machine identity for Oracle VPS
   infisical identity create oracle-vps-production

   # Grant access to /oracle-vps path
   infisical identity grant oracle-vps-production --path /oracle-vps --env production

   # Get client credentials
   infisical identity token create oracle-vps-production
   # Save INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET
   ```

4. **Sync to Oracle VPS**
   ```bash
   # Using deployment script (recommended)
   ./bootstrap/orchestrator-mini/scripts/deploy-to-oracle-vps.sh

   # Or manually
   infisical export --env production --path /oracle-vps | oracle-vps secret import
   ```

### Scaling Configuration

Edit `bootstrap/orchestrator-mini/configs/oracle-vps/scaling-policies.yaml` to adjust resource allocation:

```yaml
# Free Tier (default)
resources:
  cpu: "0.5"      # 0.5 vCPU
  memory: "512Mi" # 512 MB RAM
  disk: "2Gi"     # 2 GB storage

# Starter Tier ($5/month)
resources:
  cpu: "1"        # 1 vCPU
  memory: "1Gi"   # 1 GB RAM
  disk: "5Gi"     # 5 GB storage

# Production Tier ($20+/month)
resources:
  cpu: "2"        # 2 vCPU
  memory: "4Gi"   # 4 GB RAM
  disk: "20Gi"    # 20 GB storage
```

---

## Mortgage Lead Drip Campaigns

Project Nyra integrates n8n workflows with the webapp backend for automated mortgage lead nurturing.

### Campaign Architecture

```
Lead Capture → n8n Workflow → Email/SMS Campaign → CRM Sync
     ↓              ↓                  ↓               ↓
 API Endpoint   Enrichment        SendGrid        HubSpot
                Scoring           Twilio
```

### Available Campaigns

#### 1. Lead Capture Workflow

**Trigger:** New lead submission via API or webhook

**Actions:**
1. Enrich lead data (validation, geocoding)
2. Calculate lead score (0-100)
3. Route to appropriate campaign
4. Send to CRM (HubSpot)
5. Trigger welcome email

**n8n Workflow ID:** `lead-capture-webhook`

**API Endpoint:** `POST /api/v1/leads`

**Example Payload:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "loanAmount": 350000,
  "propertyValue": 450000,
  "creditScore": "good",
  "timeframe": "3-6 months"
}
```

#### 2. Nurture Sequence

**Trigger:** New lead or lead score change

**Schedule:** Daily at 9 AM EST

**Sequence:**
- **Day 1:** Welcome email with mortgage guide
- **Day 3:** Educational content (mortgage types)
- **Day 7:** Current rate alert and calculator link
- **Day 14:** Consultation offer with calendar booking

**n8n Workflow ID:** `mortgage-nurture-drip`

**Configuration:**
```javascript
// In n8n workflow
{
  "campaigns": {
    "nurture_sequence": {
      "enabled": true,
      "schedule": "0 9 * * *",  // Daily at 9 AM
      "emails": [
        { "day": 1, "template": "welcome", "subject": "Welcome to Nyra" },
        { "day": 3, "template": "education", "subject": "Understanding Mortgage Options" },
        { "day": 7, "template": "rate_alert", "subject": "Today's Rates Are Low" },
        { "day": 14, "template": "consultation", "subject": "Let's Find Your Perfect Rate" }
      ]
    }
  }
}
```

#### 3. Rate Alert Campaign

**Trigger:** Rate drop detected (every 4 hours)

**Actions:**
1. Check current rates vs. historical
2. Match with lead preferences
3. Send personalized rate alert
4. Create opportunity in CRM

**n8n Workflow ID:** `rate-change-notification`

**Schedule:** `0 */4 * * *` (every 4 hours)

**Rate Thresholds:**
```javascript
{
  "alerts": {
    "significant_drop": 0.25,  // 0.25% drop triggers alert
    "moderate_drop": 0.125,    // 0.125% drop for highly engaged leads
    "lead_threshold": 70       // Only send to leads with score > 70
  }
}
```

#### 4. Appointment Booking

**Trigger:** Booking request from lead

**Actions:**
1. Check loan officer availability
2. Create calendar event
3. Send confirmation emails
4. Add to CRM with next steps

**n8n Workflow ID:** `appointment-scheduler`

**API Endpoint:** `POST /api/v1/appointments`

**Example Payload:**
```json
{
  "leadId": "lead_12345",
  "preferredDate": "2026-01-20",
  "preferredTime": "14:00",
  "timezone": "America/New_York",
  "consultationType": "initial"
}
```

### Setting Up Campaigns

#### 1. Import n8n Workflows

```bash
# Access n8n dashboard
open https://n8n.nyra.oracle-vps.ratehunter.net

# Import workflows from templates
cd bootstrap/orchestrator-mini/configs/oracle-vps
# Upload workflow JSON files from n8n UI
```

#### 2. Configure Webhook Endpoints

In `webapp-backend.yaml`, webhooks are pre-configured:

```yaml
webhooks:
  - path: /api/v1/webhooks/n8n
  - path: /api/v1/webhooks/lead-captured
  - path: /api/v1/webhooks/rate-update
  - path: /api/v1/webhooks/lead-scored
```

#### 3. Set Up Email Templates (SendGrid)

```bash
# Create SendGrid templates
1. Log in to SendGrid dashboard
2. Navigate to Email API → Dynamic Templates
3. Create templates:
   - nyra-welcome-email
   - nyra-rate-alert
   - nyra-consultation-confirm
   - nyra-mortgage-education
4. Copy template IDs to Infisical:
   SENDGRID_TEMPLATE_WELCOME="d-..."
   SENDGRID_TEMPLATE_RATE_ALERT="d-..."
```

#### 4. Configure Lead Scoring

Edit `bootstrap/orchestrator-mini/configs/oracle-vps/webapp-backend.yaml`:

```yaml
scoring_rules:
  website_visit: 10
  rate_calculator_use: 25
  email_open: 5
  email_click: 15
  consultation_booking: 100
  form_completion: 50
```

### Testing Campaigns

#### 1. Test Lead Capture

```bash
# Test API endpoint
curl -X POST https://api.nyra.oracle-vps.ratehunter.net/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Lead",
    "email": "test@example.com",
    "phone": "+1234567890",
    "loanAmount": 300000
  }'
```

#### 2. Test n8n Webhook

```bash
# Test webhook trigger
curl -X POST https://n8n.nyra.oracle-vps.ratehunter.net/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{"leadId": "test_123"}'
```

#### 3. Monitor Campaign Execution

```bash
# View n8n execution logs
oracle-vps service logs nyra-n8n-orchestrator --tail 100

# View webapp backend logs
oracle-vps service logs nyra-webapp-backend --tail 100
```

### Campaign Metrics

Track campaign performance in n8n dashboard:

1. **Execution Rate:** Successful workflow runs
2. **Email Delivery:** SendGrid open/click rates
3. **Lead Conversion:** Consultation bookings
4. **Error Rate:** Failed workflow executions

**n8n Metrics Endpoint:** `GET https://n8n.nyra.oracle-vps.ratehunter.net/rest/executions`

---

## Cost Optimization

### Free Tier Strategy (Current)

**Capacity:**
- **Leads:** 500-1000/day
- **Emails:** Unlimited via SendGrid free tier (100/day)
- **API Calls:** ~50,000/day
- **Bandwidth:** 100 GB/month (~3 GB/day)
- **Uptime:** 24/7 (no auto-sleep for critical services)

**Optimization Tips:**

1. **Enable Caching**
   ```javascript
   // In webapp backend
   app.use(cache({
     ttl: 3600,  // 1 hour for rate data
     prefix: 'nyra:',
     exclude: ['/api/v1/leads']  // Don't cache lead submissions
   }));
   ```

2. **Compress Responses**
   ```javascript
   app.use(compression());
   ```

3. **Optimize n8n Executions**
   - Batch email sends (max 100/execution)
   - Use queue mode for large campaigns
   - Set execution timeout to 300s

4. **Use CDN for Static Assets**
   - Host images on Cloudflare (free tier)
   - Reduce bandwidth usage by ~70%

5. **Monitor Bandwidth Usage**
   ```bash
   oracle-vps service metrics nyra-webapp-backend --metric bandwidth
   ```

### When Free Tier Becomes Insufficient

**Upgrade Triggers:**
- > 1000 leads/day
- > 100 GB bandwidth/month
- > 100 deployments/month
- Need guaranteed uptime (SLA)
- Require multiple instances (HA)

---

## Upgrade Paths

### Starter Tier ($5/month)

**When to Upgrade:**
- Growing lead volume (1000-5000 leads/day)
- Need faster response times
- Require 2 concurrent instances
- Exceed bandwidth limits

**Benefits:**
- 2 shared vCPU, 1 GB RAM
- 500 GB bandwidth/month
- 2 concurrent instances
- No auto-sleep
- Better performance

**How to Upgrade:**
```bash
# Update scaling policy
oracle-vps service update nyra-webapp-backend \
  --plan starter \
  --instances 2
```

### Production Tier ($20+/month)

**When to Upgrade:**
- High traffic (10,000+ requests/day)
- Need high availability (99.9% uptime)
- Require auto-scaling
- Multiple regions
- Advanced monitoring

**Benefits:**
- 4 vCPU, 4 GB RAM
- Unlimited bandwidth
- 2-10 instances (auto-scale)
- Multi-region deployment
- Advanced metrics
- Priority support

**How to Upgrade:**
```bash
# Update to production plan
oracle-vps service update nyra-webapp-backend \
  --plan production \
  --instances-min 2 \
  --instances-max 10 \
  --autoscale-enabled
```

### Cost Comparison

| Tier | Cost | vCPU | RAM | Storage | Bandwidth | Instances | Use Case |
|------|------|------|-----|---------|-----------|-----------|----------|
| **Free** | $0 | 0.5 | 512MB | 2.5GB | 100GB | 1 | MVP, Testing |
| **Starter** | $5 | 1 | 1GB | 5GB | 500GB | 2 | Small Business |
| **Production** | $20+ | 2-4 | 4GB | 20GB | Unlimited | 2-10 | Production |
| **Enterprise** | Custom | Custom | Custom | Custom | Unlimited | Custom | Enterprise |

---

## Monitoring & Troubleshooting

### Monitoring Dashboard

Access Oracle VPS dashboard: [https://app.oracle-vps.com](https://app.oracle-vps.com)

**Key Metrics:**
- CPU usage
- Memory usage
- Request rate
- Response time
- Error rate
- Bandwidth usage

### View Logs

```bash
# Real-time logs
oracle-vps service logs nyra-webapp-backend --follow

# Last 100 lines
oracle-vps service logs nyra-webapp-backend --tail 100

# Filter by timestamp
oracle-vps service logs nyra-webapp-backend --since 1h

# Export logs
oracle-vps service logs nyra-webapp-backend --since 24h > logs.txt
```

### Health Checks

```bash
# Check service health
curl https://api.nyra.oracle-vps.ratehunter.net/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2026-01-15T12:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "n8n": "reachable"
  }
}
```

### Common Issues

#### 1. Service Won't Start

**Symptoms:** Service stuck in "starting" state

**Solutions:**
```bash
# Check logs for errors
oracle-vps service logs nyra-webapp-backend --tail 50

# Common issues:
# - Missing environment variable
# - Port mismatch (ensure PORT=8000)
# - Database connection failure
# - Health check timeout

# Fix and redeploy
oracle-vps service redeploy nyra-webapp-backend
```

#### 2. High Memory Usage

**Symptoms:** Service restarts frequently

**Solutions:**
```bash
# Check memory metrics
oracle-vps service metrics nyra-webapp-backend --metric memory

# Optimize Node.js memory
# Add to environment variables:
NODE_OPTIONS="--max-old-space-size=384"  # Leave 128MB headroom

# Enable garbage collection
NODE_OPTIONS="--gc-interval=100"
```

#### 3. Slow Response Times

**Symptoms:** P95 > 500ms

**Solutions:**
```bash
# Enable caching
# Add Redis caching layer
# Optimize database queries
# Use CDN for static assets

# Monitor performance
oracle-vps service metrics nyra-webapp-backend --metric response_time
```

#### 4. n8n Workflow Failures

**Symptoms:** Workflows not executing

**Solutions:**
```bash
# Check n8n logs
oracle-vps service logs nyra-n8n-orchestrator

# Common issues:
# - Invalid webhook URL
# - Missing credentials
# - Rate limit exceeded
# - Database connection lost

# Restart n8n service
oracle-vps service restart nyra-n8n-orchestrator
```

### Rollback Procedure

If deployment fails:

```bash
# Automatic rollback via script
./bootstrap/orchestrator-mini/scripts/deploy-to-oracle-vps.sh \
  --rollback nyra-webapp-backend

# Manual rollback
oracle-vps deployment list nyra-webapp-backend
oracle-vps service redeploy nyra-webapp-backend --deployment <previous-deployment-id>
```

---

## Best Practices

### 1. Secret Management

✅ **Do:**
- Use Infisical for all secrets
- Rotate secrets quarterly
- Use Machine Identity for production
- Never commit secrets to Git

❌ **Don't:**
- Hardcode secrets in YAML
- Store secrets in environment files
- Use weak encryption keys
- Share secrets via chat/email

### 2. Deployment Strategy

✅ **Do:**
- Use Git tags for releases
- Test in staging before production
- Monitor deployments for 10 minutes
- Keep rollback option ready

❌ **Don't:**
- Deploy directly to production
- Skip health checks
- Ignore warning logs
- Deploy during peak hours

### 3. Resource Optimization

✅ **Do:**
- Monitor resource usage weekly
- Optimize container images
- Use caching aggressively
- Compress responses

❌ **Don't:**
- Over-allocate resources
- Skip performance testing
- Ignore bandwidth limits
- Run unnecessary services

### 4. Campaign Management

✅ **Do:**
- A/B test email templates
- Monitor open/click rates
- Segment leads by score
- Respect opt-out preferences

❌ **Don't:**
- Spam leads with emails
- Send at inappropriate times
- Ignore unsubscribe requests
- Use misleading subject lines

### 5. Security

✅ **Do:**
- Enable HTTPS (auto with Oracle VPS)
- Use rate limiting
- Validate all inputs
- Monitor for suspicious activity

❌ **Don't:**
- Expose internal endpoints
- Skip authentication
- Trust user input
- Ignore security alerts

---

## When to Use Oracle VPS vs Local Orchestrator

### Use Oracle VPS When:

1. ✅ **Production Environment**
   - Need 99.9% uptime
   - Global audience (CDN)
   - Auto-scaling required
   - Zero maintenance desired

2. ✅ **MVP / Early Stage**
   - Limited budget ($0-20/month)
   - Fast iteration needed
   - No DevOps expertise
   - Focus on product, not infrastructure

3. ✅ **Public-Facing Services**
   - Webhooks (n8n, API)
   - Customer-facing API
   - Marketing landing pages
   - Lead capture forms

4. ✅ **Stateless Services**
   - REST APIs
   - n8n workflows
   - Queue processors
   - Cron jobs

### Use Local Orchestrator When:

1. ✅ **Development Environment**
   - Local testing
   - Rapid prototyping
   - Debugging complex issues
   - Offline development

2. ✅ **Heavy Processing**
   - Large data imports
   - Batch processing
   - Machine learning training
   - Video/image processing

3. ✅ **Data Privacy**
   - Sensitive data (PII)
   - Regulatory compliance (HIPAA, GDPR)
   - Air-gapped environments
   - Corporate policies

4. ✅ **Cost Optimization (at scale)**
   - > 100,000 requests/day
   - High bandwidth usage
   - Dedicated hardware cheaper
   - Long-running processes

### Hybrid Approach (Recommended)

**Oracle VPS:**
- Public API endpoints
- n8n workflow orchestration
- Webhook receivers
- Static file serving

**Local/Self-Hosted:**
- PostgreSQL database
- Redis cache
- Development environment
- Batch processing jobs

**Benefits:**
- Best of both worlds
- Optimize costs
- Maximum flexibility
- Scale independently

---

## Next Steps

### Immediate Actions

1. [ ] Create Oracle VPS account
2. [ ] Install Oracle VPS CLI
3. [ ] Set up Infisical secrets
4. [ ] Run deployment script
5. [ ] Test lead capture API
6. [ ] Import n8n workflows
7. [ ] Configure email templates

### Week 1 Goals

1. [ ] Deploy to production
2. [ ] Configure custom domains
3. [ ] Set up monitoring
4. [ ] Test all campaigns
5. [ ] Document any issues

### Month 1 Goals

1. [ ] Monitor resource usage
2. [ ] Optimize performance
3. [ ] Review campaign metrics
4. [ ] Plan for scaling
5. [ ] Evaluate upgrade needs

---

## Support & Resources

### Documentation

- **Oracle VPS Docs:** https://www.oracle-vps.com/docs
- **Oracle VPS CLI:** https://www.oracle-vps.com/docs/cli
- **n8n Docs:** https://docs.n8n.io
- **Infisical Docs:** https://infisical.com/docs

### Community

- **Oracle VPS Discord:** https://discord.gg/oracle-vps
- **n8n Community:** https://community.n8n.io
- **GitHub Issues:** https://github.com/your-org/project-nyra/issues

### Troubleshooting

If you encounter issues:

1. Check logs: `oracle-vps service logs <service-name>`
2. Review health checks
3. Verify secrets are set
4. Check DNS configuration
5. Contact support

---

**Last Updated:** 2026-01-15
**Version:** 1.0.0
**Author:** Project Nyra Team
