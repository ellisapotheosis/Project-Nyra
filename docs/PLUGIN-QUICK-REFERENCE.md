# Claude Flow v3 Plugins - Quick Reference Card

## Installation Commands

### List Available Plugins
```bash
# View all plugins in registry
npx @archon-os/cli@latest plugins list

# View installed plugins only
npx @archon-os/cli@latest plugins list --installed

# Search for specific plugin
npx @archon-os/cli@latest plugins search "embeddings"
```

### Install Plugins
```bash
# Install essential plugins (recommended)
pnpm add -D \
  @archon-os/embeddings@latest \
  @archon-os/security@latest \
  @archon-os/neural@latest \
  @archon-os/performance@latest

# Install via CLI
npx @archon-os/cli@latest plugins install @archon-os/embeddings

# Install multiple plugins
npx @archon-os/cli@latest plugins install \
  @archon-os/embeddings \
  @archon-os/security \
  @archon-os/neural
```

### Enable/Disable Plugins
```bash
# Enable plugin
npx @archon-os/cli@latest plugins enable @archon-os/embeddings

# Disable plugin
npx @archon-os/cli@latest plugins disable @archon-os/embeddings

# Check plugin status
npx @archon-os/cli@latest plugins info @archon-os/embeddings
```

## Embeddings Plugin (@archon-os/embeddings)

### Initialize
```bash
# Initialize with archon-os provider (75x faster)
npx @archon-os/cli@latest embeddings init --provider archon-os

# Initialize with custom model
npx @archon-os/cli@latest embeddings init \
  --provider archon-os \
  --model all-minilm-l6-v2 \
  --dimensions 384
```

### Embed Documents
```bash
# Embed single document
npx @archon-os/cli@latest embeddings embed \
  --input ./docs/mortgage-patterns.md \
  --output ./data/embeddings

# Batch embed directory
npx @archon-os/cli@latest embeddings batch \
  --input ./docs \
  --output ./data/embeddings \
  --format markdown \
  --chunk-size 512 \
  --chunk-overlap 50

# Embed with metadata
npx @archon-os/cli@latest embeddings embed \
  --input ./docs/TILA-disclosure.md \
  --metadata '{"type":"compliance","regulation":"TILA"}' \
  --output ./data/embeddings/compliance
```

### Search Embeddings
```bash
# Semantic search
npx @archon-os/cli@latest embeddings search \
  --query "conventional loan qualification requirements" \
  --k 5 \
  --threshold 0.7

# Search with filters
npx @archon-os/cli@latest embeddings search \
  --query "DTI calculation" \
  --filter 'type=compliance' \
  --k 10

# Export results
npx @archon-os/cli@latest embeddings search \
  --query "mortgage rates" \
  --output ./results/search-results.json
```

## Security Plugin (@archon-os/security)

### Security Scanning
```bash
# Full security scan
npx @archon-os/cli@latest security scan --depth full

# Quick scan
npx @archon-os/cli@latest security scan --depth quick

# Scan specific directory
npx @archon-os/cli@latest security scan \
  --path ./services/quote-api \
  --depth full
```

### CVE Detection
```bash
# Check for CVEs in dependencies
npx @archon-os/cli@latest security cve

# Filter by severity
npx @archon-os/cli@latest security cve --severity high

# Check specific package
npx @archon-os/cli@latest security cve --package express
```

### Audit Dependencies
```bash
# Audit all dependencies
npx @archon-os/cli@latest security audit

# Auto-fix vulnerabilities
npx @archon-os/cli@latest security audit --fix

# Generate audit report
npx @archon-os/cli@latest security audit \
  --report \
  --output ./reports/security-audit.json
```

### Input Validation
```bash
# Validate against schema
npx @archon-os/cli@latest security validate \
  --schema ./schemas/mortgage-input.json \
  --input ./data/sample-quote.json

# Validate API endpoints
npx @archon-os/cli@latest security validate \
  --api-spec ./openapi.yaml
```

