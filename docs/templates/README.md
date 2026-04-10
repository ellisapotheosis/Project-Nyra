# CLAUDE.md Templates & Backup System

Comprehensive template and backup system for Project Nyra CLAUDE.md configurations with Claude Flow V3 integration.

## Quick Start

### I want to...

- **Find a backup of a specific CLAUDE.md file** → Go to [`claude-md-backups/BACKUP-INDEX.md`](./claude-md-backups/BACKUP-INDEX.md)
- **Create a new CLAUDE.md for my component** → See [Template Selection](#template-selection)
- **Customize an existing CLAUDE.md** → Read [`CLAUDE-MD-CUSTOMIZATION-GUIDE.md`](./CLAUDE-MD-CUSTOMIZATION-GUIDE.md)
- **See examples from Project Nyra** → Check [`CLAUDE-MD-CUSTOMIZATION-GUIDE.md#examples`](./CLAUDE-MD-CUSTOMIZATION-GUIDE.md#examples)
- **View all available templates** → Browse [`archon-os-wiki/`](./archon-os-wiki/)

## Directory Structure

```
docs/templates/
├── README.md                                  (this file)
├── CLAUDE-MD-CUSTOMIZATION-GUIDE.md          (Comprehensive guide)
├── claude-md-backups/                         (Backup archive)
│   ├── BACKUP-INDEX.md                       (Master index of 64 files)
│   ├── apps/                                 (12 app configurations)
│   ├── services/                             (30 service configurations)
│   ├── infra/                                (11 infrastructure configs)
│   ├── tools/                                (2 tool configurations)
│   └── root/                                 (9 root-level configs)
├── archon-os-wiki/                         (Template library)
│   ├── TEMPLATE-BASIC-SERVICE.md             (Simple service template)
│   ├── TEMPLATE-API-SERVICE.md               (API service template)
│   ├── TEMPLATE-WEB-APP.md                   (Web app template)
│   └── TEMPLATE-INFRASTRUCTURE.md            (Infrastructure template)
└── examples/                                  (coming soon)
    ├── services/
    ├── applications/
    ├── infrastructure/
    └── migration-guide.md
```

## Overview

### What's Included

This system provides:

1. **Backup Archive** (64 files)
   - All CLAUDE.md files from Project Nyra
   - Organized by component type
   - Indexed and searchable
   - Maintained for reference and restoration

2. **Template Library** (4 templates)
   - Basic Service template
   - API Service template with MCP integration
   - Web Application template
   - Infrastructure template

3. **Customization Guide**
   - How to adapt templates for your component
   - Variable substitution guide
   - Project Nyra-specific integration patterns
   - Best practices and examples
   - Troubleshooting

4. **Documentation**
   - This README
   - BACKUP-INDEX.md (detailed file listing)
   - Inline template documentation

## Template Selection

### Quick Decision Guide

| You're configuring... | Use This Template |
|------|---------|
| REST API, microservice, simple backend | TEMPLATE-BASIC-SERVICE.md |
| Complex API with multiple integrations, database, external services | TEMPLATE-API-SERVICE.md |
| React/Next.js web application, dashboard, UI | TEMPLATE-WEB-APP.md |
| Kubernetes cluster, infrastructure, container orchestration | TEMPLATE-INFRASTRUCTURE.md |

### Component Types in Project Nyra

#### Applications (Use TEMPLATE-WEB-APP.md)
- apps/web/ratehunter/
- apps/web/nyra-admin/
- apps/web/mortgage-assistant/
- apps/nexus-dashboard/
- apps/landing/

#### Services (Use TEMPLATE-BASIC-SERVICE.md or TEMPLATE-API-SERVICE.md)
- services/auth-service/ (TEMPLATE-API-SERVICE.md)
- services/quote-api/ (TEMPLATE-API-SERVICE.md)
- services/rate-comparison-engine/ (TEMPLATE-API-SERVICE.md)
- services/campaign-engine/ (TEMPLATE-BASIC-SERVICE.md)
- services/[30+ other services]

#### Infrastructure (Use TEMPLATE-INFRASTRUCTURE.md)
- infra/
- infra/cluster-setup/
- infra/monitoring/
- infra/database/

## Getting Started

### Step 1: Find Your Component's Type

Is your component an **Application**, **Service**, or **Infrastructure** component?

```bash
# Example: Adding CLAUDE.md to Quote API service
$ cd services/quote-api/
$ ls -la
# If CLAUDE.md doesn't exist, we need to create one
```

### Step 2: Select Appropriate Template

```bash
# Quote API is an API service with database and integrations
# Use: TEMPLATE-API-SERVICE.md

cp docs/templates/archon-os-wiki/TEMPLATE-API-SERVICE.md ./CLAUDE.md
```

### Step 3: Customize for Your Component

Open the newly created `CLAUDE.md` and replace placeholders:

```bash
# Replace [name] with "Quote Engine"
# Replace [language] with "TypeScript"
# Replace [database] with "PostgreSQL"
# Add Project Nyra-specific integration details
# Remove sections that don't apply
```

See [`CLAUDE-MD-CUSTOMIZATION-GUIDE.md`](./CLAUDE-MD-CUSTOMIZATION-GUIDE.md) for detailed instructions.

### Step 4: Validate Your Configuration

```bash
# Validate syntax and completeness
npx @archon-os/cli@latest validate CLAUDE.md

# Get AI agent routing recommendations
npx @archon-os/cli@latest hooks pre-task --description "Review Quote API implementation"
```

## Key Features

### Integration with Claude Flow V3

All templates support advanced features:

- **3-Tier Model Routing**: Automatic optimization of agent model selection (Tier 1: Agent Booster, Tier 2: Haiku, Tier 3: Sonnet/Opus)
- **Auto-Learning**: Neural pattern training and memory consolidation
- **Swarm Orchestration**: Multi-agent coordination with hierarchical topology
- **HNSW Vector Search**: 150x-12,500x faster pattern matching
- **Memory Management**: Persistent cross-session learning

Example:
```markdown
## Claude Flow Integration

### Swarm Coordination
- When to spawn: Feature implementation (4 agents)
- Topology: Hierarchical
- Max agents: 8
- Strategy: Specialized (coder, tester, reviewer, coordinator)

### Memory & Learning
- Store patterns: Service-specific optimizations
- Learn from: Successful deployments, error patterns
- Predict: Resource requirements, performance bottlenecks
- Optimize: Caching strategies, API design
```

### Backup & Recovery

All 64 original CLAUDE.md files are backed up and organized:

```bash
# Access backups by category
cat docs/templates/claude-md-backups/apps/web/ratehunter/CLAUDE.md

# Search for specific service
find docs/templates/claude-md-backups -name "*quote*" -type f

# Restore a service configuration
cp docs/templates/claude-md-backups/services/services/quote-api/CLAUDE.md services/quote-api/CLAUDE.md
```

## Best Practices

### 1. Customize, Don't Copy Blindly

Adapt templates to your component's specific needs. Delete irrelevant sections.

```markdown
# Good: Customized for your service
Service Name: Quote Engine
Language: TypeScript
Framework: Express
Database: PostgreSQL
Purpose: Calculate mortgage quotes with various rate scenarios
```

```markdown
# Bad: Generic, not customized
Service Name: [name]
Language: [TypeScript/Python/etc]
Framework: [Express/FastAPI/etc]
Database: [PostgreSQL/MongoDB/etc]
Purpose: [description]
```

### 2. Keep CLAUDE.md Updated

Update when architecture, team, or patterns change:

```markdown
Last Updated: 2026-01-22
Updated By: John Smith
Changes:
- Added MCP integrations for rate service
- Updated performance targets
- Added swarm coordination details
```

### 3. Link to Runbooks & Documentation

Point to operational procedures:

```markdown
## Support & Escalation

- Slack channel: #quote-engine-dev
- Runbook: https://wiki.example.com/quote-engine-runbook
- Troubleshooting: https://wiki.example.com/quote-engine-troubleshooting
- On-call: [Team member]
```

### 4. Include Security Checklist

```markdown
## Security Checklist

Before deployment:
- [ ] No secrets in code or git history
- [ ] Input validation on all endpoints
- [ ] Authentication/authorization required
- [ ] HTTPS/TLS enabled
- [ ] Audit logging configured
- [ ] Dependencies scanned for CVEs
- [ ] Rate limiting implemented
```

### 5. Document Project Nyra Integration

```markdown
## Project Nyra Integration

### This Service's Role
- Consumed by: RateHunter app, Admin dashboard
- Provides: Quote calculations with multiple rates
- Part of workflow: User enters details → Gets quotes → Compares rates

### Dependencies
- Upstream: auth-service, rate-database-mcp
- Downstream: rate-comparison-engine, lead-capture-api
- Horizontal: dashboard-sync-service

### Communication Patterns
- Request/response: REST API (HTTP)
- Events: Message queue for lead submissions
- Real-time: WebSocket for rate updates
```

## Examples & Patterns

### Service Integration Pattern

```markdown
## MCP Integration Example

### Rate Service MCP
```javascript
const rateService = await initializeMCP('rate-service', {
  endpoint: process.env.RATE_SERVICE_URL,
  auth: process.env.RATE_SERVICE_API_KEY,
  timeout: 5000
});

const rates = await rateService.getCurrentRates({
  lenderIds: ['lender-1', 'lender-2'],
  cacheMaxAge: 3600
});
```

### Error Handling Pattern

```markdown
## Error Handling Strategy

| Error | HTTP Status | Response | Recovery |
|-------|------------|----------|----------|
| Invalid input | 400 | Validation errors | User retries |
| Missing rate data | 503 | Retry-After | Use cached rates |
| Database timeout | 504 | Gateway timeout | Auto-retry with backoff |
| Rate service down | 502 | Cached result | Use last known rate |
```

### Swarm Coordination Pattern

```markdown
## When to Spawn Agents

| Scenario | Agents | Topology | Duration |
|----------|--------|----------|----------|
| Bug fix | Researcher + Coder + Tester | Hierarchical | 1-2 hours |
| New feature | Architect + Coders (2) + Tester + Reviewer | Hierarchical | 1-3 days |
| Performance | Perf-engineer + Coder | Hierarchical | 2-4 hours |
| Security audit | Security-architect + Auditor + Coder | Hierarchical | 4-8 hours |
```

## Troubleshooting

### Issue: Can't find a specific CLAUDE.md

**Solution**: Check [`claude-md-backups/BACKUP-INDEX.md`](./claude-md-backups/BACKUP-INDEX.md) for complete listing.

```bash
# Search backups
grep -r "service-name" docs/templates/claude-md-backups/

# List by category
ls docs/templates/claude-md-backups/services/services/
```

### Issue: Template is too long/not suitable

**Solution**: Pick sections relevant to your component and delete the rest.

```markdown
# Example: Minimal CLAUDE.md for internal tool

# Tool Configuration

## Overview
- Purpose: [description]
- Tech: [language/framework]
- Team: [owner]

## Development
- Tests: npm test
- Linting: npm run lint
- Deployment: CI/CD via GitHub Actions

## Support
- Slack: #internal-tools
```

### Issue: Need help customizing

**Solution**: Check the comprehensive guide and examples.

1. Read: [`CLAUDE-MD-CUSTOMIZATION-GUIDE.md`](./CLAUDE-MD-CUSTOMIZATION-GUIDE.md)
2. Compare: Find similar component in [`claude-md-backups/`](./claude-md-backups/)
3. Review: See examples in customization guide
4. Ask: Post in #archon-os-help

### Issue: CLAUDE.md conflicts between directories

**Solution**: Component CLAUDE.md takes precedence over parent directories.

```
Precedence (top to bottom):
1. Component's own CLAUDE.md (services/auth-service/CLAUDE.md)
2. Parent service CLAUDE.md (services/CLAUDE.md)
3. Root CLAUDE.md (CLAUDE.md)

Use component-level to override parent settings
```

## Maintenance

### Quarterly Review

Update all CLAUDE.md files quarterly:

```bash
# Find all CLAUDE.md files
find . -name "CLAUDE.md" -type f | grep -v "docs/templates"

# Add to team calendar as recurring meeting
# Review: Changes, team updates, new patterns
```

### Backup Rotation

Keep backups current:

```bash
# Monthly backup of current CLAUDE.md files
npx @archon-os/cli@latest memory store \
  --key "claude-md-backup-$(date +%Y-%m)" \
  --value "all-current-configurations" \
  --namespace backups
```

## Integration with Claude Flow CLI

### Useful Commands

```bash
# Validate your CLAUDE.md
npx @archon-os/cli@latest validate CLAUDE.md

# Get AI routing recommendations for tasks
npx @archon-os/cli@latest hooks pre-task \
  --description "Implement new quote calculation feature"

# Store patterns in memory
npx @archon-os/cli@latest memory store \
  --key "quote-calculation-pattern" \
  --value "Multi-currency with rate adjustment" \
  --namespace service-patterns

# Search for similar patterns
npx @archon-os/cli@latest memory search \
  --query "rate calculation algorithms"
```

## Resources

### Documentation
- Claude Flow Wiki: https://github.com/ruvnet/archon-os/wiki
- Project Nyra Wiki: [internal link]
- API Documentation: [internal link]

### Files
- Backup index: [`claude-md-backups/BACKUP-INDEX.md`](./claude-md-backups/BACKUP-INDEX.md)
- Full guide: [`CLAUDE-MD-CUSTOMIZATION-GUIDE.md`](./CLAUDE-MD-CUSTOMIZATION-GUIDE.md)
- Templates: [`archon-os-wiki/`](./archon-os-wiki/)

### Support Channels
- Questions: #archon-os-help
- Issues: GitHub issues with tag `claude-md`
- Suggestions: #devops-templates

## Contributing

Found an issue or have suggestions?

1. Check this README
2. Review the customization guide
3. Check troubleshooting section
4. Ask in #archon-os-help or create an issue

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-22 | Initial system creation with 64 backups, 4 templates, comprehensive guide |

---

**Maintained By**: DevOps/Platform Team
**Last Updated**: 2026-01-22
**Files**: 64 backups + 4 templates + 2 guides + README

For questions, feedback, or contributions, reach out on #archon-os-help or contact the DevOps team.
