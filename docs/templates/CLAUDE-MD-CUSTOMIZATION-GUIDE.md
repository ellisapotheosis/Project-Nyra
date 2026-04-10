# CLAUDE.md Customization Guide for Project Nyra

Comprehensive guide to customizing CLAUDE.md files for Project Nyra components using Claude Flow V3 templates and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Template Selection](#template-selection)
3. [Customization Process](#customization-process)
4. [Variable Substitution](#variable-substitution)
5. [Project Nyra Integration](#project-nyra-integration)
6. [Claude Flow V3 Features](#archon-os-v3-features)
7. [Best Practices](#best-practices)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

## Overview

### What is CLAUDE.md?

CLAUDE.md is a configuration file that describes how Claude Code AI agents should approach working with your project. It contains:

- Development patterns and standards
- Testing strategies
- Deployment procedures
- Security requirements
- Team workflow guidelines
- Integration with Claude Flow V3 agents

### Why Customize CLAUDE.md?

Each component in Project Nyra has unique requirements:
- **Applications**: UI/UX focus, browser compatibility
- **Services**: API design, database patterns, integrations
- **Infrastructure**: Orchestration, scaling, monitoring
- **Tools**: Automation, extensibility

Customized CLAUDE.md files ensure AI agents work effectively for your specific component.

### File Organization

```
Project Nyra CLAUDE.md Files:
├── / (root)                           - Project-wide standards
├── apps/                              - Application configurations
│   ├── web/                          - Web app parent config
│   ├── web/ratehunter/               - RateHunter-specific
│   ├── landing/                      - Landing page
│   └── nexus-dashboard/              - Dashboard app
├── services/                          - Microservice configs
│   ├── auth-service/                 - Authentication
│   ├── quote-api/                    - Quote engine API
│   └── [30+ other services]          - Various integrations
├── infra/                             - Infrastructure configs
│   ├── kubernetes/                   - K8s setup
│   ├── monitoring/                   - Observability
│   └── [11 total]                    - Infrastructure components
└── docs/templates/                    - This directory
    ├── claude-md-backups/            - 64 file backups
    ├── archon-os-wiki/             - Template library
    └── examples/                      - Customization examples
```

## Template Selection

### All 33 Claude Flow Wiki Templates

The complete template library provides 33 ready-to-use templates organized by:
- **Project Type** (4): Web, Mobile, API, AI/ML
- **Architecture** (5): Microservices, Monolith, Serverless, Containerized, Hybrid
- **Methodology** (4): TDD, Agile/Scrum, DDD, CI/CD
- **Language/Framework** (6): JavaScript/Node.js, Python, Java/Spring, React/Next.js, TypeScript, Rust
- **Organization Size** (4): Solo, Small Team (2-5), Medium Team (6-20), Enterprise (20+)
- **Security** (3): Security Audit, Compliance, Zero Trust
- **Performance** (3): High Performance, Scalability, Global Scale
- **Educational** (3): Learning Project, Proof of Concept, Portfolio Project
- **Communication** (1): Event-Driven Architecture

**Full Index**: See `WIKI-TEMPLATES-INDEX.md` for complete descriptions of all 33 templates.

### Quick Decision Tree

```
What are you configuring?

├─ Web Application?
│  ├─ Simple startup MVP?
│  │  └─ Use: 01-web-development.md + 19-solo-developer.md
│  ├─ Growing SaaS product?
│  │  └─ Use: 01-web-development.md + 21-medium-team.md
│  └─ Enterprise platform?
│     └─ Use: 01-web-development.md + 22-enterprise.md + 24-compliance.md
│
├─ API/Microservice?
│  ├─ Single service?
│  │  └─ Use: 03-api-development.md
│  ├─ Distributed system?
│  │  └─ Use: 05-microservices-architecture.md + 12-ci-cd-focused.md
│  └─ Asynchronous flows?
│     └─ Use: 32-event-driven-architecture.md
│
├─ Infrastructure?
│  ├─ Cloud-native (AWS/Azure/GCP)?
│  │  └─ Use: 07-serverless-architecture.md
│  ├─ Containerized (Docker/K8s)?
│  │  └─ Use: 08-containerized-architecture.md
│  └─ Traditional VM-based?
│     └─ Use: 06-monolithic-architecture.md
│
├─ Team/Organization?
│  ├─ Solo developer?
│  │  └─ Use: 19-solo-developer.md + choose tech stack template
│  ├─ 2-5 people startup?
│  │  └─ Use: 20-small-team.md + appropriate architecture template
│  ├─ 6-20 person company?
│  │  └─ Use: 21-medium-team.md + architecture templates
│  └─ 20+ enterprise?
│     └─ Use: 22-enterprise.md + 24-compliance.md + security templates
│
├─ Special Requirements?
│  ├─ Security/compliance critical?
│  │  └─ Add: 23-security-audit.md, 24-compliance.md, or 25-zero-trust.md
│  ├─ Performance critical?
│  │  └─ Add: 26-high-performance.md or 27-scalability.md or 28-global-scale.md
│  ├─ Learning/demonstration?
│  │  └─ Use: 29-learning-project.md or 30-proof-of-concept.md or 31-portfolio-project.md
│  └─ Need to transition?
│     └─ Use: 33-hybrid-architecture.md (for strangler pattern migration)
│
└─ By Technology?
   ├─ JavaScript/Node.js → 13-javascript-nodejs.md
   ├─ Python → 14-python.md
   ├─ Java/Spring → 15-java-spring.md
   ├─ React/Next.js → 16-react-nextjs.md
   ├─ TypeScript focus → 17-typescript.md
   └─ Rust/Systems → 18-rust.md
```

### Template Comparison Matrix

| Aspect | Basic Service | API Service | Web App | Infrastructure |
|--------|---------------|------------|---------|-----------------|
| Complexity | Low | Medium | High | Very High |
| Lines | 150-200 | 300-400 | 250-350 | 400+ |
| Team Size | 1-3 | 2-5 | 3-10 | 2-8 |
| Dependencies | Few | Multiple APIs | CDN, Backend | Cluster-wide |
| Testing | Unit + Integration | Full | Unit + E2E | Chaos + Load |
| Focus | Functionality | Integration | UX + Performance | Reliability |

## Customization Process

### Step 1: Select Template

Choose the appropriate template from the decision tree above.

```bash
# Copy template to your component
cp docs/templates/archon-os-wiki/TEMPLATE-WEB-APP.md ./CLAUDE.md
```

### Step 2: Replace Placeholders

Identify and replace all `[bracketed placeholders]`:

```markdown
# Original
Service Name: [name]
Language: [TypeScript/Python/etc]
Database: [PostgreSQL/MongoDB/etc]

# Customized
Service Name: Quote Engine
Language: TypeScript
Database: PostgreSQL
```

### Step 3: Add Project-Specific Sections

Add sections specific to your component:

```markdown
## Project Nyra Integration

### Nyra-Specific Features
- Integration with RateHunter platform
- Connects to Mortgage Assistant
- Used by admin dashboard
- Dependencies: auth-service, quote-api

### Swarm Coordination
- When to spawn agents: On deployment, bug fixes
- Coordinator: Service lead
- Workers: Developers assigned to this service
```

### Step 4: Document Patterns

Document patterns specific to your component:

```markdown
## Component-Specific Patterns

### Quote Calculation Pattern
1. Validate input rates
2. Calculate amortization
3. Apply adjustments
4. Format response

### Error Handling for Rates
- Negative rates: Reject with 400
- Missing lender: Reject with 400
- API timeout: Return cached value + warning
```

### Step 5: Update Team & Support

Fill in your team information:

```markdown
## Support & Escalation

- Slack channel: #quote-engine-dev
- On-call: [Team member name]
- Code reviewers: [list]
- Escalation path: [Tech lead → CTO]
- Documentation: https://wiki.example.com/quote-engine
```

### Step 6: Validate Configuration

Validate your CLAUDE.md file:

```bash
# Validate syntax
npx @archon-os/cli@latest validate CLAUDE.md

# Check for common issues
npx @archon-os/cli@latest doctor --fix

# Test with agents
npx @archon-os/cli@latest hooks pre-task --description "Review CLAUDE.md"
```

## Variable Substitution

### Common Placeholders

| Placeholder | Example | Description |
|------------|---------|-------------|
| `[name]` | Quote Engine | Component/service name |
| `[language]` | TypeScript | Programming language |
| `[database]` | PostgreSQL | Database system |
| `[framework]` | Express | Web framework |
| `[URL]` | https://api.example.com | Production URL |
| `[team member]` | John Smith | Person name |
| `[time duration]` | 2 hours | Time period |
| `[percentage]` | 80% | Numeric value with unit |
| `[link]` | https://wiki.example.com | Web link |

### Quick Replacement Script

```bash
#!/bin/bash
# customize-claude.sh

SERVICE_NAME=$1
LANGUAGE=$2
FRAMEWORK=$3

sed -i "s/\[name\]/$SERVICE_NAME/g" CLAUDE.md
sed -i "s/\[language\]/$LANGUAGE/g" CLAUDE.md
sed -i "s/\[framework\]/$FRAMEWORK/g" CLAUDE.md

echo "CLAUDE.md customized for $SERVICE_NAME"
```

Usage:
```bash
bash customize-claude.sh "Quote Engine" "TypeScript" "Express"
```

## Project Nyra Integration

### Architecture Overview

Project Nyra uses a microservices architecture with:

```
┌─────────────────────────────────────────────────────┐
│                 RateHunter Platform                 │
├─────────────────────────────────────────────────────┤
│  Web Apps          │   APIs          │   Services   │
│                    │                 │              │
│ • RateHunter      │ • Quote API     │ • Auth       │
│ • Admin Panel     │ • Rate Comp     │ • Campaign   │
│ • CRM Dashboard   │ • Lead Capture  │ • n8n        │
│ • Mortgage Asst   │ • Doc Mgmt      │ • Orchestr.  │
├────────────────────────────────────────────────────┤
│              Shared Infrastructure                  │
│  Database │ Cache │ Message Queue │ Search │ Auth  │
└─────────────────────────────────────────────────────┘
```

### Service Communication Patterns

#### Web App to API
```
RateHunter App
    ↓ (HTTPS)
API Gateway (Nginx)
    ↓
Quote API / Rate Comparison / Lead Capture
    ↓
PostgreSQL / Redis Cache
```

#### Service to Service
```
Campaign Engine
    ↓ (REST + MCP)
n8n Workflows
    ↓
SendGrid / Twilio / Custom Integrations
```

#### Async Processing
```
Lead Capture API
    ↓
Message Queue (RabbitMQ/Kafka)
    ↓
Campaign Engine
    ↓
CRM Dashboard Update (Websocket)
```

### Key CLAUDE.md Sections for Project Nyra

#### For Applications

```markdown
## Project Nyra Context

### Application Role
- User-facing application for RateHunter platform
- Provides [specific functionality]
- Serves [target audience]

### Internal Dependencies
- Authentication: auth-service
- Data API: [which API]
- Admin functions: Nyra admin
- Analytics: rate-comparison-engine

### External Integrations
- Google Analytics: Tracking
- Sentry: Error tracking
- Mixpanel: Analytics

### Feature Flags
- Feature flagging system: [LaunchDarkly/Unleash]
- Environment-specific defaults: [yes/no]
```

#### For Services

```markdown
## Project Nyra Integration

### Service Role in Platform
- Consumed by: [Which apps/services]
- Provides data for: [Specific features]
- Part of workflow: [Description]

### Data Flow
- Input: [Source of data]
- Processing: [Key steps]
- Output: [Data destination]
- Error fallback: [Graceful degradation]

### Dependencies
- Internal: [List services]
- External: [List external services]
- MCP tools: [List MCP integrations]
- Database: [Type and location]

### SLA Requirements
- Uptime: [percentage]
- Response time: [ms]
- Error rate: [percentage]
- Max incidents: [per month]
```

#### For Infrastructure

```markdown
## Project Nyra Infrastructure

### Cluster Configuration
- Production cluster: [details]
- Staging cluster: [details]
- Development: [local/shared]
- Disaster recovery: [location]

### Service Dependencies
- Services running: [List 30+]
- External services: [List]
- Critical path services: [List]

### Scaling Requirements
- Normal load: [requests/sec]
- Peak load: [requests/sec]
- Growth projection: [increase rate]
```

## Claude Flow V3 Features

### Auto-Learning Integration

Store patterns discovered in your component:

```markdown
## Claude Flow Auto-Learning

### Learned Patterns
- Performance optimization: [Specific technique]
- Error recovery: [Common error pattern]
- Testing strategy: [Effective approach]

### Memory Namespace
```
namespace: project-nyra-[service-name]
patterns:
  - optimization-techniques
  - error-recovery
  - testing-templates
```

### Neural Pattern Training

```bash
# Train on successful patterns
npx @archon-os/cli@latest neural train \
  --pattern-type service-integration \
  --epochs 10

# Predict optimal approach
npx @archon-os/cli@latest neural predict \
  --input "Implement new rate calculation"
```

### Swarm Coordination

Define when and how agents should coordinate:

```markdown
## Swarm Coordination

### When to Spawn Agents
- Major feature implementation: 4-5 agents
- Bug investigation: 2-3 agents
- Performance optimization: 3 agents
- Security audit: 2-3 agents

### Agent Specialization
- Coordinator: [Tech lead]
- Coder: [Developer 1]
- Tester: [QA]
- Reviewer: [Senior developer]
```

## Best Practices

### 1. Keep CLAUDE.md Updated

- Update when architecture changes
- Update when dependencies change
- Update team members
- Review quarterly

```bash
# Schedule quarterly reviews
# Add to team calendar: CLAUDE.md Review Meeting
```

### 2. Link to Runbooks

Point to operational procedures:

```markdown
## Incident Response

- Service down: [Link to runbook]
- High latency: [Link to troubleshooting]
- Data corruption: [Link to recovery]
- Security incident: [Link to security runbook]
```

### 3. Version Your Configuration

Track changes to CLAUDE.md:

```bash
# In your CLAUDE.md
Template Version: 1.0
Last Updated: 2026-01-22
Updated By: [Your Name]
Change History:
- v1.0: Initial configuration
- v1.1: Added MCP integrations
```

### 4. Standardize Across Project Nyra

Maintain consistency:

```markdown
# Consistency Standards

- All services use same error format
- All APIs follow same versioning scheme
- All components log to same system
- All teams use same deployment process
```

### 5. Include Security Checklist

```markdown
## Security Checklist

Before deploying:
- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] Authentication required
- [ ] HTTPS enforced
- [ ] Audit logging enabled
- [ ] Security headers set
- [ ] Dependencies scanned
```

## Examples

### Example 1: Quote Engine Service

Location: `services/quote-engine/CLAUDE.md`

```markdown
# Quote Engine Service Configuration

## Service Overview
- Service Name: Quote Engine
- Purpose: Calculate mortgage quotes with various rate scenarios
- Version: 1.0.0
- Technology: Node.js/Express, TypeScript, PostgreSQL

## Core Functionality
- Endpoint: GET /api/v1/quotes
- Input: Property value, down payment, credit score, loan term
- Processing: Retrieve rates, calculate amortization, apply fees
- Output: Quote with monthly payment, total interest, APR

## Project Nyra Integration
- Consumed by: RateHunter web app, Admin dashboard
- Provides data for: Lead capture, comparison engine
- Part of workflow: User enters details → Gets quotes → Views comparison

## Rate Calculation Algorithm
1. Validate input rates (must be positive, ≤ 12%)
2. Fetch current rates from rate database
3. Calculate amortization with rate + fees
4. Apply property tax based on location
5. Include insurance estimates
6. Format response with payment schedule

## MCP Integrations
- Database MCP: PostgreSQL connection
- Rate Service MCP: Fetch current rates
- Geocoding MCP: Get location data

## Testing Strategy
- Unit tests: Math calculations (95% coverage)
- Integration tests: Full quote flow with mock rates
- E2E tests: From API request to response validation
- Performance: Sub-100ms response time

## Performance Targets
- p50: 50ms
- p95: 100ms
- p99: 200ms
- Throughput: 1000 req/sec

## Error Handling
- Invalid input: Return 400 with field errors
- Rate service down: Use cached rates + warning
- Database error: Return 503 with retry-after
- Timeout: Return 504 after 10s

## Deployment
- Environment: Docker container on Kubernetes
- Port: 3000
- Replicas: 2-10 (auto-scaling)
- Health check: GET /health (every 30s)

## Integration with Claude Flow V3
- Swarm: 2 agents (coder + tester)
- Memory: Store rate patterns, optimization techniques
- Topology: Hierarchical
- Auto-optimization: Suggest caching strategies
```

### Example 2: RateHunter Web Application

Location: `apps/web/ratehunter/CLAUDE.md`

```markdown
# RateHunter Web Application Configuration

## Application Overview
- Application Name: RateHunter
- Purpose: Find and compare mortgage rates from multiple lenders
- Users: Consumers looking for mortgage financing
- Version: 2.0.0

## Technology Stack
- Framework: React 18.2 + Next.js 13
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + CSS Modules
- State: Redux + Redux Toolkit
- Build: Next.js with Webpack

## Key Features
- Rate comparison across 50+ lenders
- Mortgage calculator with payment schedule
- Loan officer finder with contact
- Application tracking
- Document upload and management
- Real-time rate updates

## Project Nyra Integration
- Backend APIs: Quote Engine, Rate Comparison, Lead Capture
- Authentication: Auth Service + JWT
- Admin interface: Admin Dashboard
- Analytics: Segment + Google Analytics
- CRM sync: Send leads to CRM Dashboard

## User Flow
1. User enters property details
2. System queries Quote Engine for rates
3. Results compared with Rate Comparison Engine
4. User selects loan officer
5. Application submitted to Lead Capture API
6. Follow-up email sent via Campaign Engine

## Component Architecture
```
src/
├── components/
│   ├── QuoteCalculator
│   ├── RateComparison
│   ├── LenderDirectory
│   └── ApplicationForm
├── pages/
│   ├── index (Landing)
│   ├── compare (Rate comparison)
│   ├── apply (Application)
│   └── dashboard (User dashboard)
├── services/
│   ├── quoteApi
│   ├── rateComparisonApi
│   ├── authService
│   └── leadCaptureApi
└── state/
    ├── quotes
    ├── user
    └── application
```

## Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3.5s

## SEO Requirements
- Title: Dynamic, includes keywords
- Meta description: 160 characters
- Open Graph: For social sharing
- Structured data: Schema.org for rates
- Sitemap: Auto-generated

## Testing
- Unit tests: Component logic (80% coverage)
- Integration tests: API interactions
- E2E tests: Critical user flows (Cypress)
- Visual regression: Percy

## Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation: Full support
- Screen reader: ARIA labels
- Color contrast: ≥ 4.5:1

## Deployment
- Hosting: Vercel (Auto-scaled)
- CDN: Vercel Edge Network
- Domain: ratehunter.com
- SSL: Auto-renewed
- Preview deployments: On every PR

## Integration with Claude Flow V3
- Swarm: 3 agents (coder, tester, designer)
- Memory: Store user journey patterns, UI improvements
- Auto-optimization: Bundle size recommendations
- A/B testing: Store experiment results
```

### Example 3: Infrastructure Configuration

Location: `infra/CLAUDE.md`

```markdown
# Project Nyra Infrastructure Configuration

## Cluster Overview
- Environment: Production
- Provider: AWS EKS
- Region: us-east-1
- Cluster version: 1.28.x
- Node count: 10-30 (auto-scaling)

## Services Deployed (30+)
- Authentication: auth-service
- APIs: quote-api, rate-comparison, lead-capture, doc-management
- Integrations: github-mcp, gemini-mcp, mem0-mcp, n8n, sendgrid, twilio
- Orchestration: archon-os, serena, nyra-orchestrator
- Observability: prometheus, loki, jaeger
- Databases: PostgreSQL, MongoDB, Redis
- Message queue: RabbitMQ
- Search: Elasticsearch

## High Availability
- Multi-zone: 3 availability zones
- Load balancing: AWS ALB
- Auto-scaling: HPA + Cluster Autoscaler
- Failover: Automatic pod rescheduling

## Monitoring
- Metrics: Prometheus (15d retention)
- Logs: Loki (30d retention)
- Traces: Jaeger (7d retention)
- Dashboards: Grafana
- Alerts: PagerDuty + Slack

## Security
- RBAC: Role-based access control
- Network policies: Calico
- Secrets: AWS Secrets Manager
- Pod security: Non-root, dropped capabilities
- Image scanning: Trivy

## Disaster Recovery
- Backup tool: Velero
- Backup schedule: Daily at 2 AM UTC
- Retention: 30 days
- Test restore: Monthly
- RTO: 4 hours
- RPO: 24 hours

## Integration with Claude Flow V3
- Swarm: 4 agents (DevOps, SRE, security, monitor)
- Memory: Store incident patterns, solutions
- Auto-remediation: Self-healing pods
- Predictive: Load forecasting, cost optimization
```

## Troubleshooting

### Issue: Placeholders Still Remain

**Problem**: After customization, `[text]` placeholders still exist

**Solution**:
```bash
# Find remaining placeholders
grep -n "\[" CLAUDE.md

# Use find/replace in your editor
# Search: \[.*?\]
# Find and replace each one
```

### Issue: Template Too Large/Complex

**Problem**: Template has 400+ lines, too much for small component

**Solution**:
1. Keep only relevant sections
2. Delete unnecessary sections
3. Add note about why sections were removed
4. Focus on your component's key aspects

```markdown
# Note on Template
This is a simplified CLAUDE.md for a small internal tool.
Omitted sections: E2E testing, Kubernetes configuration, multi-tenant support
See TEMPLATE-BASIC-SERVICE.md for full version
```

### Issue: Not Sure What Goes in Section X

**Problem**: Section title doesn't match your component

**Solution**:
1. Review example for similar component type
2. Check root CLAUDE.md for format inspiration
3. Ask on Slack: #archon-os-help
4. Review Claude Flow documentation

### Issue: CLAUDE.md Conflicts Between Root and Component

**Problem**: Both root and component CLAUDE.md exist, which takes precedence?

**Solution**:
```
Precedence Order (top to bottom):
1. Component CLAUDE.md (if exists)
2. Parent directory CLAUDE.md (if exists)
3. Service parent CLAUDE.md (if exists)
4. Root CLAUDE.md (fallback)

Use specific CLAUDE.md to override parent patterns
```

## Quick Reference

### Template Files Available

- TEMPLATE-BASIC-SERVICE.md - Simple service/worker
- TEMPLATE-API-SERVICE.md - REST/GraphQL API with integrations
- TEMPLATE-WEB-APP.md - React/Next.js web application
- TEMPLATE-INFRASTRUCTURE.md - Kubernetes/Docker infrastructure

### Common Commands

```bash
# Validate CLAUDE.md
npx @archon-os/cli@latest validate CLAUDE.md

# Get routing recommendations
npx @archon-os/cli@latest hooks pre-task --description "[task]"

# Store patterns in memory
npx @archon-os/cli@latest memory store --key "pattern-name" --value "description"

# Search for similar configurations
npx @archon-os/cli@latest memory search --query "authentication patterns"
```

### Useful Links

- Template backups: `/docs/templates/claude-md-backups/`
- CLI reference: `npx @archon-os/cli@latest --help`
- V3 documentation: https://github.com/ruvnet/archon-os/wiki
- Project root CLAUDE.md: `/CLAUDE.md`

### Team Contacts

- Claude Flow issues: #archon-os-help
- Template questions: #devops-templates
- General questions: #engineering

---

**Guide Version**: 1.0
**Last Updated**: 2026-01-22
**Maintained By**: DevOps/Platform Team

For more information, see:
- Original CLAUDE.md backup collection: `docs/templates/claude-md-backups/BACKUP-INDEX.md`
- Template examples: `docs/templates/archon-os-wiki/`
- Project Nyra wiki: [internal wiki link]
