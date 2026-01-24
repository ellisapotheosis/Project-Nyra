# RuVector Quick Reference Guide

**Fast-Track Implementation for Developers**

---

## One-Page Quick Start

### The 4-Step Pipeline

```
RETRIEVE (HNSW Search)
    ↓
JUDGE (Trajectory + Verdicts)
    ↓
DISTILL (Pattern Extraction)
    ↓
CONSOLIDATE (EWC++ Memory)
```

---

## Essential Commands

### Track a Task

```bash
# Start
SESSION="task-$(date +%s)"
npx @claude-flow/cli@latest hooks intelligence trajectory-start \
  --session-id "$SESSION" --agent-type "coder" --task "Your task"

# Track steps (repeat for each step)
npx @claude-flow/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION" --operation "step-name" --outcome "success"

# End
npx @claude-flow/cli@latest hooks intelligence trajectory-end \
  --session-id "$SESSION" --verdict "success" --reward 0.92

# Store
mcp__claude-flow__memory_usage --action="store" \
  --namespace="reasoningbank" --key="pattern:name" \
  --value='{"task":"...","approach":"...","reward":0.92}'
```

---

## 4 Core Operations

| Operation | Command | Purpose |
|-----------|---------|---------|
| **Retrieve** | `mcp__claude-flow__memory_search --pattern "query" --namespace reasoningbank` | Find similar patterns (150x faster) |
| **Judge** | `npx claude-flow hooks intelligence trajectory-step` | Record operation outcomes |
| **Distill** | `mcp__claude-flow__memory_usage --action store` | Save successful patterns |
| **Consolidate** | `npx claude-flow neural consolidate` | Prevent forgetting old knowledge |

---

## Pattern Schema (Minimal)

```json
{
  "task": "What was the goal",
  "approach": "How it was solved",
  "outcome": "success|failure",
  "reward": 0.92,
  "steps": 4,
  "files_changed": 3,
  "tests_passed": true
}
```

---

## Search Similar Patterns

```bash
# Find patterns similar to your task
mcp__claude-flow__memory_search \
  --pattern "user authentication" \
  --namespace reasoningbank \
  --limit 10 \
  --threshold 0.8  # High quality only
```

---

## Verdict Scores

| Score | Status | Use |
|-------|--------|-----|
| 1.0 | Perfect | Never happens |
| 0.9+ | Production | Ready to ship |
| 0.8-0.9 | Good | Minor issues |
| 0.7-0.8 | Acceptable | Needs review |
| <0.7 | Problematic | Fix required |

---

## MCP Tool Reference

```bash
# Store pattern
mcp__claude-flow__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:name" \
  --value='{...}'

# Search patterns
mcp__claude-flow__memory_search \
  --pattern="query" \
  --namespace="reasoningbank" \
  --limit=10

# Benchmark
mcp__claude-flow__benchmark_run --suite "all"

# Analyze bottlenecks
mcp__claude-flow__bottleneck_analyze --component "memory-search"
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Pattern Search | <5ms (HNSW) |
| Verdict Assignment | <1ms |
| Distillation | <100ms |
| Consolidation | <500ms |
| SONA Adaptation | <0.05ms |

---

## 3 Common Patterns

### 1. Authentication

```bash
SESSION="auth-$(date +%s)"

npx @claude-flow/cli@latest hooks intelligence trajectory-start \
  --session-id "$SESSION" --agent-type "coder" --task "JWT auth"

# Implementation steps...
npx @claude-flow/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION" --operation "write-tests" --outcome "success"
npx @claude-flow/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION" --operation "implement" --outcome "success"

npx @claude-flow/cli@latest hooks intelligence trajectory-end \
  --session-id "$SESSION" --verdict "success" --reward 0.95

mcp__claude-flow__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:auth-jwt" \
  --value='{"task":"JWT auth","approach":"refresh+access tokens","reward":0.95}'
```

### 2. Performance Optimization

```bash
SESSION="perf-$(date +%s)"

npx @claude-flow/cli@latest hooks intelligence trajectory-start \
  --session-id "$SESSION" --agent-type "perf-engineer" \
  --task "Flash Attention optimization"

# Measure baseline
# Apply optimization
npx @claude-flow/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION" --operation "flash-attention" \
  --outcome "success" \
  --metadata '{"speedup":3.2}'

npx @claude-flow/cli@latest hooks intelligence trajectory-end \
  --session-id "$SESSION" --verdict "success" --reward 0.92
```

### 3. Error Recovery

```bash
SESSION="error-$(date +%s)"

npx @claude-flow/cli@latest hooks intelligence trajectory-start \
  --session-id "$SESSION" --agent-type "debugger"
  --task "Fix null pointer"

