# Claude Code Skills Repository

This directory contains Claude Code Skills for Project Nyra, including templates, documentation, and backups.

## Available Skills

### claude-md-manager (v1.0.0)

A comprehensive skill for managing CLAUDE.md template files across the Project Nyra repository.

**Location**: `.claude/skills/claude-md-manager/`
**Backup**: `./claude-md-manager-backup/`

#### What It Does

The `claude-md-manager` skill automates:
- **Template Creation**: Generate CLAUDE.md files from templates (basic, api, service, app, infrastructure)
- **Template Updates**: Upgrade existing CLAUDE.md to V3 standards
- **Validation**: Check compliance with Claude Flow V3 requirements and mortgage compliance standards
- **Backup/Restore**: Safe backup and restore operations with git integration
- **Variable Substitution**: Automatic replacement of project-specific variables
- **Batch Operations**: Apply changes across multiple services efficiently

#### Quick Start

```bash
# List available templates
/claude-md list

# Create new API service CLAUDE.md
/claude-md create \
  --template_type api \
  --target_path services/new-api \
  --project_name "Quote API" \
  --tech_stack "FastAPI,Python" \
  --port 8001

# Validate CLAUDE.md compliance
/claude-md validate --target_path services/auth-service

# Backup all CLAUDE.md files
/claude-md backup --backup_location docs/templates/claude-md-backups/

# Restore from backup
/claude-md restore --target_path services/auth-service
```

#### Templates Included

1. **basic** - Minimal configuration for utilities and scripts
2. **api** - RESTful API service with endpoints and routing
3. **service** - Long-running background service with job processing
4. **app** - Frontend application (React, Next.js, Vue)
5. **infrastructure** - Infrastructure as Code (Docker, Kubernetes, Terraform)

#### Variable Substitution

All templates support variable substitution:
- `{{PROJECT_NAME}}` - Service/project name
- `{{TECH_STACK}}` - Technology stack (e.g., FastAPI,Python)
- `{{PORT}}` - Service port
- `{{DESCRIPTION}}` - Project description
- `{{NAMESPACE}}` - Kubernetes/service namespace
- `{{DATE}}` - Current date (automatic)
- `{{TIMESTAMP}}` - Current timestamp (automatic)
- `{{USER}}` - Current user (automatic)

#### Features

- Production-ready templates
- V3 standards validation
- Mortgage compliance checking
- Git-aware backup/restore
- Dry-run mode
- Batch operations
- Interactive template builder

#### Invocation

```bash
/claude-md <action> [options]

Actions:
  list      - Show available templates
  preview   - Preview template content
  create    - Create new CLAUDE.md
  update    - Update to V3 standards
  validate  - Check compliance
  backup    - Backup all CLAUDE.md files
  restore   - Restore from backup
```

#### Common Workflows

##### Create CLAUDE.md for New Service

```bash
/claude-md create \
  --template_type service \
  --target_path services/document-processor \
  --project_name "Document Processor" \
  --tech_stack "Python,FastAPI" \
  --description "Processes mortgage documents with OCR and validation"
```

##### Create CLAUDE.md for Frontend App

```bash
/claude-md create \
  --template_type app \
  --target_path apps/web \
  --project_name "Nyra Dashboard" \
  --tech_stack "Next.js,React,TypeScript" \
  --description "Mortgage broker admin dashboard"
```

##### Update Existing CLAUDE.md

```bash
/claude-md update --target_path services/auth-service
```

##### Validate Compliance

```bash
/claude-md validate --target_path services/quote-api
```

##### Backup All Files

```bash
/claude-md backup --backup_location docs/templates/claude-md-backups/
```

#### Skill Structure

```
.claude/skills/claude-md-manager/
├── skill.yaml                  # Skill definition
├── prompt.md                   # Detailed usage guide
├── README.md                   # Quick reference
├── templates/
│   ├── basic.md               # Basic template
│   ├── api.md                 # API template
│   ├── service.md             # Service template
│   ├── app.md                 # App template
│   └── infrastructure.md      # Infrastructure template
└── scripts/
    └── validate.js            # Validation logic
```

#### Integration with Claude Flow V3

After creating a CLAUDE.md file, initialize a swarm for that component:

