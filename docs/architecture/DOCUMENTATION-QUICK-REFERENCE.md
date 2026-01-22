# Documentation Structure - Quick Reference

**Version:** 1.0
**Date:** 2026-01-21
**Full Specification:** [FINAL-DOCUMENTATION-STRUCTURE.md](./FINAL-DOCUMENTATION-STRUCTURE.md)

---

## Document Purpose Map

Use this quick reference to know where content belongs.

### 🎯 What Goes Where?

| I need to document... | Primary Location | Format |
|----------------------|------------------|--------|
| **Business value, ROI, problem statement** | `docs/WHITEPAPER.md` | Business prose |
| **Architecture decisions and rationale** | `docs/architecture/decisions/ADR-XXX.md` | ADR template |
| **System design, patterns, infrastructure** | `docs/ARCHITECTURE.md` + subfolders | Technical docs |
| **Requirements and specifications** | `docs/sparc/phase-1-specification/` | SPARC format |
| **Implementation logic (pseudocode)** | `docs/sparc/phase-2-pseudocode/` | Pseudocode + explanations |
| **Component and API design** | `docs/sparc/phase-3-architecture/` | Technical specs |
| **Step-by-step implementation** | `docs/sparc/phase-4-refinement/` | Implementation guide |
| **Testing and verification** | `docs/sparc/phase-5-completion/` | Test plans + checklists |
| **REST API specifications** | `docs/api/rest-api/` | OpenAPI 3.0 |
| **MCP tool documentation** | `docs/api/mcp/` | MCP spec format |
| **Deployment instructions** | `docs/deployment/` | Step-by-step guides |
| **Environment variables** | `docs/references/environment-variables.md` | Reference table |
| **How-to guides** | `docs/guides/` | Tutorial format |
| **Architecture diagrams** | `docs/architecture/diagrams/` | Mermaid `.mmd` |

---

## Three Main Documents

### 1. WHITEPAPER.md (Business Document)
**Audience:** Executives, investors, non-technical stakeholders
**Purpose:** Explain the platform's value and capabilities
**Sections:** 8 (Executive Summary → Business Value → Appendices)
**Length:** 40-60 pages
**Built from:** `docs/whitepaper/*.md` component files

### 2. ARCHITECTURE.md (Technical Document)
**Audience:** Architects, senior developers, DevOps
**Purpose:** Complete technical architecture specification
**Sections:** 8 (Overview → Security → Cross-Cutting Concerns)
**Length:** 100+ pages (with subfolders)
**Supported by:** ADRs, patterns, infrastructure docs, diagrams

### 3. SPARC Documentation (Implementation Guide)
**Audience:** Developers, implementation teams, project managers
**Purpose:** Step-by-step implementation methodology
**Phases:** 5 (Specification → Pseudocode → Architecture → Refinement → Completion)
**Length:** 80-100 pages across all phases
**Location:** `docs/sparc/phase-N-*/`

---

## Content Flow Rules

### ✅ Single Source of Truth
- Each piece of information has **ONE** primary location
- All other references **link** to the primary source
- **Never** duplicate detailed content

### 📝 How to Reference
```markdown
## Brief Topic Summary (1-2 sentences)

For complete details, see:
- [Primary Document](path/to/primary.md)
- [Specific Section](path/to/doc.md#section-name)
```

### 🚫 Don't Duplicate
- Full technical specs in whitepaper (link to architecture instead)
- Detailed API specs in multiple places (link to `docs/api/`)
- Step-by-step instructions in architecture (link to deployment guides)
- Environment variable lists everywhere (link to reference doc)

---

## Directory Structure (Condensed)

