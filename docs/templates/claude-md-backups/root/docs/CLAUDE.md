# Project Nyra Documentation - Claude Flow V3 Configuration

**Profile**: documentation
**Generated**: 2026-01-22
**Version**: 3.0.0

---

## 🚨 CRITICAL: Docs Root Folder Rules

**ONLY the following file types belong in `C:\Dev\Projects\Repos\Project-Nyra\docs/` root:**

✅ **Allowed in Root**:
- **Completion reports** (e.g., `OPTION-*-COMPLETION-REPORT.md`, `*-COMPLETE.md`)
- **Step-by-step guides for manual execution** (e.g., `YOUR-MANUAL-SETUP-GUIDE.md`)
- **To-do lists and checklists** (e.g., `TODO.md`, `CHECKLIST.md`)
- **Main index** (`README.md`)
- **This CLAUDE.md file**

❌ **Must Go in Subdirectories**:
- Architecture docs → `docs/architecture/`
- API references → `docs/api/`
- Deployment guides → `docs/deployment/`
- Configuration docs → `docs/configuration/`
- Setup guides → `docs/manual-tasks/setup/`
- Development guides → `docs/development/`
- AI automation docs → `docs/ai-automatable/`
- Cleanup reports → `docs/cleanup/`
- Bootstrap documentation → `docs/bootstrap/`
- Workflow documentation → `docs/workflows/`
- SPARC methodology → `docs/sparc/`
- Security documentation → `docs/security/`
- Operations guides → `docs/operations/`
- All other documentation → appropriate subdirectory

**When creating new files, Claude Code MUST**:
1. Check file type and purpose
2. Place in appropriate subdirectory
3. **NEVER** save general docs to root
4. Follow the target directory structure

### 📁 Target Directory Structure

```
docs/
├── README.md                   # Main index
├── CLAUDE.md                   # This file
│
├── ai-automatable/            # AI-executable tasks
│   ├── prompts/              # AI agent prompts
│   ├── bootstrap/            # Auto-bootstrap scripts
│   └── workflows/            # Automated workflows
│
├── manual-tasks/              # Human-executed tasks
│   ├── setup/               # Setup and installation
│   ├── user-setup/          # User-specific configs
│   ├── troubleshooting/     # Problem resolution
│   └── runbooks/            # Operational procedures
│
├── architecture/              # Architecture documentation
│   ├── adr/                 # Architecture Decision Records
│   ├── diagrams/            # Architecture diagrams
│   └── *.md                 # Architecture docs
│
├── deployment/                # Deployment guides
│   ├── services/            # Per-service deployment
│   └── *.md                 # Deployment procedures
│
├── development/               # Development docs
│   └── *.md                 # Development patterns
│
├── api/                       # API documentation
│   ├── examples/            # API examples
│   └── schemas/             # OpenAPI/JSON schemas
│
├── configuration/             # Configuration references
│   ├── claude/              # Claude-specific configs
│   └── examples/            # Example configurations
│
├── security/                  # Security documentation
│   └── *.md                 # Security guides
│
├── operations/                # Operations guides
│   └── *.md                 # Day-to-day operations
│
├── workflows/                 # Workflow documentation
│   └── *.md                 # Workflow patterns
│
├── sparc/                     # SPARC methodology
│   ├── specifications/      # Phase 1
│   ├── pseudocode/          # Phase 2
│   ├── architecture/        # Phase 3
│   ├── refinement/          # Phase 4
│   └── completion/          # Phase 5
│
├── bootstrap/                 # Bootstrap documentation
│   └── *.md                 # Bootstrap guides
│
├── cleanup/                   # Consolidation reports
│   ├── reports/             # Consolidation reports
│   ├── logs/                # Operation logs
│   └── risk-assessments/    # Risk analysis docs
│
└── references/                # External references
    ├── archon-os-wiki/    # Claude Flow wiki
    └── archon-os-examples/ # Example projects
```

---

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on documentation tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user says "spawn swarm" or requests complex doc work, Claude Code MUST in ONE message:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

**CLI coordinates, Task tool agents do the actual work!**

