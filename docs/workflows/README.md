# Workflow Documentation - Project Nyra

This directory contains reusable workflow definitions for systematic processing of various content types using the SPARC methodology and Claude Flow V3.

## Available Workflows

### 1. Ingestion SPARC Workflow
**Purpose**: Systematically process apps/ingestion pipeline content using the SPARC methodology.

**Location**:
- Full Documentation: [`ingestion-sparc-workflow.md`](./ingestion-sparc-workflow.md)
- Workflow Definition: [`../.archon-os/workflows/ingestion-sparc.json`](../.archon-os/workflows/ingestion-sparc.json)
- Quick Reference: [`SPARC-QUICK-REFERENCE.md`](./SPARC-QUICK-REFERENCE.md)
- Visual Diagrams: [`sparc-workflow-diagram.md`](./sparc-workflow-diagram.md)
- Example Usage: [`examples/ingestion-processing-example.md`](./examples/ingestion-processing-example.md)

**Memory Key**: `ingestion-sparc-workflow` (namespace: `consolidation`)

**Quick Start**:
```bash
npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{"ingestion_path": "/path/to/content"}'
```

**SPARC Phases**:
1. **Specification** - Analyze content and define requirements (researcher, system-architect)
2. **Pseudocode** - Design processing algorithms (planner, coder)
3. **Architecture** - Plan integration architecture (system-architect, security-architect)
4. **Refinement** - Test and validate (tester, reviewer, security-auditor)
5. **Completion** - Finalize and learn (coordinator, memory-specialist)

**Success Metrics**:
- Processing Time: < 10 minutes
- Success Rate: > 95%
- Quality Score: > 8.0
- Security Score: > 9.0
- Integration Accuracy: > 98%

---

## Workflow Directory Structure

```
docs/workflows/
├── README.md                           # This file
├── ingestion-sparc-workflow.md         # Full SPARC workflow specification
├── SPARC-QUICK-REFERENCE.md            # Quick reference guide
├── sparc-workflow-diagram.md           # Visual diagrams and flows
└── examples/
    └── ingestion-processing-example.md # Step-by-step example
```

---

## Creating New Workflows

### Step 1: Design the Workflow

Create a new markdown file with the workflow specification:

```markdown
# Workflow Name

## Overview
[Description of what this workflow does]

## Inputs
- input_1: description
- input_2: description

## Phases
1. Phase 1: [Description]
   - Agents: [agent1, agent2]
   - Steps: [...]
   - Outputs: [...]

[Continue for all phases]

## Success Criteria
- criteria_1
- criteria_2
```

### Step 2: Create JSON Definition

Create a JSON file in `.archon-os/workflows/`:

```json
{
  "workflow": {
    "id": "workflow-id",
    "name": "Workflow Name",
    "version": "1.0.0",
    "variables": { ... },
    "steps": [ ... ]
  }
}
```

### Step 3: Store in Memory

```bash
npx @archon-os/cli@latest memory store \
  --key "workflow-name" \
  --value "Workflow description and key details" \
  --namespace workflows
```

### Step 4: Create Workflow

```bash
npx @archon-os/cli@latest workflow create \
  --name "workflow-id" \
  --from-file ".archon-os/workflows/workflow-id.json"
```

---

## Workflow Design Principles

### 1. SPARC Methodology
All workflows should follow the SPARC phases when applicable:
- **S**pecification - Define what needs to be done
- **P**seudocode - Design how to do it
- **A**rchitecture - Plan where and how to integrate
- **R**efinement - Test and validate
- **C**ompletion - Finalize and learn

### 2. Agent Specialization
- Use specialized agents for specific tasks
- Avoid agent overlap (anti-drift)
- Clear role definitions

### 3. Parallelization
- Run independent tasks in parallel
- Use sequential execution only when dependencies exist
- Optimize for speed without sacrificing quality

### 4. Error Handling
- Implement retry logic with exponential backoff
- Always create backups before modifications
- Store failure patterns for learning

### 5. Knowledge Capture
- Store successful patterns in memory
- Train neural models on outcomes
- Document learnings for future use

### 6. Monitoring & Metrics
- Track phase duration
- Measure success rates
- Calculate quality scores
- Alert on anomalies

---

## Workflow Execution Patterns

### Pattern 1: Sequential Phases
Best for workflows with strict dependencies:

```yaml
steps:
  - phase_1: { depends_on: null }
  - phase_2: { depends_on: ["phase_1"] }
  - phase_3: { depends_on: ["phase_2"] }
```

### Pattern 2: Parallel Execution
Best for independent tasks:

```yaml
steps:
  - phase_1:
      type: "parallel"
      tasks: [task_a, task_b, task_c]
```

### Pattern 3: Hybrid (Recommended)
Best for complex workflows:

```yaml
steps:
  - discovery: { type: "parallel" }
  - processing: { type: "sequential", depends_on: ["discovery"] }
  - validation: { type: "parallel", depends_on: ["processing"] }
  - completion: { type: "sequential", depends_on: ["validation"] }
```

---

## Swarm Topologies

### Hierarchical (Anti-Drift)
**Best for**: Small teams (6-8 agents), tight control

```bash
npx @archon-os/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 8 \
  --strategy specialized
```

