# Claude Flow Plugins - Installation & Configuration

**Project Nyra - Complete Plugin Setup Guide**

Version: 1.0
Last Updated: 2026-01-15
Status: ✅ All Official Plugins Installed & Active

---

## 📦 Installed Plugins (6 Official)

### 1. Neural Patterns (`@claude-flow/neural`) v3.0.0
**Status**: ✅ Active
**Size**: 239.3 KB
**Type**: Core
**Trust**: Official

**Features**:
- Neural pattern training and inference
- WASM SIMD acceleration (3x speedup)
- Pattern recognition and learning
- Trajectory tracking for ReasoningBank
- MoE (Mixture of Experts) routing

**Hooks Registered**: 3
- `neural-train` - Train neural patterns on trajectories
- `neural-predict` - Predict optimal approach for new tasks
- `neural-optimize` - Optimize neural model performance

**Commands Added**: 3
```bash
# Train neural patterns
npx @claude-flow/cli@latest neural train --pattern-type coordination --epochs 10

# Predict optimal approach
npx @claude-flow/cli@latest neural predict --input "task description"

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list

# Optimize neural model
npx @claude-flow/cli@latest neural optimize --target speed
```

**Permissions**: memory, network

---

### 2. Security Scanner (`@claude-flow/security`) v3.0.0
**Status**: ✅ Active
**Size**: 175.8 KB
**Type**: Command
**Trust**: Official

**Features**:
- CVE vulnerability scanning
- Dependency security audit
- Secret detection in code
- OWASP Top 10 validation
- Security report generation

**Hooks Registered**: 2
- `security-scan` - Pre-commit security scanning
- `security-audit` - Scheduled security audits

**Commands Added**: 4
```bash
# Run security scan
npx @claude-flow/cli@latest security scan --depth full

# Audit dependencies
npx @claude-flow/cli@latest security audit --severity high

# Search CVE database
npx @claude-flow/cli@latest security cve --query "fastapi"

# Check for secrets in code
npx @claude-flow/cli@latest security threats --scan-secrets

# Generate security report
npx @claude-flow/cli@latest security report --format json
```

**Permissions**: filesystem, network

---

### 3. Vector Embeddings (`@claude-flow/embeddings`) v3.0.0
**Status**: ✅ Active
**Size**: 312.5 KB
**Type**: Core
**Trust**: Official

**Features**:
- ONNX-based embedding generation
- Hyperbolic (Poincaré ball) embeddings
- 75x faster with agentic-flow integration
- Document chunking with overlap
- Multiple normalization strategies (L2, L1, min-max, z-score)

**Hooks Registered**: 2
- `embeddings-generate` - Generate embeddings for text
- `embeddings-search` - Semantic search via embeddings

**Commands Added**: 3
```bash
# Initialize embeddings
npx @claude-flow/cli@latest embeddings init --model all-MiniLM-L6-v2

# Generate embeddings for text
npx @claude-flow/cli@latest embeddings generate --text "mortgage rate calculator"

# Semantic search
npx @claude-flow/cli@latest embeddings search --query "authentication patterns" --topK 5

# Batch processing
npx @claude-flow/cli@latest embeddings batch --file documents.txt
```

**Permissions**: memory, filesystem

---

### 4. Performance Profiler (`@claude-flow/performance`) v3.0.0
**Status**: ✅ Active
**Size**: 141.6 KB
**Type**: Command
**Trust**: Official

**Features**:
- Real-time performance profiling
- Bottleneck detection
- SLA monitoring (p50, p95, p99)
- Cost analysis per operation
- Benchmark suite for regression testing

**Hooks Registered**: 2
- `performance-track` - Track operation metrics
- `performance-alert` - Alert on SLA violations

**Commands Added**: 3
```bash
# Run benchmark suite
npx @claude-flow/cli@latest performance benchmark --suite all

# Profile specific component
npx @claude-flow/cli@latest performance profile --target quote-engine

# Get performance metrics
npx @claude-flow/cli@latest performance metrics --timeRange 24h

# Detect bottlenecks
npx @claude-flow/cli@latest performance bottleneck --threshold 1000ms

# Generate performance report
npx @claude-flow/cli@latest performance report --format detailed
```

**Permissions**: memory

---

### 5. Claims Authorization (`@claude-flow/claims`) v3.0.0
**Status**: ✅ Active
**Size**: 92.8 KB
**Type**: Core
**Trust**: Official

**Features**:
- Fine-grained access control (ADR-010)
- Claims-based authorization for agents
- Role-based permissions
- Dynamic claim validation
- Audit trail for authorization decisions

**Hooks Registered**: 2
- `claims-check` - Validate claims before operations
- `claims-audit` - Log authorization decisions

**Commands Added**: 4
```bash
# Check claims
npx @claude-flow/cli@latest claims check --agent coder-1 --resource /api/quote

# Grant claims
npx @claude-flow/cli@latest claims grant --agent coder-1 --claim "read:leads"

# Revoke claims
npx @claude-flow/cli@latest claims revoke --agent coder-1 --claim "write:quotes"

# List all claims
npx @claude-flow/cli@latest claims list --agent coder-1
```

