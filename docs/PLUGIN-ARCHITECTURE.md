# Claude Flow v3 Plugin Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Code (Host)                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    MCP Plugin System (v2)                     │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐     │  │
│  │  │ Serena  │  │ GitHub  │  │Context7 │  │ Superpowers │     │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────┘     │  │
│  │          ~/.claude/plugins/cache/                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ MCP Protocol
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                    Claude Flow v3 (Orchestrator)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                 NPM Plugin System (v3)                        │  │
│  │  ┌────────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐   │  │
│  │  │ Embeddings │  │ Security │  │ Neural │  │Performance │   │  │
│  │  │  (RuVec)   │  │  (CVE)   │  │ (MoE)  │  │(Benchmark) │   │  │
│  │  └────────────┘  └──────────┘  └────────┘  └────────────┘   │  │
│  │          ./node_modules/@archon-os/                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Plugin Discovery                           │  │
│  │  - IPFS Registry (archon-os-official)                       │  │
│  │  - Auto-discovery in node_modules                             │  │
│  │  - Manual plugin paths                                        │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Plugin API
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                      Project Nyra Services                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  RuVector  │  │Quote Engine│  │  Campaign  │  │Compliance  │   │
│  │   Search   │  │    API     │  │   Engine   │  │   Agent    │   │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Dual Plugin Architecture

### Layer 1: Claude Code Plugins (MCP-based, v2)

**Purpose**: IDE integration, tooling, UI enhancements

**Installation Location**: `~/.claude/plugins/cache/claude-plugins-official/`

**Characteristics**:
- Global installation with per-project activation
- MCP (Model Context Protocol) based
- Managed by Claude Code UI
- No migration needed from v2

**Current Plugins**:
```
serena@e30768372b41        - Workflow automation
github@e30768372b41        - GitHub integration
context7@e30768372b41      - Documentation search
agent-sdk-dev@e30768372b41 - Agent SDK development
greptile@e30768372b41      - Code search
claude-code-setup@1.0.0    - Setup wizard
superpowers@4.1.1          - Enhanced capabilities
```

**Activation**:
- Automatically activated for `/home/ellisapotheosis/projects/project-nyra`
- Manifest: `~/.claude/plugins/installed_plugins.json`
- Scope: `"project"` (not global)

### Layer 2: Claude Flow NPM Plugins (v3)

**Purpose**: Orchestration, intelligence, performance, security

**Installation Location**: `./node_modules/@archon-os/`

**Characteristics**:
- Local installation (npm/pnpm)
- Version controlled via package.json
- IPFS registry discovery
- CLI and API integration

**Essential Plugins**:
```
@archon-os/embeddings@3.0.0-alpha.1   - 75x faster vector search
@archon-os/security@3.0.0-alpha.1     - CVE scanning, validation
@archon-os/neural@3.0.0-alpha.7       - Pattern training
@archon-os/performance@3.0.0-alpha.1  - Benchmarking
@archon-os/claims@3.0.0-alpha.8       - Authorization
```

**Discovery Mechanism**:
1. IPFS Registry (primary) - `archon-os-official`
2. Auto-discovery in `node_modules/`
3. Manual paths in config

## Plugin Lifecycle

### Discovery Phase

```
┌─────────────┐
│   IPFS      │  Registry CID: QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAM...
│  Registry   │  Discovers 20 official plugins
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Plugin    │  npx @archon-os/cli@latest plugins list
│  Discovery  │  Scans: IPFS → node_modules → manual paths
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validation  │  Check versions, dependencies, trust level
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Installation │  npm/pnpm add @archon-os/embeddings
└─────────────┘
```

### Activation Phase

```
┌─────────────┐
│   Config    │  archon-os.config.json
│   Loading   │  "plugins.installed": [...]
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Plugin    │  Load plugin manifest
│   Loading   │  Check dependencies
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Initialize() │  Plugin.initialize(context)
│   Hooks     │  Register commands, hooks, agents
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Ready     │  Plugin available for use
└─────────────┘
```

### Execution Phase

```
┌─────────────┐
│   Command   │  npx @archon-os/cli@latest embeddings search
│  Invocation │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Plugin    │  Embeddings plugin handles search
│  Execution  │  Uses HNSW index, archon-os ONNX
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Result    │  Returns search results
│  Processing │  Stores in memory system
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Hooks     │  post-command hook for learning
│  Triggered  │  Neural training, memory storage
└─────────────┘
```

## Plugin Types

### Core Plugins

**Purpose**: Fundamental capabilities for all projects

| Plugin | Function | Integration |
|--------|----------|-------------|
| `@archon-os/embeddings` | Vector search, HNSW indexing | RuVector, Memory |
| `@archon-os/security` | CVE scanning, validation | Pre-commit hooks |
| `@archon-os/neural` | Pattern training, MoE | Hooks, Memory |
| `@archon-os/claims` | Authorization | Security layer |
| `@archon-os/plugins` | Plugin management | CLI |

