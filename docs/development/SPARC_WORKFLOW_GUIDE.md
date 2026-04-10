# SPARC Workflow Guide - Project Nyra

## Overview

SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) is our systematic development methodology for building robust, well-tested features.

---

## SPARC Phases

### 1. **Specification (S)**
**Purpose:** Define requirements and user stories
**Output:** Detailed specifications document
**Command:** `npx archon-os sparc run spec "<feature>"`

**What to Define:**
- User stories and acceptance criteria
- Functional requirements
- Non-functional requirements (performance, security)
- API contracts
- Data models
- Compliance requirements

### 2. **Pseudocode (P)**
**Purpose:** Design algorithm and logic flow
**Output:** High-level pseudocode
**Command:** `npx archon-os sparc run pseudocode "<feature>"`

**What to Create:**
- Algorithm descriptions
- Control flow diagrams
- Edge case handling
- Error handling strategies
- State transitions

### 3. **Architecture (A)**
**Purpose:** Design system architecture
**Output:** Architecture diagrams and decisions
**Command:** `npx archon-os sparc run architect "<feature>"`

**What to Design:**
- Component architecture
- Data flow diagrams
- Database schema
- API design
- Integration points
- Deployment architecture

### 4. **Refinement (R)**
**Purpose:** TDD implementation with iterative refinement
**Output:** Working code with tests
**Command:** `npx archon-os sparc tdd "<feature>"`

**What to Build:**
- Red: Write failing tests
- Green: Implement minimal code to pass
- Refactor: Improve code quality
- Iterate until complete

### 5. **Completion (C)**
**Purpose:** Integration, documentation, and deployment
**Output:** Production-ready feature
**Command:** `npx archon-os sparc run completion "<feature>"`

**What to Finalize:**
- Integration with existing systems
- End-to-end testing
- Performance optimization
- Documentation updates
- Deployment preparation

---

## Quick Commands

### Full SPARC Pipeline
Run complete SPARC workflow from start to finish:
```bash
npx archon-os sparc pipeline "<feature-description>"
```

### Batch Execution
Run multiple SPARC phases in parallel:
```bash
npx archon-os sparc batch "spec,pseudocode,architect" "<feature>"
```

### Individual Phase
Execute a specific SPARC phase:
```bash
npx archon-os sparc run spec "<feature>"
npx archon-os sparc run pseudocode "<feature>"
npx archon-os sparc run architect "<feature>"
npx archon-os sparc run refinement "<feature>"
npx archon-os sparc run completion "<feature>"
```

### TDD Workflow
Run Test-Driven Development workflow:
```bash
npx archon-os sparc tdd "<feature>"
```

### Get Phase Info
Get detailed information about a SPARC phase:
```bash
npx archon-os sparc info spec
npx archon-os sparc info architect
npx archon-os sparc info refinement
```

---

## Project Nyra SPARC Workflows

### Example 1: Twenty-Bridge Webhook Service

**Feature:** Implement TwentyCRM webhook receiver for real-time lead synchronization

**Workflow:**
```bash
# Full pipeline approach
npx archon-os sparc pipeline "Implement twenty-bridge webhook service for TwentyCRM lead sync with letta"

# Or step-by-step approach
npx archon-os sparc run spec "Twenty-bridge webhook receiver"
npx archon-os sparc run pseudocode "Twenty-bridge webhook receiver"
npx archon-os sparc run architect "Twenty-bridge webhook receiver"
npx archon-os sparc tdd "Twenty-bridge webhook receiver"
npx archon-os sparc run completion "Twenty-bridge webhook receiver"
```

### Example 2: Quote Engine Excel Formula Migration

**Feature:** Migrate remaining Excel formulas to API endpoints

**Workflow:**
```bash
# Batch spec + pseudocode + architect phases
npx archon-os sparc batch "spec,pseudocode,architect" "Migrate Excel USDA loan formulas to Quote Engine API"

# Then TDD implementation
npx archon-os sparc tdd "USDA loan calculation endpoint"

# Finally completion
npx archon-os sparc run completion "USDA loan endpoint integration"
```

### Example 3: Campaign Execution Monitoring

**Feature:** Add real-time campaign execution monitoring to Admin UI

**Workflow:**
```bash
# Full pipeline
npx archon-os sparc pipeline "Add real-time campaign execution monitoring dashboard to Admin UI with WebSocket updates"
```

---

## SPARC Best Practices

### 1. Start with Clear Specifications
- Write user stories in Given-When-Then format
- Define acceptance criteria upfront
- Include compliance requirements early
- Document API contracts before implementation

### 2. Design Before Coding
- Create architecture diagrams
- Review with stakeholders
- Consider scalability and security
- Plan for testing and observability

### 3. Test-Driven Development
- Write tests first (Red phase)
- Implement minimal code (Green phase)
- Refactor for quality (Refactor phase)
- Maintain 80%+ test coverage

### 4. Document as You Build
- Update architecture docs
- Write API documentation
- Create runbooks for operations
- Include inline code comments

### 5. Integrate Continuously
- Run CI checks frequently
- Deploy to staging early
- Get user feedback
- Iterate based on feedback

---

## Integration with archon-os Hooks

SPARC automatically integrates with archon-os hooks:

**Pre-Task Hooks:**
```bash
npx @archon-os/cli@latest hooks pre-task --description "<feature>"
```

**Post-Edit Hooks:**
```bash
npx @archon-os/cli@latest hooks post-edit --file "<file>" --memory-key "sparc/<phase>/<feature>"
```

**Post-Task Hooks:**
```bash
npx @archon-os/cli@latest hooks post-task --task-id "<task-id>"
```

**Memory Coordination:**
All SPARC phases store decisions in swarm memory for cross-phase coordination.

---

## Project Nyra Priority Features for SPARC