**Permissions**: config

---

### 6. Plugin Creator Pro (`plugin-creator`) v2.1.0
**Status**: ✅ Active
**Size**: 152.3 KB
**Type**: Command
**Trust**: Official

**Features**:
- Scaffold new plugin projects
- IPFS integration for decentralized publishing
- Ed25519 signature generation
- Plugin testing framework
- Marketplace submission automation

**Hooks Registered**: 5
- `plugin-init` - Initialize new plugin project
- `plugin-test` - Run plugin tests
- `plugin-package` - Package plugin for distribution
- `plugin-sign` - Sign plugin with Ed25519
- `plugin-publish` - Publish to IPFS registry

**Commands Added**: 7
```bash
# Create new plugin
npx @claude-flow/cli@latest plugins create --name my-plugin --type command

# Test plugin
npx @claude-flow/cli@latest plugins test --plugin my-plugin

# Package for distribution
npx @claude-flow/cli@latest plugins package --plugin my-plugin

# Sign with Ed25519
npx @claude-flow/cli@latest plugins sign --plugin my-plugin --key signing-key.pem

# Publish to IPFS
npx @claude-flow/cli@latest plugins publish --plugin my-plugin

# Search marketplace
npx @claude-flow/cli@latest plugins search --query "mortgage"

# Get plugin info
npx @claude-flow/cli@latest plugins info --name @claude-flow/neural
```

**Permissions**: filesystem, network

---

## 🎯 Quick Commands Reference

### Plugin Management
```bash
# List installed plugins
npx @claude-flow/cli@latest plugins list --installed

# List available plugins in registry
npx @claude-flow/cli@latest plugins list --official

# Search plugins
npx @claude-flow/cli@latest plugins search --query "security"

# Install plugin
npx @claude-flow/cli@latest plugins install --name @claude-flow/neural --yes

# Enable plugin
npx @claude-flow/cli@latest plugins toggle --name @claude-flow/neural --enable

# Disable plugin
npx @claude-flow/cli@latest plugins toggle --name @claude-flow/neural --disable

# Uninstall plugin
npx @claude-flow/cli@latest plugins uninstall --name @claude-flow/neural

# Get plugin details
npx @claude-flow/cli@latest plugins info --name @claude-flow/neural
```

---

## 🔧 System Status

### MCP Server
- **Status**: ✅ Running
- **PID**: 65236
- **Transport**: stdio
- **Host**: localhost
- **Port**: 3000

### Claude Flow Daemon
- **Status**: ✅ Running
- **PID**: 12672
- **Memory Database**: .swarm/memory.db (0.31 MB)

### Health Check Summary
- ✅ Node.js: v24.12.0
- ✅ npm: v11.7.0
- ✅ Claude Code CLI: v2.1.7
- ✅ Git: v2.52.0.windows.1
- ✅ TypeScript: v5.9.3
- ✅ Config file: claude-flow.config.json
- ⚠️ API Keys: OPENAI_API_KEY found (Claude key not configured)

---

## 📊 Plugin Capabilities Summary

| Plugin | Neural | Security | Embeddings | Performance | Claims | Creator |
|--------|--------|----------|------------|-------------|--------|---------|
| **Pattern Learning** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Security Scanning** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vector Search** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Profiling** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Authorization** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Plugin Dev** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **IPFS Integration** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CVE Database** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Hyperbolic Space** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Benchmarking** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 🚀 Usage Examples

### Example 1: Security Audit Before Deployment
```bash
# Run comprehensive security scan
npx @claude-flow/cli@latest security scan --depth full

# Check for critical CVEs
npx @claude-flow/cli@latest security cve --severity critical

# Scan for secrets in code
npx @claude-flow/cli@latest security threats --scan-secrets

# Generate security report
npx @claude-flow/cli@latest security report --format json > security-report.json
```

### Example 2: Neural Pattern Learning
```bash
# Train neural patterns on successful trajectories
npx @claude-flow/cli@latest neural train --pattern-type coordination --epochs 10

# Predict optimal approach for new task
npx @claude-flow/cli@latest neural predict --input "Generate mortgage quote for conventional loan"

# Optimize neural model for speed
npx @claude-flow/cli@latest neural optimize --target speed

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list
```

### Example 3: Semantic Search with Embeddings
```bash
# Initialize embeddings system
npx @claude-flow/cli@latest embeddings init --model all-MiniLM-L6-v2 --hyperbolic true

# Generate embeddings for documents
npx @claude-flow/cli@latest embeddings batch --file mortgage-docs.txt

# Semantic search for similar patterns
npx @claude-flow/cli@latest embeddings search --query "authentication patterns" --topK 10 --threshold 0.7
```

