# SPARC Hooks Integration Guide

## Overview

This guide explains how to integrate Claude-Flow hooks with the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic development coordination, memory management, and automated workflow optimization.

---

## What Are Claude-Flow Hooks?

Claude-Flow hooks are automated triggers that execute before, during, and after development tasks to:
- **Coordinate** multi-agent workflows
- **Persist** state and decisions across sessions
- **Optimize** development patterns through neural learning
- **Automate** repetitive tasks (formatting, testing, deployment)
- **Track** metrics and performance

### Hook Types

1. **Pre-Task Hooks** - Prepare environment before work begins
2. **Post-Edit Hooks** - Process changes after file modifications
3. **Post-Task Hooks** - Finalize and store results after completion
4. **Session Hooks** - Manage long-running development sessions
5. **Notify Hooks** - Communication and coordination signals

---

## SPARC Phase Hook Integration

### Phase 1: Specification

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Specification phase: [Feature Name]" \
  --phase "specification" \
  --feature "[feature-id]"
```

**What it does:**
- Creates task ID for tracking
- Initializes memory store for specifications
- Checks for related prior specifications
- Sets up agent coordination topology
- Prepares file watchers

**During Specification:**
```bash
# After creating specification document
npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/specifications/[feature].md" \
  --memory-key "sparc/[feature]/spec" \
  --content-type "specification"

# Notify other agents of specification completion
npx claude-flow@alpha hooks notify \
  --message "Specification complete for [feature]" \
  --target "architecture-agent"
```

**Post-Task Hook:**
```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id-from-pre-task]" \
  --status "completed" \
  --phase "specification" \
  --next-phase "pseudocode"
```

**What it does:**
- Stores specification in long-term memory
- Triggers neural pattern training
- Signals architecture phase readiness
- Updates project metrics
- Creates phase transition checkpoint

---

### Phase 2: Pseudocode

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Pseudocode phase: [Feature Name]" \
  --phase "pseudocode" \
  --feature "[feature-id]" \
  --depends-on "specification"
```

**What it does:**
- Retrieves specification from memory
- Identifies algorithms needed
- Suggests data structures based on patterns
- Prepares complexity analysis tools

**During Pseudocode:**
```bash
# After creating pseudocode document
npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/pseudocode/[feature].md" \
  --memory-key "sparc/[feature]/pseudocode" \
  --content-type "algorithm"

# Store algorithm patterns for reuse
npx claude-flow@alpha hooks store-pattern \
  --pattern-type "algorithm" \
  --pattern-name "[algorithm-name]" \
  --complexity "O(n)" \
  --use-case "[description]"
```

**Post-Task Hook:**
```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id]" \
  --status "completed" \
  --phase "pseudocode" \
  --next-phase "architecture"
```

---

### Phase 3: Architecture

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Architecture phase: [Feature Name]" \
  --phase "architecture" \
  --feature "[feature-id]" \
  --depends-on "specification,pseudocode"
```

**What it does:**
- Retrieves specification and pseudocode
- Analyzes existing architecture patterns
- Suggests component structures
- Identifies integration points

**During Architecture:**
```bash
# After creating architecture document
npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/architecture/[feature].md" \
  --memory-key "sparc/[feature]/architecture" \
  --content-type "architecture"

# Store architectural decision records
npx claude-flow@alpha hooks store-adr \
  --title "[Decision Title]" \
  --decision "[What was decided]" \
  --rationale "[Why]" \
  --alternatives "[What was considered]"
```

**Post-Task Hook:**
```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id]" \
  --status "completed" \
  --phase "architecture" \
  --next-phase "refinement"
```

---

### Phase 4: Refinement (TDD)

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Refinement phase: [Feature Name]" \
  --phase "refinement" \
  --feature "[feature-id]" \
  --mode "tdd"
```

**What it does:**
- Retrieves architecture and pseudocode
- Sets up test framework
- Configures code formatters
- Prepares TDD cycle tracking

**During Refinement:**
```bash
# After creating test file
npx claude-flow@alpha hooks post-edit \
  --file "tests/test_[feature].py" \
  --memory-key "sparc/[feature]/tests" \
  --content-type "test" \
  --auto-format true

# After implementing code
npx claude-flow@alpha hooks post-edit \
  --file "app/[feature].py" \
  --memory-key "sparc/[feature]/implementation" \
  --content-type "code" \
  --auto-format true \
  --run-tests true

# Track TDD cycles
npx claude-flow@alpha hooks tdd-cycle \
  --cycle-number 1 \
  --phase "red"  # or "green" or "refactor"
```

