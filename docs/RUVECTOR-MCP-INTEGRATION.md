# RuVector MCP Tool Integration Guide

**Date**: 2026-01-18
**Version**: 1.0

## MCP Tools for RuVector

RuVector integrates with Claude Flow's MCP (Model Context Protocol) tools for memory operations and intelligent coordination.

---

## 1. Memory Operations

### Store Pattern in Memory

```bash
# Store a pattern with metadata
mcp__claude-flow__memory_usage \
  --action "store" \
  --namespace "reasoningbank" \
  --key "pattern:auth-implementation" \
  --value '{"task":"auth","approach":"JWT","outcome":"success","reward":0.95}'
```

**Parameters:**
- `action`: "store" (operation type)
- `namespace`: "reasoningbank" (pattern storage)
- `key`: Unique identifier (recommend prefixing with domain)
- `value`: JSON-serialized pattern data
- `ttl`: Optional time-to-live in milliseconds

**Example with TTL:**
```bash
mcp__claude-flow__memory_usage \
  --action "store" \
  --namespace "reasoningbank" \
  --key "pattern:temp-optimization" \
  --value "{...}" \
  --ttl 3600000  # 1 hour
```

---

### Search Patterns via HNSW

```bash
# Semantic search with vector similarity
mcp__claude-flow__memory_search \
  --pattern "authentication patterns" \
  --namespace "reasoningbank" \
  --limit 10
```

**Parameters:**
- `pattern`: Search query (semantic search)
- `namespace`: Target namespace
- `limit`: Number of results to return
- `threshold`: Minimum similarity score (0.0-1.0)

**Advanced Search:**
```bash
mcp__claude-flow__memory_search \
  --pattern "JWT implementation" \
  --namespace "reasoningbank" \
  --limit 10 \
  --threshold 0.8  # Only high-quality matches
```

---

### Retrieve Specific Entry

```bash
# Get a specific pattern by key
npx @claude-flow/cli@latest memory retrieve \
  --key "pattern-auth" \
  --namespace "reasoningbank"
```

**Usage in Scripts:**
```bash
PATTERN=$(npx @claude-flow/cli@latest memory retrieve \
  --key "pattern:auth-implementation" \
  --namespace "reasoningbank")

echo "Retrieved pattern: $PATTERN"
```

---

## 2. Intelligence/Trajectory Operations

### Start Trajectory Tracking

```bash
# Initialize trajectory for operation tracking
npx claude-flow@v3alpha hooks intelligence trajectory-start \
  --session-id "task-123" \
  --agent-type "coder" \
  --task "Implement authentication system"
```

**Returns:**
```
Session ID: task-123
Trajectory initialized for: Implement authentication system
Agent type: coder
```

**Capture the Session ID:**
```bash
SESSION_ID=$(npx claude-flow@v3alpha hooks intelligence trajectory-start \
  --session-id "task-$(date +%s)" \
  --agent-type "coder" \
  --task "$TASK" | grep "Session ID:" | awk '{print $3}')

echo "Session: $SESSION_ID"
```

---

### Record Trajectory Steps

```bash
# Record a step in the trajectory
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "task-123" \
  --operation "code-generation" \
  --outcome "success" \
  --metadata '{"files_changed": 3, "tests_passed": true}'
```

**Parameters:**
- `session-id`: Trajectory session identifier
- `operation`: Name of the operation
- `outcome`: "success" or "failure"
- `metadata`: JSON object with additional context

**Multiple Steps Example:**
```bash
SESSION_ID="task-123"

# Step 1: Write tests
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "write-test" \
  --outcome "success" \
  --metadata '{"tests_written": 5}'

# Step 2: Implement feature
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "implement-feature" \
  --outcome "success" \
  --metadata '{"files_changed": 3, "lines_added": 200}'

# Step 3: Run tests
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "run-tests" \
  --outcome "success" \
  --metadata '{"tests_passed": 5, "coverage": 0.95}'
```

---

### End Trajectory with Verdict

```bash
# Finalize trajectory and assign verdict
npx claude-flow@v3alpha hooks intelligence trajectory-end \
  --session-id "task-123" \
  --verdict "success" \
  --reward 0.92
```

**Parameters:**
- `session-id`: Trajectory session identifier
- `verdict`: "success", "failure", or "partial"
- `reward`: Quality score (0.0 - 1.0)

**Verdict Scoring Guide:**
- `1.0`: Perfect execution
- `0.9+`: Excellent (production-ready)
- `0.8-0.9`: Good (minor issues)
- `0.7-0.8`: Acceptable (needs review)
- `<0.7`: Problematic (requires intervention)

---

## 3. Neural/Learning Operations

### Neural Pattern Training

```bash
# Train neural patterns on successful trajectories
npx claude-flow@v3alpha neural train \
  --pattern-type "optimization" \
  --training-data '{"trajectories": [...]}' \
  --epochs 10
```