### Example 4: Performance Monitoring
```bash
# Run baseline benchmark
npx @claude-flow/cli@latest performance benchmark --suite all

# Profile quote generation endpoint
npx @claude-flow/cli@latest performance profile --target quote-generation --duration 60

# Check for bottlenecks
npx @claude-flow/cli@latest performance bottleneck --threshold 1000ms

# Generate performance report
npx @claude-flow/cli@latest performance report --timeRange 7d --format detailed
```

### Example 5: Claims-Based Authorization
```bash
# Grant read access to leads for agent
npx @claude-flow/cli@latest claims grant --agent coder-1 --claim "read:leads"

# Grant write access to quotes
npx @claude-flow/cli@latest claims grant --agent coder-1 --claim "write:quotes"

# Check permissions before operation
npx @claude-flow/cli@latest claims check --agent coder-1 --resource "/api/quote/generate"

# List all claims for agent
npx @claude-flow/cli@latest claims list --agent coder-1
```

---

## 🔄 Automated Workflows with Plugins

### CI/CD Integration
```yaml
# .github/workflows/security-audit.yml
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Claude Flow
        run: npm install -g @claude-flow/cli@latest

      - name: Security Scan
        run: |
          npx @claude-flow/cli@latest security scan --depth full
          npx @claude-flow/cli@latest security cve --severity high
          npx @claude-flow/cli@latest security threats --scan-secrets

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.json
```

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run security scan before commit
echo "Running security checks..."
npx @claude-flow/cli@latest security threats --scan-secrets

if [ $? -ne 0 ]; then
  echo "❌ Security check failed! Secrets detected in code."
  exit 1
fi

echo "✅ Security checks passed"
exit 0
```

---

## 🐛 Troubleshooting

### Plugin Not Found After Installation
```bash
# Verify plugin installed
npx @claude-flow/cli@latest plugins list --installed

# Re-enable plugin
npx @claude-flow/cli@latest plugins toggle --name @claude-flow/neural --enable

# Check plugin info
npx @claude-flow/cli@latest plugins info --name @claude-flow/neural
```

### MCP Server Connection Issues
```bash
# Check MCP server status
npx @claude-flow/cli@latest mcp status

# Restart MCP server
npx @claude-flow/cli@latest mcp restart

# Check server logs
npx @claude-flow/cli@latest mcp logs --lines 50
```

### Plugin Permissions Errors
```bash
# Check required permissions
npx @claude-flow/cli@latest plugins info --name @claude-flow/security

# Grant filesystem permissions
# Edit claude-flow.config.json:
{
  "plugins": {
    "@claude-flow/security": {
      "permissions": ["filesystem", "network"]
    }
  }
}
```

---

## 📚 Additional Resources

### Documentation
- **[Best Practices Guide](../BEST-PRACTICES-GUIDE.md)** - Optimization strategies
- **[Complete Setup Guide](./COMPLETE-SETUP-GUIDE.md)** - 7-phase deployment
- **[Troubleshooting Guide](../troubleshooting/CLAUDE-FLOW-ZOD-FIX.md)** - Issue solutions
- **[Claude Flow Workflows](../workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md)** - Essential workflows

### Plugin Development
- **Plugin Creator**: Use `plugin-creator` to scaffold new plugins
- **IPFS Publishing**: Decentralized plugin marketplace via IPNS
- **Ed25519 Signing**: Cryptographic verification for trust

### Official Plugins Registry
- **IPNS Address**: `k51qzi5uqu5dkplugin53t7w9w2d4xk6x0qkdvqv5h0h8rma`
- **Trust Levels**: unverified → community → verified → official
- **9 Plugins Available**: 6 official, 3 community

---

## ✅ Plugin Setup Checklist

- [x] Neural Patterns v3.0.0 installed and active
- [x] Security Scanner v3.0.0 installed and active
- [x] Vector Embeddings v3.0.0 installed and active
- [x] Performance Profiler v3.0.0 installed and active
- [x] Claims Authorization v3.0.0 installed and active
- [x] Plugin Creator Pro v2.1.0 installed and active
- [x] MCP server running (PID 65236)
- [x] Claude Flow daemon running (PID 12672)
- [x] Memory database operational (.swarm/memory.db)
- [ ] Claude API key configured (optional, using OpenAI)
- [x] All 16 hooks registered across plugins
- [x] All 24 commands available

**Total Hooks Registered**: 16
**Total Commands Added**: 24
**Total Plugin Size**: 1.11 MB

---

**Plugin Setup Complete!** 🎉

All official claude-flow plugins are installed, enabled, and operational. The system is ready for:
- Neural pattern learning and optimization
- Security scanning and CVE detection
- Vector embeddings and semantic search
- Performance profiling and bottleneck analysis
- Fine-grained claims-based authorization
- Custom plugin development and publishing

**Last Updated**: 2026-01-15
**Status**: Operational
**Next Steps**: Configure Claude API key for enhanced capabilities

For support: support@ratehunter.net
