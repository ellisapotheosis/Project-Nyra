# Project-Nyra: Agent Execution Guide

**Quick Start**: Follow these steps to execute all 14 agents for Project-Nyra.

---

## Prerequisites

1. **Claude Flow Installed**:
   ```bash
   npx claude-flow@alpha --version
   ```

2. **Project Context**: Ensure you're in the Project-Nyra directory

3. **Coordination Review**: Review `COORDINATION_SUMMARY.md` for full details

---

## Phase 1: Execute Independent Agents

### Agents to Spawn (9 total)
1. Agent 1: CLAUDE.md Files
2. Agent 2: Workflow Structures
3. Agent 3: Infisical Variables
4. Agent 5: CI/CD Pipelines
5. Agent 6: Docker Environments
6. Agent 8: WSL Setup
7. Agent 10: Bootstrap Enhancement
8. Agent 11: User Guide
9. Agent 12: Implementation

### Execution Method

**Option A: Using MCP Task Orchestration**
```bash
npx claude-flow@alpha task-orchestrate --task "Execute Phase 1 agents following coordination/phase1/AGENT_INSTRUCTIONS.md" --strategy parallel --max-agents 9
```

**Option B: Individual Agent Instructions**

For each agent, you can provide specific instructions to Claude Code or another AI assistant. Reference the detailed instructions in `coordination/phase1/AGENT_INSTRUCTIONS.md`.

**Option C: Sequential Manual Execution**

Execute agents one by one following their instructions:

```bash
# Agent 1
"Create CLAUDE.md files for all apps following coordination/phase1/AGENT_INSTRUCTIONS.md - Agent 1"

# Agent 2
"Create workflow structures following coordination/phase1/AGENT_INSTRUCTIONS.md - Agent 2"

# Agent 3
"Configure Infisical following coordination/phase1/AGENT_INSTRUCTIONS.md - Agent 3"

# ... and so on
```

### Monitoring Phase 1

```bash
# Check status
npx claude-flow@alpha memory retrieve --key "nyra/agent-1/status"
npx claude-flow@alpha memory retrieve --key "nyra/agent-2/status"
# ... check all agents

# Or review the status tracker
cat coordination/AGENT_STATUS_TRACKER.md
```

### Phase 1 Complete When
- All 9 agents report "complete" status
- Expected duration: 15-20 minutes
- All output directories contain files

---

## Phase 2: Execute Dependent Agents

**⚠️ WAIT FOR PHASE 1 TO COMPLETE BEFORE STARTING PHASE 2**

### Verify Dependencies First

```bash
# Verify Agent 3 complete (for Agents 4 and 13)
npx claude-flow@alpha memory retrieve --key "nyra/agent-3/status"

# Verify Agent 8 complete (for Agent 7)
npx claude-flow@alpha memory retrieve --key "nyra/agent-8/status"

# Verify Agent 1 complete (for Agent 13)
npx claude-flow@alpha memory retrieve --key "nyra/agent-1/status"
```

### Batch 1: Agents 4, 7, 13

These can run in parallel once their dependencies are met:

```bash
# Agent 4 (after Agent 3)
"Create checker scripts following coordination/phase2/AGENT_INSTRUCTIONS.md - Agent 4"

# Agent 7 (after Agent 8)
"Setup Gitea following coordination/phase2/AGENT_INSTRUCTIONS.md - Agent 7"

# Agent 13 (after Agents 1 and 3)
"Create environment variable documentation following coordination/phase2/AGENT_INSTRUCTIONS.md - Agent 13"
```

### Batch 2: Agent 9

**⚠️ WAIT FOR AGENT 7 TO COMPLETE**

```bash
# Verify Agent 7 complete
npx claude-flow@alpha memory retrieve --key "nyra/agent-7/status"

# Agent 9 (after Agent 7)
"Integrate Gitea into installer following coordination/phase2/AGENT_INSTRUCTIONS.md - Agent 9"
```

### Phase 2 Complete When
- All 4 agents report "complete" status
- Expected duration: 10-15 minutes
- All integrations validated

---

## Phase 3: Validation & Integration

### Automatic Validation

```bash
# Run validation (this would be automated)
npx claude-flow@alpha task-orchestrate --task "Validate all outputs from 14 agents, check for conflicts, and verify integrations"
```

### Manual Validation Checklist

1. **File Count Validation**
   ```bash
   # Verify expected files exist
   ls -la apps/*/CLAUDE.md
   ls -la docs/workflows/
   ls -la config/infisical/
   ls -la .github/workflows/
   ls -la docker/
   ls -la bootstrap/orchestrator-mini/wsl/
   ls -la bootstrap/orchestrator-mini/wsl/gitea/
   ls -la bootstrap/GUI-Installer/
   ls -la scripts/
   ```

