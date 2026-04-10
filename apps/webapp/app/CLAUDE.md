# Mortgage Assistant - Archon OS Configuration

## 🚨 AUTOMATIC ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Use Archon workflows** via CLI or UI
2. **Coordinate via memory**

**Archon OS handles the heavy lifting of task execution!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0.0002 | Simple tasks, bug fixes |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Task
- Search memory for relevant patterns in Letta.

### After Task Success
- Record completion metrics in Archon.
- Store successful patterns in Letta.

---

## 🚀 Archon OS CLI Commands

```bash
archon workflow list
archon workflow run [name] "[task]"
archon status
```

---

## 🚀 Available Agents (60+ Types)

- `loan_officer_specialist`: Loan officer workflow expert
- `compliance_architect`: Mortgage compliance expert
- `document_specialist`: Document processing expert
- `ui_designer`: Dashboard UX designer
- `api_integrator`: Backend integration specialist
- `testing_specialist`: Component and E2E testing

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

## 🎯 Mortgage Assistant - Loan Officer Dashboard

## 🎯 APPLICATION CONTEXT

**Purpose**: Next.js 14 loan officer workspace providing document management, client communication, loan tracking, and task automation for mortgage professionals.

**Port**: 3006
**Language**: TypeScript + React + Next.js 14
**UI Components**: Custom React components + Tailwind CSS
**Data Layer**: React Query + REST APIs

## 🚨 CRITICAL DEVELOPMENT RULES

### Parallel Component Development Pattern
**MANDATORY**: All features and pages MUST be developed in parallel.

### Loan Officer Workflow First
**CRITICAL**: Design around actual loan officer workflows (Dashboard, Pipeline, Document Hub, Client Communication, Task Automation).

### Compliance & Security
**MANDATORY**: Every loan-related feature must include encryption, audit trails, role permissions, and compliance with retention policies.

## 🐝 ARCHON OS WORKFLOW

For complex UI development, use specialized Archon workflows for frontend engineering and compliance validation.

## 📈 PERFORMANCE TARGETS

- **Page Load**: < 2s for dashboard
- **Document Upload**: Support up to 10MB files
- **Real-Time Updates**: WebSocket for loan status changes
- **Offline Support**: Service worker for basic functionality

## 🧪 TESTING REQUIREMENTS

- **Unit Tests**: 85%+ coverage for business logic
- **Integration Tests**: API route handlers
- **E2E Tests**: Complete loan workflow (create → document → close)
- **Accessibility Tests**: WCAG 2.1 AA compliance

## 🔒 SECURITY & COMPLIANCE

- **Data Protection**: Encrypt all PII (SSN, income, assets)
- **Audit Requirements**: Log all document views, downloads, uploads; retain for 3+ years.

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: Archon OS patterns
- **apps/webapp/CLAUDE.md**: Web app ecosystem overview
- **services/quote-engine/**: Loan calculation backend
- **services/campaign-engine/**: Borrower communication

---

**Mortgage Assistant is the daily workspace for loan officers. Usability and reliability are paramount.**
