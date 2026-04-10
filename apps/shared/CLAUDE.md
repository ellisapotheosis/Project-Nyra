# Shared - Archon OS Configuration

## 🚨 AUTOMATIC ORCHESTRATION

**Archon OS coordinates, Claude Code Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0.0002 | Simple tasks |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex reasoning |

---

## 🧠 AUTO-LEARNING PROTOCOL

- Search memory for relevant patterns in Letta.
- Store successful patterns after completion.

---

## 🚀 Archon OS CLI Commands

```bash
archon workflow list
archon workflow run [name] "[task]"
archon status
```

Agents: `researcher`, `coder`, `reviewer`, `architect`

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

---

## 🎯 Shared - Common Assets and Resources

## 🎯 APPLICATION CONTEXT

**Purpose**: Centralized repository for shared assets, data files, and documentation used across multiple applications in the Project Nyra monorepo.

**Type**: Utility Directory
**Pattern**: DRY (Don't Repeat Yourself) principle
**Usage**: Referenced by apps/* applications

## 🚨 CRITICAL DEVELOPMENT RULES

### Single Source of Truth
**MANDATORY**: All shared resources must have ONE canonical location here.

### Parallel Update Pattern
**MANDATORY**: When updating shared resources, update all dependent files concurrently.

### Version Control
**CRITICAL**: Shared resources are versioned and breaking changes require a migration plan.

## 📊 SHARED ARCHITECTURE

### Directory Structure
```
apps/shared/
├── CLAUDE.md              # This file - development guidelines
├── assets/                # Images, icons, fonts, media
├── data/                  # Static data files and schemas
└── docs/                  # Shared documentation
```

## 🧠 ARCHON OS INTEGRATION

### Available Agents
- `asset_manager`: Shared asset organization and optimization
- `data_architect`: Shared data schema design and validation
- `documentation_specialist`: Maintain shared documentation

### Recommended Workflows

Use Archon workflows for adding assets or updating schemas to ensure all dependent applications are updated simultaneously.

## 🔧 USAGE EXAMPLES

### Import Shared Assets
```typescript
import { Logo, HeroImage } from '@nyra/shared/assets'
import { loanTypes, states, creditTiers } from '@nyra/shared/data'
```

## 🔒 SECURITY & COMPLIANCE

- **No Secrets**: Never commit API keys or credentials.
- **Data Privacy**: Shared data must not contain personal information (PII).

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: Archon OS orchestration patterns
- **apps/webapp/CLAUDE.md**: Web app documentation
- **docs/data-schema.md**: Data structure reference

---

**Shared resources reduce duplication, ensure consistency, and simplify maintenance across all Nyra applications.**
