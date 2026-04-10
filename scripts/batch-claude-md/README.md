# Batch CLAUDE.md Generation System

**Version**: 1.0.0
**Created**: January 8, 2026
**Status**: PRODUCTION READY ✓

## Overview

Automated system for generating custom CLAUDE.md files for every directory in the Project-Nyra repository. Uses template-based approach with context injection to create tech-stack-specific documentation.

## Features

- ✅ 14 directory configurations
- ✅ 10 tech stack templates
- ✅ Context-aware generation
- ✅ Placeholder injection
- ✅ Dry-run mode
- ✅ Verbose logging
- ✅ Error tracking
- ✅ Idempotent operations

## Quick Start

```bash
# Generate all CLAUDE.md files
node batch-template-engine.js

# Dry run (preview without creating files)
node batch-template-engine.js --dry-run

# Verbose output
node batch-template-engine.js --verbose

# Using package.json scripts
pnpm generate
pnpm generate:dry
pnpm generate:verbose
```

## Architecture

### Directory Structure
```
scripts/batch-claude-md/
├── batch-template-engine.js    # Main generator engine
├── nyra-layout.json            # Directory manifest
├── package.json                # NPM package config
├── templates/
│   ├── CLAUDE.md.base          # Base template
│   └── stacks/                 # Tech stack templates
│       ├── nextjs-typescript.md
│       ├── react-typescript.md
│       ├── python-fastapi.md
│       ├── docker-infra.md
│       ├── ci-cd.md
│       ├── documentation.md
│       ├── nodejs-mcp.md
│       ├── nodejs-python.md
│       ├── scripts.md
│       └── monorepo-root.md
└── README.md                   # This file
```

### How It Works

1. **Load Manifest** (`nyra-layout.json`)
   - Reads directory configurations
   - Validates structure

2. **Load Templates**
   - Base template (`CLAUDE.md.base`)
   - Stack-specific template (e.g., `nextjs-typescript.md`)

3. **Inject Context**
   - Replace `{{STACK_SPECIFIC_CONTENT}}` with stack template
   - Replace `{{variable}}` placeholders with context values

4. **Generate Files**
   - Create directory if needed
   - Write CLAUDE.md to target location

## Configuration

### nyra-layout.json Structure

```json
{
  "version": "1.0.0",
  "directories": [
    {
      "path": "./apps/nyra-admin",
      "profile": "nextjs-typescript",
      "context": {
        "appName": "Nyra Admin Panel",
        "port": "3008",
        "type": "Next.js Application",
        "description": "...",
        "techStack": ["Next.js 14", "React 18", ...],
        "devCommand": "pnpm dev",
        "buildCommand": "pnpm build",
        "testCommand": "pnpm test",
        "lintCommand": "pnpm lint",
        "agents": "- coder\n- reviewer\n- tester",
        "workflows": "- Feature development\n- ..."
      }
    }
  ]
}
```

### Context Variables

