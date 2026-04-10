# CLAUDE.md Template Manager Skill

## Overview

This skill automates the management of CLAUDE.md configuration files across Project Nyra repository. CLAUDE.md files are critical for Claude Code configuration, swarm orchestration, and multi-agent coordination within Claude Flow V3.

## Quick Start

```bash
# List available templates
/claude-md list

# Preview a template
/claude-md preview --template_type api

# Create new CLAUDE.md from template
/claude-md create --template_type api --target_path services/new-api --project_name "Quote API" --tech_stack "FastAPI,Python" --port 8001

# Update existing CLAUDE.md to V3 standards
/claude-md update --target_path services/existing-service

# Validate CLAUDE.md compliance
/claude-md validate --target_path services/any-service

# Backup all CLAUDE.md files
/claude-md backup --backup_location docs/templates/claude-md-backups/

# Restore from backup
/claude-md restore --target_path services/auth-service --backup_location docs/templates/claude-md-backups/
```

## Actions

### list
Display all available templates with descriptions and variable requirements.

**Command**:
```bash
/claude-md list
```

**Output**: Table showing template name, description, variables needed, and recommended use cases.

### preview
Show template preview with placeholder variables highlighted.

**Command**:
```bash
/claude-md preview --template_type api
```

**Output**: Rendered template with `{{VARIABLE}}` placeholders shown.

### create
Create new CLAUDE.md from template with variable substitution.

**Variables**:
- `{{PROJECT_NAME}}` - Service/app name
- `{{TECH_STACK}}` - Technology (FastAPI, NestJS, React, etc.)
- `{{PORT}}` - Service port
- `{{DESCRIPTION}}` - Short description
- `{{NAMESPACE}}` - K8s namespace or service namespace
- `{{REPO_PATH}}` - Relative path in repository

**Command**:
```bash
/claude-md create --template_type api --target_path services/new-api \
  --project_name "Quote API" \
  --tech_stack "FastAPI,Python" \
  --port 8001
```

**Result**: Creates `services/new-api/CLAUDE.md` with all variables substituted.

### update
Update existing CLAUDE.md to latest V3 standards and validate compliance.

**Features**:
- Validates current file against V3 requirements
- Adds missing sections (auto-learning, performance targets, etc.)
- Preserves custom content in marked sections
- Creates backup before modification

**Command**:
```bash
/claude-md update --target_path services/existing-service
```

**Result**: Updated CLAUDE.md with new V3 features added, old content preserved.

### validate
Validate CLAUDE.md against V3 standards and compliance requirements.

**Checks**:
- Required sections present (overview, swarm config, agent routing, etc.)
- Valid YAML/markdown syntax
- Mortgage compliance standards (if applicable)
- Memory system configuration
- Agent types referenced exist in V3
- No deprecated patterns

**Command**:
```bash
/claude-md validate --target_path services/auth-service
```

**Result**: Validation report with warnings and suggestions.

### backup
Backup all CLAUDE.md files from repository to secure location.

**Features**:
- Recursive discovery of all CLAUDE.md files
- Preserves directory structure
- Git commit with timestamp
- Excludes root CLAUDE.md if desired
- Compression support

**Command**:
```bash
/claude-md backup --backup_location docs/templates/claude-md-backups/
```

**Result**: All CLAUDE.md files backed up with git commit.

### restore
Restore CLAUDE.md from backup, with safety checks.

**Features**:
- Backup of current file before restore
- Selective restoration (single file or all)
- Version selection
- Merge capability (preserve custom content)

**Command**:
```bash
/claude-md restore --target_path services/auth-service --backup_location docs/templates/claude-md-backups/
```

**Result**: Restored CLAUDE.md with pre-restore version backed up.

## Template Types

### basic
Minimal configuration for simple utilities and scripts.

**Use For**: Small utilities, helpers, scripts
**Includes**:
- Swarm initialization (minimal)
- Task complexity detection
- File organization
- Basic routing

**Variables**: {{PROJECT_NAME}}, {{DESCRIPTION}}

### api
RESTful API service configuration with endpoints and routing.

**Use For**: FastAPI services, Express/NestJS APIs
**Includes**:
- API routing patterns
- Request/response handling
- Error handling strategies
- Rate limiting and throttling
- Endpoint documentation
- Port configuration

**Variables**: {{PROJECT_NAME}}, {{TECH_STACK}}, {{PORT}}, {{DESCRIPTION}}

### service
Long-running background service configuration.

**Use For**: Worker services, batch processors, schedulers
**Includes**:
- Health check patterns
- Resource management
- Logging and monitoring
- Signal handling
- Retry strategies
- Service discovery

**Variables**: {{PROJECT_NAME}}, {{TECH_STACK}}, {{NAMESPACE}}, {{DESCRIPTION}}

### app
Frontend application configuration (React, Next.js, Vue).

**Use For**: Web applications, dashboards, client apps
**Includes**:
- Component architecture
- State management patterns
- Build and deployment
- Performance optimization
- Responsive design guidelines
- Testing strategies

**Variables**: {{PROJECT_NAME}}, {{TECH_STACK}}, {{DESCRIPTION}}, {{NAMESPACE}}

### infrastructure
Infrastructure as Code and DevOps configuration.

**Use For**: Docker Compose, Kubernetes, Terraform
**Includes**:
- Service orchestration
- Networking patterns
- Storage configuration
- Security best practices
- Monitoring setup
- Disaster recovery

