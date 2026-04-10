# SPARC Quick Start Guide - Project Nyra

## Overview

This guide shows you how to use the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic feature development in Project Nyra.

## Prerequisites

- Claude Code environment configured
- archon-os installed: `npm install -g archon-os@alpha`
- Git repository initialized
- Project dependencies installed

---

## Quick Start: Complete SPARC Cycle

### 1. Initialize SPARC Session

```bash
# Start SPARC coordination
npx @archon-os/cli@latest hooks pre-task --description "Twenty-Bridge webhook service"

# Initialize swarm (optional, for complex features)
npx @archon-os/cli@latest swarm init --topology mesh --agents 5
```

### 2. Execute Full SPARC Pipeline

**Option A: Full Pipeline (Recommended)**
```bash
npx archon-os sparc pipeline "Twenty-Bridge webhook service"
```

**Option B: Phase-by-Phase Execution**
```bash
# Phase 1: Specification
npx archon-os sparc run spec-pseudocode "Twenty-Bridge webhook service"

# Phase 2: Architecture
npx archon-os sparc run architect "Twenty-Bridge webhook service"

# Phase 3: Refinement (TDD)
npx archon-os sparc tdd "Twenty-Bridge webhook service"

# Phase 4: Completion
npx archon-os sparc run integration "Twenty-Bridge webhook service"
```

### 3. Monitor Progress

```bash
# Check swarm status
npx archon-os swarm status

# View task results
npx archon-os task results [task-id]

# Check memory
npx archon-os memory search --query "twenty-bridge"
```

### 4. Finalize Session

```bash
# Export metrics and end session
npx @archon-os/cli@latest hooks session-end --export-metrics true

# Create PR (if ready)
npx archon-os github pr create --title "Add Twenty-Bridge webhook service"
```

---

## Example Workflows

### Workflow 1: New Feature (Twenty-Bridge Webhook)

**Step 1: Specification Phase**
```bash
# Spawn specification agent
npx archon-os sparc run spec-pseudocode "Twenty-Bridge webhook service"
```

**What happens:**
- Requirements gathering from bootstrap docs
- User story creation
- Acceptance criteria definition
- Edge case identification
- Output: `docs/sparc/specifications/twenty-bridge-webhook.md`

**Step 2: Architecture Phase**
```bash
# Spawn architecture agent
npx archon-os sparc run architect "Twenty-Bridge webhook service"
```

**What happens:**
- Component design (WebhookReceiver, EventValidator, Transformer)
- Integration planning (TwentyCRM → Nexus → n8n)
- API contract definition
- Security model design
- Output: `docs/sparc/architecture/twenty-bridge-webhook.md`

**Step 3: Refinement Phase (TDD)**
```bash
# Spawn TDD agents (coder + tester in parallel)
npx archon-os sparc tdd "Twenty-Bridge webhook service"
```

**What happens:**
- Test creation (unit, integration, performance)
- Implementation with TDD cycle (Red → Green → Refactor)
- Code review by quality agents
- Performance optimization
- Output: `bootstrap/services/twenty-bridge/` + tests

**Step 4: Completion Phase**
```bash
# Spawn integration agents
npx archon-os sparc run integration "Twenty-Bridge webhook service"
```

**What happens:**
- Docker containerization
- Integration testing with Nexus
- Documentation finalization
- Deployment to staging
- Monitoring setup
- Output: Production-ready service

---

### Workflow 2: Enhancement (Quote Engine Formula Evaluation)

**Single Command:**
```bash
npx archon-os sparc pipeline "Quote Engine dynamic formula evaluation"
```

**Phases executed automatically:**
1. Analyze existing Quote API code
2. Design formula parser and evaluation engine
3. Implement with TDD (pytest)
4. Create v2 API endpoints
5. Performance benchmarking
6. Documentation and deployment

**Custom phase execution:**
```bash
# Only run specification to understand scope
npx archon-os sparc run spec-pseudocode "Quote Engine formulas" --phase-only spec

# Review output, then continue
npx archon-os sparc run architect "Quote Engine formulas"
```

---

### Workflow 3: Bug Fix with SPARC

**For significant bugs requiring design changes:**

```bash
# Quick specification (light)
npx archon-os sparc run spec-pseudocode "Fix quote calculation edge case" --mode bugfix

# Skip architecture if design is unchanged
npx archon-os sparc tdd "Fix quote calculation edge case"

# Integration testing
npx archon-os sparc run integration "Fix quote calculation edge case"
```

**For simple fixes:**
- Skip SPARC entirely
- Use standard git workflow with PR review

---

## Agent Coordination Patterns

### Pattern 1: Parallel Specification Research

**Scenario:** Multiple components need specification