Available placeholders in templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{appName}}` | Application name | "Nyra Admin Panel" |
| `{{port}}` | Service port | "3008" |
| `{{type}}` | Application type | "Next.js Application" |
| `{{description}}` | App description | "Administrative dashboard..." |
| `{{techStack}}` | Technologies used | "Next.js 14, React 18, TS" |
| `{{devCommand}}` | Development command | "pnpm dev" |
| `{{buildCommand}}` | Build command | "pnpm build" |
| `{{testCommand}}` | Test command | "pnpm test" |
| `{{lintCommand}}` | Lint command | "pnpm lint" |
| `{{agents}}` | Recommended agents | "- coder\n- reviewer" |
| `{{workflows}}` | Recommended workflows | "- Feature development" |
| `{{profile}}` | Tech stack profile | "nextjs-typescript" |
| `{{generationDate}}` | Generation date | "2026-01-08" |

## Tech Stack Profiles

### Available Profiles

1. **nextjs-typescript** - Next.js 14 with TypeScript
   - Apps: nyra-admin, ratehunter, crm

2. **react-typescript** - React SPA with TypeScript
   - Apps: webapp, crm-dashboard

3. **python-fastapi** - Python + FastAPI backend
   - Services: quote-api

4. **docker-infra** - Docker infrastructure
   - Directories: infra

5. **ci-cd** - GitHub Actions workflows
   - Directories: .github

6. **documentation** - Documentation sites
   - Directories: docs

7. **nodejs-mcp** - MCP server development
   - Servers: archon-os, ruv-swarm

8. **nodejs-python** - Hybrid Node.js + Python
   - Tools: archon-os

9. **scripts** - Automation scripts
   - Directories: scripts

10. **monorepo-root** - Monorepo root configuration
    - Directories: . (root)

## Adding New Directories

1. **Edit nyra-layout.json**
   ```json
   {
     "path": "./apps/new-app",
     "profile": "nextjs-typescript",
     "context": {
       "appName": "New App",
       "port": "3009",
       ...
     }
   }
   ```

2. **Run Generator**
   ```bash
   node batch-template-engine.js
   ```

## Creating New Templates

1. **Create Stack Template**
   ```bash
   # Create new template file
   touch templates/stacks/my-stack.md
   ```

2. **Define Stack Guidelines**
   ```markdown
   ## My Stack Development Guidelines

   ### Project Structure
   ...

   ### Best Practices
   ...
   ```

3. **Update Manifest**
   ```json
   {
     "path": "./apps/my-app",
     "profile": "my-stack",  // Reference new template
     "context": { ... }
   }
   ```

4. **Generate**
   ```bash
   node batch-template-engine.js
   ```

## Maintenance

### Regenerating All Files

```bash
# Regenerate all CLAUDE.md files
node batch-template-engine.js

# Preview changes first
node batch-template-engine.js --dry-run
```

### Updating Single Directory

1. Edit `nyra-layout.json` for that directory
2. Delete the existing CLAUDE.md file
3. Run generator

### Manual Customization

After generation, CLAUDE.md files can be manually edited. To preserve changes:

1. **Option A**: Edit the template/manifest instead
2. **Option B**: Don't regenerate (manual maintenance)
3. **Option C**: Use git to review and selectively accept changes

## Output Locations

Generated files are created at:

```
Project-Nyra/
├── CLAUDE.md                          # Monorepo root
├── apps/
│   ├── nyra-admin/CLAUDE.md
│   ├── ratehunter/CLAUDE.md
│   ├── webapp/CLAUDE.md
│   ├── crm/CLAUDE.md
│   └── crm-dashboard/CLAUDE.md
├── services/
│   └── quote-api/CLAUDE.md
├── infra/CLAUDE.md
├── .github/CLAUDE.md
├── docs/CLAUDE.md
├── tools/
│   └── archon-os/CLAUDE.md
├── mcp-servers/
│   ├── archon-os/CLAUDE.md
│   └── ruv-swarm/CLAUDE.md
└── scripts/CLAUDE.md
```

## Troubleshooting

### "Module not found" Error

```bash
# Ensure you're in the correct directory
cd scripts/batch-claude-md

# Node.js modules are not needed (no dependencies)
```

### "File not found" Error

```bash
# Check that all template files exist
ls templates/stacks/
```

### "Invalid JSON" Error

```bash
# Validate manifest JSON
cat nyra-layout.json | jq .
```

## Integration with Claude Code

Each generated CLAUDE.md provides:

- Project context for AI agents
- Tech stack specific guidelines
- Recommended development workflows
- Available Claude Flow agents
- Command reference

When working in a directory, Claude Code automatically reads the local CLAUDE.md for context.

## Performance

- **Generation Time**: <1 second for all 14 files
- **File Size**: ~2-4KB per CLAUDE.md
- **Total Output**: ~40KB
- **Dependencies**: None (pure Node.js)

## Future Enhancements

- [ ] Auto-detect new directories
- [ ] Template validation
- [ ] Multi-language support
- [ ] Custom template plugins
- [ ] Git hook integration
- [ ] VS Code extension

## Support

- **Issues**: Create issue in Project-Nyra repository
- **Enhancements**: Edit templates or manifest
- **Questions**: See examples in generated files

## License

Part of Project Nyra - MIT License
