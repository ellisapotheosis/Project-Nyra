# ClawTeam Alpha → Stable Release Upgrade Plan

**Date:** 2026-08-25  
**Current Status:** Alpha ("Coming Soon")  
**Target Stability:** v1.0.0 (Q4 2026 estimated)

---

## Why Defer to Stable

ClawTeam is marked "Coming Soon" by upstream. Deploying alpha in production risks:

- Feature incompleteness (missing API endpoints)
- Bug instability (deadlock detection false positives, Windows path issues)
- API changes (breaking changes between alpha → stable)

**Recommendation:** Use single-agent OpenHarness for production. Use ClawTeam alpha for testing/validation only.

---

## Testing Strategy (While Alpha)

### Phase 3 — Alpha Validation

Run in isolated test environment:

```bash
# 1. Deploy ClawTeam on non-prod node
docker compose -f infra/hosts/oracle-vps/docker-compose.clawteam.yml up -d

# 2. Run comprehensive test suite
bash tests/phase3-clawteam-alpha-tests.sh

# 3. Document findings
- Deadlock detection false positives → increase timeout to 600s
- Windows path issues → use WSL2 Ubuntu only
- Missing endpoints → workaround with direct OpenClaw calls
```

### Comprehensive Alpha Test Suite

```bash
#!/bin/bash
# Tests for ClawTeam alpha viability

echo "=== ClawTeam Alpha Validation ==="

# Test 1: Team spawn
curl -X POST http://localhost:8085/team \
  -d '{"team_task_id":"alpha-test-1","subtasks":[{"id":"st-1","desc":"test"}]}'

# Test 2: Parallel execution (3 agents)
for i in 1 2 3; do
  curl -X POST http://localhost:8085/team -d "{...}" &
done
wait

# Test 3: Deadlock detection timeout
curl -X POST http://localhost:8085/team \
  -d '{"deadlock_timeout_sec":600,...}'

# Test 4: Structured handoff
curl -X POST http://localhost:8085/handoff/accept \
  -d '{"handoff_token":"...","callback":"..."}'

# Test 5: Error recovery
curl -X POST http://localhost:8085/team \
  -d '{"max_retries":2,...}'
```

---

## Pre-Upgrade Checklist (When v1.0 Released)

- [ ] Upstream ClawTeam v1.0.0 released and documented
- [ ] Breaking changes reviewed (vs. current alpha)
- [ ] New API endpoints documented
- [ ] Windows support fixed (if needed)
- [ ] Performance benchmarks available
- [ ] Migration guide provided by upstream
- [ ] Test suite updated (phase3-clawteam-tests.sh)

---

## Upgrade Path: Alpha → Stable

### Step 1: Backup Current State

```bash
docker compose -f docker-compose.clawteam.yml down
docker volume create clawteam_backup
docker cp orchestrator-clawteam-primary:/data /tmp/clawteam_backup_$(date +%s)
```

### Step 2: Update Compose File

```yaml
# docker-compose.clawteam.yml (v1.0.0)
services:
  clawteam-primary:
    image: projectnyra/clawteam:v1.0.0 # Changed from 'coming-soon'
    # ... rest unchanged
```

### Step 3: Redeploy

```bash
docker compose -f docker-compose.clawteam.yml pull
docker compose -f docker-compose.clawteam.yml up -d --force-recreate
```

### Step 4: Verify

```bash
# Run smoke test
bash tests/phase3-clawteam-smoke-test.sh

# Check API compatibility
curl http://localhost:8085/v1/teams
curl http://localhost:8085/v1/status
```

### Step 5: Enable Team Tasks

```bash
# Update OpenClaw config
export CLAWTEAM_ENABLED=true
export CLAWTEAM_URL=http://clawteam-primary:8085

# Re-deploy OpenClaw
docker compose -f docker-compose.yml restart openclaw-gateway
```

---

## Known Limitations (Alpha)

### Issue 1: Deadlock Detection False Positives

```yaml
# Workaround: Increase timeout
{ "team_config": {
      "deadlock_detection": true,
      "deadlock_timeout_sec": 600, # Default: 300s
    } }
```

### Issue 2: Windows Path Issues

```yaml
# Workaround: Use WSL2 Ubuntu
{ "constraints": {
      "os": "ubuntu", # Never "windows"
      "path_style": "posix",
    } }
```

### Issue 3: OpenHarness Credential Bug

```yaml
# Workaround: Set env var
environment:
  ANTHROPIC_API_KEY: ${LITELLM_OPENHARNESS_KEY}
```

---

## Rollback Plan (If Stable Release Has Issues)

```bash
# Revert to alpha
docker compose -f docker-compose.clawteam.yml down
docker image rm projectnyra/clawteam:v1.0.0

# Restore backup
docker cp /tmp/clawteam_backup_* orchestrator-clawteam-primary:/data

# Restart alpha
docker compose -f docker-compose.clawteam.yml up -d
```

---

## Production Readiness Timeline

| Phase             | Date     | Status      | Action                               |
| ----------------- | -------- | ----------- | ------------------------------------ |
| Phase 3 (current) | Now      | Alpha       | Testing only, document findings      |
| Phase 3.1         | 2 weeks  | Stable v0.9 | Release candidate, broader testing   |
| Phase 4           | 4 weeks  | Stable v1.0 | Production-ready, full team features |
| Phase 4+          | 6+ weeks | Mature      | Advanced features, hardening         |

---

## When to Use ClawTeam vs. Single-Agent

| Scenario                   | Use                  | Reason                       |
| -------------------------- | -------------------- | ---------------------------- |
| Interactive development    | OpenHarness only     | Faster, more reliable        |
| Feature implementation     | OpenHarness only     | Alpha stability risks        |
| Parallel testing           | ClawTeam alpha (lab) | Isolated testing environment |
| Production features        | OpenHarness only     | Until ClawTeam v1.0 stable   |
| Team coordination (future) | ClawTeam v1.0        | After stable release         |

---

## Monitoring During Alpha Testing

```bash
# Watch ClawTeam logs
docker logs -f orchestrator-clawteam-primary

# Track deadlock incidents
grep "deadlock_detected" orchestrator-clawteam-primary-logs.txt | wc -l

# Monitor parallel execution latency
curl http://localhost:8085/metrics | grep "task_duration_seconds"
```

---

## Contact & Escalation

**ClawTeam Upstream:** github.com/projectnyra/clawteam  
**Report issues:** Use `alpha-testing` label  
**Success stories:** Document in `/docs/ai-orchestration/CLAWTEAM_ALPHA_TESTS.md`

---

**ClawTeam upgrade readiness: Full plan in place. Ready to adopt v1.0 when released.**