### High Priority (Week 1-2)

1. **Twenty-Bridge Webhook Service**
   - CRM → letta real-time sync
   - Webhook signature verification
   - Event processing pipeline
   - Status: Architecture complete, needs implementation

2. **Quote Engine Excel Migration**
   - Remaining USDA formula migration
   - Jumbo loan calculations
   - Rate lock integration
   - Status: Core engine complete, needs extensions

3. **Campaign Execution Monitoring**
   - Real-time execution dashboard
   - WebSocket updates
   - Delivery status tracking
   - Status: Campaign engine complete, needs UI

### Medium Priority (Week 3-4)

4. **Letta Archivist Agent Configuration**
   - Memory write policy implementation
   - Agent persona definition
   - Knowledge base initialization
   - Status: Service architecture complete, needs configuration

5. **Admin UI Lead Scoring**
   - ML-based lead scoring model
   - Score visualization
   - Historical trends
   - Status: UI framework complete, needs ML integration

6. **n8n Workflow Templates**
   - Campaign workflows
   - Lead nurturing flows
   - Document collection automation
   - Status: Campaign engine ready, needs templates

### Low Priority (Week 5-6)

7. **Performance Optimization**
   - Query optimization
   - Caching strategies
   - Load testing
   - Status: Base performance good, needs optimization

8. **Advanced Analytics**
   - Campaign ROI analytics
   - Lead conversion funnels
   - Revenue forecasting
   - Status: Basic analytics complete, needs advanced features

---

## SPARC Template Files

### Specification Template
**Location:** `docs/sparc/specifications/TEMPLATE_SPEC.md`

```markdown
# Feature Specification: [Feature Name]

## User Stories
- As a [role], I want [feature] so that [benefit]

## Acceptance Criteria
- [ ] Given [context], When [action], Then [result]

## Requirements
### Functional
- Requirement 1
- Requirement 2

### Non-Functional
- Performance: [target]
- Security: [requirements]
- Compliance: [regulations]

## API Contracts
[API specifications]

## Data Models
[Data structures]
```

### Architecture Template
**Location:** `docs/sparc/architecture/TEMPLATE_ARCH.md`

```markdown
# Architecture Design: [Feature Name]

## Component Diagram
[C4 diagram or similar]

## Data Flow
[Flow diagram]

## API Design
[Endpoint specifications]

## Database Schema
[Schema definition]

## Integration Points
[External dependencies]

## Deployment Strategy
[Deployment plan]

## ADRs (Architecture Decision Records)
- ADR-001: [Decision title]
```

### TDD Test Template
**Location:** `tests/sparc/TEMPLATE_TEST.ts`

```typescript
describe('[Feature Name]', () => {
  describe('User Story: [Story]', () => {
    it('should [expected behavior]', () => {
      // Arrange

      // Act

      // Assert
    });
  });
});
```

---

## Monitoring SPARC Progress

### View Active SPARC Tasks
```bash
npx archon-os sparc status
```

### View Phase Completion
```bash
npx archon-os sparc report
```

### Export SPARC Documentation
```bash
npx archon-os sparc export --format markdown --output docs/sparc/
```

---

## SPARC Metrics & Quality Gates

### Required Quality Gates

**Specification Phase:**
- [ ] All user stories defined
- [ ] Acceptance criteria clear
- [ ] API contracts specified
- [ ] Compliance requirements documented

**Architecture Phase:**
- [ ] Component diagram created
- [ ] Data flow documented
- [ ] Security reviewed
- [ ] Performance targets set

**Refinement Phase:**
- [ ] Test coverage ≥ 80%
- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan clean

**Completion Phase:**
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Runbook created
- [ ] Deployed to staging

---

## Getting Help

### SPARC Documentation
- Official Guide: https://github.com/ruvnet/archon-os/docs/sparc
- Examples: `examples/sparc/` directory
- Templates: `docs/sparc/templates/`

### Common Issues

**Issue:** SPARC command not found
**Solution:** Ensure archon-os@alpha is installed:
```bash
npm install -g archon-os@alpha
```

**Issue:** Phase fails to complete
**Solution:** Check logs and rerun with --verbose:
```bash
npx archon-os sparc run architect "feature" --verbose
```

**Issue:** Need to resume a phase
**Solution:** SPARC phases are resumable:
```bash
npx archon-os sparc resume <phase-id>
```

---

## Next Steps

1. **Review Priority Features** - Choose next feature to implement
2. **Run SPARC Pipeline** - Execute full workflow for selected feature
3. **Coordinate with Agents** - Use archon-os hooks for multi-agent coordination
4. **Monitor Progress** - Track completion via SPARC status commands
5. **Iterate** - Refine based on feedback and testing

---

## Example: Complete SPARC Workflow

### Feature: Twenty-Bridge Webhook Service Implementation

```bash
# Step 1: Initialize SPARC workflow
cd C:\Dev\Projects\Repos\Project-Nyra

# Step 2: Run full SPARC pipeline
npx archon-os sparc pipeline "Implement twenty-bridge webhook service with TwentyCRM integration, signature verification, and letta sync"

# Step 3: Monitor progress
npx archon-os sparc status

# Step 4: Review deliverables
# - docs/sparc/specifications/twenty-bridge-webhook.md
# - docs/sparc/architecture/twenty-bridge-webhook.md
# - services/twenty-bridge/ (implementation)
# - tests/services/twenty-bridge/ (test suite)

# Step 5: Deploy and validate
docker compose -f infra/docker-compose.dev-minimal.yml up -d twenty-bridge
npm run test:integration -- tests/services/twenty-bridge
```

---

**Remember:** SPARC is iterative. Don't hesitate to revisit earlier phases if requirements change or new insights emerge!

🚀 **Happy Building with SPARC!**