### Command Plugins

**Purpose**: Extend CLI functionality

| Plugin | Function | Commands |
|--------|----------|----------|
| `@archon-os/performance` | Performance analysis | `benchmark`, `profile`, `optimize` |

### Integration Plugins

**Purpose**: Connect external systems

| Plugin | Function | Integration |
|--------|----------|-------------|
| `@archon-os/plugin-agentic-qe` | Quantum entanglement | archon-os |
| `@archon-os/plugin-prime-radiant` | Psychohistory patterns | Memory systems |
| `@archon-os/plugin-gastown-bridge` | Cross-system bridge | MCP servers |

### Domain Plugins

**Purpose**: Vertical-specific functionality

| Plugin | Function | Domain |
|--------|----------|--------|
| `@archon-os/plugin-financial-risk` | Risk analysis | Mortgage, Finance |
| `@archon-os/plugin-healthcare-clin...` | Clinical workflows | Healthcare |
| `@archon-os/plugin-legal-contracts` | Contract processing | Legal, Mortgage |

### Intelligence Plugins

**Purpose**: AI/ML capabilities

| Plugin | Function | Technology |
|--------|----------|------------|
| `@archon-os/plugin-code-intelligence` | Code analysis | AST, patterns |
| `@archon-os/plugin-test-intelligence` | Test optimization | Coverage analysis |
| `@archon-os/plugin-neural-coordinator` | Multi-agent coordination | Neural nets |
| `@archon-os/plugin-quantum-optimizer` | Quantum algorithms | Optimization |
| `@archon-os/plugin-cognitive-kernel` | Cognitive architecture | Kernel design |

## Plugin Communication

### Inter-Plugin Communication

```
┌─────────────────┐
│   Embeddings    │  Provides: vector search
│     Plugin      │
└────────┬────────┘
         │
         │ Plugin API
         ▼
┌─────────────────┐
│     Neural      │  Consumes: embeddings for pattern storage
│     Plugin      │  Provides: pattern predictions
└────────┬────────┘
         │
         │ Plugin API
         ▼
┌─────────────────┐
│   Performance   │  Consumes: neural predictions for optimization
│     Plugin      │  Provides: benchmark data
└─────────────────┘
```

### Plugin-to-System Communication

```
┌─────────────┐
│   Plugin    │
└──────┬──────┘
       │
       ├──────────► Memory System (RuVector)
       │
       ├──────────► Hooks System (pre-task, post-task)
       │
       ├──────────► CLI Commands (embeddings search)
       │
       ├──────────► Config System (plugins.config)
       │
       └──────────► MCP Servers (external integrations)
```

## Plugin Configuration

### Global Configuration

Location: `archon-os.config.json`

```json
{
  "plugins": {
    "enabled": true,
    "autoLoad": true,
    "autoDiscover": true,
    "paths": ["./plugins", "./node_modules"],
    "registry": "archon-os-official",
    "registryCID": "QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834",
    "installed": [...],
    "config": {...}
  }
}
```

### Per-Plugin Configuration

```json
{
  "plugins": {
    "config": {
      "@archon-os/embeddings": {
        "provider": "archon-os",
        "model": "all-minilm-l6-v2",
        "dimensions": 384,
        "onnxOptimization": true
      }
    }
  }
}
```

### Environment Variables

```bash
# Registry
export CLAUDE_FLOW_PLUGIN_REGISTRY=archon-os-official
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR...

# Paths
export CLAUDE_FLOW_PLUGIN_PATH=./node_modules
export CLAUDE_CODE_PLUGIN_PATH=~/.claude/plugins

# Auto-discovery
export CLAUDE_FLOW_PLUGIN_AUTO_DISCOVER=true

# Per-plugin settings
export CLAUDE_FLOW_EMBEDDINGS_PROVIDER=archon-os
export CLAUDE_FLOW_SECURITY_SCAN_ON_COMMIT=true
```

## Plugin Dependencies

### Embeddings Plugin Dependencies

```
@archon-os/embeddings
├── archon-os (ONNX runtime, 75x faster)
├── @archon-os/memory (storage backend)
├── @archon-os/hnsw (indexing)
└── Node.js native modules (optional CUDA)
```

### Security Plugin Dependencies

```
@archon-os/security
├── nvd (National Vulnerability Database)
├── @archon-os/cli (scanning commands)
├── zod (input validation)
└── @archon-os/hooks (pre-commit integration)
```

### Neural Plugin Dependencies

```
@archon-os/neural
├── @archon-os/moe (Mixture of Experts)
├── @archon-os/ewc (Elastic Weight Consolidation)
├── @archon-os/lora (Low-Rank Adaptation)
├── @archon-os/flash-attention (optimization)
└── @archon-os/memory (pattern storage)
```