2. **Conflict Detection**
   ```bash
   # Check git status for any issues
   git status

   # Review any conflicts
   git diff
   ```

3. **Integration Validation**
   - Agent 4 scripts reference Agent 3 schemas
   - Agent 7 Gitea uses Agent 8 WSL foundation
   - Agent 9 installer includes Agent 7 Gitea scripts
   - Agent 13 docs include Agent 1 and Agent 3 variables

### Generate Final Reports

Once all agents complete and validation passes:

```bash
"Generate final coordination reports using templates in coordination/reports/REPORT_TEMPLATES.md. Populate with actual data from all agent executions."
```

This will create:
- `IMPLEMENTATION_STATUS.md`
- `NEXT_STEPS.md`
- `AGENT_COORDINATION_REPORT.md`
- `PROJECT_READY_CHECKLIST.md`

---

## Troubleshooting

### Agent Fails to Complete

1. **Check Logs**
   ```bash
   npx claude-flow@alpha memory retrieve --key "nyra/agent-N/status"
   npx claude-flow@alpha memory retrieve --key "nyra/agent-N/outputs"
   ```

2. **Retry Agent**
   - Re-run the agent with same instructions
   - Verify dependencies were met
   - Check for file system issues

3. **Manual Intervention**
   - Review agent instructions
   - Complete tasks manually if needed
   - Document in coordination report

### Dependency Not Met

1. **Verify Blocker Agent**
   ```bash
   # Check if blocking agent completed
   npx claude-flow@alpha memory retrieve --key "nyra/agent-N/status"
   ```

2. **Wait for Completion**
   - Phase 2 agents must wait for Phase 1 dependencies
   - Agent 9 must wait for Agent 7

3. **Force Execution** (only if necessary)
   - Manually verify dependency outputs exist
   - Proceed with caution
   - Document override in report

### File Conflicts

1. **Identify Conflict**
   ```bash
   git status
   git diff
   ```

2. **Resolve Conflict**
   - Review conflicting files
   - Merge manually if needed
   - Ensure no data loss

3. **Validate Resolution**
   - Test affected functionality
   - Document resolution
   - Update coordination report

---

## Quick Reference Commands

### Check All Agent Status
```bash
for i in {1..13}; do
  echo "Agent $i:"
  npx claude-flow@alpha memory retrieve --key "nyra/agent-$i/status"
done
```

### View Coordination State
```bash
npx claude-flow@alpha memory retrieve --key "nyra/coordination/phase"
```

### Export All Metrics
```bash
npx claude-flow@alpha hooks session-end --export-metrics true --session-id "nyra-swarm-001"
```

---

## Timeline Expectations

| Phase | Duration | Agents | Notes |
|-------|----------|--------|-------|
| Phase 1 | 15-20 min | 9 agents | Parallel execution |
| Phase 2 Batch 1 | 8-10 min | 3 agents | Conditional parallel |
| Phase 2 Batch 2 | 2-5 min | 1 agent | After Agent 7 |
| Validation | 5-10 min | - | Automated + Manual |
| Reporting | 2-3 min | - | Generate reports |
| **Total** | **35-45 min** | **14 agents** | End-to-end |

---

## Success Indicators

### Phase 1 Success
- ✅ All 9 agents report "complete"
- ✅ 50+ files created
- ✅ No file conflicts
- ✅ Memory coordination working

### Phase 2 Success
- ✅ All dependencies verified
- ✅ All 4 agents report "complete"
- ✅ Integration points validated
- ✅ No conflicts with Phase 1

### Overall Success
- ✅ All 14 agents complete
- ✅ 100+ files created
- ✅ All reports generated
- ✅ Project ready for next steps

---

## Post-Execution

### Review Deliverables
1. Read `coordination/reports/IMPLEMENTATION_STATUS.md`
2. Follow `coordination/reports/NEXT_STEPS.md`
3. Review `coordination/reports/AGENT_COORDINATION_REPORT.md`
4. Check `coordination/reports/PROJECT_READY_CHECKLIST.md`

### Next Actions
- Configure secrets in Infisical
- Test local development environment
- Run validation scripts
- Deploy to staging

---

**Ready to Execute**: Yes
**Estimated Duration**: 35-45 minutes
**Required Resources**: 14 concurrent agent slots, standard compute

**Start Command**: Begin with Phase 1 agent execution following instructions above.
