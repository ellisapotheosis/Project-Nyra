# Claude Flow v3 Plugins Documentation

Welcome to the Claude Flow v3 plugins documentation for Project Nyra. This directory contains comprehensive guides for setting up, configuring, and using the plugin system.

## Documentation Index

### 1. Setup Guide (START HERE)
**File**: [`CLAUDE-FLOW-PLUGINS-SETUP.md`](../CLAUDE-FLOW-PLUGINS-SETUP.md)

Complete installation and configuration guide covering:
- Current plugin status
- Architecture decision (local vs global)
- Installation methods (CLI, npm, package.json)
- Recommended plugins for Project Nyra
- Configuration examples
- Troubleshooting

**When to use**: First-time setup or when adding new plugins.

### 2. Architecture Overview
**File**: [`PLUGIN-ARCHITECTURE.md`](../PLUGIN-ARCHITECTURE.md)

System design documentation including:
- Dual plugin architecture (Claude Code + Claude Flow)
- Plugin lifecycle (discovery → activation → execution)
- Plugin types (core, command, integration, domain, intelligence)
- Communication patterns
- Trust model and security
- Performance characteristics

**When to use**: Understanding system design or creating custom plugins.

### 3. Quick Reference Card
**File**: [`PLUGIN-QUICK-REFERENCE.md`](../PLUGIN-QUICK-REFERENCE.md)

Command cheat sheet with:
- Installation commands
- Plugin-specific commands (embeddings, security, neural, performance)
- Common workflows
- Environment variables
- Troubleshooting shortcuts

**When to use**: Daily development, quick lookups.

### 4. Setup Summary
**File**: [`PLUGIN-SETUP-SUMMARY.md`](../PLUGIN-SETUP-SUMMARY.md)

Completion status and next steps:
- Current installation status
- Configuration changes made
- Immediate actions required
- Integration points
- Success criteria

**When to use**: Tracking progress, validating setup.

## Quick Start

### 1. Install Plugins (5 minutes)

```bash
# Automated installation
cd /home/ellisapotheosis/projects/project-nyra
./scripts/install-claude-flow-plugins.sh

# Or manual installation
pnpm add -D \
  @claude-flow/embeddings@latest \
  @claude-flow/security@latest \
  @claude-flow/neural@latest \
  @claude-flow/performance@latest
```

### 2. Initialize Plugins (2 minutes)

```bash
# Initialize embeddings for RuVector
npx @claude-flow/cli@latest embeddings init --provider agentic-flow

# Pretrain neural patterns
npx @claude-flow/cli@latest hooks pretrain --model-type moe --epochs 5
```

### 3. Validate Installation (1 minute)

```bash
# Check installed plugins
npx @claude-flow/cli@latest plugins list --installed

# Run health check
npx @claude-flow/cli@latest doctor

# Test embeddings
npx @claude-flow/cli@latest embeddings search --query "test"
```

## Plugin Categories

### Essential Plugins (Install First)

| Plugin | Purpose | Command |
|--------|---------|---------|
| **embeddings** | 75x faster vector search | `embeddings search --query "..."` |
| **security** | CVE scanning, validation | `security scan --depth full` |
| **neural** | Pattern training, MoE | `neural train --pattern-type ...` |
| **performance** | Benchmarking, profiling | `performance benchmark --suite all` |

### Domain Plugins (Optional)

| Plugin | Purpose | Priority |
|--------|---------|----------|
| code-intelligence | Code analysis | LOW |
| test-intelligence | Test optimization | LOW |
| financial-risk | Mortgage risk analysis | MEDIUM |
| legal-contracts | Disclosure processing | MEDIUM |

## Common Tasks

### Search Documents (Embeddings)
```bash
npx @claude-flow/cli@latest embeddings search \
  --query "conventional loan qualification" \
  --k 5 \
  --threshold 0.7
```

### Scan for Vulnerabilities (Security)
```bash
npx @claude-flow/cli@latest security scan --depth full
npx @claude-flow/cli@latest security cve --severity high
```

### Train on Patterns (Neural)
```bash
npx @claude-flow/cli@latest neural train \
  --pattern-type coordination \
  --epochs 10
```

### Benchmark Performance
```bash
npx @claude-flow/cli@latest performance benchmark --suite all
npx @claude-flow/cli@latest performance profile --target quote-api
```

## Integration with Nyra Systems

### RuVector Memory System
```bash
# Index mortgage documents
npx @claude-flow/cli@latest embeddings batch \
  --input ./services/ruvector-search/data \
  --output ./data/memory/embeddings

# Search indexed documents
npx @claude-flow/cli@latest embeddings search \
  --query "FHA loan requirements"
```

### Pre-commit Hooks
```bash
# Enable security scan on commit
npx @claude-flow/cli@latest config set \
  plugins.config.@claude-flow/security.scanOnCommit true
```

### Performance Monitoring
```bash
# Track metrics in real-time
npx @claude-flow/cli@latest performance metrics --watch

# Export to Prometheus
npx @claude-flow/cli@latest performance metrics \
  --export \
  --format prometheus
```

