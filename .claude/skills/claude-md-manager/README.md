# CLAUDE.md Template Manager Skill

## Overview

The CLAUDE.md Template Manager Skill provides automated template management for CLAUDE.md configuration files across Project Nyra. CLAUDE.md files are essential for Claude Code configuration and multi-agent coordination in Claude Flow V3.

## Installation

The skill is located at `.claude/skills/claude-md-manager/` and is automatically available within Claude Code.

## Quick Reference

| Action | Purpose | Example |
|--------|---------|---------|
| `list` | Show available templates | `/claude-md list` |
| `preview` | Preview template content | `/claude-md preview --template_type api` |
| `create` | Create new CLAUDE.md | `/claude-md create --template_type api --target_path services/new-api --project_name "Quote API" --tech_stack "FastAPI,Python" --port 8001` |
| `update` | Update to V3 standards | `/claude-md update --target_path services/existing-service` |
| `validate` | Check compliance | `/claude-md validate --target_path services/auth-service` |
| `backup` | Backup all CLAUDE.md files | `/claude-md backup --backup_location docs/templates/claude-md-backups/` |
| `restore` | Restore from backup | `/claude-md restore --target_path services/auth-service` |

## Templates Included

### 1. **basic**
Minimal configuration for utilities and simple scripts.
- Swarm initialization (minimal)
- Task complexity detection
- File organization
- Basic routing

### 2. **api**
RESTful API service configuration.
- API routing patterns
- Request/response handling
- Error handling strategies
- Rate limiting
- Endpoint documentation
- Port configuration

### 3. **service**
Long-running background service configuration.
- Health check patterns
- Resource management
- Logging and monitoring
- Signal handling
- Retry strategies

### 4. **app**
Frontend application configuration (React, Next.js).
- Component architecture
- State management patterns
- Build and deployment
- Performance optimization
- Testing strategies

### 5. **infrastructure**
Infrastructure as Code configuration.
- Service orchestration
- Networking patterns
- Storage configuration
- Security best practices
- Monitoring setup

## Variable Substitution

Templates support variable substitution using `{{VARIABLE_NAME}}` syntax:

**Supported Variables**:
- `{{PROJECT_NAME}}` - Service/project name
- `{{TECH_STACK}}` - Technology stack (e.g., FastAPI,Python)
- `{{PORT}}` - Service port
- `{{DESCRIPTION}}` - Project description
- `{{NAMESPACE}}` - Kubernetes/service namespace
- `{{DATE}}` - Current date (auto)
- `{{TIMESTAMP}}` - Current timestamp (auto)
- `{{USER}}` - Current user (auto)

## Common Workflows

### Create API Service CLAUDE.md
```bash
/claude-md create \
  --template_type api \
  --target_path services/quote-api \
  --project_name "Quote API" \
  --tech_stack "FastAPI,Python" \
  --port 8002 \
  --description "Mortgage quote calculation service"
```

### Create Frontend App CLAUDE.md
```bash
/claude-md create \
  --template_type app \
  --target_path apps/web \
  --project_name "Nyra Dashboard" \
  --tech_stack "Next.js,React,TypeScript" \
  --description "Mortgage broker admin dashboard"
```

### Update Existing CLAUDE.md
```bash
/claude-md update --target_path services/auth-service
```

### Validate Compliance
```bash
/claude-md validate --target_path services/quote-api
```

### Backup All CLAUDE.md Files
```bash
/claude-md backup --backup_location docs/templates/claude-md-backups/
```

### Restore from Backup
```bash
/claude-md restore \
  --target_path services/auth-service \
  --backup_location docs/templates/claude-md-backups/
```

## Features

- 5 Production-Ready Templates
- Variable Interpolation System
- V3 Standards Validation
- Git-Aware Backup/Restore
- Dry-Run Mode
- Interactive Template Builder
- Mortgage Compliance Integration
- Batch Operations

## File Structure

```
.claude/skills/claude-md-manager/
├── skill.yaml              # Skill definition
├── prompt.md               # Skill instructions
├── README.md               # This file
├── templates/
│   ├── basic.md           # Basic template
│   ├── api.md             # API service template
│   ├── service.md         # Background service template
│   ├── app.md             # Frontend app template
│   └── infrastructure.md  # Infrastructure template
└── scripts/
    └── validate.js        # Validation logic
```

## Integration with Claude Flow

After creating a CLAUDE.md file, you can initialize a swarm for that component:

```bash
# Create CLAUDE.md
/claude-md create --template_type api --target_path services/new-api \
  --project_name "New API" --tech_stack "FastAPI,Python" --port 8003

# Store in memory
npx @archon-os/cli@latest memory store \
  --key "claude-md-new-api" \
  --value "Created CLAUDE.md for New API service" \
  --namespace templates

# Initialize swarm
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 8
```

## Mortgage Compliance

All templates include compliance sections for mortgage operations:

- TILA/RESPA Disclosure validation
- Anti-steering policy enforcement
- Fair lending law compliance
- State-specific regulations
- CFPB examination standards
- Complete audit logging

## Best Practices

1. **Always Backup Before Update**: Use `backup` action before updating existing CLAUDE.md
2. **Validate After Create**: Run `validate` after creating new CLAUDE.md files
3. **Use Batch Operations**: Apply changes across multiple services efficiently
4. **Preserve Custom Content**: Update action preserves domain-specific guidance
5. **Version Control**: Commit backed-up CLAUDE.md files to version control

## Troubleshooting

### Template Not Found
Available templates: basic, api, service, app, infrastructure

### Variable Not Substituted
Ensure variable syntax is correct: `{{VARIABLE_NAME}}`

### Validation Failures
Check validation report and use `update` action to fix issues

### File Already Exists
Use `backup` flag to preserve existing file before overwriting

## Template Development

To create custom templates, follow the structure of existing templates in `templates/` directory. Variables should use `{{VARIABLE_NAME}}` format for proper substitution.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-22 | Initial release with 5 base templates |

## Support & Documentation

- **Project Nyra Documentation**: `CLAUDE.md` (root)
- **Claude Flow V3 Docs**: `.archon-os/CAPABILITIES.md`
- **Skill Prompt**: `prompt.md` (detailed usage guide)

## License

Part of Project Nyra. See LICENSE for details.

---

**Remember**: CLAUDE.md files drive Claude Code configuration and agent coordination. Keep them up-to-date and validated!
