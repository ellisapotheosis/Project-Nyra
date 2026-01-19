# SPARC Ingestion Workflow - Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites Check

```bash
# Verify Claude Flow CLI is available
npx @claude-flow/cli@latest --version

# Start daemon if not running
npx @claude-flow/cli@latest daemon start

# Initialize memory
npx @claude-flow/cli@latest memory init
```

### 2. Make Scripts Executable

```bash
chmod +x scripts/ingestion/*.sh
```

### 3. Run Your First Workflow

```bash
# Process a single directory
./scripts/ingestion/sparc-workflow.sh \
  --item "_archive/ingestion-historical-2026-01-18/ingest/NyraDocs" \
  --type docs \
  --output "docs/ingested"
```

### 4. Check Status

```bash
# Monitor workflow progress
./scripts/ingestion/workflow-status.sh --all
```

## Common Commands

### Single Item Processing

```bash
# Basic processing
./scripts/ingestion/sparc-workflow.sh \
  --item <PATH> \
  --type <TYPE> \
  --output <OUTPUT>

# With context
./scripts/ingestion/sparc-workflow.sh \
  --item <PATH> \
  --type <TYPE> \
  --context "Your context here"

# Dry run first
./scripts/ingestion/sparc-workflow.sh \
  --item <PATH> \
  --dry-run
```

### Batch Processing

```bash
# Process multiple directories
./scripts/ingestion/batch-process.sh \
  --parallel 4 \
  --type docs \
  _archive/ingestion-historical-2026-01-18/ingest/*

# With custom output
./scripts/ingestion/batch-process.sh \
  --parallel 8 \
  --output "docs/processed" \
  <DIRECTORY_PATTERN>
```

### Monitoring

```bash
# View all workflows
./scripts/ingestion/workflow-status.sh --all

# Watch mode (auto-refresh)
./scripts/ingestion/workflow-status.sh --all --watch

# Check specific item
./scripts/ingestion/workflow-status.sh --item-id <ID>

# JSON output
./scripts/ingestion/workflow-status.sh --all --format json
```

## Quick Examples

### Example 1: Process Documentation

```bash
./scripts/ingestion/sparc-workflow.sh \
  --item "_archive/ingestion-historical-2026-01-18/ingest/NyraDocs" \
  --type docs \
  --output "docs/ingested/nyra-docs"
```

### Example 2: Batch Process Configurations

```bash
./scripts/ingestion/batch-process.sh \
  --parallel 6 \
  --type config \
  --output "config/ingested" \
  _archive/ingestion-historical-2026-01-18/ingest/.nyra-backups/*
```

### Example 3: Process with Context

```bash
./scripts/ingestion/sparc-workflow.sh \
  --item "./custom-data" \
  --type code \
  --context "Extract reusable components and patterns" \
  --output "src/ingested"
```

## Troubleshooting

### CLI Not Found

```bash
npm install -g @claude-flow/cli@latest
```

### Daemon Not Running

```bash
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest daemon status
```

### Memory Issues

```bash
npx @claude-flow/cli@latest memory init --force
npx @claude-flow/cli@latest memory stats
```

### Check Logs

```bash
tail -f .claude-flow/logs/daemon.log
```

## Next Steps

For detailed information, see:
- **Full Guide**: `docs/workflows/sparc-ingestion-guide.md`
- **Workflow Definition**: `.claude-flow/workflows/ingestion-sparc.json`
- **Script Source**: `scripts/ingestion/`

## Support

Run diagnostics:
```bash
npx @claude-flow/cli@latest doctor
```

For help:
```bash
./scripts/ingestion/sparc-workflow.sh --help
./scripts/ingestion/batch-process.sh --help
./scripts/ingestion/workflow-status.sh --help
```
