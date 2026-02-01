# Claude Flow V3 Complete Bootstrap Guide

> **Comprehensive setup for fresh Claude Flow installations with all modules, plugins, and security best practices**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Core Installation](#phase-1-core-installation)
3. [Phase 2: Module Setup](#phase-2-module-setup)
4. [Phase 3: Configuration & Security](#phase-3-configuration--security)
5. [Phase 4: Integration & Testing](#phase-4-integration--testing)
6. [Phase 5: Production Hardening](#phase-5-production-hardening)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+ or yarn v4+
- **Python**: 3.10+ (for Python-based services)
- **Git**: v2.40+
- **Docker**: 24+ (optional but recommended)

### Environment Setup
```bash
# Install Node version manager (fnm)
curl -fsSL https://fnm.io/install | bash

# Use Node 20 LTS
fnm use 20

# Verify installations
node --version    # v20.x.x
npm --version     # v10.x.x
git --version     # 2.40+
```

---

## Phase 1: Core Installation

### Step 1.1: Clone & Initialize Project

```bash
# Clone the project
git clone https://github.com/your-org/project-nyra.git
cd project-nyra

# Initialize project structure
mkdir -p {src,tests,services,apps,mcp-servers,infra,scripts,config,docs}

# Create package.json if not exists
npm init -y
```

### Step 1.2: Install Claude Flow Core

```bash
# Install CLI globally
npm install -g @claude-flow/cli@latest

# Initialize Claude Flow
npx @claude-flow/cli@latest init --wizard

# Start daemon (required for operations)
npx @claude-flow/cli@latest daemon start

# Verify installation
npx @claude-flow/cli@latest --version
npx @claude-flow/cli@latest status
```

### Step 1.3: Install Core Dependencies

```bash
# Project dependencies
npm install \
  @anthropic-ai/claude-code@latest \
  dotenv \
  pino \
  pino-pretty

# Memory system dependencies
npm install \
  @ruvector/memory@latest \
  @letta/sdk@latest \
  @mem0/sdk@latest \
  graphiti-core@latest

# MCP server core
npm install \
  @modelcontextprotocol/sdk@latest \
  @modelcontextprotocol/server-stdio@latest

# Development dependencies
npm install --save-dev \
  @types/node@latest \
  typescript@latest \
  vitest@latest \
  @vitest/ui@latest \
  eslint@latest \
  prettier@latest
```

---

## Phase 2: Module Setup

### Step 2.1: Configure Claude Flow Modules

Create `claude-flow.config.json`:

```json
{
  "version": "3.0.0",
  "project": {
    "name": "project-nyra",
    "description": "AI-Powered Mortgage Automation",
    "type": "microservices"
  },
  "swarm": {
    "topology": "hierarchical-mesh",
    "maxAgents": 15,
    "strategy": "balanced",
    "coordinator": {
      "type": "queen",
      "priority": "high"
    }
  },
  "memory": {
    "backend": "hybrid",
    "primary": "ruvector",
    "secondary": ["letta", "graphiti", "mem0"],
    "persistence": {
      "enabled": true,
      "path": "./.swarm/memory",
      "encryption": true
    },
    "hnsw": {
      "enabled": true,
      "dimension": 1536,
      "maxElements": 100000,
      "efConstruction": 200,
      "ef": 100
    }
  },
  "performance": {
    "flashAttention": true,
    "tokenOptimization": true,
    "caching": {
      "enabled": true,
      "ttl": 3600
    }
  },
  "security": {
    "encryption": {
      "enabled": true,
      "algorithm": "aes-256-gcm"
    },
    "validation": {
      "inputSanitization": true,
      "strictPaths": true,
      "commandWhitelist": true
    },
    "filePermissions": {
      "sensitive": "0600",
      "config": "0640",
      "default": "0644"
    }
  },
  "providers": {
    "llm": {
      "primary": "anthropic",
      "fallback": ["openrouter"],
      "routing": {
        "tier1": "agent-booster",
        "tier2": "haiku",
        "tier3": "sonnet"
      }
    },
    "memory": {
      "vector": "ruvector",
      "semantic": "graphiti",
      "persistence": "agentdb"
    }
  },
  "mcp": {
    "servers": [
      {
        "name": "claude-flow",
        "type": "stdio",
        "command": "npx",
        "args": ["@claude-flow/cli@latest", "mcp", "start"],
        "enabled": true
      },
      {
        "name": "graphiti",
        "type": "stdio",
        "command": "npx",
        "args": ["@graphiti/mcp@latest"],
        "enabled": true
      },
      {
        "name": "github",
        "type": "stdio",
        "command": "npx",
        "args": ["@modelcontextprotocol/server-github"],
        "env": {
          "GITHUB_TOKEN": "${GITHUB_TOKEN}"
        }
      }
    ]
  },
  "hooks": {
    "enabled": true,
    "workers": ["ultralearn", "optimize", "audit", "testgaps"],
    "autoTrain": true,
    "persistenceInterval": 300000
  },
  "logging": {
    "level": "info",
    "format": "json",
    "destinations": ["console", "file"],
    "file": "./.swarm/logs/claude-flow.log"
  }
}
```

### Step 2.2: Install Memory Modules

```bash
# RuVector (Primary memory system)
npm install @ruvector/core@latest @ruvector/hnsw@latest

# Letta (Conversational memory)
npm install @letta/core@latest

# Graphiti (Knowledge graphs)
npm install graphiti-core@latest

# Mem0 (Personalization)
npm install @mem0/sdk@latest

# AgentDB (Unified storage)
npm install @agentdb/core@latest @agentdb/hybrid@latest

# SONA (Self-Optimizing Neural Architecture)
npm install @sona/core@latest @sona/lora@latest

# EWC++ (Elastic Weight Consolidation)
npm install @ewc/pytorch@latest
```

### Step 2.3: Install Provider Modules

```bash
# Anthropic provider
npm install @anthropic-ai/sdk@latest

# OpenRouter integration
npm install openrouter@latest

# Local LLM (Ollama)
npm install ollama@latest

# Embeddings providers
npm install @openai/embeddings@latest sentence-transformers@latest
```

---

## Phase 3: Configuration & Security

### Step 3.1: Environment Variables Setup

Create `.env.example`:

```bash
# API Keys (from Infisical)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=...
GITHUB_TOKEN=...

# Project Configuration
PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
ENVIRONMENT=development

# Infisical
INFISICAL_TOKEN=...
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=dev

# Memory Configuration
MEMORY_BACKEND=hybrid
RUVECTOR_DIMENSION=1536
HNSW_MAX_ELEMENTS=100000

# Security
ENCRYPTION_KEY=...
ENCRYPTION_ALGORITHM=aes-256-gcm

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# LLM Routing
LLM_PRIMARY=anthropic
LLM_FALLBACK=openrouter
LOCAL_LLM_ENABLED=false
LOCAL_LLM_HOST=http://localhost:11434

# Ports
CLAUDE_FLOW_PORT=6000
NEXUS_ROUTER_PORT=6000
DIFY_PORT=3001
N8N_PORT=5678
PROMETHEUS_PORT=9090
GRAFANA_PORT=3005
```

Create `.env` from template:

```bash
cp .env.example .env

# Fill in actual values (never commit .env!)
# Use Infisical for sensitive values:
infisical run --projectId="..." --env="dev" -- npm start
```

### Step 3.2: Security Configuration

Create `.claude/security/validation.js`:

```javascript
/**
 * Input Validation & Sanitization
 * Security layer for Claude Flow
 */

const crypto = require('crypto');
const path = require('path');

class SecurityValidator {
  constructor(config = {}) {
    this.config = {
      strictPaths: true,
      maxInputLength: 10000,
      allowedExtensions: ['.js', '.ts', '.json', '.md', '.yml', '.yaml'],
      ...config
    };

    this.commandWhitelist = [
      'npx', 'npm', 'git', 'docker', 'node', 'python',
      'curl', 'wget', 'infisical'
    ];
  }

  /**
   * Validate command against whitelist
   */
  validateCommand(command) {
    const cmd = command.trim().split(/\s+/)[0];

    if (!this.commandWhitelist.includes(cmd)) {
      throw new Error(`Command not whitelisted: ${cmd}`);
    }

    return true;
  }

  /**
   * Sanitize file paths (prevent traversal)
   */
  validatePath(filePath, baseDir = process.cwd()) {
    const normalized = path.normalize(filePath);
    const absolute = path.resolve(baseDir, normalized);
    const baseDirResolved = path.resolve(baseDir);

    if (!absolute.startsWith(baseDirResolved)) {
      throw new Error(`Path traversal detected: ${filePath}`);
    }

    return absolute;
  }

  /**
   * Validate environment variable names
   */
  validateEnvVar(name) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid environment variable name: ${name}`);
    }
    return true;
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input, maxLength = this.config.maxInputLength) {
    if (typeof input !== 'string') {
      return '';
    }

    if (input.length > maxLength) {
      return input.substring(0, maxLength);
    }

    // Remove potentially dangerous characters
    return input
      .replace(/[<>\"']/g, '') // Remove HTML special chars
      .replace(/`/g, '')        // Remove backticks
      .replace(/\$\{/g, '')     // Remove template injection
      .trim();
  }

  /**
   * Validate server names
   */
  validateServerName(name) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      throw new Error(`Invalid server name: ${name}`);
    }
    return true;
  }

  /**
   * Hash sensitive data for logging
   */
  hashForLog(data) {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 8);
  }
}

module.exports = { SecurityValidator };
```

### Step 3.3: File Permissions Hardening

```bash
# Create secure directories
mkdir -p ./.swarm/{memory,logs,security,cache}
mkdir -p ./config/{secrets,templates}

# Set restrictive permissions
chmod 700 ./.swarm
chmod 700 ./.swarm/memory
chmod 700 config/secrets

# Create secure config files
touch config/secrets/.env.production
chmod 600 config/secrets/.env.production

# Log directory
chmod 750 ./.swarm/logs
```

---

## Phase 4: Integration & Testing

### Step 4.1: Initialize MCP Servers

```bash
# Add MCP servers to Claude Code
claude mcp add claude-flow npx @claude-flow/cli@latest mcp start
claude mcp add graphiti npx @graphiti/mcp@latest
claude mcp add github npx @modelcontextprotocol/server-github

# List installed servers
claude mcp list

# Test connections
npx @claude-flow/cli@latest mcp test
```

### Step 4.2: Initialize Memory System

Create `.claude/scripts/memory-init.js`:

```javascript
#!/usr/bin/env node
/**
 * Initialize memory subsystem
 */

const path = require('path');
const fs = require('fs').promises;
const { RuVectorMemory } = require('@ruvector/core');
const { LettaMemory } = require('@letta/core');
const { GraphitiMemory } = require('graphiti-core');

async function initializeMemory() {
  console.log('🧠 Initializing memory systems...\n');

  try {
    // Initialize RuVector (primary)
    const ruvector = new RuVectorMemory({
      dimension: 1536,
      maxElements: 100000,
      persistence: {
        enabled: true,
        path: './.swarm/memory/ruvector'
      }
    });
    await ruvector.initialize();
    console.log('✅ RuVector initialized');

    // Initialize Letta
    const letta = new LettaMemory({
      persistencePath: './.swarm/memory/letta'
    });
    await letta.initialize();
    console.log('✅ Letta initialized');

    // Initialize Graphiti
    const graphiti = new GraphitiMemory({
      persistencePath: './.swarm/memory/graphiti'
    });
    await graphiti.initialize();
    console.log('✅ Graphiti initialized');

    // Create memory index
    const memoryIndex = {
      initialized: true,
      timestamp: new Date().toISOString(),
      systems: {
        ruvector: { status: 'ready', dimension: 1536 },
        letta: { status: 'ready' },
        graphiti: { status: 'ready' }
      }
    };

    await fs.writeFile(
      './.swarm/memory/index.json',
      JSON.stringify(memoryIndex, null, 2),
      { mode: 0o600 }
    );

    console.log('\n✨ Memory systems ready for operation');
  } catch (error) {
    console.error('❌ Memory initialization failed:', error.message);
    process.exit(1);
  }
}

initializeMemory();
```

Run initialization:

```bash
node .claude/scripts/memory-init.js
```

### Step 4.3: Setup Testing Framework

Create `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90
    },
    testTimeout: 30000
  }
});
```

Create sample test `tests/security.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { SecurityValidator } from '../.claude/security/validation';

describe('Security Validation', () => {
  const validator = new SecurityValidator();

  it('should validate whitelisted commands', () => {
    expect(() => validator.validateCommand('npm install')).not.toThrow();
    expect(() => validator.validateCommand('malicious-command')).toThrow();
  });

  it('should prevent path traversal', () => {
    expect(() => validator.validatePath('../../../etc/passwd')).toThrow();
    expect(() => validator.validatePath('./src/index.js')).not.toThrow();
  });

  it('should sanitize user input', () => {
    const input = '<script>alert("xss")</script>';
    const sanitized = validator.sanitizeInput(input);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('`');
  });

  it('should validate server names', () => {
    expect(() => validator.validateServerName('valid-server')).not.toThrow();
    expect(() => validator.validateServerName('Invalid Server!')).toThrow();
  });
});
```

Run tests:

```bash
npm test
```

---

## Phase 5: Production Hardening

### Step 5.1: Create Security Checklist

Create `.claude/security/checklist.md`:

```markdown
# Security Hardening Checklist

## Environment & Secrets
- [ ] All API keys in .env (not committed)
- [ ] INFISICAL_TOKEN configured for secret injection
- [ ] .env.example created with dummy values
- [ ] .gitignore excludes .env and config/secrets/

## File Permissions
- [ ] .swarm/memory: 700 (owner only)
- [ ] config/secrets: 700 (owner only)
- [ ] .env files: 600 (no group/world access)
- [ ] Log files: 640 (no world access)

## Input Validation
- [ ] All user inputs sanitized
- [ ] Path traversal validation in place
- [ ] Command whitelist enforced
- [ ] Environment variable names validated

## Dependencies
- [ ] npm audit passed (no high/critical vulnerabilities)
- [ ] Lock file committed (package-lock.json)
- [ ] Dependency update strategy documented
- [ ] Security patches monitored (dependabot/renovate)

## Logging & Monitoring
- [ ] Sensitive data redacted from logs
- [ ] Security events logged (auth failures, validation errors)
- [ ] Log rotation configured
- [ ] Prometheus metrics exported

## Testing
- [ ] 90%+ code coverage
- [ ] Security tests pass
- [ ] Integration tests pass
- [ ] E2E tests for critical workflows

## Deployment
- [ ] Docker image security scan passed
- [ ] SBOM (Software Bill of Materials) generated
- [ ] Secrets rotation documented
- [ ] Incident response plan ready
```

### Step 5.2: Setup Audit & Scanning

```bash
# Create audit script
cat > scripts/security-audit.sh << 'EOF'
#!/bin/bash
set -e

echo "🔒 Running security audit..."

# npm audit
npm audit --audit-level=moderate

# ESLint security rules
npm run lint -- --ext .js,.ts

# SAST scanning (if SonarQube available)
# sonar-scanner

# Dependency check
npm outdated

# License check
npm ls --all

echo "✅ Security audit complete"
EOF

chmod +x scripts/security-audit.sh
```

Run regularly:

```bash
./scripts/security-audit.sh
```

### Step 5.3: Production Dockerfile

Create `Dockerfile.prod`:

```dockerfile
# Multi-stage build for security
FROM node:20-slim as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Final stage - minimal image
FROM node:20-slim

WORKDIR /app

# Non-root user
RUN useradd -m -u 1000 appuser

# Copy only production dependencies
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules

# Copy application (exclude .env files)
COPY --chown=appuser:appuser src ./src
COPY --chown=appuser:appuser .claude ./.claude
COPY --chown=appuser:appuser package.json ./

# Set permissions
RUN chmod 700 ./.claude && chmod 700 .swarm 2>/dev/null || true

USER appuser

EXPOSE 6000

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:6000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/index.js"]
```

Build securely:

```bash
docker build -f Dockerfile.prod -t project-nyra:latest .
docker scan project-nyra:latest  # Scan for vulnerabilities
```

---

## Troubleshooting

### Issue: "ZSH_DISABLE_COMPFIX" warnings

**Solution**: Already added to your ~/.zshrc
```bash
source ~/.zshrc
```

### Issue: Memory initialization fails

**Solution**: Ensure directories exist with correct permissions
```bash
mkdir -p .swarm/{memory,logs,cache,security}
chmod 700 .swarm/memory
node .claude/scripts/memory-init.js
```

### Issue: MCP server connection errors

**Solution**: Verify daemon is running
```bash
npx @claude-flow/cli@latest daemon status
npx @claude-flow/cli@latest daemon start --verbose
```

### Issue: Security validation errors

**Solution**: Check path and command whitelist configuration
```bash
cat claude-flow.config.json | jq .security
```

---

## Post-Installation Commands

```bash
# Initialize everything at once
npx @claude-flow/cli@latest init --wizard
npx @claude-flow/cli@latest daemon start
node .claude/scripts/memory-init.js
npm test
./scripts/security-audit.sh

# Verify all systems
npx @claude-flow/cli@latest status
npx @claude-flow/cli@latest mcp list
npx @claude-flow/cli@latest memory search --query "test"

# Create initial swarm
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced
```

---

## Next Steps

1. **Deploy to production** using provided Dockerfile
2. **Setup CI/CD** with GitHub Actions (see `github-workflow-automation` skill)
3. **Monitor with observability stack** (Prometheus + Grafana + Loki)
4. **Implement audit trails** for compliance
5. **Document operational procedures** for your team

**Support**: Run `npx @claude-flow/cli@latest doctor --fix` for automatic diagnostics