```
docs/
├── WHITEPAPER.md ← Business document (generated from components)
├── ARCHITECTURE.md ← Technical master document
├── IMPLEMENTATION-GUIDE.md ← Deployment master document
│
├── whitepaper/ ← Whitepaper components (source of truth)
│   ├── 01-EXECUTIVE-SUMMARY.md
│   ├── 02-PROBLEM-STATEMENT.md
│   ├── 03-SOLUTION-OVERVIEW.md
│   ├── 04-PLATFORM-CAPABILITIES.md
│   ├── 05-ARCHITECTURE-OVERVIEW.md
│   ├── 06-IMPLEMENTATION-ROADMAP.md
│   ├── 07-BUSINESS-VALUE.md
│   └── 08-APPENDICES.md
│
├── architecture/ ← Technical architecture
│   ├── decisions/ ← ADRs (Architecture Decision Records)
│   ├── patterns/ ← Design patterns
│   ├── infrastructure/ ← Infrastructure specs
│   ├── integrations/ ← Integration architecture
│   ├── data/ ← Data architecture
│   └── diagrams/ ← Mermaid diagrams
│
├── sparc/ ← SPARC methodology (5 phases)
│   ├── 00-SPARC-OVERVIEW.md
│   ├── phase-1-specification/
│   ├── phase-2-pseudocode/
│   ├── phase-3-architecture/
│   ├── phase-4-refinement/
│   └── phase-5-completion/
│
├── api/ ← API specifications
│   ├── rest-api/ ← OpenAPI specs
│   ├── mcp/ ← MCP tools
│   └── webhooks/ ← Webhook contracts
│
├── deployment/ ← Deployment guides
│   ├── quick-start/
│   ├── services/
│   ├── configuration/
│   └── operations/
│
├── guides/ ← How-to guides
│   ├── developer/
│   ├── operator/
│   └── user/
│
├── references/ ← Reference documentation
│   ├── tech-stack.md
│   ├── port-allocation.md
│   ├── environment-variables.md
│   └── glossary.md
│
└── templates/ ← Documentation templates
    ├── adr-template.md
    ├── api-spec-template.md
    └── deployment-guide-template.md
```

---

## Quick Decision Guide

**"I'm writing about..."**

### Business Value / ROI
→ `docs/whitepaper/07-BUSINESS-VALUE.md`

### Architecture Decision
→ Create new ADR in `docs/architecture/decisions/ADR-XXX-decision-name.md`

### Technical Design Pattern
→ `docs/architecture/patterns/pattern-name.md`

### API Endpoint
→ `docs/api/rest-api/service-name-api.md` (use OpenAPI format)

### Deployment Steps
→ `docs/deployment/services/service-name.md`

### How to Perform Task
→ `docs/guides/[developer|operator|user]/task-name.md`

### Configuration Option
→ `docs/references/environment-variables.md` or `docs/deployment/configuration/`

### Troubleshooting Issue
→ `docs/deployment/operations/troubleshooting.md` or `docs/guides/`

### Diagram
→ `docs/architecture/diagrams/diagram-name.mmd` (Mermaid format)

---

## Implementation Roadmap

| Week | Phase | Focus |
|------|-------|-------|
| 1 | Foundation | Directory structure, templates, build scripts |
| 2 | Whitepaper | Business document (8 sections, 40-60 pages) |
| 3-4 | Architecture | ADRs, patterns, infrastructure, integrations |
| 5-6 | SPARC | 5-phase implementation methodology |
| 7 | Supporting | API docs, deployment guides, references |
| 8 | Polish | Review, validation, launch |

---

## Templates Available

| Template | Location | Use For |
|----------|----------|---------|
| ADR | `docs/templates/adr-template.md` | Architecture decisions |
| API Spec | `docs/templates/api-spec-template.md` | REST API documentation |
| Deployment | `docs/templates/deployment-guide-template.md` | Service deployment |
| Troubleshooting | `docs/templates/troubleshooting-template.md` | Problem resolution |

---

## Build Commands

```bash
# Build master whitepaper from components
./scripts/docs/build-whitepaper.sh

# Generate PNG diagrams from Mermaid
./scripts/docs/build-diagrams.sh

# Validate documentation
./scripts/docs/validate-docs.sh

# Generate table of contents
./scripts/docs/generate-toc.sh

# Check for duplicate content
./scripts/docs/check-duplication.sh
```

---

## Need Help?

1. **Read full specification:** [FINAL-DOCUMENTATION-STRUCTURE.md](./FINAL-DOCUMENTATION-STRUCTURE.md)
2. **Check templates:** `docs/templates/`
3. **View examples:** Existing ADRs in `docs/architecture/decisions/`
4. **Ask questions:** Create GitHub issue with `documentation` label

---

**For Complete Details:** See [FINAL-DOCUMENTATION-STRUCTURE.md](./FINAL-DOCUMENTATION-STRUCTURE.md)
