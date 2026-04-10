# Bootstrap Agent Skill

**Version**: 1.0.0
**Status**: Production Ready ✅

## Overview

Comprehensive initialization system for creating properly configured directories with custom CLAUDE.md files, configurations, environments, and workflows using Claude Flow wiki templates and examples.

## Features

- ✅ Custom CLAUDE.md tailored to tech stack
- ✅ Multi-source template loading (Custom → Wiki → Default)
- ✅ Environment configurations (.env templates)
- ✅ Claude Flow workflows
- ✅ Memory bank initialization
- ✅ Tech stack specific guidelines
- ✅ Development commands
- ✅ Agent recommendations
- ✅ Batch initialization support
- ✅ Dry-run mode
- ✅ Context injection

## Installation

```bash
# As a skill (automatic via Claude Code)
# No installation needed when used as a skill

# For standalone use
cd .claude/skills/bootstrap-agent
npm link
```

## Usage

### Via Claude Code Skill

```bash
/bootstrap-agent create <path> <profile> [options]
/bootstrap-agent batch --config=<file>
```

### Standalone CLI

```bash
# Bootstrap single directory
node batch-init.js create ./apps/new-app nextjs-typescript --port=3005

# Batch bootstrap
node batch-init.js batch --config=batch-init.json

# Dry run (preview)
node batch-init.js create ./test nextjs-typescript --dry-run --verbose
```

## Available Profiles

### Web Applications
- `nextjs-typescript` - Next.js 14 + TypeScript + App Router
- `react-typescript` - React 18 + TypeScript + Vite
- `react-native` - React Native mobile apps
- `vue-typescript` - Vue 3 + TypeScript + Vite
- `angular-typescript` - Angular + TypeScript

### Backend Services
- `python-fastapi` - FastAPI + Python 3.11
- `nodejs-express` - Express + TypeScript
- `java-spring` - Spring Boot + Java
- `go-gin` - Gin + Go
- `rust-actix` - Actix + Rust

### Infrastructure & DevOps
- `docker-infra` - Docker Compose infrastructure
- `kubernetes` - Kubernetes manifests
- `terraform` - Terraform IaC
- `ci-cd` - GitHub Actions workflows

### Specialized
- `nodejs-mcp` - MCP server development
- `nodejs-python` - Hybrid Node.js + Python
- `documentation` - Documentation sites
- `scripts` - Automation scripts
- `monorepo-root` - Monorepo configuration

### Data & AI
- `data-science` - Jupyter + Python + ML libs
- `machine-learning` - ML model training/deployment
- `ai-agents` - AI agent development

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Application name | Directory name |
| `--description` | App description | Auto-generated |
| `--port` | Service port | Auto-assigned |
| `--dry-run` | Preview without creating | false |
| `--verbose, -v` | Verbose output | false |
| `--skip-memory` | Skip memory-bank.md | false |
| `--skip-workflows` | Skip workflow files | false |

## Examples

### Single Directory Bootstrap

```bash
# Basic Next.js app
node batch-init.js create ./apps/dashboard nextjs-typescript

# With custom options
node batch-init.js create ./apps/analytics react-typescript \
  --name="Analytics Dashboard" \
  --description="Real-time analytics and reporting" \
  --port=3006

# Python API service
node batch-init.js create ./services/auth-api python-fastapi \
  --name="Authentication API" \
  --port=8001

# Infrastructure setup
node batch-init.js create ./infra/monitoring docker-infra
```

### Batch Initialization

Create `batch-config.json`:

```json
[
  {
    "path": "./apps/customer-portal",
    "profile": "nextjs-typescript",
    "context": {
      "appName": "Customer Portal",
      "port": "3010",
      "description": "Customer-facing portal application"
    }
  },
  {
    "path": "./services/notification-service",
    "profile": "python-fastapi",
    "context": {
      "appName": "Notification Service",
      "port": "8002",
      "description": "Email and SMS notification service"
    }
  }
]
```