**Pattern Types:**
- `optimization`: Performance optimization patterns
- `coordination`: Agent coordination patterns
- `error-handling`: Error recovery patterns
- `performance`: Performance tuning patterns

---

### Consolidate Memory

```bash
# Consolidate patterns to prevent catastrophic forgetting
npx claude-flow@v3alpha neural consolidate \
  --namespace "reasoningbank"
```

**Process:**
1. Identifies important patterns (high reward)
2. Calculates Fisher Information Matrix
3. Sets consolidation penalties for important patterns
4. Stores consolidation metadata

---

### Get Intelligence Statistics

```bash
# Get memory statistics
npx claude-flow@v3alpha hooks intelligence stats \
  --namespace "reasoningbank"
```

**Output:**
```json
{
  "namespace": "reasoningbank",
  "total_patterns": 150,
  "avg_reward": 0.87,
  "total_memory_mb": 45.2,
  "search_latency_ms": 3.5,
  "patterns_by_type": {
    "auth": 15,
    "performance": 32,
    "coordination": 28,
    "error-handling": 75
  }
}
```

---

## 4. Pattern Search and Analysis

### Get Pattern Statistics

```bash
# Get top matching patterns with stats
npx claude-flow@v3alpha hooks intelligence pattern-stats \
  --query "authentication implementation" \
  --k 10 \
  --namespace "reasoningbank"
```

**Returns:**
```json
[
  {
    "id": "pattern:auth-123",
    "task": "implement auth",
    "approach": "JWT with refresh tokens",
    "reward": 0.95,
    "relevance_score": 0.92
  },
  ...
]
```

---

### Search for Specific Patterns

```bash
# Search patterns with filters
npx claude-flow@v3alpha hooks intelligence pattern-search \
  --query "authentication" \
  --min-reward 0.8 \
  --namespace "reasoningbank"
```

**Parameters:**
- `query`: Search term
- `min-reward`: Minimum quality threshold
- `namespace`: Target namespace

---

## 5. Session Management

### Start Session

```bash
# Start a session with auto-configuration
npx claude-flow@v3alpha hooks session-start \
  --session-id "dev-session-001" \
  --auto-configure
```

---

### End Session

```bash
# End session and export metrics
npx claude-flow@v3alpha hooks session-end \
  --generate-summary true \
  --export-metrics true
```

**Output:**
```json
{
  "session_id": "dev-session-001",
  "duration_ms": 3600000,
  "patterns_learned": 25,
  "avg_trajectory_reward": 0.87,
  "memory_usage_mb": 120.5
}
```

---

### Restore Previous Session

```bash
# Restore the most recent session
npx claude-flow@v3alpha hooks session-restore \
  --latest
```

---

## 6. Integration with Workflow Coordinator

### Hook Pattern in Agent Configuration

```yaml
# Agent YAML configuration
hooks:
  pre: |
    SESSION_ID="agent-$(date +%s)"
    npx claude-flow@v3alpha hooks intelligence trajectory-start \
      --session-id "$SESSION_ID" \
      --agent-type "coder" \
      --task "$TASK"
    mcp__claude-flow__memory_search --pattern="$TASK" --namespace="reasoningbank" --limit=10

  post: |
    npx claude-flow@v3alpha hooks intelligence trajectory-end \
      --session-id "$SESSION_ID" \
      --verdict "${VERDICT:-success}" \
      --reward "${REWARD:-0.85}"
    mcp__claude-flow__memory_usage --action="store" \
      --namespace="reasoningbank" \
      --key="pattern:$(date +%s)" \
      --value="$PATTERN_DATA"
```

---

## 7. Performance Monitoring via MCP

### Benchmark Operations

```bash
# Run performance benchmarks
mcp__claude-flow__benchmark_run \
  --suite "all"
```

---

### Analyze Bottlenecks

```bash
# Analyze system bottlenecks
mcp__claude-flow__bottleneck_analyze \
  --component "memory-search" \
  --metrics '["latency","throughput","memory"]'
```

---

### Get Performance Report

```bash
# Generate performance report
mcp__claude-flow__performance_report \
  --format "detailed" \
  --timeframe "24h"
```

---

## 8. Complete Integration Example

### Workflow with MCP Tools

