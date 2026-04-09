# CLAUDE.md Template: Small Team (2-5 People)

**Team Size**: 2-5 People
**Roles**: Backend, Frontend, DevOps
**Communication**: Daily Standups
**Release Cycle**: Weekly

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 5 --strategy balanced
```

## 🎯 Project Context

- **Team Members**: {{TEAM_SIZE}}
- **Project Name**: {{PROJECT_NAME}}
- **Sprint Duration**: 1 week
- **Release Frequency**: {{RELEASE_FREQUENCY}}

## 🔧 Small Team Workflow

### Lightweight Project Management
```bash
# Use GitHub Issues + Projects
- Issues for tasks
- Project board for visibility
- Milestones for releases
```

### Communication
```
- Daily standup: 15 minutes
- Weekly planning: 1 hour
- Weekly retro: 30 minutes
```

## 🐝 Small Team Swarm

### Specialized Roles
```
Backend Dev (1-2):
  - API development
  - Database design
  - Deployment automation

Frontend Dev (1-2):
  - UI/UX implementation
  - Performance optimization
  - Component library

DevOps (0.5):
  - CI/CD pipeline
  - Infrastructure
  - Monitoring
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "team-decisions-{{PROJECT_NAME}}" \
  --value "Architecture decisions, team standards, best practices" \
  --namespace team --tags "decisions,standards"
```

## 🚀 Small Team Practices

### Code Review Process
```
- All changes require review
- At least 1 approval
- Deploy after green CI/CD
```

### Pair Programming (Optional)
```
- Complex features: pair programming
- Code reviews: quick pairing sessions
- 30-60 minutes per session
```

## ✅ Testing Strategy

### Practical Coverage
```
- Core features: 80%+
- Critical paths: 100%
- Bug reproduction: tests added
- Coverage gates: 70% minimum
```

## 📊 Small Team Metrics

- Sprint velocity: 15-25 points
- Deployment frequency: 2-3 per week
- Lead time: <1 day
- Mean time to recovery: <1 hour

## 📋 Small Team Checklist

- [ ] GitHub repo with CI/CD
- [ ] Product backlog prioritized
- [ ] Velocity established
- [ ] Code review process defined
- [ ] Deployment pipeline automated
- [ ] Monitoring configured
- [ ] Incident response plan
- [ ] Knowledge sharing cadence

---

**Generated from**: claude-flow CLAUDE.md Small Team (2-5) Template
