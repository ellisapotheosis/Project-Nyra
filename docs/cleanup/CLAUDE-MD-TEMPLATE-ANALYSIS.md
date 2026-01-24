# CLAUDE.md Template Best Practices Analysis

**Date**: 2026-01-22
**Analysis Focus**: V3 Template Structure, Documentation Customizations, Best Practices
**Generated for**: Project Nyra Documentation Consolidation

---

## Executive Summary

This analysis examines CLAUDE.md template best practices from Claude Flow V3 documentation and the Project Nyra codebase. Key findings include:

- **58 CLAUDE.md files** identified across Project Nyra (services, apps, infrastructure, documentation)
- **Root CLAUDE.md** serves as master template with complete V3 configuration
- **Documentation-specific CLAUDE.md** requires specialized sections (no CLI commands, focus on content structure)
- **V3 template structure** follows a mandatory 28-section order for consistency
- **Anti-drift topology** requires `hierarchical` or `hierarchical-mesh` for teams
- **File organization** prohibits root folder for working files; requires `/src`, `/tests`, `/docs` subdirectories

---

## V3 Template Structure (Recommended Section Order)

### Tier 1: Critical Configuration (Mandatory First)

1. **Project Title + Version**
   - Format: `# [Project Name] - Claude Flow V3 Configuration`
   - Example: `# Project Documentation - Claude Flow V3 Configuration`

2. **🚨 AUTOMATIC SWARM ORCHESTRATION**
   - When to auto-spawn agents
   - How CLI and Task tool coordinate
   - Critical: "CLI coordinates, Task tool agents do the actual work!"

3. **🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)**
   - Tier 1: Agent Booster (<1ms, $0)
   - Tier 2: Haiku (~500ms, $0.0002)
   - Tier 3: Sonnet/Opus (2-5s, $0.003-$0.015)
   - Pre-task hook for routing recommendations

4. **🛡️ ANTI-DRIFT CONFIG (PREFERRED)**
   - Topologies: hierarchical, hierarchical-mesh, mesh, ring, star, hybrid
   - Max agents: 6-8 (hierarchical), 10-15 (hierarchical-mesh)
   - Strategy: specialized (clear roles)
   - Consensus: raft (leader maintains state)

### Tier 2: Execution Patterns

5. **🔄 AUTO-START SWARM PROTOCOL (Background Execution)**
   - Spawn ALL agents in ONE message
   - Use `run_in_background: true` for Task tool
   - Example bash + Task pattern

6. **⏸️ CRITICAL: Spawn and Wait Pattern**
   - Tell user agents are working
   - Stop (no more tool calls)
   - Wait for results
   - Synthesize when complete

### Tier 3: Learning & Development

7. **🧠 AUTO-LEARNING PROTOCOL**
   - Before task: search memory for patterns
   - During task: execute with context
   - After success: store pattern, train neural
   - Continuous improvement triggers

8. **🚨 CRITICAL DEVELOPMENT RULES**
   - Project-specific critical requirements
   - Tool usage restrictions
   - File organization rules
   - Git conventions

9. **🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT**
   - ALL operations in ONE message
   - NO root folder saves
   - Organize in subdirectories (/src, /tests, /docs, /config, /scripts, /examples)
   - Use Claude Code's Task tool for concurrency

10. **⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**
    - TodoWrite: batch all in ONE call
    - Task tool: spawn ALL agents in ONE message
    - File operations: batch reads/writes/edits
    - Bash commands: batch terminal operations
    - Memory operations: batch store/retrieve

### Tier 4: Agent & Command Reference

11. **📋 Agent Routing (Anti-Drift)**
    - Code numbers (1, 3, 5, 7, 9, 11)
    - Agent recommendations by task type
    - Hierarchical vs mesh considerations

12. **🎯 Task Complexity Detection**
    - When to auto-invoke swarm (3+ files, new features, refactoring)
    - When to skip swarm (single file, simple bug fixes)

