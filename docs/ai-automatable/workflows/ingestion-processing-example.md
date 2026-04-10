# Ingestion Processing Example - Step by Step

This document demonstrates how to use the SPARC workflow to process ingestion content.

## Scenario: Processing Historical Ingestion Archive

**Context**: We have archived ingestion content at `_archive/ingestion-historical-2026-01-18` that contains:
- Docker compose files
- Configuration files (neo4j, postgres, qdrant)
- Python cleaners
- GitHub workflows
- Bootstrap configurations

**Goal**: Systematically process and integrate valuable content into the proper domain structure.

---

## Step 1: Initialize Claude Flow Environment

```bash
# Check system health
npx @archon-os/cli@latest doctor

# Initialize memory system if needed
npx @archon-os/cli@latest memory init --force

# Start daemon for background workers
npx @archon-os/cli@latest daemon start
```

---

## Step 2: Search for Previous Patterns

```bash
# Search for similar ingestion patterns
npx @archon-os/cli@latest memory search \
  --query "docker compose integration" \
  --namespace ingestion_patterns \
  --limit 5

# Retrieve the workflow definition
npx @archon-os/cli@latest memory retrieve \
  --key "ingestion-sparc-workflow" \
  --namespace consolidation
```

---

## Step 3: Create the Workflow

```bash
# Create workflow from JSON definition
npx @archon-os/cli@latest workflow create \
  --name "ingestion-sparc-processor" \
  --from-file ".archon-os/workflows/ingestion-sparc.json"

# Verify workflow was created
npx @archon-os/cli@latest workflow list
```

**Expected Output:**
```
┌─────────────────────────────┬─────────┬────────┬──────────┐
│ Workflow ID                 │ Name    │ Status │ Created  │
├─────────────────────────────┼─────────┼────────┼──────────┤
│ ingestion-sparc-processor   │ SPARC..│ ready  │ 2026-... │
└─────────────────────────────┴─────────┴────────┴──────────┘
```

---

## Step 4: Initialize Swarm (Anti-Drift Configuration)

```bash
# Initialize with hierarchical-mesh topology (recommended for 10+ agents)
npx @archon-os/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 10 \
  --strategy specialized \
  --consensus raft

# Verify swarm initialization
npx @archon-os/cli@latest swarm status
```

**Expected Output:**
```
[OK] Swarm initialized successfully

Topology:     hierarchical-mesh
Max Agents:   10
Strategy:     specialized
Consensus:    raft
Active:       0/10 agents
Health:       healthy
```

---

## Step 5: Execute the Workflow

```bash
# Execute with custom variables for historical ingestion
npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "_archive/ingestion-historical-2026-01-18",
    "content_type": "mixed",
    "target_domain": "apps",
    "priority": "high",
    "validation_level": "deep"
  }'
```

**Expected Output:**
```
[INFO] Starting workflow: ingestion-sparc-processor
[INFO] Variables:
  - ingestion_path: _archive/ingestion-historical-2026-01-18
  - content_type: mixed
  - target_domain: apps
  - priority: high
  - validation_level: deep

[INFO] Phase 1: Specification - Starting...
[INFO] Spawning agents: researcher, system-architect
```

---

## Step 6: Monitor Progress

### Option A: Real-Time Monitoring
```bash
# Watch workflow progress (updates every 2s)
npx @archon-os/cli@latest workflow status \
  --workflow-id ingestion-sparc-processor \
  --watch
```

### Option B: Verbose Status Check
```bash
# Get detailed status
npx @archon-os/cli@latest workflow status \
  --workflow-id ingestion-sparc-processor \
  --verbose
```

