# CLAUDE.md Template: Agile/Scrum Methodology

**Development Approach**: Agile/Scrum Framework
**Sprint Duration**: {{SPRINT_LENGTH}} weeks (typically 2)
**Technology Stack**: {{TECH_STACK}}

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**Agile teams require sprint coordination:**

1. **Scrum Master**: Sprint coordination
2. **Product Owner**: Prioritization
3. **Development Team**: Implementation
4. **QA Team**: Quality assurance

### Initialization

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced

# Spawn agile-focused agents
npx @claude-flow/cli@latest agent spawn -t coordinator --name scrum-master --capabilities "scrum,coordination"
npx @claude-flow/cli@latest agent spawn -t coder --name dev-team --capabilities "development,implementation"
npx @claude-flow/cli@latest agent spawn -t tester --name qa-team --capabilities "testing,qa"
```

## 🎯 Project Context

- **Project Name**: {{PROJECT_NAME}}
- **Product**: {{PRODUCT_NAME}}
- **Team Size**: {{TEAM_SIZE}} people
- **Sprint Duration**: {{SPRINT_LENGTH}} weeks
- **Release Cycle**: {{RELEASE_CYCLE}}

## 🔧 Agile/Scrum Framework

### Sprint Cycle (2 Weeks)
```
Week 1:
├── Monday: Sprint Planning (2-4 hours)
├── Daily: Daily Standup (15 minutes)
├── Wednesday: Sprint Check-in
└── Friday: Sprint Review Prep

Week 2:
├── Monday: Daily Standup
├── Daily: Development & Testing
├── Thursday: Sprint Review (1-2 hours)
├── Thursday: Sprint Retrospective (1-1.5 hours)
└── Friday: Sprint Retro Action Items
```

### Project Structure
```
project/
├── docs/
│   ├── product/
│   │   ├── roadmap.md
│   │   ├── product-vision.md
│   │   └── acceptance-criteria.md
│   ├── sprints/
│   │   ├── sprint-1/
│   │   │   ├── goals.md
│   │   │   ├── stories.md
│   │   │   ├── retrospective.md
│   │   │   └── metrics.md
│   │   └── sprint-2/
│   └── user-stories/
├── backlog/
│   ├── product-backlog.md
│   ├── sprint-backlog.md
│   └── done-items.md
├── src/
├── tests/
└── package.json
```

## 🐝 Agile Swarm Orchestration

### Sprint Planning (8 hours per sprint)
- **Duration**: 4 hours
- **Agents**: Scrum Master, Dev Team, QA Team
- **Tasks**:
  - Review product backlog
  - Select user stories for sprint
  - Break stories into tasks
  - Estimate effort (story points)
  - Commit to sprint goal

### Daily Standup (15 minutes)
- **Duration**: 15 minutes
- **Agents**: All team members
- **Questions**:
  - What did I complete yesterday?
  - What will I complete today?
  - Are there any blockers?

### Sprint Development (8 days)
- **Duration**: 8 working days
- **Agents**: Dev Team, QA Team
- **Focus**: Story implementation, testing, code review

### Sprint Review (2 hours)
- **Duration**: 1-2 hours
- **Agents**: All team, Product Owner
- **Output**: Demo of completed work

### Sprint Retrospective (1.5 hours)
- **Duration**: 1-1.5 hours
- **Agents**: Team members
- **Focus**: What went well, what to improve

## 🧠 Memory Management

### Store Sprint Goals
```bash
npx @claude-flow/cli@latest memory store --key "sprint-goal-{{SPRINT_NUMBER}}" \
  --value "Sprint goal, key results, success criteria" \
  --namespace sprints --tags "agile,sprint"
```

### Store Retrospective Insights
```bash
npx @claude-flow/cli@latest memory store --key "retro-insights-sprint-{{SPRINT_NUMBER}}" \
  --value "What went well, improvements, action items" \
  --namespace retrospectives --tags "agile,improvement"
```

## 📊 User Stories & Backlog

### User Story Template
```markdown
## Story: User Login

**As a** user
**I want to** log in to the application
**So that** I can access my account

### Acceptance Criteria
- [ ] User can enter email and password
- [ ] Valid credentials grant access
- [ ] Invalid credentials show error
- [ ] User can reset forgotten password
- [ ] Login page is mobile-responsive

### Tasks
- [ ] Create login form UI (3 SP)
- [ ] Implement authentication API (5 SP)
- [ ] Add password reset flow (5 SP)
- [ ] Write integration tests (3 SP)
- [ ] Add error handling (2 SP)

### Story Points: 18
### Priority: High
### Sprint: Sprint 5
```

### Product Backlog Management
```bash
# Store prioritized backlog
npx @claude-flow/cli@latest memory store --key "product-backlog-{{PROJECT_NAME}}" \
  --value "[Story 1, Story 2, ...] with priorities and estimates" \
  --namespace backlog --tags "agile,backlog"
```

## 🚀 Agile Workflow

### Sprint Metrics Dashboard
```
Sprint {{SPRINT_NUMBER}} Metrics
================================

Goal: {{SPRINT_GOAL}}

Velocity:
- Planned: {{PLANNED_POINTS}} story points
- Completed: {{COMPLETED_POINTS}} story points
- Burn: {{BURN_RATE}% down from start

Quality:
- Test Coverage: {{COVERAGE}}%
- Bugs Found: {{BUG_COUNT}}
- Code Review Time: {{AVG_REVIEW_TIME}} hours

Team:
- On Track: {{ON_TRACK_STORIES}}
- At Risk: {{AT_RISK_STORIES}}
- Blocked: {{BLOCKED_STORIES}}
```

### Velocity Tracking
```
Sprint 1: 25 points
Sprint 2: 28 points
Sprint 3: 26 points
Sprint 4: 27 points

Average Velocity: 26.5 points
Next Sprint Goal: {{VELOCITY_TARGET}} points
```

## ✅ Definition of Done

```
Story is Done when:
- [ ] Code written and reviewed
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Acceptance criteria met
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Deployment prepared
- [ ] Product Owner approved
```

## 🎯 Sprint Goals & Success Criteria

### Example Sprint Goal
```
Goal: Implement user authentication and account management

Success Criteria:
- User registration working
- Email verification implemented
- Password reset functional
- User profile management working
- 90%+ test coverage
- Security audit passed
```

## 📋 Agile Checklist

- [ ] Product backlog created and prioritized
- [ ] Team trained on Scrum
- [ ] Sprint cadence established
- [ ] Story point estimates defined
- [ ] Definition of Done agreed
- [ ] Sprint tracking tool configured
- [ ] Daily standup schedule set
- [ ] Retrospective process documented
- [ ] Velocity tracking implemented
- [ ] Release plan created
- [ ] Team communication established
- [ ] Stakeholder engagement plan

---

**Generated from**: claude-flow CLAUDE.md Agile/Scrum Methodology Template