```bash
#!/bin/bash

# Initialize session
echo "Starting development session..."
SESSION_ID="dev-$(date +%s%N)"

# ============================================
# Task: Implement Authentication
# ============================================

TASK="Implement JWT-based authentication"

# 1. Start trajectory
echo "1️⃣ Starting trajectory tracking..."
npx claude-flow@v3alpha hooks intelligence trajectory-start \
  --session-id "$SESSION_ID" \
  --agent-type "coder" \
  --task "$TASK"

# 2. Search for similar patterns
echo "2️⃣ Searching for similar patterns..."
SIMILAR=$(mcp__claude-flow__memory_search \
  --pattern "JWT authentication" \
  --namespace "reasoningbank" \
  --limit 5)

echo "Found similar patterns: $SIMILAR"

# 3. Execute work and track steps
echo "3️⃣ Executing implementation..."

# Step 1: Write tests
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "write-tests" \
  --outcome "success" \
  --metadata '{"tests_written": 8}'

# Step 2: Implement feature
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "implement-feature" \
  --outcome "success" \
  --metadata '{"files_changed": 5, "lines_added": 350}'

# Step 3: Run tests
npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "run-tests" \
  --outcome "success" \
  --metadata '{"tests_passed": 8, "coverage": 0.98}'

# 4. End trajectory
echo "4️⃣ Completing trajectory..."
npx claude-flow@v3alpha hooks intelligence trajectory-end \
  --session-id "$SESSION_ID" \
  --verdict "success" \
  --reward 0.96

# 5. Store pattern
echo "5️⃣ Storing learned pattern..."
mcp__claude-flow__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:jwt-auth-$(date +%s)" \
  --value='{
    "task": "implement JWT authentication",
    "approach": "JWT with refresh tokens",
    "steps": [
      {"operation": "write-tests", "outcome": "success"},
      {"operation": "implement-feature", "outcome": "success"},
      {"operation": "run-tests", "outcome": "success"}
    ],
    "outcome": "success",
    "reward": 0.96,
    "metadata": {
      "agent_type": "coder",
      "duration_ms": 1500,
      "files_changed": 5,
      "tests_passed": true,
      "coverage": 0.98
    }
  }'

# 6. Consolidate memory
echo "6️⃣ Consolidating memory..."
npx claude-flow@v3alpha neural consolidate --namespace reasoningbank

# 7. Get statistics
echo "7️⃣ Getting memory statistics..."
npx claude-flow@v3alpha hooks intelligence stats --namespace reasoningbank

# 8. End session
echo "8️⃣ Ending session..."
npx claude-flow@v3alpha hooks session-end \
  --generate-summary true \
  --export-metrics true

echo "✅ Complete!"
```

---

## 9. Error Handling Patterns

### Handle Missing Patterns

```bash
# Check if pattern exists before retrieve
PATTERN=$(npx @claude-flow/cli@latest memory retrieve \
  --key "pattern:not-found" \
  --namespace "reasoningbank" 2>&1)

if [[ $PATTERN == *"not found"* ]]; then
  echo "Pattern not found, using default..."
  # Use default behavior
else
  echo "Pattern found: $PATTERN"
fi
```

---

### Handle Trajectory Failures

```bash
# Record failure in trajectory
SESSION_ID="task-$(date +%s)"

npx claude-flow@v3alpha hooks intelligence trajectory-start \
  --session-id "$SESSION_ID" \
  --agent-type "coder" \
  --task "Risky operation"

# If operation fails
if ! npx claude-flow@v3alpha hooks intelligence trajectory-step \
  --session-id "$SESSION_ID" \
  --operation "risky-code" \
  --outcome "failure"; then

  # Record failure verdict
  npx claude-flow@v3alpha hooks intelligence trajectory-end \
    --session-id "$SESSION_ID" \
    --verdict "failure" \
    --reward 0.0

  echo "Operation failed, trajectory recorded"
  exit 1
fi
```

---

## 10. Best Practices

### 1. Session Identifiers
```bash
# Use timestamp for uniqueness
SESSION_ID="agent-$(date +%s%N)"

# Or include agent type
SESSION_ID="coder-$(date +%s)"
```

### 2. Pattern Keys
```bash
# Use descriptive, hierarchical keys
--key "pattern:auth:jwt:implementation"
--key "pattern:perf:cache:lru"
--key "pattern:error:retry:exponential"
```

### 3. Reward Scoring
```bash
# Use consistent scoring:
# 1.0 = Perfect
# 0.9+ = Production-ready
# 0.8-0.9 = Good
# 0.7-0.8 = Acceptable
# <0.7 = Problematic
```

### 4. Memory Cleanup
```bash
# Set TTL for temporary patterns
mcp__claude-flow__memory_usage --action="store" \
  --namespace="reasoningbank" \
  --key="pattern:temporary" \
  --value "{...}" \
  --ttl 3600000  # 1 hour
```

### 5. Search Thresholds
```bash
# Use high thresholds for production patterns
mcp__claude-flow__memory_search \
  --pattern "auth" \
  --namespace "reasoningbank" \
  --threshold 0.85  # Only very similar patterns
```

---

## Troubleshooting

### Pattern Not Found
- Verify namespace is correct
- Check pattern key spelling
- Try searching instead of direct retrieval

### Slow Search Performance
- Check HNSW parameters
- Rebuild index if corrupted
- Monitor index size

### Memory Consolidation Issues
- Check available disk space
- Verify no concurrent operations
- Review consolidation logs

---

**Document Version**: 1.0
**Status**: Integration Guide
**Last Updated**: 2026-01-18
