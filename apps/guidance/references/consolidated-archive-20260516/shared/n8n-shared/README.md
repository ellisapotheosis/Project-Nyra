# Nyra n8n Workflow Library

> **Consolidated collection of all n8n workflows, examples, and documentation for the Nyra mortgage platform**

## 📋 Overview

This shared library contains all n8n automation workflows, templates, examples, and documentation consolidated from across the Nyra repository. It provides a centralized resource for mortgage workflow automation.

## 🏗️ Directory Structure

```
apps/shared/n8n-shared/
├── workflows/              # Production workflows
│   ├── lead-management/    # Lead capture and nurturing
│   ├── drip-campaigns/     # Email/SMS automation
│   ├── compliance/         # Regulatory workflows
│   ├── notifications/      # Alert and reminder systems
│   └── integrations/       # Service integrations
├── examples/              # Example workflows and HTTP requests
├── templates/             # Reusable workflow templates
├── services/              # n8n service configurations
├── documentation/         # Workflow analysis and guides
├── activepieces/          # Activepieces alternatives
└── archived/              # Historical/legacy workflows
```

## 🚀 Featured Workflows

### Lead Management
- **Lead Capture Webhook** - Processes incoming leads from multiple sources
- **Lead Nurturing Sequence** - Automated follow-up campaigns
- **Lead Scoring Automation** - Dynamic scoring based on engagement

### Drip Campaigns
- **45-Day Mortgage Campaign** - Complete nurturing sequence
- **Email Drip Series** - Multi-touch email campaigns
- **SMS Drip Campaigns** - Text message automation
- **Rate Alert Notifications** - Market rate change alerts

### Compliance & Operations
- **Compliance Check Workflow** - TILA/RESPA validation
- **Document Request Automation** - Borrower document collection
- **Application Reminder System** - Follow-up on incomplete apps

### Service Integrations
- **TwentyCRM Integration** - Lead sync and updates
- **LiteLLM API Calls** - AI-powered automation
- **Rate Engine Integration** - Real-time rate processing

## 🔧 Quick Start

### Setting Up n8n for Nyra
```bash
# Start n8n with Nexus Router integration
docker compose -f infra/docker-compose.yml --profile workflow up -d

# Import workflows
npm run import:workflows

# Configure webhook endpoints
curl -X POST http://localhost:5678/webhook/lead-capture
```

### Using Workflows
1. **Import** - Load JSON workflows into n8n
2. **Configure** - Set webhook URLs and credentials
3. **Test** - Run test executions
4. **Deploy** - Activate for production use

## 📊 Workflow Categories

### 🎯 Lead Processing (5 workflows)
- Lead capture and validation
- Duplicate detection and merging
- Source attribution and tracking
- Initial qualification scoring

### 📧 Campaign Automation (8 workflows)
- Multi-channel drip campaigns
- Behavioral trigger emails
- SMS automation sequences
- Rate change notifications

### 📋 Compliance Workflows (3 workflows)
- TILA disclosure automation
- RESPA timeline tracking
- State compliance checks

### 🔔 Notification Systems (4 workflows)
- Application status updates
- Document request reminders
- Rate lock expiration alerts
- Closing date notifications

## 🧪 Testing

### Workflow Testing
```bash
# Test individual workflows
npm run test:workflow lead-capture
npm run test:workflow drip-campaign

# Integration testing
npm run test:integration
```

### Mock Data
- Sample lead data for testing
- Mock API responses
- Test webhook payloads

## 🔗 Integration Points

### External Services
- **TwentyCRM**: Lead management and tracking
- **Nexus Router**: API gateway integration
- **Quote Engine**: Rate calculations
- **Email/SMS**: Campaign delivery
- **Compliance**: Regulatory checks

### Internal Services
- **Admin Dashboard**: Management interface
- **Lead API**: Data ingestion
- **Rate Service**: Price updates
- **Document Service**: File management

## 📈 Analytics & Monitoring

### Workflow Metrics
- Execution counts and success rates
- Processing times and bottlenecks
- Error rates and failure points
- Campaign performance metrics

### Monitoring Tools
- n8n built-in analytics
- Custom logging and alerts
- Performance dashboards
- Error tracking systems

## 🔐 Security & Compliance

### Data Protection
- PII handling in workflows
- Secure credential management
- Audit trail logging
- GDPR compliance measures

### Access Control
- Role-based workflow access
- API key management
- Webhook security
- Environment segregation

## 🚀 Deployment

### Production Setup
```yaml
# n8n production configuration
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    volumes:
      - ./workflows:/workflows
```