13. **Project Config (Anti-Drift Defaults)**
    - Topology, max agents, strategy
    - Memory backend, HNSW, neural settings
    - Consensus method, model routing

14. **🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)**
    - Core: init, agent, swarm, memory, mcp, task, session, config, status, workflow, hooks, hive-mind
    - Advanced: daemon, neural, security, performance, providers, plugins, deployment, embeddings, claims, migrate, doctor, completions

15. **🚀 Available Agents (60+ Types)**
    - Core: coder, reviewer, tester, planner, researcher
    - V3 Specialized: security-architect, auditor, memory-specialist, performance-engineer
    - Domain-specific agents for Project Nyra

16. **🪝 V3 Hooks System (27 Hooks + 12 Workers)**
    - Core hooks: pre-edit, post-edit, pre-command, post-command, pre-task, post-task
    - Session hooks: session-start, session-end, session-restore
    - Intelligence hooks: route, explain, pretrain, build-agents, metrics, transfer
    - Worker management: worker list, dispatch, status, detect
    - Coverage hooks: coverage-route, coverage-suggest, coverage-gaps

### Tier 5: Intelligence & Learning

17. **🔄 Migration (V2 to V3)**
    - If applicable to project

18. **🧠 Intelligence System (RuVector)**
    - SONA, MoE, HNSW, EWC++, Flash Attention
    - 4-step pipeline: Retrieve, Judge, Distill, Consolidate

19. **📦 Embeddings Package**
    - Features and integration

20. **🐝 Hive-Mind Consensus**
    - Topologies: hierarchical, mesh, hierarchical-mesh, ring, star, adaptive
    - Strategies: byzantine, raft, gossip, crdt, quorum

21. **📊 Performance Targets**
    - V3 specific metrics and benchmarks

22. **📊 Performance Optimization Protocol**
    - Automatic tracking, benchmarking, session persistence

23. **🧠 Neural Pattern Training**
    - Training commands and processes

### Tier 6: Configuration & Environment

24. **🔧 Environment Variables**
    - CLAUDE_FLOW_CONFIG
    - API keys (Anthropic, OpenAI, Google)
    - MCP server settings
    - Memory backend configuration

25. **🩺 Doctor Health Checks**
    - Node.js, npm, Git checks
    - Config validity, daemon status
    - API key verification

26. **🚀 Quick Setup**
    - MCP server setup
    - Daemon initialization
    - Doctor command

27. **🎯 Claude Code vs CLI Tools**
    - Clear separation of concerns
    - When to use Task tool vs CLI

28. **📝 Memory Commands Reference (IMPORTANT)**
    - Store, search, list, retrieve operations
    - Syntax and flags for memory CLI

### Optional Additional Sections (Project-Specific)

- **🎯 Project Context**: Specific to the project
- **🔧 Development Patterns**: Language/framework specific
- **🚀 Deployment & CI/CD**: Deployment strategies
- **🔒 Security & Compliance**: Security requirements
- **📚 Additional Resources**: Links to templates and guides

---

## Key Patterns from Analysis

### Pattern 1: Mandatory Section Order
Files that deviate from recommended order:
- Root CLAUDE.md follows recommended order precisely
- Services diverge based on specific needs (e.g., auth-service adds auth patterns)
- Documentation CLAUDE.md uses simplified version

### Pattern 2: Anti-Drift Architecture
All production CLAUDE.md files should specify:
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

For larger teams:
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized
```

### Pattern 3: File Organization Rules
Consistently enforced across all CLAUDE.md:
- ✅ `/src` - Source code
- ✅ `/tests` - Test files
- ✅ `/docs` - Documentation
- ✅ `/config` - Configuration
- ✅ `/scripts` - Utility scripts
- ✅ `/examples` - Example code
- ❌ Root folder - Never for working files

### Pattern 4: One Message = All Operations
Critical rule repeated in every CLAUDE.md:
- Batch TodoWrite calls (5-10+ items minimum)
- Spawn ALL Task tool agents in ONE message
- Batch file reads/writes/edits
- Batch Bash commands with `&&` chaining
- Batch memory operations

### Pattern 5: Swarm Execution Pattern
```javascript
// STEP 1: Initialize swarm coordination
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in ONE message
Task({ prompt: "...", run_in_background: true })
Task({ prompt: "...", run_in_background: true })
Task({ prompt: "...", run_in_background: true })

