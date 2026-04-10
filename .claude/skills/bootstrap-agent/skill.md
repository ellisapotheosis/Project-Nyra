---
name: bootstrap-agent
description: Bootstrap and initialize any app/module with custom CLAUDE.md, configs, environments, and workflows using Claude Flow wiki templates and examples
version: 1.0.0
author: Project Nyra
tags: [bootstrap, init, templates, archon-os, automation]
---

# Bootstrap Agent Skill

Comprehensive initialization system for creating properly configured directories with custom CLAUDE.md files, configurations, environments, and workflows.

## What This Does

Automatically sets up any new app/module/service with:
- ✅ Custom CLAUDE.md tailored to tech stack
- ✅ Environment configurations (.env templates)
- ✅ Claude Flow workflows
- ✅ Memory bank initialization
- ✅ Tech stack specific guidelines
- ✅ Development commands
- ✅ Agent recommendations

## Usage

```
/bootstrap-agent create <path> <profile> [options]
```

### Examples

```bash
# Bootstrap a new Next.js app
/bootstrap-agent create ./apps/new-app nextjs-typescript --port=3005

# Bootstrap a Python API service
/bootstrap-agent create ./services/auth-api python-fastapi --port=8001

# Bootstrap infrastructure directory
/bootstrap-agent create ./infra/monitoring docker-infra

# Bootstrap with full options
/bootstrap-agent create ./apps/dashboard react-typescript \
  --name="Analytics Dashboard" \
  --description="Real-time analytics and reporting" \
  --port=3006
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

### Enterprise Patterns
- `microservices` - Microservices architecture
- `domain-driven-design` - DDD patterns
- `event-sourcing` - Event-driven architecture

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--name` | Application name | Directory name |
| `--description` | App description | Auto-generated |
| `--port` | Service port | Auto-assigned |
| `--agents` | Recommended agents | From profile |
| `--workflows` | Custom workflows | From profile |
| `--skip-memory` | Skip memory-bank.md | false |
| `--skip-workflows` | Skip workflow files | false |
| `--dry-run` | Preview without creating | false |

## What Gets Created

```
<target-directory>/
├── CLAUDE.md              # Custom AI context
├── memory-bank.md         # Memory/context tracking
├── .env.template          # Environment template
├── .workflows/            # Claude Flow workflows
│   ├── development.json
│   ├── testing.json
│   └── deployment.json
└── config/                # Stack-specific configs
    └── [varies by profile]
```

## Integrated Resources

This skill uses:
- **Claude Flow Wiki**: 50+ CLAUDE.md templates for different tech stacks
- **Claude Flow Examples**: Proven configurations and workflows
- **Project Nyra Templates**: Custom templates with best practices

## Advanced Usage

### Batch Initialization

Create multiple directories at once:

```bash
/bootstrap-agent batch --config=batch-init.json
```

**batch-init.json**:
```json
[
  {
    "path": "./apps/customer-portal",
    "profile": "nextjs-typescript",
    "context": {
      "appName": "Customer Portal",
      "port": "3010"
    }
  },
  {
    "path": "./services/notification-service",
    "profile": "python-fastapi",
    "context": {
      "appName": "Notification Service",
      "port": "8002"
    }
  }
]
```

### Custom Profiles

Create your own profile:

```bash
/bootstrap-agent add-profile custom-stack \
  --base=nodejs-express \
  --add-guidelines="./docs/my-guidelines.md"
```

### Update Existing

Re-bootstrap existing directory (preserves customizations):

```bash
/bootstrap-agent update ./apps/existing-app --merge
```

## Generated CLAUDE.md Structure

```markdown
# [App Name] - CLAUDE.md

## 🎯 Project Overview
[Description]

## 🏗️ Architecture
- Tech Stack: [Stack Details]
- Port: [Port]
- Type: [Type]

## 📋 Development Commands
[Commands for dev, build, test, lint]

## 🧠 Claude Flow Integration
### Available Agents
[Recommended agents]

### Workflows
[Suggested workflows]

## 🛠️ Tech Stack Guidelines
[Stack-specific best practices]

## 📝 Notes
[Generation metadata]
```

## Integration with Existing System

This skill integrates with:
- **Batch CLAUDE.md System**: Uses existing templates
- **Claude Flow**: Auto-configures workflows
- **Project Nyra**: Follows repository standards

## Troubleshooting

### Profile Not Found
```bash
# List available profiles
/bootstrap-agent list-profiles

# Use closest match
/bootstrap-agent create ./app nextjs-typescript
```

### Permission Errors
```bash
# Check directory permissions
# Ensure target directory is writable
```

### Template Issues
```bash
# Regenerate templates
/bootstrap-agent refresh-templates
```

## Contributing

Add new profiles by creating:
1. Template in `docs/references/templates-library/stacks/`
2. Update profile registry
3. Test with `--dry-run`

## See Also

- `/sparc` - SPARC methodology workflows
- `/github-modes` - GitHub integration
- `/swarm-orchestration` - Multi-agent coordination
