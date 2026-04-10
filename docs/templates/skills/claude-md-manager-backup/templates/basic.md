# {{PROJECT_NAME}} - Claude Code Configuration

> {{DESCRIPTION}}

## Overview

{{PROJECT_NAME}} is a utility/script component that performs specific tasks within Project Nyra. This configuration optimizes Claude Code behavior for implementation and testing.

## Quick Start

```bash
# Initialize development environment
npm install

# Run with Claude Flow
npx @archon-os/cli@latest agent spawn -t coder --name {{PROJECT_NAME}}-dev
```

## 🚨 AUTOMATIC SWARM ORCHESTRATION

When starting work on complex tasks, Claude Code MUST automatically:

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🤖 INTELLIGENT 3-TIER MODEL ROUTING

**Before spawning agents, get routing recommendation:**
```bash
npx @archon-os/cli@latest hooks pre-task --description "[task description]"
```

**When you see routing recommendations:**
- `[AGENT_BOOSTER_AVAILABLE]` → Use Edit tool directly (no LLM needed)
- `[TASK_MODEL_RECOMMENDATION]` → Use specified model (haiku/sonnet/opus)

## Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Multiple files (3+)
- New feature implementation
- Refactoring across modules
- Testing strategy changes

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes

## 📁 File Organization

**Directory Structure:**
```
{{PROJECT_NAME}}/
├── src/               # Source code
├── tests/             # Test files
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── config/            # Configuration files
```

## Development Workflow

### 1. Before Starting a Task
```bash
# Search memory for relevant patterns
npx @archon-os/cli@latest memory search --query "{{PROJECT_NAME}} patterns"

# Check if similar task was done before
npx @archon-os/cli@latest memory search --query "[task type]" --namespace tasks
```

### 2. During Implementation
- Write clean, maintainable code
- Follow single responsibility principle
- Include comprehensive error handling
- Add meaningful logging

### 3. After Completing Tasks
```bash
# Store successful pattern
npx @archon-os/cli@latest memory store --namespace patterns \
  --key "{{PROJECT_NAME}}-pattern" --value "What worked"

# Record task completion
npx @archon-os/cli@latest hooks post-task --task-id "[id]" --success true
```

## 🧠 Memory System

Use Project Nyra's memory systems for persistence:

```bash
# Store patterns
npx @archon-os/cli@latest memory store \
  --key "{{PROJECT_NAME}}-solution" \
  --value "Solution approach" \
  --namespace patterns

# Search patterns
npx @archon-os/cli@latest memory search \
  --query "{{PROJECT_NAME}} related"
```

## Testing Strategy

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- test-name
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Startup time | <1s |
| Memory usage | <100MB |
| Test execution | <30s |
| Code coverage | >80% |

## 📊 Continuous Improvement

After major changes:
```bash
# Run performance benchmark
npx @archon-os/cli@latest performance benchmark --suite unit

# Check test coverage
npm run test:coverage

# Analyze code quality
npx @archon-os/cli@latest hooks worker dispatch --trigger refactor
```

## Troubleshooting

### Common Issues

1. **Dependencies not found**
   ```bash
   npm install
   npm ci
   ```

2. **Tests failing**
   ```bash
   npm test -- --verbose
   npm test -- --bail  # Stop on first failure
   ```

3. **Performance degradation**
   ```bash
   npx @archon-os/cli@latest performance profile
   ```

## Integration Points

- Project Nyra memory systems (RuVector, Letta)
- Claude Flow V3 orchestration
- MCP servers (if applicable)

## Contributing

1. Follow existing code patterns
2. Write tests for new functionality
3. Update documentation
4. Store successful patterns in memory
5. Validate before committing

## Quick Reference

```bash
# CLI shortcuts
npx @archon-os/cli@latest memory search --query "[query]"
npx @archon-os/cli@latest hooks post-edit --file "[file]" --train-neural true
npx @archon-os/cli@latest agent spawn -t coder --name dev

# Development
npm install
npm test
npm run build
npm start
```

## Support

- Documentation: See related CLAUDE.md files in parent directories
- Memory patterns: Search in Project Nyra memory system
- Logging: Check stdout and error logs for debugging

## Version

Created: {{DATE}}
Component: {{PROJECT_NAME}}
Architecture: Claude Flow V3