### Hierarchical-Mesh (Recommended)
**Best for**: Large teams (10-15 agents), V3 queen + peer communication

```bash
npx @archon-os/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 15 \
  --strategy specialized
```

### Mesh
**Best for**: Distributed tasks, peer-to-peer coordination

```bash
npx @archon-os/cli@latest swarm init \
  --topology mesh \
  --max-agents 12 \
  --strategy balanced
```

---

## Memory Integration

All workflows should integrate with the memory system:

### Before Execution
```bash
# Search for similar patterns
npx @archon-os/cli@latest memory search \
  --query "[workflow context]" \
  --namespace workflow_patterns
```

### During Execution
- Cache intermediate results
- Track progress in real-time
- Store phase outcomes

### After Execution
```bash
# Store successful patterns
npx @archon-os/cli@latest memory store \
  --key "workflow-pattern-$(date +%s)" \
  --value "$(cat completion_report.json)" \
  --namespace workflow_patterns

# Train neural models
npx @archon-os/cli@latest neural train \
  --pattern-type workflow \
  --data completion_report.json
```

---

## Workflow Metrics

Track these metrics for all workflows:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Duration | < baseline | `workflow status --verbose` |
| Success Rate | > 95% | `workflow metrics` |
| Quality Score | > 8.0 | Review reports |
| Agent Utilization | 60-80% | `agent health` |
| Memory Usage | < 80% | `system metrics` |
| Error Rate | < 5% | `workflow logs` |

---

## Common Commands

```bash
# List all workflows
npx @archon-os/cli@latest workflow list

# Get workflow details
npx @archon-os/cli@latest workflow status --workflow-id [id]

# Execute workflow
npx @archon-os/cli@latest workflow execute --workflow-id [id]

# Pause workflow
npx @archon-os/cli@latest workflow pause --workflow-id [id]

# Resume workflow
npx @archon-os/cli@latest workflow resume --workflow-id [id]

# Cancel workflow
npx @archon-os/cli@latest workflow cancel --workflow-id [id]

# View workflow metrics
npx @archon-os/cli@latest workflow metrics --workflow-id [id]

# Save as template
npx @archon-os/cli@latest workflow template save \
  --workflow-id [id] \
  --template-name [name]

# Create from template
npx @archon-os/cli@latest workflow template create \
  --template-id [id] \
  --new-name [name]
```

---

## Best Practices

### 1. Workflow Design
- Start with clear success criteria
- Define inputs and outputs explicitly
- Plan for error scenarios
- Include rollback procedures

### 2. Agent Selection
- Match agent types to task requirements
- Use model routing for cost optimization
- Limit concurrent agents (anti-drift)

### 3. Testing
- Test with small datasets first
- Validate each phase independently
- Run full integration tests
- Benchmark performance

### 4. Documentation
- Document all workflow phases
- Include examples and use cases
- Maintain change logs
- Update based on learnings

### 5. Monitoring
- Set up alerts for long-running workflows
- Track resource utilization
- Monitor error rates
- Review metrics regularly

---

## Troubleshooting

### Workflow Not Starting
```bash
# Check daemon status
npx @archon-os/cli@latest daemon status

# Start daemon if needed
npx @archon-os/cli@latest daemon start

# Check swarm health
npx @archon-os/cli@latest swarm health
```

### Workflow Hanging
```bash
# Check agent health
npx @archon-os/cli@latest agent health

# View workflow logs
npx @archon-os/cli@latest workflow logs --workflow-id [id]

# Pause and inspect
npx @archon-os/cli@latest workflow pause --workflow-id [id]
```

### Memory Issues
```bash
# Check memory stats
npx @archon-os/cli@latest memory stats

# Clear old entries
npx @archon-os/cli@latest memory cleanup --older-than 30d

# Reinitialize if needed
npx @archon-os/cli@latest memory init --force
```

---

## Future Workflows

Planned workflows for Project Nyra:

1. **Code Consolidation Workflow** - Merge duplicate code across modules
2. **Security Audit Workflow** - Comprehensive security scanning
3. **Docker Orchestration Workflow** - Container integration and management
4. **Config Merge Workflow** - Configuration file merging
5. **Test Coverage Workflow** - Identify and fill test gaps
6. **Documentation Workflow** - Auto-generate documentation
7. **Performance Optimization Workflow** - Identify and fix bottlenecks
8. **Migration Workflow** - Systematic codebase migrations

---

## Contributing

To add a new workflow:

1. Design the workflow (SPARC methodology)
2. Create markdown documentation
3. Create JSON definition
4. Add examples and diagrams
5. Test thoroughly
6. Store in memory
7. Update this README

---

## Resources

- Claude Flow Documentation: https://github.com/ruvnet/archon-os
- SPARC Methodology: `.archon-os/CAPABILITIES.md`
- Agent Types: `CLAUDE.md` (Available Agents section)
- CLI Commands: `CLAUDE.md` (V3 CLI Commands section)
- Memory System: `docs/architecture/memory-system.md`

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/ruvnet/archon-os/issues
- Memory Search: `npx @archon-os/cli@latest memory search --query "workflow"`
- Doctor Diagnostics: `npx @archon-os/cli@latest doctor --fix`

---

Last Updated: 2026-01-18
