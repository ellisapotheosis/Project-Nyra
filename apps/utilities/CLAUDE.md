# Utilities - Archon OS Configuration

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

---

## 🎯 Utilities - Development Tools and Helpers

## 🎯 APPLICATION CONTEXT

**Purpose**: Collection of development utilities, CLI tools, and helper scripts that enhance the Project Nyra development experience.

**Primary Tool**: shadcn-tweakcn (shadcn/ui component customization tool)
**Type**: Utility Directory
**Usage**: Development workflow enhancement

## 🚨 CRITICAL DEVELOPMENT RULES

### Tool Integration Pattern
**MANDATORY**: Utilities should integrate with Archon OS workflows.

## 📊 UTILITIES ARCHITECTURE

### Directory Structure
```
apps/utilities/
├── CLAUDE.md                      # This file - development guidelines
├── shadcn-tweakcn/                # shadcn/ui customization tool
└── (future utilities)
```

## 🧠 ARCHON OS INTEGRATION

### Available Agents
- `utility_developer`: Create and maintain development utilities
- `tool_integrator`: Integrate utilities with development workflow
- `documentation_specialist`: Document utility usage and examples

## 📚 RELATED DOCUMENTATION

- **Root CLAUDE.md**: Archon OS orchestration patterns
- **shadcn-tweakcn/README.md**: Component customization guide

---

**Utilities amplify developer productivity by automating repetitive tasks and enforcing best practices.**
