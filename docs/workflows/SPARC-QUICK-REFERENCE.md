# SPARC Ingestion Workflow - Quick Reference
> Fast reference for using the ingestion SPARC workflow

## One-Line Execution

```bash
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{"ingestion_path": "/path/to/ingestion", "priority": "high"}'
```

## SPARC Phases Overview

| Phase | Agents | Duration | Output |
|-------|--------|----------|--------|
| **S**pecification | researcher, system-architect | ~5 min | specification.json |
| **P**seudocode | planner, coder | ~5 min | algorithms.md |
| **A**rchitecture | system-architect, security-architect | ~10 min | architecture docs |
| **R**efinement | tester, reviewer, security-auditor | ~15 min | test/review reports |
| **C**ompletion | coordinator, memory-specialist | ~5 min | completion report |

**Total**: ~40 minutes for deep validation

## Input Variables

```yaml
ingestion_path: "/path/to/content"    # Required
content_type: "mixed"                 # config|code|workflow|docker|mixed
target_domain: "apps"                 # apps|infra|shared
priority: "normal"                    # low|normal|high|critical
validation_level: "standard"          # basic|standard|deep
```

## Quick Commands

```bash
# Create workflow from file
npx @claude-flow/cli@latest workflow create \
  --name "ingestion-sparc-processor" \
  --from-file ".claude-flow/workflows/ingestion-sparc.json"

# Execute with custom variables
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "/archive/ingestion-historical",
    "content_type": "docker",
    "target_domain": "infra",
    "priority": "high",
    "validation_level": "deep"
  }'

# Monitor progress
npx @claude-flow/cli@latest workflow status \
  --workflow-id ingestion-sparc-processor \
  --verbose

# Pause if needed
npx @claude-flow/cli@latest workflow pause \
  --workflow-id ingestion-sparc-processor

# Resume
npx @claude-flow/cli@latest workflow resume \
  --workflow-id ingestion-sparc-processor
```

## Success Criteria

| Metric | Target | How to Check |
|--------|--------|--------------|
| Processing Time | < 10 min | `workflow status --verbose` |
| Success Rate | > 95% | `workflow metrics` |
| Quality Score | > 8.0 | Check `review_report.json` |
| Tests Passing | 100% | Check `test_report.json` |
| Security Score | > 9.0 | Check `security_report.json` |

## Common Use Cases

### 1. Docker Compose Integration
```bash
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "/path/to/docker-compose.yml",
    "content_type": "docker",
    "target_domain": "infra",
    "validation_level": "deep"
  }'
```

### 2. Configuration Merge
```bash
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "/path/to/configs",
    "content_type": "config",
    "target_domain": "config",
    "validation_level": "standard"
  }'
```

### 3. Code Migration
```bash
npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '{
    "ingestion_path": "/path/to/code",
    "content_type": "code",
    "target_domain": "apps/services",
    "validation_level": "deep"
  }'
```

## Outputs

After successful completion:

```
/outputs/
  specification.json          # Phase 1: What was analyzed
  algorithms.md               # Phase 2: Processing logic
  docs/architecture/
    ingestion-integration.md  # Phase 3: Architecture design
  docs/security/
    ingestion-security.md     # Phase 3: Security design
  test_report.json           # Phase 4: Test results
  review_report.json         # Phase 4: Code review
  security_report.json       # Phase 4: Security audit
  completion_report.json     # Phase 5: Final integration
  knowledge_report.json      # Phase 5: Learnings captured
```

## Error Handling

### Automatic Retries
- Max attempts: 3
- Backoff: exponential (2x)
- Rollback: automatic on failure

### Manual Rollback
```bash
# If workflow fails, rollback manually
npx @claude-flow/cli@latest workflow cancel \
  --workflow-id ingestion-sparc-processor \
  --reason "Manual rollback requested"

# Restore from backup (created automatically)
ls /backups/ingestion-sparc-*
```

## Memory Search

```bash
# Find similar patterns
npx @claude-flow/cli@latest memory search \
  --query "ingestion processing" \
  --namespace ingestion_patterns

# Retrieve specific workflow
npx @claude-flow/cli@latest memory retrieve \
  --key "ingestion-sparc-workflow" \
  --namespace consolidation
```

## Integration with Claude Code

When user requests ingestion processing:

```typescript
// 1. Initialize swarm
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 10")

// 2. Execute workflow
Bash(`npx @claude-flow/cli@latest workflow execute \
  --workflow-id ingestion-sparc-processor \
  --variables '${JSON.stringify(variables)}'`)

// 3. Monitor completion
// Wait for workflow to complete, then review outputs
```

## Troubleshooting

### Workflow Stuck
```bash
# Check status
npx @claude-flow/cli@latest workflow status --workflow-id ingestion-sparc-processor

# Check swarm health
npx @claude-flow/cli@latest swarm status

# Check agent health
npx @claude-flow/cli@latest agent health
```

### Phase Failures
```bash
# View detailed logs
npx @claude-flow/cli@latest workflow status --workflow-id ingestion-sparc-processor --verbose

# Check specific phase
cat /outputs/[phase]_report.json
```

### Memory Issues
```bash
# Check memory stats
npx @claude-flow/cli@latest memory stats

# Reinitialize if needed
npx @claude-flow/cli@latest memory init --force
```

## Performance Tuning

### Faster Processing (Trade Quality)
```json
{
  "validation_level": "basic",
  "priority": "high"
}
```

### Higher Quality (More Time)
```json
{
  "validation_level": "deep",
  "priority": "critical"
}
```

### Balanced (Recommended)
```json
{
  "validation_level": "standard",
  "priority": "normal"
}
```

## Related Workflows

- `code-consolidation-workflow` - For code merging
- `security-audit-workflow` - For security validation
- `docker-orchestration-workflow` - For container integration
- `config-merge-workflow` - For configuration handling

## Support

- Full Documentation: `docs/workflows/ingestion-sparc-workflow.md`
- Workflow JSON: `.claude-flow/workflows/ingestion-sparc.json`
- Memory Key: `ingestion-sparc-workflow` (namespace: `consolidation`)
- GitHub Issues: https://github.com/ruvnet/claude-flow/issues