// STEP 3: Tell user and STOP
// "I've spawned 3 agents working in parallel. They'll report back when done."
// DO NOT check status or add more tool calls
```

---

## Documentation-Specific Customizations

### For `/docs/CLAUDE.md`

Documentation CLAUDE.md should be **simplified** compared to service CLAUDE.md:

#### What to REMOVE:
- ❌ Most CLI commands (docs don't run these)
- ❌ Agent routing codes (not applicable)
- ❌ Performance benchmarking
- ❌ Deployment configurations
- ❌ Security scanning

#### What to KEEP/MODIFY:
- ✅ Auto-learning protocol (for documentation patterns)
- ✅ File organization rules (where to save docs)
- ✅ Writing guidelines (documentation-specific)
- ✅ Document structure standards
- ✅ Markdown/diagram standards
- ✅ Version management
- ✅ Change documentation procedures

#### Documentation-Specific Sections:

```markdown
## 📋 Documentation Structure

### Mandatory Directories
- `/docs` - Main documentation
- `/docs/architecture` - Architecture Decision Records
- `/docs/api` - API documentation
- `/docs/guides` - User/developer guides
- `/docs/references` - Technical references
- `/docs/troubleshooting` - Troubleshooting guides

### File Naming
- README.md in every major directory
- ADR-XXX-description.md for decisions
- [topic]-guide.md for guides
- [topic]-reference.md for references

## 📝 Documentation Standards

### Markdown Style
- Headings: H1 (main), H2 (sections), H3 (subsections)
- Code blocks: Always specify language
- Tables for structured data
- Links for cross-references
- Images with alt text

### Content Guidelines
- Write for target audience (developers, users, operators)
- Keep current (mark outdated sections)
- Include examples and runnable code
- Add troubleshooting sections
- Use consistent terminology (maintain glossary)

## 🔄 Documentation Workflow

### Before Writing
```bash
npx @claude-flow/cli@latest memory search --query "similar documentation patterns"
```

### After Publishing
```bash
npx @claude-flow/cli@latest memory store --key "doc-pattern-api-reference" --value "Approach used for API docs" --namespace docs
```

## 🚀 Available Documentation Agents

- `researcher` - Research requirements, analyze patterns
- `api-docs` - Generate API documentation
- `reviewer` - Review documentation quality

## 🧠 Documentation Learning

### Store Documentation Patterns
```bash
npx @claude-flow/cli@latest memory store \
  --key "pattern-api-docs" \
  --value "Structure: Overview, Endpoints, Examples, Troubleshooting" \
  --namespace docs-patterns
```

### Find Similar Approaches
```bash
npx @claude-flow/cli@latest memory search \
  --query "API documentation structure" \
  --namespace docs-patterns
```
```

---

## File Organization Rules (Consistent Across All CLAUDE.md)

### Root-Level Restrictions
```
PROHIBITED in root:
❌ /working-files
❌ /temp.md
❌ /test-output.txt
❌ /implementation files
❌ /test files

REQUIRED subdirectory organization:
✅ /src/... (source code)
✅ /tests/... (test files)
✅ /docs/... (documentation)
✅ /config/... (configuration)
✅ /scripts/... (utility scripts)
✅ /examples/... (examples)
```

### Documentation Root Exception
For `/docs` itself:
```
/docs/
  ├── README.md (main index)
  ├── /architecture (ADRs)
  ├── /api (API docs)
  ├── /guides (user guides)
  ├── /references (technical references)
  ├── /troubleshooting (troubleshooting)
  └── /development (development guides)
