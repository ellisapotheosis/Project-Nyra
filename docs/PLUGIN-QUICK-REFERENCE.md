# Claude Flow v3 Plugins - Quick Reference Card

## Installation Commands

### List Available Plugins
```bash
# View all plugins in registry
npx @claude-flow/cli@latest plugins list

# View installed plugins only
npx @claude-flow/cli@latest plugins list --installed

# Search for specific plugin
npx @claude-flow/cli@latest plugins search "embeddings"
```

### Install Plugins
```bash
# Install essential plugins (recommended)
pnpm add -D \
  @claude-flow/embeddings@latest \
  @claude-flow/security@latest \
  @claude-flow/neural@latest \
  @claude-flow/performance@latest

# Install via CLI
npx @claude-flow/cli@latest plugins install @claude-flow/embeddings

# Install multiple plugins
npx @claude-flow/cli@latest plugins install \
  @claude-flow/embeddings \
  @claude-flow/security \
  @claude-flow/neural
```

### Enable/Disable Plugins
```bash
# Enable plugin
npx @claude-flow/cli@latest plugins enable @claude-flow/embeddings

# Disable plugin
npx @claude-flow/cli@latest plugins disable @claude-flow/embeddings

# Check plugin status
npx @claude-flow/cli@latest plugins info @claude-flow/embeddings
```

## Embeddings Plugin (@claude-flow/embeddings)

### Initialize
```bash
# Initialize with agentic-flow provider (75x faster)
npx @claude-flow/cli@latest embeddings init --provider agentic-flow

# Initialize with custom model
npx @claude-flow/cli@latest embeddings init \
  --provider agentic-flow \
  --model all-minilm-l6-v2 \
  --dimensions 384
```

### Embed Documents
```bash
# Embed single document
npx @claude-flow/cli@latest embeddings embed \
  --input ./docs/mortgage-patterns.md \
  --output ./data/embeddings

# Batch embed directory
npx @claude-flow/cli@latest embeddings batch \
  --input ./docs \
  --output ./data/embeddings \
  --format markdown \
  --chunk-size 512 \
  --chunk-overlap 50

# Embed with metadata
npx @claude-flow/cli@latest embeddings embed \
  --input ./docs/TILA-disclosure.md \
  --metadata '{"type":"compliance","regulation":"TILA"}' \
  --output ./data/embeddings/compliance
```

### Search Embeddings
```bash
# Semantic search
npx @claude-flow/cli@latest embeddings search \
  --query "conventional loan qualification requirements" \
  --k 5 \
  --threshold 0.7

# Search with filters
npx @claude-flow/cli@latest embeddings search \
  --query "DTI calculation" \
  --filter 'type=compliance' \
  --k 10

# Export results
npx @claude-flow/cli@latest embeddings search \
  --query "mortgage rates" \
  --output ./results/search-results.json
```

## Security Plugin (@claude-flow/security)

### Security Scanning
```bash
# Full security scan
npx @claude-flow/cli@latest security scan --depth full

# Quick scan
npx @claude-flow/cli@latest security scan --depth quick

# Scan specific directory
npx @claude-flow/cli@latest security scan \
  --path ./services/quote-api \
  --depth full
```

### CVE Detection
```bash
# Check for CVEs in dependencies
npx @claude-flow/cli@latest security cve

# Filter by severity
npx @claude-flow/cli@latest security cve --severity high

# Check specific package
npx @claude-flow/cli@latest security cve --package express
```

### Audit Dependencies
```bash
# Audit all dependencies
npx @claude-flow/cli@latest security audit

# Auto-fix vulnerabilities
npx @claude-flow/cli@latest security audit --fix

# Generate audit report
npx @claude-flow/cli@latest security audit \
  --report \
  --output ./reports/security-audit.json
```

### Input Validation
```bash
# Validate against schema
npx @claude-flow/cli@latest security validate \
  --schema ./schemas/mortgage-input.json \
  --input ./data/sample-quote.json

# Validate API endpoints
npx @claude-flow/cli@latest security validate \
  --api-spec ./openapi.yaml
```

### Security Report
```bash
# Generate comprehensive report
npx @claude-flow/cli@latest security report \
  --format markdown \
  --output ./docs/SECURITY_REPORT.md

# Include recommendations
npx @claude-flow/cli@latest security report \
  --recommendations \
  --format json
```

## Neural Plugin (@claude-flow/neural)

### Train Patterns
```bash
# Train on coordination patterns
npx @claude-flow/cli@latest neural train \
  --pattern-type coordination \
  --epochs 10

# Train on mortgage workflows
npx @claude-flow/cli@latest neural train \
  --pattern-type workflow \
  --data ./data/successful-quotes \
  --epochs 20

# Train with custom learning rate
npx @claude-flow/cli@latest neural train \
  --pattern-type optimization \
  --learning-rate 0.001 \
  --epochs 15
```