### Security Report
```bash
# Generate comprehensive report
npx @archon-os/cli@latest security report \
  --format markdown \
  --output ./docs/SECURITY_REPORT.md

# Include recommendations
npx @archon-os/cli@latest security report \
  --recommendations \
  --format json
```

## Neural Plugin (@archon-os/neural)

### Train Patterns
```bash
# Train on coordination patterns
npx @archon-os/cli@latest neural train \
  --pattern-type coordination \
  --epochs 10

# Train on mortgage workflows
npx @archon-os/cli@latest neural train \
  --pattern-type workflow \
  --data ./data/successful-quotes \
  --epochs 20

# Train with custom learning rate
npx @archon-os/cli@latest neural train \
  --pattern-type optimization \
  --learning-rate 0.001 \
  --epochs 15
```

### Predict Optimal Approach
```bash
# Get routing recommendation
npx @archon-os/cli@latest neural predict \
  --input "Generate mortgage quote for conventional loan"

# Predict with context
npx @archon-os/cli@latest neural predict \
  --input "Process 1003 application" \
  --context '{"borrower_type":"first-time","loan_amount":350000}'
```

### View Learned Patterns
```bash
# List all patterns
npx @archon-os/cli@latest neural patterns --list

# View specific pattern
npx @archon-os/cli@latest neural patterns --show coordination

# Export patterns
npx @archon-os/cli@latest neural patterns \
  --export \
  --output ./data/neural-patterns.json
```

### Optimize Neural Model
```bash
# Optimize for inference speed
npx @archon-os/cli@latest neural optimize --target inference-speed

# Optimize for memory usage
npx @archon-os/cli@latest neural optimize --target memory

# Optimize for accuracy
npx @archon-os/cli@latest neural optimize --target accuracy
```

### View Training Status
```bash
# Check training progress
npx @archon-os/cli@latest neural status

# View metrics
npx @archon-os/cli@latest neural status --metrics

# Export training logs
npx @archon-os/cli@latest neural status \
  --export \
  --output ./logs/neural-training.log
```

## Performance Plugin (@archon-os/performance)

### Run Benchmarks
```bash
# Run all benchmarks
npx @archon-os/cli@latest performance benchmark --suite all

# Specific benchmark
npx @archon-os/cli@latest performance benchmark --suite memory

# Custom duration
npx @archon-os/cli@latest performance benchmark \
  --suite all \
  --duration 120s
```

### Profile Components
```bash
# Profile quote API
npx @archon-os/cli@latest performance profile \
  --target quote-api \
  --duration 60s

# Profile with flame graph
npx @archon-os/cli@latest performance profile \
  --target orchestrator \
  --flame-graph \
  --output ./reports/flame-graph.html
```

### View Metrics
```bash
# Real-time metrics
npx @archon-os/cli@latest performance metrics --watch

# Export metrics
npx @archon-os/cli@latest performance metrics \
  --export \
  --format prometheus \
  --output ./data/metrics.txt
```

### Optimize Performance
```bash
# Auto-optimize
npx @archon-os/cli@latest performance optimize --auto

# Optimize specific target
npx @archon-os/cli@latest performance optimize \
  --target vector-search \
  --goal latency

# Generate optimization report
npx @archon-os/cli@latest performance optimize \
  --analyze \
  --report ./docs/OPTIMIZATION_REPORT.md
```

### Generate Performance Report
```bash
# Comprehensive report
npx @archon-os/cli@latest performance report \
  --format markdown \
  --output ./docs/performance/BENCHMARK_REPORT.md

# Include comparisons
npx @archon-os/cli@latest performance report \
  --compare-with baseline \
  --format html
```

## Plugin Management

### Discovery
```bash
# Discover plugins in node_modules
npx @archon-os/cli@latest plugins discover

# Scan specific path
npx @archon-os/cli@latest plugins discover --path ./custom-plugins

# Rebuild plugin cache
npx @archon-os/cli@latest plugins discover --rebuild
```

### Update Plugins
```bash
# Update all plugins
npx @archon-os/cli@latest plugins update --all

# Update specific plugin
npx @archon-os/cli@latest plugins update @archon-os/embeddings

# Check for updates
npx @archon-os/cli@latest plugins outdated
```