```

---

## Memory Namespaces (Best Practices)

Consistent across all CLAUDE.md files:

| Namespace | Purpose | Examples |
|-----------|---------|----------|
| `patterns` | Code patterns, approaches | `pattern-auth`, `pattern-api-design` |
| `solutions` | Bug fixes, troubleshooting | `solution-null-check`, `solution-cache-miss` |
| `tasks` | Task completion history | `task-feature-oauth`, `task-refactor-db` |
| `docs-patterns` | Documentation approaches | `pattern-api-docs`, `pattern-guide-structure` |
| `compliance` | Compliance rules | `rule-tila`, `rule-state-regulations` |
| `mortgage-patterns` | Mortgage-specific | `pattern-dti-calculation`, `pattern-lender-query` |

---

## Memory Commands (Consistent Across All CLAUDE.md)

All CLAUDE.md files include identical memory command reference:

```bash
# REQUIRED: --key and --value
npx @claude-flow/cli@latest memory store --key "pattern-auth" --value "JWT with refresh tokens" --namespace patterns

# REQUIRED: --query (full flag, not -q)
npx @claude-flow/cli@latest memory search --query "authentication patterns" --namespace patterns

# OPTIONAL: --namespace, --limit
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10

# REQUIRED: --key
npx @claude-flow/cli@latest memory retrieve --key "pattern-auth" --namespace patterns

# Initialize if needed
npx @claude-flow/cli@latest memory init --force --verbose
```

---

## Best Practices Checklist for CLAUDE.md Creation

### Mandatory Sections
- [ ] Project title + version
- [ ] Automatic swarm orchestration
- [ ] 3-tier model routing (ADR-026)
- [ ] Anti-drift configuration
- [ ] Auto-learning protocol
- [ ] Agent routing codes
- [ ] CLI commands reference
- [ ] Hooks system reference
- [ ] Memory commands reference
- [ ] File organization rules
- [ ] Critical execution rules (1 message = all operations)

### Recommended Sections
- [ ] Project context
- [ ] Development patterns
- [ ] Performance targets
- [ ] Environment variables
- [ ] Quick setup
- [ ] Claude Code vs CLI tools

### Documentation-Specific
- [ ] Document structure standards
- [ ] Markdown guidelines
- [ ] Diagram standards
- [ ] Content writing guidelines
- [ ] Documentation workflow
- [ ] Documentation agents (researcher, api-docs)
- [ ] Documentation memory patterns

### Validation
- [ ] Follows recommended 28-section order (or justified deviation)
- [ ] Includes anti-drift configuration (hierarchical or hierarchical-mesh)
- [ ] Specifies file organization rules
- [ ] Memory namespaces documented
- [ ] One message = all operations rule emphasized
- [ ] No console/logging when inappropriate
- [ ] All CLI commands have bash code blocks with language spec

---

## Common Deviations & Justifications

### Service-Specific CLAUDE.md
Services like `auth-service`, `quote-api` add:
- Authentication-specific patterns
- Service-specific agents
- Custom memory namespaces
- Domain-specific workflows

### Documentation CLAUDE.md
Simplified version that focuses on:
- Document structure
- Writing standards
- Content organization
- Documentation workflow (instead of code workflow)

### Infrastructure CLAUDE.md
Focuses on:
- Infrastructure automation
- Deployment patterns
- Infrastructure-specific agents
- Security and compliance

---

## Migration Guide (V2 to V3)

For projects migrating CLAUDE.md from V2 to V3:

1. **Keep existing sections:**
   - Project Context
   - Development Patterns
   - Security & Compliance
   - Language-specific guidelines

2. **Add new V3 sections (in order):**
   - Automatic Swarm Orchestration (at top)
   - Intelligent Model Routing
   - Anti-Drift Config
   - Auto-Learning Protocol
   - V3 CLI Commands
   - Hooks System
   - Memory Commands Reference

3. **Update existing patterns:**
   - Add hooks to agent coordination
   - Add model routing to task spawning
   - Add auto-learning to workflows
   - Replace old memory patterns with CLI commands

4. **Validate:**
   - Run `npx @claude-flow/cli@latest doctor --fix`
   - Test swarm init: `npx @claude-flow/cli@latest swarm init --topology hierarchical`
   - Test memory: `npx @claude-flow/cli@latest memory init --force`

---

## Key Metrics from Repository Analysis

### CLAUDE.md Files Identified: 58
Distribution:
- Services: 22 files
- Applications: 8 files
- Infrastructure: 8 files
- Configs: 1 file
- Scripts: 1 file
- Tools: 4 files
- Documentation: 2 files
- References: 1 file
- Skills/Templates: 1 file

### Root CLAUDE.md Stats
- Total sections: 28
- Lines of code: ~3,800
- Command examples: 100+
- Agent types documented: 61+
- CLI commands: 26 (140+ subcommands)
- Hooks: 27 + 12 workers
- Networking topologies: 6
- Consensus strategies: 5

### Template Guide Stats (CLAUDE-MD-V3-TEMPLATE-GUIDE.md)
- Template examples: 9
- Section templates: 9
- Complete example: Full-stack web app
- Checklist items: 17
- Resources linked: 4

---

## Recommended Tools for CLAUDE.md Management

### Validation
```bash
# Check syntax
npx @claude-flow/cli@latest config validate