**Auto-Formatting:**
Hooks automatically run formatters after code changes:
- Python: `black`, `isort`, `autopep8`
- JavaScript/TypeScript: `prettier`, `eslint --fix`
- Go: `gofmt`, `goimports`

**Auto-Testing:**
Hooks can automatically run tests after implementation:
```bash
npx claude-flow@alpha hooks post-edit \
  --file "app/[feature].py" \
  --run-tests true \
  --test-suite "tests/test_[feature].py"
```

**Post-Task Hook:**
```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id]" \
  --status "completed" \
  --phase "refinement" \
  --next-phase "completion" \
  --metrics "coverage=94%,tests=45,passed=45"
```

---

### Phase 5: Completion

**Pre-Task Hook:**
```bash
npx claude-flow@alpha hooks pre-task \
  --description "Completion phase: [Feature Name]" \
  --phase "completion" \
  --feature "[feature-id]" \
  --integration-test true
```

**What it does:**
- Retrieves all prior phase artifacts
- Prepares integration test environment
- Configures deployment pipelines
- Sets up observability

**During Completion:**
```bash
# After creating Dockerfile
npx claude-flow@alpha hooks post-edit \
  --file "Dockerfile" \
  --memory-key "sparc/[feature]/deployment/docker" \
  --validate-docker true

# After integration tests
npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/completion/[feature].md" \
  --memory-key "sparc/[feature]/completion" \
  --content-type "deployment"

# Trigger deployment pipeline
npx claude-flow@alpha hooks trigger-deployment \
  --target "staging" \
  --feature "[feature-id]"
```

**Post-Task Hook:**
```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id]" \
  --status "completed" \
  --phase "completion" \
  --deployed true \
  --environment "staging"
```

---

## Session Management

### Session Start

**When to use:** Beginning a multi-hour or multi-day SPARC cycle

```bash
npx claude-flow@alpha hooks session-start \
  --session-name "sparc-[feature-id]" \
  --duration "8h" \
  --phases "all"
```

**What it does:**
- Creates session identifier
- Initializes session-specific memory
- Starts tracking time and metrics
- Sets up auto-save checkpoints

---

### Session Checkpoint

**When to use:** End of work day, before long break, after major milestone

```bash
npx claude-flow@alpha hooks session-checkpoint \
  --session-id "[session-id]" \
  --description "Completed specification and pseudocode phases"
```

**What it does:**
- Saves current state to memory
- Records progress metrics
- Creates restore point
- Generates progress summary

---

### Session Restore

**When to use:** Resuming work after break or on different machine

```bash
npx claude-flow@alpha hooks session-restore \
  --session-id "sparc-[feature-id]" \
  --restore-context true
```

**What it does:**
- Retrieves saved state from memory
- Restores agent configurations
- Loads prior decisions and context
- Resumes metrics tracking

---

### Session End

**When to use:** After completing all SPARC phases

```bash
npx claude-flow@alpha hooks session-end \
  --session-id "[session-id]" \
  --export-metrics true \
  --generate-report true
```

**What it does:**
- Finalizes all metrics
- Generates performance report
- Trains neural patterns from session
- Archives session data
- Creates lessons learned document

---

## Memory Coordination

### Memory Keys Structure

**Hierarchical key structure for SPARC:**

```
sparc/
  [feature-id]/
    spec/
      requirements
      user-stories
      acceptance-criteria
    pseudocode/
      algorithms
      data-structures
      complexity-analysis
    architecture/
      components
      integrations
      adrs/
        [adr-1]
        [adr-2]
    refinement/
      tests
      implementation
      tdd-cycles/
        cycle-1
        cycle-2
      metrics/
        coverage
        performance
    completion/
      deployment
      integration-tests
      documentation
```

### Storing Context

```bash
# Store specification context
npx claude-flow@alpha hooks memory-store \
  --key "sparc/[feature]/spec/requirements" \
  --value "[JSON or text content]" \
  --ttl "30d"

# Store with tags for retrieval
npx claude-flow@alpha hooks memory-store \
  --key "sparc/[feature]/architecture/components" \
  --value "[content]" \
  --tags "architecture,components,microservices"
```

### Retrieving Context

```bash
# Retrieve specific key
npx claude-flow@alpha hooks memory-retrieve \
  --key "sparc/[feature]/spec/requirements"

# Search by pattern
npx claude-flow@alpha hooks memory-search \
  --query "webhook" \
  --pattern "sparc/*/spec/*"

# Retrieve by tags
npx claude-flow@alpha hooks memory-search \
  --tags "architecture,microservices"
```

---

## Agent Coordination

### Parallel Agent Execution

**Scenario:** Multiple agents working on different SPARC phases concurrently