Run batch:

```bash
node batch-init.js batch --config=batch-config.json
```

## What Gets Created

```
<target-directory>/
├── CLAUDE.md              # Custom AI context
├── memory-bank.md         # Memory/context tracking
├── .env.template          # Environment template
└── .workflows/            # Claude Flow workflows
    ├── development.json
    ├── testing.json
    └── deployment.json
```

## Template Sources

This skill uses a priority-based template loading system:

1. **Custom Templates** (`docs/references/templates-library/stacks/`)
   - Project-specific customizations
   - Highest priority

2. **Claude Flow Wiki Templates** (`docs/references/archon-os-wiki/`)
   - Official CLAUDE-MD-*.md templates
   - 50+ templates for different tech stacks
   - Medium priority

3. **Default Fallback**
   - Generic template when no specific match found
   - Lowest priority

## Architecture

```
bootstrap-agent/
├── batch-init.js              # CLI driver
├── batch-template-engine.js   # Template engine
├── package.json               # Package config
├── skill.md                   # Skill definition
├── README.md                  # This file
└── templates/
    └── CLAUDE.md              # Base template
```

### Template Engine Flow

1. Load directory manifest
2. For each directory:
   - Load base template
   - Load tech stack template (Custom → Wiki → Default)
   - Load workflow examples from archon-os-clone
   - Load config examples
   - Inject context variables
   - Generate CLAUDE.md
   - Generate memory-bank.md
   - Generate .workflows/
   - Generate .env.template

## Integration

### With Claude Code

```bash
# Use as a skill
/bootstrap-agent create ./apps/new-feature nextjs-typescript
```

### With Claude Flow

The generated files automatically integrate with Claude Flow:

- CLAUDE.md provides project context
- .workflows/ contains automation workflows
- memory-bank.md tracks session context
- Recommended agents for each tech stack

### With Existing Projects

```bash
# Re-bootstrap existing directory (preserves customizations)
node batch-init.js create ./existing-app nextjs-typescript --merge
```

## Customization

### Adding Custom Profiles

1. Create template file:
```bash
echo "## My Custom Stack Guidelines" > docs/references/templates-library/stacks/my-stack.md
```

2. Use in bootstrap:
```bash
node batch-init.js create ./apps/my-app my-stack
```

### Customizing Base Template

Edit `templates/CLAUDE.md` to change the base structure.

### Adding Custom Workflows

Add workflow examples to `docs/references/archon-os-examples/02-workflows/`

## Troubleshooting

### Profile Not Found

```bash
# List available profiles (check wiki and custom directories)
ls docs/references/archon-os-wiki/CLAUDE-MD-*.md
ls docs/references/templates-library/stacks/*.md

# Use closest match or create custom template
```

### Permission Errors

```bash
# Check directory permissions
# Ensure target directory is writable
```

### Template Loading Issues

```bash
# Run with verbose flag to see which templates are loaded
node batch-init.js create ./test nextjs-typescript --dry-run --verbose
```

## Performance

- **Generation Time**: <1 second per directory
- **File Size**: ~2-4KB per CLAUDE.md
- **Dependencies**: None (pure Node.js)
- **Template Sources**: 50+ wiki templates + custom templates

## Contributing

To add new profiles:

1. Create template in `docs/references/templates-library/stacks/`
2. Follow existing template format
3. Test with `--dry-run`
4. Document in skill.md

## Support

- **Issues**: Create issue in Project-Nyra repository
- **Documentation**: See `skill.md` for detailed usage
- **Examples**: See `docs/references/archon-os-examples/`

## License

Part of Project Nyra - MIT License

---

**Next Steps After Bootstrap:**

1. Configure environment variables (`.env.template`)
2. Review generated CLAUDE.md for project context
3. Use recommended Claude Flow agents
4. Follow tech stack specific guidelines
5. Update memory-bank.md as you work