```javascript
// Claude Code spawns agents in parallel
Task("Webhook Spec Agent", "Define webhook requirements for Twenty-Bridge", "specification")
Task("Security Spec Agent", "Define security requirements for webhook auth", "specification")
Task("Performance Spec Agent", "Define performance requirements for webhook handling", "specification")

// All run concurrently, store results in memory
```

### Pattern 2: TDD Swarm

**Scenario:** Multiple test types needed

```javascript
// Spawn TDD swarm in one message
Task("Unit Test Agent", "Create unit tests for webhook validation", "tester")
Task("Integration Test Agent", "Create integration tests for n8n publishing", "tester")
Task("Performance Test Agent", "Create load tests for webhook endpoint", "tester")
Task("Implementation Agent", "Implement webhook service to pass all tests", "sparc-coder")

// Agents coordinate via hooks and memory
```

### Pattern 3: Architecture Review

**Scenario:** Complex system design needs review

```javascript
// Architecture agent creates design
Task("System Architect", "Design Twenty-Bridge webhook architecture", "system-architect")

// Review agents validate in parallel
Task("Security Reviewer", "Review security architecture", "reviewer")
Task("Performance Reviewer", "Review performance architecture", "reviewer")
Task("Integration Reviewer", "Review integration points", "reviewer")
```

---

## Quality Gates Checklist

### Before Moving to Next Phase

**Specification → Pseudocode:**
```bash
# Check specification completeness
[ ] All user stories documented in docs/sparc/specifications/
[ ] Acceptance criteria defined
[ ] Edge cases identified
[ ] Dependencies mapped
[ ] Stakeholder sign-off (commit to spec branch)
```

**Pseudocode → Architecture:**
```bash
# Check algorithm design
[ ] Algorithms validated and documented
[ ] Logic flow diagrams created
[ ] Complexity analysis complete
[ ] Data structures selected
[ ] Peer review completed
```

**Architecture → Refinement:**
```bash
# Check architecture design
[ ] Component diagram created
[ ] Interface contracts defined
[ ] Integration plan documented
[ ] Security model approved
[ ] Architecture review passed
```

**Refinement → Completion:**
```bash
# Check implementation quality
[ ] All tests passing (run: npm test)
[ ] Code coverage ≥ 85% (run: npm run coverage)
[ ] Performance benchmarks met
[ ] Security scan passed
[ ] Documentation updated
```

**Completion → Deployment:**
```bash
# Check production readiness
[ ] Integration tests passing
[ ] Staging deployment successful
[ ] Load testing complete
[ ] Monitoring configured
[ ] Runbooks created
[ ] Production checklist complete
```

---

## File Organization

### SPARC Phase Outputs

```
docs/sparc/
├── specifications/
│   ├── twenty-bridge-webhook.md
│   ├── quote-engine-formulas.md
│   └── campaign-dashboard.md
├── architecture/
│   ├── twenty-bridge-webhook.md
│   ├── quote-engine-formulas.md
│   └── campaign-dashboard.md
├── pseudocode/
│   ├── twenty-bridge-webhook.md
│   ├── quote-engine-formulas.md
│   └── campaign-dashboard.md
├── refinement/
│   ├── twenty-bridge-webhook-tests.md
│   ├── quote-engine-formulas-tests.md
│   └── campaign-dashboard-tests.md
└── completion/
    ├── twenty-bridge-webhook-deployment.md
    ├── quote-engine-formulas-deployment.md
    └── campaign-dashboard-deployment.md
```

### Implementation Outputs

```
bootstrap/services/
├── twenty-bridge/
│   ├── app/
│   ├── tests/
│   ├── Dockerfile
│   └── README.md
├── quote-api/  (enhanced)
│   ├── app/
│   │   ├── formula_engine/  (new)
│   │   └── ...
│   └── tests/
└── campaign-dashboard/  (new)
    ├── backend/
    ├── frontend/
    └── tests/
```

---

## Common Commands Reference

### SPARC Commands

```bash
# List available modes
npx archon-os sparc modes

# Get mode details
npx archon-os sparc info architect

# Run specific mode
npx archon-os sparc run <mode> "<task>"

# Run TDD workflow
npx archon-os sparc tdd "<feature>"

# Run full pipeline
npx archon-os sparc pipeline "<task>"

# Parallel execution
npx archon-os sparc batch spec-pseudocode,architect "<task>"
```

### Swarm Commands

```bash
# Initialize swarm
npx archon-os swarm init --topology mesh --agents 5

# Check status
npx archon-os swarm status

# Scale agents
npx archon-os swarm scale --agents 8

# List agents
npx archon-os agent list
```

### Memory Commands

```bash
# Store context
npx archon-os memory store --key "sparc/feature/spec" --value "{...}"

# Retrieve context
npx archon-os memory retrieve --key "sparc/feature/spec"

# Search memory
npx archon-os memory search --query "webhook"

# List all keys
npx archon-os memory list --pattern "sparc/*"
```