```bash
# Coordinator agent spawns parallel agents
# (This is done via Claude Code's Task tool, not MCP)

# Agent 1: Specification
# Pre-task hook automatically called
Task("Specification Agent", "
  Create specification for [feature]
  Hooks: pre-task, post-edit, post-task
", "specification")

# Agent 2: Research (parallel to spec)
# Pre-task hook automatically called
Task("Research Agent", "
  Research best practices for [feature]
  Store findings in memory
  Hooks: pre-task, post-edit
", "researcher")

# Agent 3: Prior Art Review (parallel)
# Pre-task hook automatically called
Task("Reviewer Agent", "
  Review similar implementations
  Document lessons learned
  Hooks: pre-task, post-edit
", "reviewer")
```

**Coordination via Memory:**

All agents share context via memory:
- Specification agent stores requirements
- Research agent stores best practices
- Reviewer agent stores prior patterns
- Architecture agent (next phase) retrieves all context

---

### Sequential Agent Execution

**Scenario:** Phases that must run in order

```bash
# Phase 1: Specification
Task("Spec Agent", "Create specification", "specification")
# Post-task hook signals architecture readiness

# Phase 2: Architecture (waits for spec)
# Pre-task hook retrieves specification
Task("Architecture Agent", "Design architecture", "architecture")
# Post-task hook signals refinement readiness

# Phase 3: Refinement (waits for architecture)
# Pre-task hook retrieves architecture
Task("TDD Agent", "Implement with TDD", "sparc-coder")
```

**Hook-Based Signaling:**

```bash
# Agent 1 completes work
npx claude-flow@alpha hooks post-task \
  --task-id "[task-1-id]" \
  --status "completed" \
  --signal-next "architecture-agent"

# Agent 2 receives signal via pre-task hook
# Pre-task hook checks for completion signals
npx claude-flow@alpha hooks pre-task \
  --description "Architecture phase" \
  --wait-for-signal "specification-complete"
```

---

## Advanced Hook Features

### Auto-Formatting

**Automatic code formatting after edits:**

```bash
npx claude-flow@alpha hooks post-edit \
  --file "app/service.py" \
  --auto-format true \
  --formatters "black,isort"
```

Supported formatters:
- **Python:** `black`, `isort`, `autopep8`, `yapf`
- **JavaScript/TypeScript:** `prettier`, `eslint --fix`
- **Go:** `gofmt`, `goimports`
- **Rust:** `rustfmt`

---

### Auto-Testing

**Automatic test execution after code changes:**

```bash
npx claude-flow@alpha hooks post-edit \
  --file "app/service.py" \
  --run-tests true \
  --test-suite "tests/" \
  --fail-fast true
```

If tests fail, hook returns error and prevents phase progression.

---

### Neural Pattern Training

**Learning from successful patterns:**

After completing a SPARC cycle, hooks automatically train neural models:

```bash
npx claude-flow@alpha hooks session-end \
  --session-id "[session-id]" \
  --train-patterns true \
  --success-metrics "coverage=94%,latency=145ms"
```

**What gets learned:**
- Effective algorithm choices for problem types
- Optimal architecture patterns for use cases
- TDD cycle timing and effectiveness
- Common error patterns and fixes

**Future benefits:**
- Suggestions during specification phase
- Architecture pattern recommendations
- Test case generation
- Error prediction and prevention

---

### GitHub Integration

**Automatic PR creation after completion:**

```bash
npx claude-flow@alpha hooks post-task \
  --task-id "[task-id]" \
  --phase "completion" \
  --create-pr true \
  --pr-title "Add [feature]" \
  --pr-body "$(cat docs/sparc/completion/[feature].md)"
```

**Automatic commit messages:**

```bash
npx claude-flow@alpha hooks post-edit \
  --file "app/service.py" \
  --auto-commit true \
  --commit-msg "Implement [component] - Refinement phase"
```

---

## Hooks Configuration

### Global Configuration

**File:** `.claude-flow/config.json`

```json
{
  "hooks": {
    "enabled": true,
    "auto_format": true,
    "auto_test": false,
    "formatters": {
      "python": ["black", "isort"],
      "javascript": ["prettier"],
      "typescript": ["prettier", "eslint --fix"]
    },
    "memory": {
      "ttl_days": 30,
      "max_size_mb": 500,
      "compression": true
    },
    "sessions": {
      "auto_checkpoint_minutes": 30,
      "auto_save": true
    },
    "github": {
      "auto_commit": false,
      "auto_pr": false,
      "commit_prefix": "[SPARC]"
    },
    "neural": {
      "training_enabled": true,
      "training_threshold": 0.85
    }
  }
}
```

### Per-Project Configuration

Override global settings in project-specific config:

**File:** `project/.claude-flow.json`