## Plugin Trust Model

### Trust Levels

| Level | Source | Verification |
|-------|--------|--------------|
| **Official** | @archon-os/* | Anthropic-signed, IPFS-pinned |
| **Verified** | Known publishers | Community-verified, audited |
| **Community** | Third-party | User-installed, no verification |
| **Local** | Project-specific | Developer responsibility |

### Security Verification

```
┌─────────────┐
│   Plugin    │  Package signature
│  Download   │  from IPFS registry
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Signature  │  Verify against Anthropic public key
│Verification │  Check hash matches CID
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Dependency   │  Audit dependencies (npm audit)
│   Scan      │  Check for known vulnerabilities
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Trust     │  Mark as Official/Verified/Community
│   Rating    │  Store in installed_plugins.json
└─────────────┘
```

## Performance Characteristics

### Plugin Overhead

| Plugin | Memory | Startup | Runtime | Benefit |
|--------|--------|---------|---------|---------|
| embeddings | ~100MB | +200ms | <1ms | 75x faster search |
| security | ~50MB | +150ms | ~10ms | CVE detection |
| neural | ~200MB | +300ms | <0.05ms | Pattern learning |
| performance | ~20MB | +50ms | ~5ms | Optimization |
| **Total** | **~370MB** | **+700ms** | **<20ms** | **High ROI** |

### Optimization Strategies

1. **Lazy Loading**: Load plugins on-demand, not at startup
2. **Worker Threads**: Run heavy plugins in background
3. **ONNX Acceleration**: Use GPU for embeddings (75x faster)
4. **Caching**: Cache plugin results in memory
5. **Batch Operations**: Group plugin calls

## Custom Plugin Development

### Plugin Template

```typescript
// plugins/custom-plugin/index.ts
import { Plugin, PluginContext, PluginMetadata } from '@archon-os/plugins';

export const metadata: PluginMetadata = {
  name: 'custom-plugin',
  version: '1.0.0',
  type: 'integration',
  author: 'Your Name',
  description: 'Custom plugin for specific functionality',
  dependencies: {
    'archon-os': '^3.0.0',
    '@archon-os/memory': '^3.0.0'
  }
};

export class CustomPlugin implements Plugin {
  name = metadata.name;
  version = metadata.version;

  async initialize(context: PluginContext): Promise<void> {
    // Register commands
    context.registerCommand('custom:command', this.handleCommand);

    // Register hooks
    context.registerHook('pre-task', this.preTaskHook);

    // Initialize resources
    await this.initializeResources();
  }

  private async handleCommand(params: any): Promise<any> {
    // Command implementation
  }

  private async preTaskHook(context: any): Promise<void> {
    // Hook implementation
  }

  private async initializeResources(): Promise<void> {
    // Resource initialization
  }

  async shutdown(): Promise<void> {
    // Cleanup resources
  }
}
```

### Plugin Manifest (package.json)

```json
{
  "name": "@nyra/custom-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "claudeFlow": {
    "version": "^3.0.0",
    "type": "integration",
    "commands": ["custom:command"],
    "hooks": ["pre-task"],
    "config": {
      "required": ["apiKey"],
      "optional": ["timeout"]
    }
  },
  "dependencies": {
    "@archon-os/plugins": "^3.0.0"
  }
}
```

## Migration Path

### From Claude Code Plugins (v2) to Claude Flow Plugins (v3)

**No migration needed** - Both systems coexist:
- Claude Code plugins continue to work (MCP-based)
- Claude Flow plugins add orchestration capabilities
- No conflicts between the two systems

### Adding New Functionality

**Option 1: Use Existing Plugin**
```bash
npx @archon-os/cli@latest plugins install @archon-os/embeddings
```

**Option 2: Create Custom Plugin**
```bash
npx @archon-os/cli@latest plugins create @nyra/mortgage-plugin
```

## Troubleshooting Architecture

### Plugin Not Loading

1. Check installation: `npx @archon-os/cli@latest plugins list --installed`
2. Verify config: `archon-os.config.json` → `plugins.installed`
3. Check paths: `plugins.paths` includes `./node_modules`
4. Scan for plugins: `npx @archon-os/cli@latest plugins discover`

### Plugin Conflicts

1. Check versions: `npm list @archon-os/embeddings`
2. Clear cache: `rm -rf node_modules/.cache`
3. Reinstall: `npm install --force`

### Performance Issues

1. Profile: `npx @archon-os/cli@latest performance profile --target plugin-name`
2. Disable heavy plugins temporarily
3. Use lazy loading: `plugins.autoLoad: false`

---

**Last Updated**: 2026-01-26
**Architecture Version**: v3.0.0
**Status**: Production-ready hybrid architecture