### Uninstall Plugins
```bash
# Uninstall plugin
npx @archon-os/cli@latest plugins uninstall @archon-os/embeddings

# Remove from npm
pnpm remove @archon-os/embeddings
```

### Plugin Info
```bash
# Get plugin details
npx @archon-os/cli@latest plugins info @archon-os/embeddings

# View plugin dependencies
npx @archon-os/cli@latest plugins info \
  @archon-os/neural \
  --dependencies

# Check compatibility
npx @archon-os/cli@latest plugins info \
  @archon-os/security \
  --compatibility
```

## Configuration

### View Plugin Config
```bash
# Get plugin configuration
npx @archon-os/cli@latest config get plugins

# Get specific plugin config
npx @archon-os/cli@latest config get plugins.config.@archon-os/embeddings
```

### Set Plugin Config
```bash
# Enable auto-discovery
npx @archon-os/cli@latest config set plugins.autoDiscover true

# Set plugin path
npx @archon-os/cli@latest config set plugins.paths '["./plugins","./node_modules"]'

# Configure embeddings provider
npx @archon-os/cli@latest config set \
  plugins.config.@archon-os/embeddings.provider archon-os
```

## Integration Examples

### RuVector Integration (Embeddings)
```bash
# Initialize RuVector with embeddings
npx @archon-os/cli@latest memory init --backend ruvector --hnsw-enabled

# Index mortgage documents
npx @archon-os/cli@latest embeddings batch \
  --input ./services/ruvector-search/data \
  --output ./data/memory/embeddings

# Search indexed documents
npx @archon-os/cli@latest embeddings search \
  --query "FHA loan requirements" \
  --k 5
```

### Pre-commit Security Integration
```bash
# Enable security scan on commit
npx @archon-os/cli@latest config set \
  plugins.config.@archon-os/security.scanOnCommit true

# Run security scan before commit
npx @archon-os/cli@latest hooks pre-command \
  --command "git commit" \
  --plugin security \
  --scan true
```

### Neural Training After Success
```bash
# Train on successful workflow
npx @archon-os/cli@latest hooks post-task \
  --plugin neural \
  --train-on-success true \
  --pattern-type workflow
```

## Troubleshooting

### Plugin Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules/.cache
pnpm install --force

# Rebuild plugin index
npx @archon-os/cli@latest plugins discover --rebuild
```

### Version Conflicts
```bash
# Check installed versions
npm list @archon-os/embeddings

# Update to latest compatible version
npx @archon-os/cli@latest plugins update @archon-os/embeddings --compatible
```

### Configuration Issues
```bash
# Validate config file
npx @archon-os/cli@latest config validate

# Reset plugin config
npx @archon-os/cli@latest config reset plugins

# Run health check
npx @archon-os/cli@latest doctor --plugins
```

### IPFS Registry Slow
```bash
# Use direct CID
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

# Use faster gateway
export CLAUDE_FLOW_PLUGIN_REGISTRY_GATEWAY=https://gateway.pinata.cloud

# List with direct CID
npx @archon-os/cli@latest plugins list --cid QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834
```

## Common Workflows

### Initial Setup
```bash
# 1. Run installation script
./scripts/install-archon-os-plugins.sh

# 2. Validate installation
npx @archon-os/cli@latest plugins list --installed
npx @archon-os/cli@latest doctor

# 3. Initialize essential plugins
npx @archon-os/cli@latest embeddings init --provider archon-os
npx @archon-os/cli@latest hooks pretrain --model-type moe
```

### Daily Development
```bash
# 1. Check for plugin updates
npx @archon-os/cli@latest plugins outdated

# 2. Run security scan
npx @archon-os/cli@latest security scan --quick

# 3. Search for patterns
npx @archon-os/cli@latest embeddings search --query "your task"

# 4. Get neural prediction
npx @archon-os/cli@latest neural predict --input "your workflow"
```

### Pre-deployment
```bash
# 1. Full security audit
npx @archon-os/cli@latest security audit --fix

