# CLAUDE.md Template: Hybrid Architecture

**Architecture Pattern**: Hybrid (Monolith + Services)
**Approach**: Strangler Pattern
**Transition**: Gradual Migration
**Goal**: Modular Monolith Evolution

## 🚨 AUTOMATIC SWARM ORCHESTRATION

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 12 --strategy specialized
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Current State**: {{CURRENT_STATE}} (Monolith)
- **Target State**: {{TARGET_STATE}} (Microservices)
- **Migration Timeline**: {{TIMELINE}} months

## 🔧 Hybrid Architecture

### Layer 1: Monolithic Core
```
├── Domain Models
├── Business Logic
├── Legacy APIs
└── Shared Database
```

### Layer 2: Extracted Services
```
├── Auth Service (Extracted)
├── Payment Service (Extracted)
├── Notification Service (Extracted)
└── Legacy Routes (API Gateway)
```

### Layer 3: API Gateway
```
- Routes to monolith
- Routes to services
- Service discovery
- Load balancing
```

## 🚀 Strangler Pattern Migration

### Phase 1: Parallel (2-4 weeks)
```
- Identify service boundary
- Implement new service
- Run in parallel
- Compare results
```

### Phase 2: Redirect (1-2 weeks)
```
- Update API gateway
- Route traffic to service
- Monitor metrics
- Verify functionality
```

### Phase 3: Cleanup (1 week)
```
- Remove legacy code
- Update documentation
- Archive old service
- Celebrate completion
```

## 🧠 Memory Management

```bash
npx @claude-flow/cli@latest memory store --key "migration-progress-{{PROJECT_NAME}}" \
  --value "Services extracted, timeline, lessons learned" \
  --namespace migration --tags "hybrid,evolution"
```

## 📊 Hybrid Metrics

- Services extracted: {{SERVICES_COUNT}}
- Code decoupling: {{DECOUPLING_PERCENTAGE}}%
- Migration progress: {{PROGRESS_PERCENTAGE}}%
- Team velocity: {{VELOCITY}} points/sprint

## 📋 Hybrid Architecture Checklist

- [ ] Service boundaries identified
- [ ] API gateway configured
- [ ] First service extracted
- [ ] Traffic routing tested
- [ ] Monitoring configured
- [ ] Team trained on new architecture
- [ ] Documentation updated
- [ ] Rollback procedures defined
- [ ] Gradual migration scheduled
- [ ] Success metrics defined

---

**Generated from**: claude-flow CLAUDE.md Hybrid Architecture Template