**Variables**: {{PROJECT_NAME}}, {{DESCRIPTION}}, {{NAMESPACE}}

## Variable Substitution

All templates support variable substitution using `{{VARIABLE_NAME}}` syntax.

**Automatic Variables**:
- `{{DATE}}` - Current date
- `{{TIMESTAMP}}` - Current timestamp
- `{{USER}}` - Current user
- `{{REPO_ROOT}}` - Project root path

**User-Provided Variables**:
- `{{PROJECT_NAME}}` - Service/project name
- `{{TECH_STACK}}` - Technology stack
- `{{PORT}}` - Service port
- `{{DESCRIPTION}}` - Project description
- `{{NAMESPACE}}` - Kubernetes/service namespace

## Examples

### Example 1: Create API Service CLAUDE.md
```bash
/claude-md create \
  --template_type api \
  --target_path services/quote-api \
  --project_name "Quote API Service" \
  --tech_stack "FastAPI,Python" \
  --port 8002 \
  --description "Mortgage quote calculation service with multi-lender integration"
```

**Creates**: `services/quote-api/CLAUDE.md` with:
- FastAPI-specific patterns
- Port 8002 configuration
- Quote API domain knowledge
- Error handling for financial calculations
- Compliance validation patterns

### Example 2: Create Next.js App CLAUDE.md
```bash
/claude-md create \
  --template_type app \
  --target_path apps/web \
  --project_name "Nyra Dashboard" \
  --tech_stack "Next.js,React,TypeScript" \
  --description "Mortgage broker admin dashboard with real-time lead management"
```

**Creates**: `apps/web/CLAUDE.md` with:
- Next.js App Router patterns
- Server/Client Component guidance
- Zustand state management
- Tailwind CSS conventions
- Real-time data handling (WebSockets)

### Example 3: Update Service CLAUDE.md
```bash
/claude-md update --target_path services/auth-service
```

**Result**:
- Analyzes current CLAUDE.md
- Adds missing V3 sections
- Preserves custom domain guidance
- Validates against current architecture

### Example 4: Backup All CLAUDE.md Files
```bash
/claude-md backup --backup_location docs/templates/claude-md-backups/
```

**Creates**:
```
docs/templates/claude-md-backups/
├── backup-2026-01-22-144530/
│   ├── root/CLAUDE.md
│   ├── services/
│   │   ├── auth-service/CLAUDE.md
│   │   ├── quote-api/CLAUDE.md
│   │   └── campaign-engine/CLAUDE.md
│   ├── apps/
│   │   ├── web/CLAUDE.md
│   │   └── landing/CLAUDE.md
│   └── README.md
└── latest -> backup-2026-01-22-144530
```

### Example 5: Validate Multiple Services
```bash
# Validate single service
/claude-md validate --target_path services/quote-api

# Validate all services (batch)
for service in services/*/; do
  /claude-md validate --target_path "$service"
done
```

**Output**: Validation report with:
- Section completeness
- V3 compliance status
- Mortgage standard adherence
- Warnings and suggestions
- Compliance violations (if any)

### Example 6: Restore from Backup
```bash
/claude-md restore \
  --target_path services/auth-service \
  --backup_location docs/templates/claude-md-backups/
```

**Result**: Restores from most recent backup, saves current version first.

## Mortgage Compliance

All templates include mandatory compliance sections for mortgage operations:

- **TILA/RESPA Disclosure**: Disclosure generation and validation
- **Anti-Steering**: Loan product recommendation guidelines
- **Fair Lending**: Protected class considerations
- **State Regulations**: Multi-state compliance tracking
- **Audit Logging**: Complete audit trail requirements

Ensure mortgage-related services use compliance-enhanced templates.

## Advanced Usage

### Batch Create Templates
```bash
# Create CLAUDE.md for all services
for service in services/*/; do
  service_name=$(basename "$service")
  /claude-md create \
    --template_type service \
    --target_path "$service" \
    --project_name "$service_name" \
    --tech_stack "Python,FastAPI"
done
```

### Merge Templates
Combine multiple templates for complex services:
```bash
/claude-md create \
  --template_type api \
  --target_path services/hybrid \
  --project_name "Hybrid Service"
  # Can be extended to combine with service template
```

### Dry-Run Mode
Preview changes before applying:
```bash
/claude-md create \
  --template_type api \
  --target_path services/new-api \
  --project_name "Test API" \
  --dry-run true
```

## Integration with Claude Flow

This skill integrates with Claude Flow V3:

```bash
# After creating CLAUDE.md, initialize swarm for that service
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 8

# Store pattern in memory
npx @archon-os/cli@latest memory store \
  --key "claude-md-service-api" \
  --value "[content of created CLAUDE.md]" \
  --namespace templates
```

## Troubleshooting

### Template Not Found
Ensure template name is one of: basic, api, service, app, infrastructure

### Variable Not Substituted
Check variable name matches syntax: `{{VARIABLE_NAME}}`

### CLAUDE.md Already Exists
Use `--backup` flag to create backup before overwriting, or use `update` action

### Validation Fails
Review validation report for missing sections or deprecated patterns. Use `update` action to fix.

## Support

For issues or template requests, create an issue with template details and use case.

Template version: 1.0.0
Last updated: 2026-01-22