# Health check
npx @claude-flow/cli@latest doctor --fix
```

### Auto-Generation
For batch CLAUDE.md creation:
```bash
node scripts/batch-claude-md/batch-template-engine.js
```

### Updates
Keep templates current:
```bash
npx @claude-flow/cli@latest init --update-capabilities
```

---

## Quick Reference: Documentation CLAUDE.md Template

```markdown
# [Project] Documentation - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION
[Include standard section]

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING
[Include standard section]

## 🛡️ ANTI-DRIFT CONFIG
[Simplified: hierarchical-mesh recommended for docs coordination]

## 📋 Documentation Structure
[Documentation-specific: directories, naming, standards]

## 📝 Documentation Standards
[Documentation-specific: markdown, writing guidelines, examples]

## 🔄 Documentation Workflow
[Documentation-specific: before/after patterns]

## 🚀 Available Documentation Agents
- researcher (research requirements)
- api-docs (API documentation)
- reviewer (documentation quality)

## 🧠 AUTO-LEARNING PROTOCOL
[Modified for documentation: store doc patterns, search similar approaches]

## 📝 Memory Commands Reference
[Include standard section]

## 📋 File Organization Rules
[Standard section]

## 🚨 CRITICAL: CONCURRENT EXECUTION
[Include standard section]

## Resources
- [Root CLAUDE.md](../../CLAUDE.md)
- [V3 Template Guide](../development/CLAUDE-MD-V3-TEMPLATE-GUIDE.md)
- [Capabilities](../.claude-flow/CAPABILITIES.md)
```

---

## Conclusion

The Claude Flow V3 CLAUDE.md template is a comprehensive, highly structured configuration system that:

1. **Enforces consistency** through a recommended 28-section order
2. **Prevents drift** via hierarchical/specialized agent topologies
3. **Optimizes execution** through the "1 message = all operations" rule
4. **Enables learning** via memory namespaces and post-task hooks
5. **Routes intelligently** using 3-tier model routing (ADR-026)
6. **Scales from services to teams** through flexible topologies and strategies

For documentation specifically, the template should be simplified to focus on content structure, writing standards, and documentation workflows rather than code execution and performance metrics.

---

**Generated**: 2026-01-22
**Analysis Scope**: 58 CLAUDE.md files, 3 master templates
**Verified Against**: Root CLAUDE.md, V3 Template Guide, Capabilities Reference
**Status**: Complete and Ready for Documentation Consolidation