## Troubleshooting

### Plugin Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules/.cache
pnpm install --force

# Rebuild plugin index
npx @claude-flow/cli@latest plugins discover --rebuild
```

### Configuration Warnings
Current config has non-critical warnings (Expected object, received string/boolean). These don't affect functionality.

To suppress warnings:
```bash
npx @claude-flow/cli@latest config validate --ignore-warnings
```

### IPFS Registry Slow
```bash
# Use direct CID
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

# Use faster gateway
export CLAUDE_FLOW_PLUGIN_REGISTRY_GATEWAY=https://gateway.pinata.cloud
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Claude Code (Host)                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MCP Plugins (v2) - 7 plugins installed          │  │
│  │  ~/.claude/plugins/cache/                         │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ MCP Protocol
                         │
┌─────────────────────────────────────────────────────────┐
│            Claude Flow v3 (Orchestrator)                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  NPM Plugins (v3) - Ready for installation       │  │
│  │  ./node_modules/@claude-flow/                     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Plugin API
                         │
┌─────────────────────────────────────────────────────────┐
│              Project Nyra Services                       │
│  RuVector | Quote API | Campaign Engine | Compliance    │
└─────────────────────────────────────────────────────────┘
```

## Configuration Files

### Main Config
**File**: `/claude-flow.config.json`

Contains:
- Plugin paths and registry
- Per-plugin configuration
- Auto-discovery settings

### Plugin Manifest
**File**: `~/.claude/plugins/installed_plugins.json`

Contains:
- Installed Claude Code plugins
- Version information
- Installation metadata

### Installation Script
**File**: `/scripts/install-claude-flow-plugins.sh`

Features:
- Prerequisites check
- Essential plugins installation
- Optional plugins
- Initialization and validation

## Performance Characteristics

| Plugin | Memory | Startup | Runtime | Benefit |
|--------|--------|---------|---------|---------|
| embeddings | ~100MB | +200ms | <1ms | 75x faster search |
| security | ~50MB | +150ms | ~10ms | CVE detection |
| neural | ~200MB | +300ms | <0.05ms | Pattern learning |
| performance | ~20MB | +50ms | ~5ms | Optimization |
| **Total** | **~370MB** | **+700ms** | **<20ms** | **High ROI** |

For Nyra's 4-PC cluster with 32GB+ RAM per node, this overhead is acceptable.

## Plugin Registry

**Registry**: claude-flow-official (IPFS-based)

- **CID**: QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834
- **Gateway**: https://gateway.pinata.cloud
- **Total Plugins**: 20 official plugins
- **Trust Level**: Official (Anthropic-verified)

## Support and Resources

### Documentation
- **Setup Guide**: Comprehensive installation instructions
- **Architecture**: System design and patterns
- **Quick Reference**: Command cheat sheet
- **Summary**: Setup status and next steps

### External Resources
- **Claude Flow Docs**: https://github.com/ruvnet/claude-flow
- **Issue Tracker**: https://github.com/ruvnet/claude-flow/issues
- **Plugin Registry**: IPFS QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

### Project Context
- **Main Config**: `/CLAUDE.md`
- **Whitepaper**: `/ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `/ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`

## FAQ

### Do I need to migrate from v2 plugins?
No. Claude Code plugins (v2) work independently from Claude Flow plugins (v3). Both systems coexist without conflicts.

### Where are plugins installed?
- **Claude Code plugins**: `~/.claude/plugins/cache/` (global, per-project activation)
- **Claude Flow plugins**: `./node_modules/@claude-flow/` (local, npm-managed)

### How do I add a custom plugin?
See the "Custom Plugin Development" section in [`PLUGIN-ARCHITECTURE.md`](../PLUGIN-ARCHITECTURE.md).

### Why IPFS for the registry?
IPFS provides decentralized, censorship-resistant plugin distribution with content-addressable storage (CIDs).

### What if IPFS is slow?
Use direct CID or faster gateway (see Troubleshooting section).

### Do plugins work in containers?
Yes. Since plugins install in `node_modules/`, they work in containerized environments.

## Next Steps

1. **Review Setup Guide**: Read [`CLAUDE-FLOW-PLUGINS-SETUP.md`](../CLAUDE-FLOW-PLUGINS-SETUP.md)
2. **Run Installation**: Execute `/scripts/install-claude-flow-plugins.sh`
3. **Validate Setup**: Check with `npx @claude-flow/cli@latest doctor`
4. **Integrate Systems**: Connect with RuVector, TwentyCRM, Nexus
5. **Create Custom Plugins**: Build Nyra-specific plugins for mortgage workflows

## Status

- **Setup**: ✅ Complete (configuration ready)
- **Installation**: ⏳ Pending (run installation script)
- **Validation**: ⏳ Pending (after installation)
- **Integration**: ⏳ Pending (after validation)

---

**Last Updated**: 2026-01-26
**Project**: Nyra - AI Mortgage Automation Platform
**Claude Flow Version**: v3.0.0-alpha.184