# 2. Performance benchmarks
npx @archon-os/cli@latest performance benchmark --suite all

# 3. Generate reports
npx @archon-os/cli@latest security report \
  --output ./reports/security-$(date +%Y%m%d).md
npx @archon-os/cli@latest performance report \
  --output ./reports/performance-$(date +%Y%m%d).md

# 4. Train on recent patterns
npx @archon-os/cli@latest neural train --pattern-type all --epochs 5
```

## Environment Variables

```bash
# Plugin Registry
export CLAUDE_FLOW_PLUGIN_REGISTRY=archon-os-official
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834
export CLAUDE_FLOW_PLUGIN_REGISTRY_GATEWAY=https://gateway.pinata.cloud

# Plugin Paths
export CLAUDE_FLOW_PLUGIN_PATH=./node_modules
export CLAUDE_CODE_PLUGIN_PATH=~/.claude/plugins

# Auto-discovery
export CLAUDE_FLOW_PLUGIN_AUTO_DISCOVER=true

# Embeddings
export CLAUDE_FLOW_EMBEDDINGS_PROVIDER=archon-os
export CLAUDE_FLOW_EMBEDDINGS_ONNX=true
export CLAUDE_FLOW_EMBEDDINGS_BATCH_SIZE=32

# Security
export CLAUDE_FLOW_SECURITY_SCAN_ON_COMMIT=true
export CLAUDE_FLOW_SECURITY_CVE_DB=nvd
export CLAUDE_FLOW_SECURITY_SEVERITY=medium

# Neural
export CLAUDE_FLOW_NEURAL_MODEL_TYPE=moe
export CLAUDE_FLOW_NEURAL_TRAIN_ON_SUCCESS=true
export CLAUDE_FLOW_NEURAL_EPOCHS=10

# Performance
export CLAUDE_FLOW_PERFORMANCE_TRACK_METRICS=true
export CLAUDE_FLOW_PERFORMANCE_AUTO_OPTIMIZE=true
```

## Keyboard Shortcuts (if terminal supports)

```bash
# Alias suggestions for .bashrc or .zshrc
alias cf='npx @archon-os/cli@latest'
alias cfpl='npx @archon-os/cli@latest plugins list'
alias cfps='npx @archon-os/cli@latest plugins search'
alias cfpi='npx @archon-os/cli@latest plugins install'
alias cfes='npx @archon-os/cli@latest embeddings search'
alias cfss='npx @archon-os/cli@latest security scan'
alias cfnt='npx @archon-os/cli@latest neural train'
alias cfpb='npx @archon-os/cli@latest performance benchmark'
```

## Quick Decision Matrix

### Which Plugin Should I Use?

| Task | Plugin | Command |
|------|--------|---------|
| Search documents | embeddings | `embeddings search --query "..."` |
| Find security issues | security | `security scan --depth full` |
| Learn from patterns | neural | `neural train --pattern-type ...` |
| Measure performance | performance | `performance benchmark --suite all` |
| Authorize actions | claims | `claims check --action ...` |

### Plugin Priority for Nyra

1. **CRITICAL**: `@archon-os/embeddings` - 75x faster search
2. **CRITICAL**: `@archon-os/security` - CVE detection
3. **HIGH**: `@archon-os/neural` - Pattern learning
4. **HIGH**: `@archon-os/performance` - Optimization
5. **MEDIUM**: Domain-specific plugins (future)

---

**Quick Links**:
- Setup Guide: `/docs/archon-os-PLUGINS-SETUP.md`
- Architecture: `/docs/PLUGIN-ARCHITECTURE.md`
- Config File: `/archon-os.config.json`
- Installation Script: `/scripts/install-archon-os-plugins.sh`

**Support**:
- Claude Flow Docs: https://github.com/ruvnet/archon-os
- Issue Tracker: https://github.com/ruvnet/archon-os/issues
- Plugin Registry: IPFS QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

**Last Updated**: 2026-01-26