```bash
# Create CLAUDE.md for new service
/claude-md create --template_type api --target_path services/new-api \
  --project_name "New API" --tech_stack "FastAPI,Python" --port 8003

# Store in memory
npx @claude-flow/cli@latest memory store \
  --key "claude-md-new-api" \
  --value "Created CLAUDE.md for New API service" \
  --namespace templates

# Initialize swarm for development
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8
```

#### Best Practices

1. **Always Backup Before Updating**: Use `backup` action before updating existing files
2. **Validate After Creation**: Run `validate` after creating new CLAUDE.md
3. **Use Batch Operations**: Apply changes across multiple services efficiently
4. **Preserve Custom Content**: Update action preserves domain-specific guidance
5. **Version Control**: Commit CLAUDE.md files to version control

#### Troubleshooting

| Issue | Solution |
|-------|----------|
| Template not found | Use `/claude-md list` to see available templates |
| Variable not substituted | Check syntax: `{{VARIABLE_NAME}}` |
| Validation fails | Review report and use `update` to fix issues |
| File already exists | Use `backup` flag or `update` action |

#### Documentation

- **Skill Prompt**: `.claude/skills/claude-md-manager/prompt.md` - Comprehensive usage guide
- **Skill README**: `.claude/skills/claude-md-manager/README.md` - Quick reference
- **Project CLAUDE.md**: `CLAUDE.md` (root) - Overall system architecture
- **Claude Flow V3**: `.claude-flow/CAPABILITIES.md` - V3 documentation

#### Support

For issues or enhancements:
1. Check the comprehensive prompt.md guide
2. Review template examples
3. Test with `--dry-run` flag
4. Store solutions in Project Nyra memory system

## Skill Development Guidelines

### Creating New Skills

1. **Define Skill Structure**:
   ```
   .claude/skills/skill-name/
   ├── skill.yaml        # Skill definition
   ├── prompt.md         # Usage guide
   ├── README.md         # Quick reference
   ├── templates/        # Template files (if applicable)
   ├── scripts/          # Implementation scripts
   └── docs/             # Additional documentation
   ```

2. **Follow V3 Standards**: Use Claude Flow V3 patterns and memory integration

3. **Include Mortgage Compliance**: Reference compliance requirements for mortgage-related skills

4. **Document Thoroughly**: Provide examples and clear instructions

5. **Test Extensively**: Validate across different scenarios

### Skill Template

Use `claude-md-manager` as a reference for skill structure and quality standards.

## Backup Strategy

All skills are backed up to:
- **Location**: `claude-md-manager-backup/`
- **Frequency**: When significant updates are made
- **Retention**: Keep latest 3 versions
- **Git Integration**: Tracked in version control

## Version History

| Skill | Version | Date | Status |
|-------|---------|------|--------|
| claude-md-manager | 1.0.0 | 2026-01-22 | Production Ready |

## Quick Reference

### Skill Installation

Skills are automatically available in Claude Code when placed in `.claude/skills/`.

### Skill Invocation

```bash
# Run skill via Claude Code
/skill-name <action> [options]

# Or via CLI
npx @claude-flow/cli@latest skill run skill-name --action <action>
```

### Testing Skills

```bash
# Test skill with --dry-run
/claude-md create --dry-run true --template_type api --target_path services/test

# Preview without making changes
/claude-md preview --template_type api
```

## Integration with Project Nyra

Skills are part of the Project Nyra development workflow:

1. **Use with Claude Flow V3**: Initialize swarms after creating CLAUDE.md files
2. **Store Patterns**: Save successful patterns to Project Nyra memory system
3. **Leverage Memory**: Use stored patterns in future tasks
4. **Continuous Improvement**: Update skills based on learned patterns

## Support & Resources

- **Claude Code Skills**: `.claude/skills/` directory
- **Claude Flow V3**: `.claude-flow/CAPABILITIES.md`
- **Project Documentation**: `CLAUDE.md` (root)
- **Memory System**: `npx @claude-flow/cli@latest memory search --query "skill patterns"`

## License

Part of Project Nyra. See LICENSE for details.

---

**Last Updated**: 2026-01-22
**Maintained By**: Project Nyra Team
**Claude Flow Version**: V3