### Predict Optimal Approach
```bash
# Get routing recommendation
npx @claude-flow/cli@latest neural predict \
  --input "Generate mortgage quote for conventional loan"

# Predict with context
npx @claude-flow/cli@latest neural predict \
  --input "Process 1003 application" \
  --context '{"borrower_type":"first-time","loan_amount":350000}'
```

### View Learned Patterns
```bash
# List all patterns
npx @claude-flow/cli@latest neural patterns --list

# View specific pattern
npx @claude-flow/cli@latest neural patterns --show coordination

# Export patterns
npx @claude-flow/cli@latest neural patterns \
  --export \
  --output ./data/neural-patterns.json
```

### Optimize Neural Model
```bash
# Optimize for inference speed
npx @claude-flow/cli@latest neural optimize --target inference-speed

# Optimize for memory usage
npx @claude-flow/cli@latest neural optimize --target memory

# Optimize for accuracy
npx @claude-flow/cli@latest neural optimize --target accuracy
```

### View Training Status
```bash
# Check training progress
npx @claude-flow/cli@latest neural status

# View metrics
npx @claude-flow/cli@latest neural status --metrics

# Export training logs
npx @claude-flow/cli@latest neural status \
  --export \
  --output ./logs/neural-training.log
```

## Performance Plugin (@claude-flow/performance)

### Run Benchmarks
```bash
# Run all benchmarks
npx @claude-flow/cli@latest performance benchmark --suite all

# Specific benchmark
npx @claude-flow/cli@latest performance benchmark --suite memory

# Custom duration
npx @claude-flow/cli@latest performance benchmark \
  --suite all \
  --duration 120s
```

### Profile Components
```bash
# Profile quote API
npx @claude-flow/cli@latest performance profile \
  --target quote-api \
  --duration 60s

# Profile with flame graph
npx @claude-flow/cli@latest performance profile \
  --target orchestrator \
  --flame-graph \
  --output ./reports/flame-graph.html
```

### View Metrics
```bash
# Real-time metrics
npx @claude-flow/cli@latest performance metrics --watch

# Export metrics
npx @claude-flow/cli@latest performance metrics \
  --export \
  --format prometheus \
  --output ./data/metrics.txt
```

### Optimize Performance
```bash
# Auto-optimize
npx @claude-flow/cli@latest performance optimize --auto

# Optimize specific target
npx @claude-flow/cli@latest performance optimize \
  --target vector-search \
  --goal latency

# Generate optimization report
npx @claude-flow/cli@latest performance optimize \
  --analyze \
  --report ./docs/OPTIMIZATION_REPORT.md
```

### Generate Performance Report
```bash
# Comprehensive report
npx @claude-flow/cli@latest performance report \
  --format markdown \
  --output ./docs/performance/BENCHMARK_REPORT.md

# Include comparisons
npx @claude-flow/cli@latest performance report \
  --compare-with baseline \
  --format html
```

## Plugin Management

### Discovery
```bash
# Discover plugins in node_modules
npx @claude-flow/cli@latest plugins discover

# Scan specific path
npx @claude-flow/cli@latest plugins discover --path ./custom-plugins

# Rebuild plugin cache
npx @claude-flow/cli@latest plugins discover --rebuild
```

### Update Plugins
```bash
# Update all plugins
npx @claude-flow/cli@latest plugins update --all

# Update specific plugin
npx @claude-flow/cli@latest plugins update @claude-flow/embeddings

# Check for updates
npx @claude-flow/cli@latest plugins outdated
```

### Uninstall Plugins
```bash
# Uninstall plugin
npx @claude-flow/cli@latest plugins uninstall @claude-flow/embeddings

# Remove from npm
pnpm remove @claude-flow/embeddings
```

### Plugin Info
```bash
# Get plugin details
npx @claude-flow/cli@latest plugins info @claude-flow/embeddings

# View plugin dependencies
npx @claude-flow/cli@latest plugins info \
  @claude-flow/neural \
  --dependencies

# Check compatibility
npx @claude-flow/cli@latest plugins info \
  @claude-flow/security \
  --compatibility
```

## Configuration

### View Plugin Config
```bash
# Get plugin configuration
npx @claude-flow/cli@latest config get plugins

# Get specific plugin config
npx @claude-flow/cli@latest config get plugins.config.@claude-flow/embeddings
```

### Set Plugin Config
```bash
# Enable auto-discovery
npx @claude-flow/cli@latest config set plugins.autoDiscover true

# Set plugin path
npx @claude-flow/cli@latest config set plugins.paths '["./plugins","./node_modules"]'

# Configure embeddings provider
npx @claude-flow/cli@latest config set \
  plugins.config.@claude-flow/embeddings.provider agentic-flow
```

## Integration Examples

### RuVector Integration (Embeddings)
```bash
# Initialize RuVector with embeddings
npx @claude-flow/cli@latest memory init --backend ruvector --hnsw-enabled

# Index mortgage documents
npx @claude-flow/cli@latest embeddings batch \
  --input ./services/ruvector-search/data \
  --output ./data/memory/embeddings

# Search indexed documents
npx @claude-flow/cli@latest embeddings search \
  --query "FHA loan requirements" \
  --k 5
```

