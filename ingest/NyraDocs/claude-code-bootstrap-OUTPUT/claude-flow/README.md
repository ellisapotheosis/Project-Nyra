# Claude Flow Configuration

This directory contains comprehensive configuration files for Claude Flow with full orchestration, memory, neural networks, and verification features.

## Files Overview

### `MASTER-.env`
Complete Claude Flow environment configuration:
- Core Claude Flow settings
- Multi-provider API support (Anthropic, OpenRouter, OpenAI, Gemini)
- Swarm coordination and topology
- AgentDB with quantization and HNSW indexing
- ReasoningBank adaptive learning
- Neural network auto-optimization
- Memory persistence and compression
- GitHub integration and checkpointing
- Security and monitoring

### `settings-complete.json`
Comprehensive settings file with:
- Full hooks system (Pre/Post tool use)
- Neural optimization with 3 models
- Memory auto-persistence with namespaces
- Checkpoint automation (every 5 minutes)
- Security auditing and truth verification (95% threshold)
- GitHub backup and gist sync
- Performance optimization targets

### `settings-alpha-all-modes.json`
All SPARC modes and coordination patterns enabled

### `.env.example`
Template for environment variables with all configurable options

## Quick Setup

1. **Install Claude Flow:**
   ```bash
   npm install -g claude-flow@alpha
   ```

2. **Initialize configuration:**
   ```bash
   npx claude-flow@alpha init --force
   ```

3. **Copy environment file:**
   ```bash
   cp MASTER-.env .env
   ```

4. **Configure your API keys:**
   Edit `.env` and add:
   - `ANTHROPIC_API_KEY` (required)
   - `GITHUB_TOKEN` (for GitHub integration)
   - `INFISICAL_*` credentials (for secrets management)

5. **Copy settings:**
   ```bash
   cp settings-complete.json .claude/settings.json
   ```

6. **Test installation:**
   ```bash
   npx claude-flow@alpha swarm init --topology mesh
   npx claude-flow@alpha agent list
   ```

## Features Enabled

### 🤖 **Multi-Agent Orchestration**
- **Swarm Topologies**: Mesh, Hierarchical, Adaptive
- **100 Max Agents**: Scale to large teams
- **50 Concurrent Tasks**: Parallel execution
- **Agent Types**: Researcher, Coder, Analyst, Optimizer, Coordinator

### 🧠 **Neural Optimization**
- **Task Predictor**: Learn optimal task routing
- **Error Preventer**: Block risky operations (85% threshold)
- **Performance Optimizer**: Auto-tune for speed/accuracy/efficiency

### 💾 **Memory Systems**
- **AgentDB**: Vector database with scalar quantization (150x faster)
- **ReasoningBank**: Adaptive learning from experience
- **Namespaces**: swarm, tasks, patterns, errors, optimizations
- **90-day retention**: Automatic cleanup
- **Compression**: Efficient storage
- **GitHub backup**: Automatic gist sync

### 🔄 **Checkpointing**
- **Auto-checkpoint**: Every 5 minutes
- **Git integration**: Automatic commits
- **20 checkpoint limit**: Rolling window
- **Metrics included**: Performance tracking
- **Branch strategy**: `checkpoint/{timestamp}`

### 🔗 **Hooks System**
- **PreToolUse**: Safety validation, context loading, neural prediction
- **PostToolUse**: Metrics tracking, memory updates, neural training
- **Stop**: Session summaries, state persistence, memory backup
- **PreCompact**: Context preservation guidance

### ✅ **Truth Verification**
- **95% Threshold**: Quality gate for all code
- **Security Audit**: Detect hardcoded secrets, injection risks
- **Real Implementation**: No mocks/stubs in production code
- **Automatic Rollback**: Failed verification triggers undo

### 🔒 **Security**
- **Environment variables**: All secrets externalized
- **Input validation**: SQL injection prevention
- **HTTPS enforcement**: No insecure protocols
- **No eval/exec**: Code injection protection
- **Rate limiting**: 100 requests per 15 minutes

### 📊 **Monitoring & Metrics**
- **Prometheus**: Metrics on port 9090
- **Performance targets**: <500ms command, <100ms memory, <50ms neural
- **30-day logs**: Automatic retention
- **90-day metrics**: Long-term analysis

## Usage Examples

### Initialize Swarm
```bash
npx claude-flow@alpha swarm init --topology hierarchical --agents 10
```

### Orchestrate Complex Task
```bash
npx claude-flow@alpha task orchestrate "Build REST API with tests" --strategy adaptive --max-agents 5
```

### Memory Operations
```bash
# Store
npx claude-flow@alpha memory store --key "api/design" --value "RESTful with JWT auth" --namespace tasks

# Retrieve
npx claude-flow@alpha memory retrieve --key "api/design" --namespace tasks
```

### Neural Training
```bash
npx claude-flow@alpha neural train --pattern code-review
npx claude-flow@alpha neural status
```

### Checkpoints
```bash
# Create
npx claude-flow@alpha checkpoint create --message "API milestone"

# List
npx claude-flow@alpha checkpoint list

# Restore
npx claude-flow@alpha checkpoint restore <id>
```

### Truth Verification
```bash
# Verify file
npx claude-flow@alpha verify verify src/api.ts --threshold 0.95

# Get report
npx claude-flow@alpha truth --report --json
```

## Configuration Tips

1. **Start small**: Begin with 5-10 agents, scale up as needed
2. **Monitor memory**: Check `.claude-flow/memory/` size regularly
3. **Tune neural models**: Adjust learning rates based on performance
4. **GitHub integration**: Set `GITHUB_TOKEN` for automatic backups
5. **Use Infisical**: Centralize secrets management across team

## Troubleshooting

**Agents not spawning?**
```bash
npx claude-flow@alpha swarm status --verbose
npx claude-flow@alpha diagnostics --api-check
```

**Memory issues?**
```bash
npx claude-flow@alpha memory usage
npx claude-flow@alpha memory compress --namespace all
```

**Performance slow?**
```bash
npx claude-flow@alpha benchmark run --type swarm
npx claude-flow@alpha analysis bottleneck-detect
```

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- Discussions: https://github.com/ruvnet/claude-flow/discussions
