# CLAUDE.md Template: Enterprise (20+ People)

**Team Size**: 20+ People
**Roles**: Specialized Functions
**Organization**: Department/Division Structure
**Release Cycle**: Continuous/Multiple Regions

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 20 --strategy specialized
```

## 🎯 Project Context

- **Team Members**: {{TEAM_SIZE}}
- **Departments**: {{NUMBER_OF_DEPARTMENTS}}
- **Project Name**: {{PROJECT_NAME}}
- **Global Scale**: {{DEPLOYMENT_REGIONS}}

## 🔧 Enterprise Organization

### Department Structure
```
Platform & Infrastructure (8-10):
  - Backend team leads (2-3)
  - Database/Data engineers (2)
  - DevOps/SRE (2-3)
  - Security engineer (1)
  - Tech architect (1)

Frontend & UX (5-7):
  - Frontend leads (2)
  - Frontend engineers (2-3)
  - Product designer (1)
  - Design systems (1)

Quality & Testing (3-4):
  - QA lead (1)
  - QA engineers (2-3)

Product & Management (2-3):
  - Product manager (1)
  - Technical program manager (1)
  - Data analyst (0-1)

Operations & Support (1-2):
  - Technical support lead (1)
  - Incident management (0-1)
```

## 🐝 Enterprise Swarm

### Multi-Department Coordination
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 25 --strategy specialized

# Platform Department
npx @claude-flow/cli@latest agent spawn -t system-architect --name platform-lead --capabilities "architecture,strategy"

# Frontend Department
npx @claude-flow/cli@latest agent spawn -t coder --name frontend-lead

# QA Department
npx @claude-flow/cli@latest agent spawn -t tester --name qa-lead

# Multi-agent coordination
npx @claude-flow/cli@latest agent spawn -t coordinator --name enterprise-coordinator
```

## 🚀 Enterprise Practices

### Governance & Compliance
```
- Architecture review board
- Security council
- Change advisory board (CAB)
- Compliance officers
- Legal review process
```

### Meeting Structure
```
- Standups: 15 min (per department)
- Sync meetings: 3x weekly (cross-department)
- Architecture review: Weekly
- Exec sync: 2x weekly
- Planning: Quarterly (OKRs) + Sprint
```

### Code Review & Approval
```
- Minimum 3 approvals for core
- Security review for auth/payment
- Architecture review for major changes
- At least 2 from different teams
```

### Deployment Process
```
- Change tickets (Jira/Azure DevOps)
- CAB approval for production
- Phased rollout (blue-green, canary)
- Rollback strategy defined
- Post-deployment validation
- Monitoring for 24 hours
```

## 🔒 Enterprise Security

```
- RBAC with fine-grained permissions
- Audit logging of all changes
- SOC 2 / ISO 27001 compliance
- Regular security audits
- Vulnerability management
- Incident response plan (24/7)
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "enterprise-standards-{{PROJECT_NAME}}" \
  --value "Architecture standards, API contracts, security policies, compliance requirements" \
  --namespace enterprise --tags "standards,compliance,governance"

npx @claude-flow/cli@latest memory store --key "enterprise-procedures-{{PROJECT_NAME}}" \
  --value "Deployment procedures, incident response, disaster recovery, business continuity" \
  --namespace enterprise --tags "procedures,operations"
```

## ✅ Enterprise Testing & Quality

### Test Strategy
```
Unit:            85%+ coverage
Integration:     75%+ coverage
E2E:             All user journeys
Performance:     Weekly benchmarks
Security:        Monthly penetration testing
Accessibility:   WCAG 2.1 AA compliance
```

### Quality Gates
```
- Coverage: 80%+
- Security: 0 critical/high vulnerabilities
- Performance: P99 < 500ms
- Availability: 99.99% uptime
- Accessibility: 100% WCAG pass
- Compliance: All checks pass
```

## 📊 Enterprise Metrics

- Sprint velocity: 100+ points
- Deployment frequency: 10+ per week
- Lead time: <4 hours
- MTTR: <15 minutes
- Availability: 99.99%+
- Customer satisfaction: 4.5+ / 5.0

## 🎯 Enterprise Goals

- Feature velocity: Faster time to market
- Stability: 99.99%+ uptime
- Compliance: Industry certifications
- Security: Zero critical vulnerabilities
- Scalability: 1000+ concurrent users
- Global reach: Multi-region deployment

## 📋 Enterprise Checklist

- [ ] Organization structure defined
- [ ] Governance policies documented
- [ ] Security standards implemented
- [ ] Compliance framework established
- [ ] Disaster recovery plan
- [ ] Business continuity plan
- [ ] Vendor management process
- [ ] Performance SLOs defined
- [ ] Escalation procedures defined
- [ ] Knowledge management system
- [ ] Executive reporting configured
- [ ] Customer support tier defined

---

**Generated from**: claude-flow CLAUDE.md Enterprise (20+) Template