### Pre-commit Security Integration
```bash
# Enable security scan on commit
npx @claude-flow/cli@latest config set \
  plugins.config.@claude-flow/security.scanOnCommit true

# Run security scan before commit
npx @claude-flow/cli@latest hooks pre-command \
  --command "git commit" \
  --plugin security \
  --scan true
```

### Neural Training After Success
```bash
# Train on successful workflow
npx @claude-flow/cli@latest hooks post-task \
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
npx @claude-flow/cli@latest plugins discover --rebuild
```

### Version Conflicts
```bash
# Check installed versions
npm list @claude-flow/embeddings

# Update to latest compatible version
npx @claude-flow/cli@latest plugins update @claude-flow/embeddings --compatible
```

### Configuration Issues
```bash
# Validate config file
npx @claude-flow/cli@latest config validate

# Reset plugin config
npx @claude-flow/cli@latest config reset plugins

# Run health check
npx @claude-flow/cli@latest doctor --plugins
```

### IPFS Registry Slow
```bash
# Use direct CID
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

# Use faster gateway
export CLAUDE_FLOW_PLUGIN_REGISTRY_GATEWAY=https://gateway.pinata.cloud

# List with direct CID
npx @claude-flow/cli@latest plugins list --cid QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834
```

## Common Workflows

### Initial Setup
```bash
# 1. Run installation script
./scripts/install-claude-flow-plugins.sh

# 2. Validate installation
npx @claude-flow/cli@latest plugins list --installed
npx @claude-flow/cli@latest doctor

# 3. Initialize essential plugins
npx @claude-flow/cli@latest embeddings init --provider agentic-flow
npx @claude-flow/cli@latest hooks pretrain --model-type moe
```

### Daily Development
```bash
# 1. Check for plugin updates
npx @claude-flow/cli@latest plugins outdated

# 2. Run security scan
npx @claude-flow/cli@latest security scan --quick

# 3. Search for patterns
npx @claude-flow/cli@latest embeddings search --query "your task"

# 4. Get neural prediction
npx @claude-flow/cli@latest neural predict --input "your workflow"
```

### Pre-deployment
```bash
# 1. Full security audit
npx @claude-flow/cli@latest security audit --fix

# 2. Performance benchmarks
npx @claude-flow/cli@latest performance benchmark --suite all

# 3. Generate reports
npx @claude-flow/cli@latest security report \
  --output ./reports/security-$(date +%Y%m%d).md
npx @claude-flow/cli@latest performance report \
  --output ./reports/performance-$(date +%Y%m%d).md

# 4. Train on recent patterns
npx @claude-flow/cli@latest neural train --pattern-type all --epochs 5
```

## Environment Variables

```bash
# Plugin Registry
export CLAUDE_FLOW_PLUGIN_REGISTRY=claude-flow-official
export CLAUDE_FLOW_PLUGIN_REGISTRY_CID=QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834
export CLAUDE_FLOW_PLUGIN_REGISTRY_GATEWAY=https://gateway.pinata.cloud

# Plugin Paths
export CLAUDE_FLOW_PLUGIN_PATH=./node_modules
export CLAUDE_CODE_PLUGIN_PATH=~/.claude/plugins

# Auto-discovery
export CLAUDE_FLOW_PLUGIN_AUTO_DISCOVER=true

# Embeddings
export CLAUDE_FLOW_EMBEDDINGS_PROVIDER=agentic-flow
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
alias cf='npx @claude-flow/cli@latest'
alias cfpl='npx @claude-flow/cli@latest plugins list'
alias cfps='npx @claude-flow/cli@latest plugins search'
alias cfpi='npx @claude-flow/cli@latest plugins install'
alias cfes='npx @claude-flow/cli@latest embeddings search'
alias cfss='npx @claude-flow/cli@latest security scan'
alias cfnt='npx @claude-flow/cli@latest neural train'
alias cfpb='npx @claude-flow/cli@latest performance benchmark'
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

1. **CRITICAL**: `@claude-flow/embeddings` - 75x faster search
2. **CRITICAL**: `@claude-flow/security` - CVE detection
3. **HIGH**: `@claude-flow/neural` - Pattern learning
4. **HIGH**: `@claude-flow/performance` - Optimization
5. **MEDIUM**: Domain-specific plugins (future)

---

**Quick Links**:
- Setup Guide: `/docs/CLAUDE-FLOW-PLUGINS-SETUP.md`
- Architecture: `/docs/PLUGIN-ARCHITECTURE.md`
- Config File: `/claude-flow.config.json`
- Installation Script: `/scripts/install-claude-flow-plugins.sh`

**Support**:
- Claude Flow Docs: https://github.com/ruvnet/claude-flow
- Issue Tracker: https://github.com/ruvnet/claude-flow/issues
- Plugin Registry: IPFS QmXbfEAaR7D2Ujm4GAkbwcGZQMHqAMpwDoje4583uNP834

**Last Updated**: 2026-01-26
