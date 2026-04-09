# CLAUDE.md Template: Medium Team (6-20 People)

**Team Size**: 6-20 People
**Roles**: Multiple Specializations
**Organization**: Pod/Chapter Structure
**Release Cycle**: Continuous

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 12 --strategy specialized
```

## 🎯 Project Context

- **Team Members**: {{TEAM_SIZE}}
- **Pods/Squads**: {{NUMBER_OF_PODS}}
- **Project Name**: {{PROJECT_NAME}}
- **Release**: Continuous/Weekly

## 🔧 Medium Team Organization

### Pod Structure
```
Platform Squad (4-5):
  - Backend services (2)
  - Data engineer (1)
  - DevOps (1)
  - Tech lead (1)

Frontend Squad (3-4):
  - Frontend engineers (2-3)
  - Design engineer (1)

QA/DevOps Squad (2-3):
  - QA engineers (2)
  - DevOps engineer (1)
```

## 🐝 Medium Team Swarm

### Multi-Pod Coordination
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized

# Platform Squad
npx @claude-flow/cli@latest agent spawn -t coder --name platform-lead
npx @claude-flow/cli@latest agent spawn -t coder --name backend-team

# Frontend Squad
npx @claude-flow/cli@latest agent spawn -t coder --name frontend-lead

# QA/DevOps Squad
npx @claude-flow/cli@latest agent spawn -t tester --name qa-lead
```

## 🚀 Medium Team Practices

### Meeting Cadence
```
- Daily standup: 15 min per pod
- Cross-pod sync: 2x weekly
- Sprint planning: 4 hours
- Sprint review: 2 hours
- Retro: 1.5 hours
```

### Code Review SLA
```
- Max 24 hours to first review
- At least 2 approvals for core
- Auto-merge after tests pass (if approved)
```

### Deployment Cadence
```
- Multiple deployments per day
- Canary: 5% -> 25% -> 100%
- Automatic rollback on errors
- Post-deployment monitoring
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "team-standards-{{PROJECT_NAME}}" \
  --value "Architecture standards, API contracts, deployment procedures" \
  --namespace team --tags "standards,procedures"
```

## ✅ Testing & Quality

### Test Strategy
```
Unit:        80%+ coverage
Integration: 60%+ coverage
E2E:         Critical paths only (100%)
Performance: Weekly benchmarks
```

### Quality Gates
```
- Coverage: 75%+
- Security: 0 critical/high
- Performance: P99 < 1s
- Reliability: 99.5% uptime
```

## 📊 Medium Team Metrics

- Sprint velocity: 40-80 points
- Deployment frequency: 5-10 per week
- Lead time: <1 day
- MTTR: <30 minutes
- Availability: 99.5%

## 📋 Medium Team Checklist

- [ ] Pod structure defined
- [ ] Communication channels established
- [ ] Tech standards documented
- [ ] Architecture review process
- [ ] Incident response procedure
- [ ] On-call rotation
- [ ] Knowledge sharing program
- [ ] Career development paths

---

**Generated from**: claude-flow CLAUDE.md Medium Team (6-20) Template