### 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple edits (fix-typo, add-section, format-table) |
| **2** | Haiku | ~500ms | $0.0002 | Simple docs, formatting, low complexity |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Complex docs, architecture, technical writing |

**Before spawning agents, get routing recommendation:**
```bash
npx @archon-os/cli@latest hooks pre-task --description "[documentation task description]"
```

**When you see these recommendations:**

1. `[AGENT_BOOSTER_AVAILABLE]` → Skip LLM entirely, use Edit tool directly
   - Intent types: `fix-typo`, `add-section`, `format-table`, `add-link`, `update-heading`

2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool:
```javascript
Task({
  prompt: "...",
  subagent_type: "researcher",
  model: "haiku"  // ← USE THE RECOMMENDED MODEL (haiku/sonnet/opus)
})
```

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks

---

### 🛡️ Anti-Drift Config (PREFERRED)

**Use this for documentation swarms:**
```bash
# Small doc teams (4-6 agents) - use hierarchical for tight control
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Large doc teams (8-10 agents) - use hierarchical-mesh for coordination
npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 10 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Coordinator controls writers directly (anti-drift for small teams)
- `hierarchical-mesh` - Coordinator + peer review (recommended for 8+ agents)
- `mesh` - Fully connected peer network

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator ensures consistency
- **max-agents 4-6**: Smaller team = consistent style
- **specialized**: Clear roles (researcher, writer, reviewer)
- **consensus**: raft (coordinator maintains style guide)

---

### 🔄 Auto-Start Swarm Protocol (Background Execution)

When the user requests complex documentation work, **spawn agents in background and WAIT for completion:**

```javascript
// STEP 1: Initialize swarm coordination (anti-drift config)
Bash("npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in a SINGLE message
// Use run_in_background: true so agents work concurrently
Task({
  prompt: "Research documentation requirements, analyze existing docs, store findings in memory",
  subagent_type: "researcher",
  description: "Documentation research phase",
  run_in_background: true  // ← CRITICAL: Run in background
})
Task({
  prompt: "Write documentation following style guide and standards. Organize into proper subdirectories.",
  subagent_type: "api-docs",
  description: "Documentation writing phase",
  run_in_background: true
})
Task({
  prompt: "Review documentation quality, check links, verify examples, ensure consistency.",
  subagent_type: "reviewer",
  description: "Documentation review phase",
  run_in_background: true
})

// STEP 3: WAIT - Tell user agents are working, then STOP
// Say: "I've spawned 3 agents to work on this documentation in parallel. They'll report back when done."
// DO NOT check status repeatedly. Just wait for user or agent responses.
```

### ⏸️ CRITICAL: Spawn and Wait Pattern

**After spawning background agents:**

1. **TELL USER** - "I've spawned X agents working in parallel on: [list tasks]"
2. **STOP** - Do not continue with more tool calls
3. **WAIT** - Let the background agents complete their work
4. **RESPOND** - When agents return results, review and synthesize

**Example response after spawning:**
```
I've launched 3 concurrent agents to work on this documentation:
- 🔍 Researcher: Analyzing requirements and existing docs
- ✍️ Writer: Creating documentation following style guide
- 👀 Reviewer: Checking quality and consistency

They're working in parallel. I'll synthesize their results when they complete.
```

### 🚫 DO NOT:
- Continuously check swarm status
- Poll TaskOutput repeatedly
- Add more tool calls after spawning
- Ask "should I check on the agents?"

### ✅ DO:
- Spawn all agents in ONE message
- Tell user what's happening
- Wait for agent results to arrive
- Synthesize results when they return

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Documentation Task
```bash
# 1. Search memory for relevant documentation patterns from past work
Bash("npx @archon-os/cli@latest memory search --query '[documentation topic]' --namespace docs-patterns")

# 2. Check if similar documentation was done before
Bash("npx @archon-os/cli@latest memory search --query '[doc type]' --namespace docs")

# 3. Load learned documentation optimizations
Bash("npx @archon-os/cli@latest hooks route --task '[documentation task description]'")
```

### After Completing Any Documentation Successfully
```bash
# 1. Store successful pattern for future reference
Bash("npx @archon-os/cli@latest memory store --namespace docs-patterns --key '[pattern-name]' --value '[what worked]'")

# 2. Train neural patterns on the successful approach
Bash("npx @archon-os/cli@latest hooks post-edit --file '[main-doc-file]' --train-neural true")

# 3. Record task completion with metrics
Bash("npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true")
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After major doc restructure | `map` | Update codebase documentation map |
| After adding documentation | `document` | Auto-generate additional docs |
| After architecture changes | `document` | Update architecture docs |
| Every 5+ doc changes | `map` | Update documentation index |
| Complex technical writing | `deepdive` | Deep documentation analysis |

### Memory-Enhanced Documentation

**ALWAYS check memory before:**
- Starting a new documentation section (search for similar docs)
- Writing technical content (search for patterns)
- Creating architecture diagrams (search for diagram conventions)
- Updating guides (search for guide structure patterns)

**ALWAYS store in memory after:**
- Completing a comprehensive guide (store the structure)
- Creating a new documentation pattern (store the approach)
- Solving a documentation organization issue (store the solution)
- Discovering a better way to document (store the technique)

---

## 📋 Documentation Structure Standards

### Mandatory Directories

All documentation MUST be organized in these subdirectories:

- `/docs/ai-automatable` - Tasks Claude/AI can execute autonomously
- `/docs/manual-tasks` - Step-by-step guides requiring human action
- `/docs/architecture` - Architecture Decision Records and system design
- `/docs/api` - API documentation with examples and schemas
- `/docs/deployment` - Deployment guides and procedures
- `/docs/configuration` - Configuration references and examples
- `/docs/development` - Development patterns and workflows
- `/docs/security` - Security documentation and best practices
- `/docs/operations` - Day-to-day operations and runbooks
- `/docs/workflows` - Workflow documentation and patterns
- `/docs/sparc` - SPARC methodology documentation
- `/docs/bootstrap` - Bootstrap documentation and guides
- `/docs/cleanup` - Consolidation reports and logs
- `/docs/references` - External examples and templates

### File Naming Conventions

- **README.md** - One per major directory (main index)
- **ADR-XXX-description.md** - Architecture Decision Records
- **[topic]-guide.md** - User guides (e.g., setup-guide.md)
- **[topic]-reference.md** - Technical references
- **[SERVICE]-CLAUDE.md** - Per-service/component Claude configs
- **UPPERCASE-WITH-DASHES.md** - Important standalone docs

### Document Structure Template

```markdown
# Document Title

**Purpose**: One-line description
**Audience**: Who this is for
**Last Updated**: YYYY-MM-DD

## Overview
Brief introduction

## Prerequisites
What you need before starting

## Main Content
Detailed information with:
- Clear headings (H2, H3)
- Code blocks with language specification
- Tables for structured data
- Examples that can be copy-pasted
- Troubleshooting sections

## Related Documentation
- Link to related docs
- Cross-references

## Changelog
- YYYY-MM-DD: What changed
```

---

## 📝 Documentation Writing Standards

### Markdown Style Guidelines

**Headings:**
- H1 (`#`) - Document title (one per file)
- H2 (`##`) - Major sections
- H3 (`###`) - Subsections
- H4 (`####`) - Sub-subsections (use sparingly)

**Code Blocks:**
```bash
# Always specify language
npx @archon-os/cli@latest hooks pre-task --description "task"
```

```javascript
// JavaScript example
const example = "Always use syntax highlighting";
```

**Tables:**
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |

**Lists:**
- Use `-` for unordered lists
- Be consistent with list style
- Keep list items concise

**Links:**
- Use descriptive link text: [Claude Flow Documentation](https://github.com/ruvnet/archon-os)
- Prefer relative links for internal docs: `[Setup Guide](./manual-tasks/setup/setup-guide.md)`

**Images:**
```markdown
![Alt text describing the image](./images/diagram.png)
```

### Content Writing Guidelines

**Write for Your Audience:**
- **Developers**: Technical details, code examples, architecture
- **Users**: Step-by-step instructions, troubleshooting, FAQs
- **Operators**: Runbooks, monitoring, incident response

**Keep Documentation Current:**
- Mark outdated sections with: `⚠️ **Outdated**: [Reason]`
- Update `Last Updated` date when making changes
- Archive superseded docs to `docs/_archive/`

**Include Runnable Examples:**
```bash
# Good: Complete, runnable command
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6

# Bad: Incomplete or placeholder
npx @archon-os/cli@latest swarm init [options]
```

**Add Troubleshooting:**
Every guide should include:
```markdown
## Troubleshooting

### Error: "Cannot connect to server"
**Cause**: Server is not running
**Solution**: Start the server with `npm start`

### Error: "Permission denied"
**Cause**: Insufficient permissions
**Solution**: Run with `sudo` or check file permissions
```

**Use Consistent Terminology:**
- Maintain a glossary for domain-specific terms
- Use the same term throughout (e.g., "borrower" not "customer"/"user")
- Define acronyms on first use: Model Context Protocol (MCP)

---

## 🎯 Available Documentation Agents

### Core Documentation Agents
- `researcher` - Research requirements, analyze patterns, gather information
- `api-docs` - Generate API documentation with examples
- `reviewer` - Review documentation quality, check links, verify consistency

### Specialized Agents
- `system-architect` - Create architecture diagrams and technical designs
- `planner` - Plan documentation structure and organization

### When to Use Each Agent

| Task | Primary Agent | Support Agents |
|------|--------------|----------------|
| New guide creation | api-docs | researcher, reviewer |
| Architecture documentation | system-architect | researcher, reviewer |
| API reference | api-docs | reviewer |
| Troubleshooting guide | researcher | api-docs, reviewer |
| Documentation audit | reviewer | researcher |
| Content reorganization | planner | researcher, reviewer |

---

## 🔄 Documentation Workflow

### Before Writing Documentation

1. **Search for existing patterns:**
```bash
npx @archon-os/cli@latest memory search --query "similar documentation topic" --namespace docs-patterns
```

2. **Check for related docs:**
```bash
npx @archon-os/cli@latest memory search --query "related guides" --namespace docs
```

3. **Get routing recommendation:**
```bash
npx @archon-os/cli@latest hooks pre-task --description "Write [type] documentation for [topic]"
```

### During Documentation Writing

1. **Follow directory structure** - Place files in appropriate subdirectories
2. **Use templates** - Follow document structure template above
3. **Include examples** - All code/commands must be runnable
4. **Add cross-links** - Link to related documentation
5. **Use proper formatting** - Follow markdown style guidelines

### After Publishing Documentation

1. **Store the pattern:**
```bash
npx @archon-os/cli@latest memory store \
  --key "doc-pattern-[type]-[topic]" \
  --value "Approach used: [description]" \
  --namespace docs-patterns
```

2. **Train neural patterns:**
```bash
npx @archon-os/cli@latest hooks post-edit \
  --file "docs/[subdirectory]/[filename].md" \
  --train-neural true
```

3. **Record completion:**
```bash
npx @archon-os/cli@latest hooks post-task \
  --task-id "doc-[topic]" \
  --success true \
  --store-results true
```

---

## 🧠 Documentation Learning & Memory

### Memory Namespaces for Documentation

| Namespace | Purpose | Examples |
|-----------|---------|----------|
| `docs-patterns` | Documentation structures and approaches | `pattern-api-reference`, `pattern-guide-structure` |
| `docs` | Completed documentation tasks | `task-setup-guide`, `task-api-docs` |
| `patterns` | General patterns applicable to docs | `pattern-error-handling`, `pattern-troubleshooting` |

### Store Documentation Patterns

```bash
# Store successful documentation structure
npx @archon-os/cli@latest memory store \
  --key "pattern-api-docs-structure" \
  --value "Structure: Overview → Authentication → Endpoints → Examples → Troubleshooting → Related Docs" \
  --namespace docs-patterns

# Store writing approach
npx @archon-os/cli@latest memory store \
  --key "pattern-technical-writing" \
  --value "Approach: Define problem → Show solution → Explain why → Provide example → Link to related" \
  --namespace docs-patterns

# Store diagram conventions
npx @archon-os/cli@latest memory store \
  --key "pattern-architecture-diagrams" \
  --value "Convention: Mermaid for simple flows, PlantUML for complex architectures, always include legend" \
  --namespace docs-patterns
```

### Find Similar Documentation Approaches

```bash
# Search for API documentation patterns
npx @archon-os/cli@latest memory search \
  --query "API documentation structure" \
  --namespace docs-patterns \
  --limit 5

# Search for guide writing patterns
npx @archon-os/cli@latest memory search \
  --query "setup guide approach" \
  --namespace docs-patterns

# Search for troubleshooting patterns
npx @archon-os/cli@latest memory search \
  --query "troubleshooting section structure" \
  --namespace docs-patterns
```

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files to the root docs folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### File Organization for Documentation

**Correct file placement examples:**
```bash
# ✅ CORRECT - Organized in subdirectories
docs/manual-tasks/setup/windows-setup-guide.md
docs/architecture/distributed-memory.md
docs/api/rest-api-reference.md
docs/deployment/services/nexus-router-deployment.md

# ❌ INCORRECT - Root folder
docs/windows-setup-guide.md
docs/distributed-memory.md
docs/rest-api-reference.md
docs/nexus-router-deployment.md
```

---

## 📝 Memory Commands Reference (IMPORTANT)

### Store Documentation Data
```bash
# REQUIRED: --key and --value
# OPTIONAL: --namespace (default: "default"), --ttl, --tags
npx @archon-os/cli@latest memory store \
  --key "doc-pattern-api-reference" \
  --value "Structure: Overview, Authentication, Endpoints, Examples, Troubleshooting" \
  --namespace docs-patterns

npx @archon-os/cli@latest memory store \
  --key "doc-completed-setup-guide" \
  --value "Completed comprehensive setup guide with Windows/Linux sections" \
  --namespace docs \
  --tags "guide,setup,complete"
```

### Search Documentation Patterns
```bash
# REQUIRED: --query (full flag, not -q)
# OPTIONAL: --namespace, --limit, --threshold
npx @archon-os/cli@latest memory search \
  --query "API documentation structure" \
  --namespace docs-patterns

npx @archon-os/cli@latest memory search \
  --query "troubleshooting guide patterns" \
  --namespace docs-patterns \
  --limit 5
```

### List Documentation Entries
```bash
# OPTIONAL: --namespace, --limit
npx @archon-os/cli@latest memory list --namespace docs-patterns --limit 10
npx @archon-os/cli@latest memory list --namespace docs --limit 20
```

### Retrieve Specific Documentation Pattern
```bash
# REQUIRED: --key
# OPTIONAL: --namespace (default: "default")
npx @archon-os/cli@latest memory retrieve \
  --key "doc-pattern-api-reference" \
  --namespace docs-patterns
```

### Initialize Memory Database
```bash
npx @archon-os/cli@latest memory init --force --verbose
```

---

## 🪝 V3 Hooks for Documentation

### Essential Documentation Hooks

```bash
# Before starting documentation work
npx @archon-os/cli@latest hooks pre-task \
  --description "Write API documentation for Quote Engine" \
  --coordinate-swarm true

# After completing documentation
npx @archon-os/cli@latest hooks post-task \
  --task-id "doc-quote-engine-api" \
  --success true \
  --store-results true

# After editing documentation files
npx @archon-os/cli@latest hooks post-edit \
  --file "docs/api/quote-engine-api.md" \
  --success true \
  --train-neural true

# Session management for documentation work
npx @archon-os/cli@latest hooks session-start --session-id "docs-consolidation"
npx @archon-os/cli@latest hooks session-end --export-metrics true

# Route documentation task to optimal agent
npx @archon-os/cli@latest hooks route \
  --task "Create architecture documentation for distributed memory system"
```

---

## 🎯 Project Context

**Project**: AI-powered mortgage automation platform (Project Nyra)
**Documentation Focus**: Technical documentation for developers, operators, and AI agents
**Compliance**: All documentation must consider mortgage industry compliance requirements

### Documentation Priorities

1. **Accuracy** - All technical content must be correct and up-to-date
2. **Completeness** - Cover prerequisites, steps, examples, troubleshooting
3. **Organization** - Follow target directory structure strictly
4. **Consistency** - Use consistent terminology and formatting
5. **Accessibility** - Write for target audience (developers, operators, users)

### Special Considerations

**Mortgage Domain:**
- Document compliance requirements in all relevant guides
- Include regulatory considerations (TILA, RESPA, TRID)
- Reference state-specific regulations when applicable

**Multi-Language Stack:**
- Document language-specific patterns (Python/FastAPI, TypeScript/Next.js, NestJS)
- Include setup instructions for each stack
- Provide examples in relevant languages

**Distributed Architecture:**
- Document multi-node deployments
- Include network diagrams for distributed systems
- Cover GPU worker cluster documentation

---

## 🔧 Environment Variables

```bash
# Configuration
CLAUDE_FLOW_CONFIG=./archon-os.config.json
CLAUDE_FLOW_LOG_LEVEL=info

# Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# MCP Server
CLAUDE_FLOW_MCP_PORT=3000
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_TRANSPORT=stdio

# Memory
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

---

## 📚 Resources & Links

### Project Nyra Documentation
- **Root CLAUDE.md**: `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`
- **Whitepaper**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- **SPARC Workflows**: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`

### Claude Flow V3
- **Documentation**: https://github.com/ruvnet/archon-os
- **Issues**: https://github.com/ruvnet/archon-os/issues
- **Capabilities**: `.archon-os/CAPABILITIES.md`
- **Template Guide**: `docs/references/archon-os-wiki/CLAUDE-MD-V3-TEMPLATE-GUIDE.md`

### Related Documentation
- **Cleanup Reports**: `docs/cleanup/`
- **Template Analysis**: `docs/cleanup/CLAUDE-MD-TEMPLATE-ANALYSIS.md`
- **Reorganization Plan**: `docs/cleanup/DOCS-REORGANIZATION-PLAN.md`

---

## 🎯 Quick Commands for Documentation Work

```bash
# System health check
npx @archon-os/cli@latest doctor --fix

# Initialize memory systems
npx @archon-os/cli@latest memory init --force --verbose

# Start daemon with background workers
npx @archon-os/cli@latest daemon start

# Initialize documentation swarm
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Search for documentation patterns
npx @archon-os/cli@latest memory search --query "documentation patterns" --namespace docs-patterns

# View system status
npx @archon-os/cli@latest status --watch

# Map documentation structure
npx @archon-os/cli@latest hooks worker dispatch --trigger map
```

---

## 🚨 SWARM EXECUTION RULES (CRITICAL)

1. **SPAWN IN BACKGROUND**: Use `run_in_background: true` for all agent Task calls
2. **SPAWN ALL AT ONCE**: Put ALL agent Task calls in ONE message for parallel execution
3. **TELL USER**: After spawning, list what each agent is doing
4. **STOP AND WAIT**: After spawning, STOP - do NOT add more tool calls or check status
5. **NO POLLING**: Never poll TaskOutput or check swarm status - trust agents to return
6. **SYNTHESIZE**: When agent results arrive, review ALL results before proceeding
7. **NO CONFIRMATION**: Don't ask "should I check?" - just wait for results

**Example spawn message:**
```
I've launched 3 agents in background:
- 🔍 Researcher: Analyzing existing documentation patterns
- ✍️ Writer: Creating comprehensive API documentation
- 👀 Reviewer: Checking quality, links, and consistency
Working in parallel - I'll synthesize when they complete.
```

---

**Remember: Claude Flow CLI coordinates, Claude Code Task tool creates!**

---

# IMPORTANT INSTRUCTION REMINDERS

## Core Principles for Documentation Work
1. **Do what has been asked; nothing more, nothing less.**
2. **NEVER create files in the root docs folder unless explicitly allowed.**
3. **ALWAYS place documentation in appropriate subdirectories.**
4. **NEVER proactively create documentation files (*.md) unless explicitly requested.**
5. **Follow the target directory structure strictly.**

## Documentation-Specific Rules
6. **Check file type before creating** - Determine proper subdirectory
7. **Use consistent naming conventions** - Follow patterns above
8. **Include all required sections** - Overview, prerequisites, examples, troubleshooting
9. **Add cross-references** - Link to related documentation
10. **Update memory after completion** - Store patterns for future use

---

**Generated**: 2026-01-22
**Version**: 3.0.0
**Status**: Documentation Configuration Active