**Expected Output:**
```
┌─────────────────────────────────────────────────────────┐
│ Workflow: ingestion-sparc-processor                     │
├─────────────────────────────────────────────────────────┤
│ Status:        Running                                  │
│ Progress:      60% (Phase 4/5)                          │
│ Duration:      25m 30s                                  │
│ Agents Active: 3                                        │
└─────────────────────────────────────────────────────────┘

Phases:
✅ Phase 1: Specification    (5m 12s) - Complete
✅ Phase 2: Pseudocode       (4m 45s) - Complete
✅ Phase 3: Architecture     (9m 32s) - Complete
⏳ Phase 4: Refinement       (6m 01s) - Running
   ├─ Testing: ✅ Complete
   ├─ Code Review: ✅ Complete
   └─ Security Audit: ⏳ Running (80%)
⏸️ Phase 5: Completion       - Pending
```

### Option C: Check Agent Health
```bash
# View all active agents
npx @archon-os/cli@latest agent list --status active

# Check swarm health
npx @archon-os/cli@latest swarm health
```

---

## Step 7: Review Outputs (After Completion)

```bash
# Check workflow completion status
npx @archon-os/cli@latest workflow status \
  --workflow-id ingestion-sparc-processor

# View generated reports
ls -la outputs/
# Expected files:
# - specification.json
# - algorithms.md
# - docs/architecture/ingestion-integration.md
# - docs/security/ingestion-security.md
# - test_report.json
# - review_report.json
# - security_report.json
# - completion_report.json
# - knowledge_report.json

# Read completion report
cat outputs/completion_report.json
```

**Example Completion Report:**
```json
{
  "workflow_id": "ingestion-sparc-processor",
  "status": "completed",
  "duration_ms": 2430000,
  "phases_completed": 5,
  "success_rate": 100,
  "quality_score": 8.7,
  "security_score": 9.2,
  "files_processed": 47,
  "files_integrated": 42,
  "files_skipped": 5,
  "target_locations": [
    "apps/infra/docker",
    "config/storage",
    "config/env"
  ],
  "backup_location": "backups/ingestion-sparc-20260118",
  "learnings_stored": true,
  "neural_models_trained": true
}
```

---

## Step 8: Validate Integration

```bash
# Run post-integration tests
npm test

# Check docker configurations
docker-compose -f apps/infra/docker/docker-compose.yml config

# Verify config files
cat config/storage/postgres.yml
cat config/storage/neo4j.yml

# Check security scan results
npx @archon-os/cli@latest security scan --path apps/
```

---

## Step 9: Knowledge Capture and Learning

```bash
# Verify patterns were stored
npx @archon-os/cli@latest memory search \
  --query "ingestion docker integration" \
  --namespace ingestion_patterns

# Check neural model training
npx @archon-os/cli@latest neural status

# View learning metrics
npx @archon-os/cli@latest hooks metrics --period 1h
```

---

## Step 10: Cleanup and Archive

```bash
# Verify backup was created
ls -la backups/ingestion-sparc-*

# Archive original ingestion folder (already done in this case)
# The original content is at: _archive/ingestion-historical-2026-01-18

# Update documentation
git add docs/ apps/ config/
git commit -m "feat: Integrate historical ingestion content via SPARC workflow"
```

---

## Handling Errors

### If Workflow Fails

```bash
# Check error details
npx @archon-os/cli@latest workflow status \
  --workflow-id ingestion-sparc-processor \
  --verbose

# View logs
npx @archon-os/cli@latest workflow logs \
  --workflow-id ingestion-sparc-processor

# Rollback if needed
npx @archon-os/cli@latest workflow cancel \
  --workflow-id ingestion-sparc-processor \
  --reason "Rolling back due to errors"

# Restore from backup
cp -r backups/ingestion-sparc-20260118/* ./
```

### If Phase Hangs

```bash
# Pause workflow
npx @archon-os/cli@latest workflow pause \
  --workflow-id ingestion-sparc-processor

# Check agent health
npx @archon-os/cli@latest agent health

# Resume from last checkpoint
npx @archon-os/cli@latest workflow resume \
  --workflow-id ingestion-sparc-processor \
  --from-checkpoint
```

---

## Advanced Usage

### Custom Processing Rules

Create a custom configuration file:

```yaml
# custom-processing-rules.yml
content_filters:
  - type: "docker"
    action: "merge"
    target: "apps/infra/docker"
    merge_strategy: "service-based"

  - type: "config"
    action: "validate-and-merge"
    target: "config/storage"
    validation: "schema-strict"

  - type: "workflow"
    action: "review-and-integrate"
    target: ".github/workflows"
    approval: "required"

exclude_patterns:
  - "*.tmp"
  - "node_modules/"
  - ".env*"

security_checks:
  scan_for_secrets: true
  validate_dependencies: true
  require_cve_scan: true
```

Execute with custom rules:

```bash
npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "_archive/ingestion-historical-2026-01-18",
    "content_type": "mixed",
    "processing_rules": "custom-processing-rules.yml"
  }'
```

---

## Performance Tuning

### Fast Processing (Trade Quality for Speed)

```bash
npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "_archive/ingestion-historical-2026-01-18",
    "validation_level": "basic",
    "priority": "high",
    "skip_security_scan": false
  }'
```

**Expected Duration**: ~15 minutes

### Maximum Quality (More Time)

```bash
npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "_archive/ingestion-historical-2026-01-18",
    "validation_level": "deep",
    "priority": "critical",
    "require_manual_review": true
  }'
```

**Expected Duration**: ~60 minutes

---

## Integration with Claude Code

When working with Claude Code, the workflow can be triggered automatically:

```typescript
// User request: "Process the ingestion archive"

// Claude Code responds:
Bash("npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 10")

Bash(`npx @archon-os/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{"ingestion_path": "_archive/ingestion-historical-2026-01-18"}'`)

// Spawn background agents
Task({
  prompt: "Execute specification phase for ingestion archive",
  subagent_type: "researcher",
  run_in_background: true
})
Task({
  prompt: "Design architecture for content integration",
  subagent_type: "system-architect",
  run_in_background: true
})

// Tell user
"I've launched 5 agents working on SPARC phases:
- Researcher: Analyzing archive content
- Architect: Designing integration approach
- Planner: Creating processing algorithms
- Tester: Setting up validation
- Security: Reviewing safety

They're processing in parallel. I'll synthesize results when complete."
```

---

## Success Criteria

After successful execution, verify:

- [ ] All phases completed (5/5)
- [ ] Tests passing (>95%)
- [ ] Quality score > 8.0
- [ ] Security score > 9.0
- [ ] No critical vulnerabilities
- [ ] Documentation updated
- [ ] Patterns stored in memory
- [ ] Neural models trained
- [ ] Backup created
- [ ] Integration validated

---

## Continuous Improvement

After each successful run, the workflow learns:

1. **Pattern Storage**: Successful integration patterns stored in ruvector
2. **Neural Training**: Models learn from outcomes via SONA
3. **Metric Tracking**: Performance metrics captured for optimization
4. **Runbook Updates**: Best practices documented automatically

Query learnings:

```bash
# Find similar successful patterns
npx @archon-os/cli@latest memory search \
  --query "docker integration success" \
  --namespace workflow_patterns \
  --limit 10

# Get recommendations for next ingestion
npx @archon-os/cli@latest neural predict \
  --input "Processing new ingestion archive with docker and configs"
```

---

## Related Documentation

- Full Workflow Spec: `docs/workflows/ingestion-sparc-workflow.md`
- Quick Reference: `docs/workflows/SPARC-QUICK-REFERENCE.md`
- Visual Diagrams: `docs/workflows/sparc-workflow-diagram.md`
- Workflow JSON: `.archon-os/workflows/ingestion-sparc.json`
- Memory Key: `ingestion-sparc-workflow` (namespace: `consolidation`)

---

## Support

For issues or questions:
- GitHub: https://github.com/ruvnet/archon-os/issues
- Memory Search: `npx @archon-os/cli@latest memory search --query "sparc workflow"`
- Doctor Check: `npx @archon-os/cli@latest doctor --fix`