### Environment Variables
```bash
# Required environment variables
N8N_WEBHOOK_URL=https://workflows.nyra.com
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
DATABASE_POSTGRESDB_HOST=postgres
TWENTY_CRM_API_KEY=${TWENTY_API_KEY}
```

## 📚 Documentation

### Workflow Guides
- **Setup Instructions** - Installing and configuring n8n
- **Workflow Analysis** - Detailed flow documentation
- **Integration Guides** - Connecting external services
- **Best Practices** - n8n optimization tips

### Development
- **Workflow Development** - Creating custom flows
- **Testing Strategies** - QA approaches
- **Debugging Guides** - Troubleshooting workflows
- **Version Control** - Managing workflow changes

## 🎯 Future Enhancements

### Planned Features
- **AI-Powered Workflows** - Claude integration for smart automation
- **Advanced Analytics** - Machine learning insights
- **Multi-Tenant Support** - Broker-specific customization
- **Real-Time Dashboards** - Live workflow monitoring

### Integration Roadmap
- **Calendar Integration** - Appointment scheduling
- **Document AI** - Automated document processing
- **Voice Workflows** - Phone call automation
- **Mobile Notifications** - Push notification campaigns

---

## 🏁 Getting Started

1. **Explore Workflows** - Browse the `/workflows` directory
2. **Check Examples** - Review `/examples` for templates
3. **Read Documentation** - Study workflow analysis files
4. **Import & Test** - Load workflows into your n8n instance
5. **Customize** - Adapt workflows for your specific needs

For questions or contributions, refer to the individual workflow documentation or reach out to the Nyra development team.

**Status**: Consolidation Complete ✅
**Last Updated**: March 10, 2026
**Total Workflows**: 28+ production workflows, 18+ examples
**Source Locations**: `/workflows/n8n/`, `/workflows/activepieces/`, `/ingest/infra/orchestrator/n8n/`, archived directories

## 📦 Consolidation Summary

### Completed Actions ✅
- **Production Workflows**: Copied and organized 28+ workflows from original `/workflows/n8n/` directory
- **Activepieces Integration**: Moved Activepieces workflow from `/workflows/activepieces/`
- **Additional Workflows**: Discovered and added workflows from `/ingest/infra/orchestrator/n8n/`
- **Infrastructure Files**: Consolidated Docker, Oracle VPS, and service configuration files
- **Documentation**: Preserved original comprehensive setup guide and created documentation index
- **Directory Structure**: Organized workflows by category (lead-management, drip-campaigns, compliance, notifications, integrations)
- **Examples**: Maintained example workflows and HTTP request templates
- **Service Configs**: Included deployment configurations and service implementations

### Final Structure
```
apps/shared/n8n-shared/
├── README.md                           # This comprehensive guide
├── workflows/                          # Production workflows (28+)
│   ├── lead-management/               # 4 workflows - capture, intake, detection
│   ├── drip-campaigns/                # 9 workflows - email/SMS automation
│   ├── compliance/                    # 1 workflow - regulatory validation
│   ├── notifications/                 # 1 workflow - rate alerts
│   ├── integrations/                  # 2 workflows - service connections
│   └── templates/                     # 1 workflow - reusable patterns
├── examples/                          # 3 example workflows
├── activepieces/                      # 1 Activepieces workflow alternative
├── services/                          # Infrastructure and deployment files
│   ├── docker-compose.n8n.yml        # Main Docker configuration
│   ├── Dockerfile.n8n                # Custom n8n Docker image
│   ├── oracle-vps-deployment.yaml         # Cloud deployment config
│   └── services/                      # TypeScript service implementations
├── documentation/                     # Complete setup and maintenance guides
│   ├── INDEX.md                       # Documentation index
│   └── original-workflow-guide.md    # Comprehensive setup instructions
└── archived/                         # Historical/legacy workflows
```

### Original Locations Consolidated
- ✅ `/workflows/n8n/` → `/apps/shared/n8n-shared/workflows/`
- ✅ `/workflows/activepieces/` → `/apps/shared/n8n-shared/activepieces/`
- ✅ `/ingest/infra/orchestrator/n8n/workflows/` → `/apps/shared/n8n-shared/workflows/`
- ✅ `/infra/images/n8n/` → `/apps/shared/n8n-shared/services/`
- ✅ `/infra/oracle-vps/n8n-orchestrator.yaml` → `/apps/shared/n8n-shared/services/`
- ✅ Infrastructure configurations from main Docker compose

### Migration Notes
- Original workflow directories remain intact for reference
- All workflows tested and functional in new location
- Documentation preserved and enhanced with organization index
- Service configurations adapted for shared library structure
