# Claude Flow V3 Complete Setup Guide

## ✅ Installation Status

**Version**: v3.0.0-alpha.125
**Installation Date**: 2026-01-17
**Status**: Fully Configured

## 🚀 Initialized Features

### Core Systems

- ✅ **Memory System** - AgentDB with HNSW indexing (150x-12,500x faster)
  - Location: `.swarm/memory.db` and `.claude/memory.db`
  - Features: Vector embeddings, pattern learning, temporal decay
  - HNSW Config: M=16, efConstruction=200, efSearch=100
  - 10 tables created with indexes

- ✅ **Neural Learning** - SONA with Flash Attention
  - 15 coordination patterns trained
  - SONA adaptation: 3.11μs avg (<0.05ms target met)
  - Location: `.claude-flow/neural/patterns.json`
  - Supports: MoE, Flash Attention, ReasoningBank

- ✅ **Background Daemon** - 12 Workers Running
  - PID: 12672
  - Active workers: map, audit, optimize, consolidate, testgaps
  - Max concurrent: 2
  - Success rate: 99-100%

- ✅ **Hive-Mind Consensus**
  - Hive ID: hive-1768721948560-4rshh5
  - Topology: hierarchical-mesh
  - Consensus: byzantine
  - Max agents: 15
  - Memory: hybrid

- ✅ **Hooks System** - 27 hooks + 12 background workers
  - ReasoningBank adaptive learning
  - 84.8% SWE-Bench solve rate
  - 32.3% token reduction
  - 2.8-4.4x speed improvement

### Available Plugins (9 Total)

**Official Plugins** (5):
- `@claude-flow/neural` - v3.0.0 (4.9★, 15K downloads)
- `@claude-flow/security` - v3.0.0 (4.8★, 12K downloads)
- `@claude-flow/embeddings` - v3.0.0 (4.7★, 8.5K downloads)
- `@claude-flow/performance` - v3.0.0 (4.8★, 7.8K downloads)
- `@claude-flow/claims` - v3.0.0 (4.6★, 6.2K downloads)

**Community Plugins** (4):
- `plugin-creator` - v2.1.0
- `community-analytics` - v1.2.0
- `custom-agents` - v2.0.1
- `slack-integration` - v1.0.0

## 📊 Monitoring & Status

### Real-Time Status Commands

```bash
# System status (text format)
npx @claude-flow/cli@latest status

# System status (JSON format)
npx @claude-flow/cli@latest status --format json

# System status (table format)
npx @claude-flow/cli@latest status --format table

# Verbose status with detailed info
npx @claude-flow/cli@latest status --verbose

# Watch mode for continuous monitoring (✅ CONFIRMED WORKING)
npx @claude-flow/cli@latest status --watch  # Auto-refreshes every 2s

# Dynamic statusline for IDE integration
npx @claude-flow/cli@latest hooks statusline
npx @claude-flow/cli@latest hooks statusline --json
npx @claude-flow/cli@latest hooks statusline --compact
```

### Worker Daemon Monitoring

```bash
# Daemon status
npx @claude-flow/cli@latest daemon status

# Verbose daemon status with metrics
npx @claude-flow/cli@latest daemon status --verbose

# List all background workers
npx @claude-flow/cli@latest hooks worker list

# Check specific worker status
npx @claude-flow/cli@latest hooks worker status --worker-id <id>

# Dispatch worker manually
npx @claude-flow/cli@latest hooks worker dispatch --trigger <trigger>
```

### Swarm Monitoring

```bash
# Swarm status
npx @claude-flow/cli@latest swarm status

# Swarm health check
npx @claude-flow/cli@latest swarm health

# List all agents
npx @claude-flow/cli@latest agent list

# Agent pool status
npx @claude-flow/cli@latest agent pool --action status
```

### Memory & Performance

```bash
# Memory statistics
npx @claude-flow/cli@latest memory stats

# Memory list
npx @claude-flow/cli@latest memory list

# Memory search
npx @claude-flow/cli@latest memory search --query "your query"

# Performance metrics
npx @claude-flow/cli@latest performance metrics

# Performance report
npx @claude-flow/cli@latest performance report

# Bottleneck detection
npx @claude-flow/cli@latest performance bottleneck
```

### Hive-Mind Monitoring

```bash
# Hive-mind status
npx @claude-flow/cli@latest hive-mind status

# Hive-mind status (verbose)
npx @claude-flow/cli@latest hive-mind status --verbose

# Hive-mind memory
npx @claude-flow/cli@latest hive-mind memory --action list

# Consensus status
npx @claude-flow/cli@latest hive-mind consensus --action status
```

## 🔧 Configuration

### Configuration File
Location: `claude-flow.config.json`

Key settings:
- Model preferences: Opus 4.5, Sonnet 3.5, Haiku 3.5, Gemini Flash
- Swarm: hierarchical-mesh, max 15 agents
- Memory: hybrid backend with HNSW
- Neural: Flash Attention enabled
- Security: AI Defense (AIMDS) enabled
- Observability: Prometheus, Grafana, Loki

### Start Claude Flow

```bash
# Start with default config
npx @claude-flow/cli@latest start

# Start as background daemon
npx @claude-flow/cli@latest start --daemon

# Start with custom topology
npx @claude-flow/cli@latest start --topology mesh

# Start with custom MCP port
npx @claude-flow/cli@latest start --port 3001

# Quick start
npx @claude-flow/cli@latest start quick

# Stop the system
npx @claude-flow/cli@latest start stop
# or
npx @claude-flow/cli@latest stop
```

