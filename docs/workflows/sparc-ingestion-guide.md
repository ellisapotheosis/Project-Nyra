# SPARC Ingestion Workflow Guide

## Overview

The SPARC Ingestion Workflow is a systematic approach to processing ingestion pipeline items using the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology. This workflow ensures consistent, high-quality processing of diverse content types through structured phases.

## Table of Contents

1. [Architecture](#architecture)
2. [Workflow Phases](#workflow-phases)
3. [Usage Guide](#usage-guide)
4. [Scripts Reference](#scripts-reference)
5. [Memory Structure](#memory-structure)
6. [Troubleshooting](#troubleshooting)
7. [Examples](#examples)

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                   SPARC Workflow Pipeline                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐          │
│  │Specification│──▶│ Pseudocode │──▶│Architecture│──┐       │
│  └────────────┘   └────────────┘   └────────────┘  │       │
│                                                      │       │
│  ┌────────────┐   ┌────────────┐                   │       │
│  │ Completion │◀──│ Refinement │◀──────────────────┘       │
│  └────────────┘   └────────────┘                            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    Memory Coordination                       │
│  • Phase inputs/outputs stored in memory                    │
│  • HNSW-indexed for fast retrieval                         │
│  • Persistent across sessions                               │
└─────────────────────────────────────────────────────────────┘
```

### Components

- **Workflow Definition**: JSON configuration (`.claude-flow/workflows/ingestion-sparc.json`)
- **CLI Integration**: Claude Flow CLI for coordination
- **Memory Backend**: AgentDB with HNSW indexing
- **Agent Coordination**: Hierarchical topology with specialized agents
- **Scripts**: Shell scripts for execution and monitoring

## Workflow Phases

### Phase 1: Specification

**Agent**: `sparc-spec`
**Purpose**: Analyze ingestion item and define processing requirements

**Tasks**:
1. Analyze ingestion item structure and content
2. Identify content type and format
3. Define processing requirements
4. Document constraints and dependencies
5. Establish success criteria
6. Store specification in memory

**Inputs**:
- `itemPath`: Path to ingestion item
- `itemType`: Type of content (docs, code, config)
- `context`: Additional context or requirements

**Outputs**:
- `requirements`: Detailed requirements specification
- `constraints`: Processing constraints and limitations
- `successCriteria`: Definition of successful processing

**Memory Key**: `sparc/specification/{itemId}`

### Phase 2: Pseudocode

**Agent**: `sparc-pseudo`
**Purpose**: Design processing algorithm and approach

**Tasks**:
1. Review specification requirements
2. Design processing algorithm
3. Define processing steps
4. Map data transformation flow
5. Identify edge cases
6. Store pseudocode in memory

**Inputs**:
- `specification`: Requirements from specification phase
- `itemPath`: Path to ingestion item

**Outputs**:
- `algorithm`: Processing algorithm design
- `steps`: Step-by-step processing plan
- `dataFlow`: Data transformation flow

**Memory Key**: `sparc/pseudocode/{itemId}`

### Phase 3: Architecture

**Agent**: `sparc-arch`
**Purpose**: Design system architecture and integration points

**Tasks**:
1. Review pseudocode and requirements
2. Design system architecture
3. Define component structure
4. Plan integration points
5. Design file organization
6. Store architecture in memory

**Inputs**:
- `pseudocode`: Algorithm design from pseudocode phase
- `specification`: Requirements specification

**Outputs**:
- `architecture`: System architecture design
- `components`: Component breakdown
- `integration`: Integration strategy

**Memory Key**: `sparc/architecture/{itemId}`

### Phase 4: Refinement

**Agent**: `sparc-refine`
**Purpose**: Implement and refine the processing solution

**Tasks**:
1. Review architecture design
2. Implement processing logic
3. Process and transform content
4. Apply formatting and organization
5. Handle edge cases
6. Store implementation details in memory

**Inputs**:
- `architecture`: Architecture design
- `itemPath`: Path to ingestion item
- `targetPath`: Destination path for processed content

**Outputs**:
- `implementation`: Implemented solution
- `processedFiles`: List of processed files
- `transformations`: Applied transformations

**Memory Key**: `sparc/refinement/{itemId}`

### Phase 5: Completion

**Agent**: `sparc-complete`
**Purpose**: Validate, test, and finalize processing

**Tasks**:
1. Validate processed content
2. Run quality checks
3. Verify success criteria met
4. Generate processing report
5. Document lessons learned
6. Store completion report in memory

**Inputs**:
- `refinement`: Implementation from refinement phase
- `processedFiles`: List of processed files
- `successCriteria`: Success criteria from specification

**Outputs**:
- `validation`: Validation results
- `tests`: Test results
- `report`: Processing completion report

**Memory Key**: `sparc/completion/{itemId}`

## Usage Guide

### Prerequisites

1. **Claude Flow CLI installed**:
   ```bash
   npm install -g @claude-flow/cli@latest
   ```

2. **Claude Flow daemon running**:
   ```bash
   npx @claude-flow/cli@latest daemon start
   ```

3. **Memory system initialized**:
   ```bash
   npx @claude-flow/cli@latest memory init
   ```

### Single Item Processing

```bash
# Basic usage
./scripts/ingestion/sparc-workflow.sh \
  --item "_archive/ingestion-historical-2026-01-18/ingest/NyraDocs" \
  --type docs \
  --output "docs/ingested"

# With additional context
./scripts/ingestion/sparc-workflow.sh \
  --item "./config-files" \
  --type config \
  --context "Merge overlapping configurations" \
  --output "config/consolidated"

# Skip specific phases
./scripts/ingestion/sparc-workflow.sh \
  --item "./data" \
  --skip-phase architecture \
  --skip-phase completion

# Dry run (preview without executing)
./scripts/ingestion/sparc-workflow.sh \
  --item "./test-data" \
  --dry-run
```

### Batch Processing

```bash
# Process multiple directories
./scripts/ingestion/batch-process.sh \
  _archive/ingestion-historical-2026-01-18/ingest/*

# With parallel processing
./scripts/ingestion/batch-process.sh \
  --parallel 8 \
  --type docs \
  _archive/ingestion-historical-2026-01-18/ingest/NyraDocs/*

# Custom output directory
./scripts/ingestion/batch-process.sh \
  --output "docs/processed" \
  --results ".claude-flow/batch-results" \
  _archive/ingestion-historical-2026-01-18/ingest/*
```

### Monitoring Workflow Status

```bash
# Check specific item
./scripts/ingestion/workflow-status.sh \
  --item-id "abc123def456"

# View all workflows
./scripts/ingestion/workflow-status.sh --all

# Filter by phase
./scripts/ingestion/workflow-status.sh \
  --all \
  --phase refinement

# Watch mode (auto-refresh)
./scripts/ingestion/workflow-status.sh \
  --all \
  --watch

# JSON output
./scripts/ingestion/workflow-status.sh \
  --all \
  --format json
```

## Scripts Reference

### sparc-workflow.sh

Main workflow execution script.

**Options**:
- `-i, --item PATH`: Path to ingestion item (required)
- `-t, --type TYPE`: Item type (docs, code, config, etc.)
- `-o, --output PATH`: Target output path
- `-c, --context TEXT`: Additional context
- `-s, --skip-phase PHASE`: Skip a specific phase
- `-d, --dry-run`: Preview without executing
- `-v, --verbose`: Verbose output
- `-h, --help`: Show help

### batch-process.sh

Batch processing script for multiple items.

**Options**:
- `-p, --parallel N`: Maximum parallel processes (default: 4)
- `-t, --type TYPE`: Item type
- `-o, --output DIR`: Base output directory
- `-r, --results DIR`: Results directory
- `-d, --dry-run`: Preview mode
- `-h, --help`: Show help

### workflow-status.sh

Status monitoring and reporting script.

**Options**:
- `-i, --item-id ID`: Check specific item ID
- `-a, --all`: Show all workflow executions
- `-p, --phase PHASE`: Filter by phase
- `-l, --limit N`: Limit results (default: 10)
- `-f, --format FORMAT`: Output format (table, json, summary)
- `-w, --watch`: Watch mode (refresh every 5s)
- `-h, --help`: Show help

## Memory Structure

### Namespace: `ingestion-sparc`

The workflow uses a structured memory namespace for coordination:

```
ingestion-sparc/
├── sparc/
│   ├── specification/
│   │   ├── {itemId}-input
│   │   └── {itemId}-output
│   ├── pseudocode/
│   │   ├── {itemId}-input
│   │   └── {itemId}-output
│   ├── architecture/
│   │   ├── {itemId}-input
│   │   └── {itemId}-output
│   ├── refinement/
│   │   ├── {itemId}-input
│   │   └── {itemId}-output
│   └── completion/
│       ├── {itemId}-input
│       └── {itemId}-output
└── metrics/
    └── {itemId}
```

### Querying Memory

```bash
# Search all SPARC entries
npx @claude-flow/cli@latest memory search \
  --query "sparc" \
  --namespace ingestion-sparc

# Retrieve specific phase output
npx @claude-flow/cli@latest memory retrieve \
  --key "sparc/specification/abc123-output" \
  --namespace ingestion-sparc

# List all entries
npx @claude-flow/cli@latest memory list \
  --namespace ingestion-sparc \
  --limit 50
```

## Troubleshooting

### Common Issues

#### 1. CLI Not Found

**Problem**: `@claude-flow/cli: command not found`

**Solution**:
```bash
# Install CLI globally
npm install -g @claude-flow/cli@latest

# Or use npx
npx @claude-flow/cli@latest <command>
```

#### 2. Memory Not Initialized

**Problem**: `Memory database not initialized`

**Solution**:
```bash
npx @claude-flow/cli@latest memory init --force
```

#### 3. Daemon Not Running

**Problem**: `Cannot connect to daemon`

**Solution**:
```bash
# Start daemon
npx @claude-flow/cli@latest daemon start

# Check status
npx @claude-flow/cli@latest daemon status
```

#### 4. Phase Fails

**Problem**: Phase execution fails or times out

**Solution**:
```bash
# Check logs
cat .claude-flow/logs/daemon.log

# Re-run specific phase
./scripts/ingestion/sparc-workflow.sh \
  --item "$ITEM_PATH" \
  --skip-phase specification \
  --skip-phase pseudocode
```

#### 5. Memory Retrieval Fails

**Problem**: Cannot retrieve phase results

**Solution**:
```bash
# Verify memory entry exists
npx @claude-flow/cli@latest memory search \
  --query "{itemId}" \
  --namespace ingestion-sparc

# Check memory stats
npx @claude-flow/cli@latest memory stats
```

### Debug Mode

Enable verbose logging:

```bash
# Set log level
export CLAUDE_FLOW_LOG_LEVEL=debug

# Run with verbose flag
./scripts/ingestion/sparc-workflow.sh \
  --item "$ITEM_PATH" \
  --verbose
```

## Examples

### Example 1: Process Documentation Directory

```bash
# Single directory
./scripts/ingestion/sparc-workflow.sh \
  --item "_archive/ingestion-historical-2026-01-18/ingest/NyraDocs" \
  --type docs \
  --output "docs/ingested/nyra-docs" \
  --context "Consolidate and organize documentation from multiple sources"

# Check results
./scripts/ingestion/workflow-status.sh --all
```

### Example 2: Batch Process Configuration Files

```bash
# Process all config directories
./scripts/ingestion/batch-process.sh \
  --parallel 6 \
  --type config \
  --output "config/ingested" \
  _archive/ingestion-historical-2026-01-18/ingest/.nyra-backups/*

# Monitor progress
./scripts/ingestion/workflow-status.sh --all --watch
```

### Example 3: Process Code Repositories

```bash
# Process code with specific context
./scripts/ingestion/sparc-workflow.sh \
  --item "_archive/ingestion-historical-2026-01-18/ingest/NyraDocs/claude-code-bootstrap-OUTPUT" \
  --type code \
  --output "src/ingested" \
  --context "Extract reusable components and patterns"
```

### Example 4: Dry Run Before Processing

```bash
# Preview what would be done
./scripts/ingestion/batch-process.sh \
  --dry-run \
  --type docs \
  _archive/ingestion-historical-2026-01-18/ingest/*

# Review output, then run for real
./scripts/ingestion/batch-process.sh \
  --type docs \
  _archive/ingestion-historical-2026-01-18/ingest/*
```

### Example 5: Resume Failed Workflow

```bash
# Skip completed phases and resume
./scripts/ingestion/sparc-workflow.sh \
  --item "$ITEM_PATH" \
  --skip-phase specification \
  --skip-phase pseudocode \
  --skip-phase architecture
```

## Integration with Claude Flow

### Creating Workflow Programmatically

```bash
# Create workflow from template
npx @claude-flow/cli@latest workflow create \
  --name "ingestion-processor" \
  --file ".claude-flow/workflows/ingestion-sparc.json"

# Execute workflow
npx @claude-flow/cli@latest workflow execute \
  --workflow-id "ingestion-processor" \
  --variables '{"itemPath":"./data","itemType":"docs"}'

# Check workflow status
npx @claude-flow/cli@latest workflow status \
  --workflow-id "ingestion-processor"
```

### Using MCP Tools

From Claude Code, you can invoke the workflow using MCP tools:

```javascript
// Initialize workflow
mcp__claude-flow__workflow_create({
  name: "ingestion-processor",
  steps: [/* workflow steps */]
})

// Execute workflow
mcp__claude-flow__workflow_execute({
  workflowId: "ingestion-processor",
  variables: {
    itemPath: "_archive/ingestion/.../docs",
    itemType: "docs"
  }
})

// Check status
mcp__claude-flow__workflow_status({
  workflowId: "ingestion-processor",
  verbose: true
})
```

## Best Practices

1. **Always use dry-run first** for new item types
2. **Monitor memory usage** with large batch operations
3. **Use appropriate parallelism** based on system resources
4. **Store context** for complex processing requirements
5. **Review logs** after batch operations
6. **Backup results** before re-processing
7. **Use meaningful item IDs** for tracking
8. **Document custom processing logic** in context field

## Performance Optimization

### Parallel Processing

```bash
# Adjust based on CPU cores
./scripts/ingestion/batch-process.sh \
  --parallel $(nproc) \
  _archive/ingestion-historical-2026-01-18/ingest/*
```

### Memory Optimization

```bash
# Enable HNSW indexing for faster search
npx @claude-flow/cli@latest memory init \
  --enable-hnsw \
  --hnsw-m 16 \
  --hnsw-ef-construction 200
```

### Result Caching

Results are automatically cached in memory. To clear cache:

```bash
# Clear specific namespace
npx @claude-flow/cli@latest memory delete \
  --namespace ingestion-sparc \
  --pattern "sparc/*"
```

## Support

For issues or questions:
- Check logs: `.claude-flow/logs/daemon.log`
- Run diagnostics: `npx @claude-flow/cli@latest doctor`
- View memory stats: `npx @claude-flow/cli@latest memory stats`
- GitHub Issues: https://github.com/ruvnet/claude-flow/issues

## License

This workflow is part of the Project Nyra repository and follows the same license terms.