```json
{
  "hooks": {
    "auto_format": true,
    "auto_test": true,
    "formatters": {
      "python": ["black", "isort", "mypy"]
    }
  }
}
```

---

## Troubleshooting

### Issue: Hooks Not Running

**Symptom:** Hooks commands have no effect

**Solution:**
```bash
# Check hooks installation
npx claude-flow@alpha hooks status

# Reinstall if needed
npm install -g claude-flow@alpha

# Verify configuration
cat .claude-flow/config.json
```

---

### Issue: Memory Not Persisting

**Symptom:** Context lost between sessions

**Solution:**
```bash
# Check memory database
npx claude-flow@alpha hooks memory-status

# Verify storage path
echo $CLAUDE_FLOW_MEMORY_PATH

# Manually test store/retrieve
npx claude-flow@alpha hooks memory-store --key "test" --value "hello"
npx claude-flow@alpha hooks memory-retrieve --key "test"
```

---

### Issue: Auto-Format Failing

**Symptom:** Code not formatted after post-edit hook

**Solution:**
```bash
# Verify formatter is installed
which black  # or prettier, eslint, etc.

# Install if missing
pip install black isort  # for Python
npm install -g prettier eslint  # for JavaScript

# Test formatter manually
black app/service.py

# Check hook configuration
npx claude-flow@alpha hooks config show formatters
```

---

## Best Practices

### DO:
- ✅ Always run pre-task hook before starting work
- ✅ Use post-edit hooks after significant changes
- ✅ Create session checkpoints at end of day
- ✅ Store all decisions in memory with clear keys
- ✅ Use descriptive task descriptions
- ✅ Run post-task hooks even if work incomplete
- ✅ Use memory search to find prior patterns
- ✅ Let hooks auto-format code

### DON'T:
- ❌ Skip pre-task hooks (breaks coordination)
- ❌ Forget to run post-task hooks (metrics lost)
- ❌ Use generic memory keys (hard to retrieve)
- ❌ Manually format code if auto-format enabled
- ❌ Create sessions without ending them properly
- ❌ Store secrets in memory (use secure storage)

---

## Example: Complete SPARC Cycle with Hooks

```bash
# 1. Start session
npx claude-flow@alpha hooks session-start \
  --session-name "sparc-twenty-bridge" \
  --phases "all"

# 2. Specification phase
npx claude-flow@alpha hooks pre-task \
  --description "Specification: Twenty-Bridge webhook"

# ... create specification ...

npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/specifications/twenty-bridge.md" \
  --memory-key "sparc/twenty-bridge/spec"

npx claude-flow@alpha hooks post-task \
  --task-id "[from-pre-task]" \
  --next-phase "architecture"

# 3. Architecture phase
npx claude-flow@alpha hooks pre-task \
  --description "Architecture: Twenty-Bridge webhook" \
  --depends-on "specification"

# ... create architecture ...

npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/architecture/twenty-bridge.md" \
  --memory-key "sparc/twenty-bridge/architecture"

npx claude-flow@alpha hooks post-task \
  --task-id "[from-pre-task]" \
  --next-phase "refinement"

# 4. Refinement phase
npx claude-flow@alpha hooks pre-task \
  --description "Refinement: Twenty-Bridge webhook" \
  --mode "tdd"

# ... TDD cycle: write tests, implement, refactor ...

npx claude-flow@alpha hooks post-edit \
  --file "app/webhook.py" \
  --auto-format true \
  --run-tests true

npx claude-flow@alpha hooks post-task \
  --task-id "[from-pre-task]" \
  --next-phase "completion"

# 5. Completion phase
npx claude-flow@alpha hooks pre-task \
  --description "Completion: Twenty-Bridge webhook"

# ... integration testing, deployment ...

npx claude-flow@alpha hooks post-edit \
  --file "docs/sparc/completion/twenty-bridge.md" \
  --memory-key "sparc/twenty-bridge/completion"

npx claude-flow@alpha hooks post-task \
  --task-id "[from-pre-task]" \
  --create-pr true

# 6. End session
npx claude-flow@alpha hooks session-end \
  --session-id "sparc-twenty-bridge" \
  --export-metrics true \
  --train-patterns true
```

**Result:** Complete SPARC cycle with full coordination, memory persistence, and automated workflows.

---

## References

- [Claude-Flow Documentation](https://github.com/ruvnet/claude-flow)
- [Hooks API Reference](https://github.com/ruvnet/claude-flow/docs/hooks.md)
- [Memory Management Guide](https://github.com/ruvnet/claude-flow/docs/memory.md)
- [Neural Training](https://github.com/ruvnet/claude-flow/docs/neural.md)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-05
**Maintained By:** SPARC Coordination Agent