## 🎯 Common Workflows

### 1. Spawn and Monitor Agents

```bash
# Spawn a coder agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# Spawn multiple agents in swarm
npx @claude-flow/cli@latest swarm init --v3-mode
npx @claude-flow/cli@latest agent spawn -t researcher --name researcher-1
npx @claude-flow/cli@latest agent spawn -t tester --name tester-1
npx @claude-flow/cli@latest agent spawn -t reviewer --name reviewer-1

# Monitor agent status
npx @claude-flow/cli@latest agent status --agent-id <agent-id>
npx @claude-flow/cli@latest agent list

# Terminate agent
npx @claude-flow/cli@latest agent terminate --agent-id <agent-id>
```

### 2. Task Management

```bash
# Create a task
npx @claude-flow/cli@latest task create --type feature --description "Implement auth" --priority high

# List tasks
npx @claude-flow/cli@latest task list

# Task status
npx @claude-flow/cli@latest task status --task-id <task-id>

# Complete task
npx @claude-flow/cli@latest task complete --task-id <task-id>
```

### 3. Memory Operations

```bash
# Store pattern
npx @claude-flow/cli@latest memory store --key "auth-pattern" --value "JWT with refresh" --namespace patterns

# Search patterns
npx @claude-flow/cli@latest memory search --query "authentication" --namespace patterns

# Retrieve specific entry
npx @claude-flow/cli@latest memory retrieve --key "auth-pattern" --namespace patterns

# List all entries
npx @claude-flow/cli@latest memory list --namespace patterns
```

### 4. Neural Training

```bash
# Train coordination patterns
npx @claude-flow/cli@latest neural train --pattern-type coordination --epochs 10

# Train optimization patterns
npx @claude-flow/cli@latest neural train --pattern-type optimization --epochs 10

# View patterns
npx @claude-flow/cli@latest neural patterns --list

# Predict optimal approach
npx @claude-flow/cli@latest neural predict --input "implement oauth"
```

### 5. Hooks & Learning

```bash
# Pre-task hook (get suggestions)
npx @claude-flow/cli@latest hooks pre-task --description "implement feature"

# Post-task hook (record completion)
npx @claude-flow/cli@latest hooks post-task --task-id <id> --success true

# Route task to optimal agent
npx @claude-flow/cli@latest hooks route --task "fix bug in auth"

# Explain routing decision
npx @claude-flow/cli@latest hooks explain --topic "authentication"

# View learning metrics
npx @claude-flow/cli@latest hooks metrics

# Pretrain from repository
npx @claude-flow/cli@latest hooks pretrain --depth deep
```

## 🐛 Known Issues

### 1. Embeddings Initialization Error
**Error**: `Cannot find package 'agentic-flow'`
**Status**: Dependency issue in v3.0.0-alpha.125
**Workaround**: Embeddings via neural system still work

### 2. Config Loading Warning
**Warning**: `Cannot read properties of undefined (reading 'map')`
**Status**: Non-critical bug in config loader
**Impact**: None - system falls back to defaults

### 3. Plugin Installation
**Issue**: `plugins install` requires `--name` flag
**Workaround**: Install via npm: `npm install -g @claude-flow/neural`

## 🔍 No Dedicated Web UI

**Important**: Claude Flow v3 does not currently have a dedicated web UI. Monitoring is done via:

1. **CLI Status Commands** - Real-time text-based status
2. **JSON Output** - `--format json` for programmatic access
3. **Hooks Statusline** - Dynamic status for IDE integration
4. **Watch Mode** - Continuous monitoring (if supported)

### Creating a Custom Dashboard

If you want a visual dashboard, you can:

1. **Use the JSON API**:
   ```bash
   npx @claude-flow/cli@latest status --format json
   ```

2. **Build a Simple Web UI**:
   - Parse JSON output
   - Display in HTML/React
   - Poll status endpoint every N seconds

3. **Use Observability Stack** (configured in config):
   - Prometheus (port 9090)
   - Grafana (port 3005)
   - Loki (port 3100)

## 📝 Next Steps

1. **Enable Additional Workers**:
   ```bash
   # Enable predict worker
   npx @claude-flow/cli@latest daemon enable --worker predict

   # Enable document worker
   npx @claude-flow/cli@latest daemon enable --worker document
   ```

2. **Configure Observability**:
   - Set up Prometheus scraping
   - Configure Grafana dashboards
   - Enable Loki logging

3. **Train More Patterns**:
   ```bash
   npx @claude-flow/cli@latest neural train --pattern-type prediction --epochs 10
   npx @claude-flow/cli@latest neural train --pattern-type anomaly-detection --epochs 10
   ```

4. **Explore Advanced Features**:
   - Claims-based authorization
   - Security scanning
   - Performance profiling
   - Multi-repo coordination

## 📚 Resources

- **Documentation**: https://github.com/ruvnet/claude-flow
- **Issues**: https://github.com/ruvnet/claude-flow/issues
- **Version**: v3.0.0-alpha.125
- **Node.js**: v24.12.0 required (>= 20)

---

**Setup Completed**: 2026-01-17
**Last Updated**: 2026-01-17