# Try fix
if npx @claude-flow/cli@latest hooks intelligence trajectory-step \
  --session-id "$SESSION" --operation "apply-fix" \
  --outcome "success"; then
  # Test fix
  npx @claude-flow/cli@latest hooks intelligence trajectory-step \
    --session-id "$SESSION" --operation "verify" --outcome "success"

  npx @claude-flow/cli@latest hooks intelligence trajectory-end \
    --session-id "$SESSION" --verdict "success" --reward 0.88
else
  npx @claude-flow/cli@latest hooks intelligence trajectory-end \
    --session-id "$SESSION" --verdict "failure" --reward 0.0
fi
```

---

## Hook Configuration Template

```yaml
# In agent.md or CLAUDE.md
hooks:
  pre: |
    SESSION="agent-$(date +%s)"
    npx @claude-flow/cli@latest hooks intelligence trajectory-start \
      --session-id "$SESSION" --agent-type "coder" --task "$TASK"
    mcp__claude-flow__memory_search --pattern="$TASK" --namespace="reasoningbank" --limit=10

  post: |
    npx @claude-flow/cli@latest hooks intelligence trajectory-end \
      --session-id "$SESSION" --verdict "success" --reward 0.85
    mcp__claude-flow__memory_usage --action="store" \
      --namespace="reasoningbank" --key="pattern:$(date +%s)" \
      --value="{...PATTERN_DATA...}"
    npx @claude-flow/cli@latest neural consolidate --namespace reasoningbank
```

---

## TypeScript Implementation Template

```typescript
class RuVectorLearner {
  async learnTask(task: string): Promise<void> {
    const sessionId = `session-${Date.now()}`;

    // RETRIEVE: Find similar patterns
    const similar = await this.searchPatterns(task);
    console.log(`Found ${similar.length} similar patterns`);

    // JUDGE: Start tracking
    await this.startTrajectory(sessionId, task);

    try {
      // Execute work, track steps
      for (const step of workSteps) {
        const success = await step.execute();
        await this.recordStep(sessionId, step.name, success);
      }

      // DISTILL: End and store
      await this.endTrajectory(sessionId, 'success', 0.92);
      await this.storePattern({
        task,
        outcome: 'success',
        reward: 0.92
      });

    } catch (error) {
      await this.endTrajectory(sessionId, 'failure', 0.0);
      throw error;
    }

    // CONSOLIDATE: Protect old knowledge
    await this.consolidateMemory();
  }
}
```

---

## Namespace Conventions

| Namespace | Content | Retention |
|-----------|---------|-----------|
| `reasoningbank` | Learned patterns | Permanent |
| `v3-performance` | Performance metrics | 7 days |
| `patterns` | General patterns | Permanent |
| `solutions` | Bug fixes | Permanent |
| `coordination` | Swarm data | 24 hours |

---

## Debugging Checklist

- [ ] Session ID is unique: `$(date +%s)`
- [ ] Pattern key describes the domain
- [ ] Reward score is 0.0-1.0
- [ ] All steps recorded before end
- [ ] Verdict matches actual outcome
- [ ] Metadata includes helpful context
- [ ] Namespace is consistent
- [ ] Similar patterns found via search

---

## Memory Stats Command

```bash
npx @claude-flow/cli@latest hooks intelligence stats --namespace reasoningbank
```

**Output:**
- Total patterns stored
- Average reward score
- Search latency
- Memory usage
- Patterns by type

---

## Performance Profile

```
Tier 1 (Real-Time)    <1ms:   Pattern lookup
Tier 2 (Fast)         <10ms:  HNSW search
Tier 3 (Normal)       <100ms: Distillation
Tier 4 (Slow)         <500ms: Consolidation
Tier 5 (Background):  1-2s:   Neural training
```

---

## Next Steps

1. **Implement** - Follow RUVECTOR-IMPLEMENTATION-PATTERNS.md
2. **Code** - Use examples from RUVECTOR-CODE-EXAMPLES.md
3. **Integrate** - Follow MCP patterns in RUVECTOR-MCP-INTEGRATION.md
4. **Monitor** - Check stats with `hooks intelligence stats`
5. **Learn** - Patterns improve over time

---

## Resources

- 📚 **RUVECTOR-IMPLEMENTATION-PATTERNS.md** - Deep dive on each component
- 💻 **RUVECTOR-CODE-EXAMPLES.md** - Copy-paste ready examples
- 🔧 **RUVECTOR-MCP-INTEGRATION.md** - All MCP commands
- 📖 **CLAUDE.md** - Full RuVector specification

---

**Quick Reference Version**: 1.0
**Updated**: 2026-01-18