### GitHub Commands

```bash
# Create PR
npx archon-os github pr create --title "Add feature" --body "Description"

# Review PR
npx archon-os github pr review --pr 123

# Create issue
npx archon-os github issue create --title "Bug" --body "Details"
```

---

## Troubleshooting

### Issue: Phase Hanging

**Symptom:** SPARC phase doesn't complete

**Solution:**
```bash
# Check swarm status
npx archon-os swarm status

# Check agent metrics
npx archon-os agent metrics

# Force terminate if needed
npx archon-os swarm destroy

# Restart phase
npx archon-os sparc run <mode> "<task>"
```

### Issue: Quality Gate Failure

**Symptom:** Tests failing, coverage low

**Solution:**
```bash
# Run tests locally
npm test

# Check coverage
npm run coverage

# Run specific test file
npm test -- tests/webhook.test.js

# Fix issues, then re-run refinement
npx archon-os sparc tdd "Feature name"
```

### Issue: Integration Failure

**Symptom:** Service doesn't integrate with Nexus/n8n

**Solution:**
```bash
# Check service logs
docker logs [container-id]

# Test integration manually
curl -X POST http://localhost:8080/webhook -d '{...}'

# Review architecture phase output
cat docs/sparc/architecture/[feature].md

# Re-run integration phase
npx archon-os sparc run integration "Feature name"
```

### Issue: Memory Not Persisting

**Symptom:** Context lost between phases

**Solution:**
```bash
# Verify memory store
npx archon-os memory list

# Check hooks configuration
cat .archon-os/config.json

# Manually store context
npx @archon-os/cli@latest hooks post-edit --memory-key "sparc/feature/context"

# Restore session
npx @archon-os/cli@latest hooks session-restore --session-id "sparc-[feature]"
```

---

## Best Practices

### DO:
- ✅ Run hooks at every phase transition
- ✅ Store all phase outputs in docs/sparc/
- ✅ Use batch operations for parallel execution
- ✅ Review quality gate checklists before proceeding
- ✅ Write tests before implementation (TDD)
- ✅ Document decisions in Architecture Decision Records (ADRs)
- ✅ Use memory to share context between agents
- ✅ Create PRs after completion phase

### DON'T:
- ❌ Skip quality gates to save time
- ❌ Move to next phase with failing tests
- ❌ Implement without architecture approval
- ❌ Deploy without integration testing
- ❌ Save working files to root folder
- ❌ Spawn agents in multiple messages
- ❌ Forget to run post-task hooks
- ❌ Ignore code review feedback

---

## Example: Full Feature Development

**Feature:** Twenty-Bridge Webhook Service

```bash
# 1. Initialize
npx @archon-os/cli@latest hooks pre-task --description "Twenty-Bridge webhook"
npx archon-os swarm init --topology mesh --agents 5

# 2. Specification
npx archon-os sparc run spec-pseudocode "Twenty-Bridge webhook"
# Review: docs/sparc/specifications/twenty-bridge-webhook.md
# Quality gate: ✅ All requirements documented

# 3. Architecture
npx archon-os sparc run architect "Twenty-Bridge webhook"
# Review: docs/sparc/architecture/twenty-bridge-webhook.md
# Quality gate: ✅ Design approved

# 4. Refinement (TDD)
npx archon-os sparc tdd "Twenty-Bridge webhook"
# Review: bootstrap/services/twenty-bridge/
# Quality gate: ✅ Tests passing, coverage 90%

# 5. Completion
npx archon-os sparc run integration "Twenty-Bridge webhook"
# Review: Docker running, integrated with Nexus
# Quality gate: ✅ Integration tests passing

# 6. Create PR
npx archon-os github pr create \
  --title "Add Twenty-Bridge webhook service" \
  --body "Implements webhook receiver for TwentyCRM events"

# 7. Finalize
npx @archon-os/cli@latest hooks session-end --export-metrics true
```

**Time:** ~2 days (16 hours)
**Output:** Production-ready webhook service with 90%+ test coverage

---

## Next Steps

1. **Read the Roadmap:** Review `docs/sparc/ROADMAP.md` for priority features
2. **Choose a Feature:** Start with Priority 1 (Twenty-Bridge webhook)
3. **Run First Phase:** Execute specification phase
4. **Follow This Guide:** Use workflows and commands above
5. **Iterate and Improve:** Refine templates based on learnings

---

## Additional Resources

- [SPARC Methodology Overview](./README.md)
- [Phase Templates](./templates/)
- [Hooks Integration Guide](./HOOKS_INTEGRATION.md)
- [Quality Gates Detailed](./QUALITY_GATES.md)
- [archon-os Documentation](https://github.com/ruvnet/archon-os)

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-05
**Maintained By:** SPARC Coordination Agent
