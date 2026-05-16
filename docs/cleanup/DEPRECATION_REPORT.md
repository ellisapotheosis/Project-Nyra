# DEPRECATION_REPORT.md

## 🚨 Overview
This report identifies legacy components and architectural patterns that have been officially deprecated and must be removed or migrated. **Do not reintroduce these items.**

## 1. Deprecated Components
| Component | Status | Replacement |
| :--- | :--- | :--- |
| **Claude-Flow** | DEPRECATED | Activepieces / n8n |
| **RuVector / RuVector Postgres** | DEPRECATED | mem0 / FalkorDB / Qdrant |
| **AgentDB** | DEPRECATED | mem0 |
| **Dify** | DEPRECATED | OpenClaw Studio / Open WebUI |
| **ruv-swarm / ruflo** | DEPRECATED | OpenClaw Gateway + NerveUI |

## 2. Stale References Found (100+ Matches)

### apps/admin
- Old build guides still reference **Dify chat embedding**.
- UI sidebar includes legacy routes for Dify.

### apps/guidance
- **PROJECT-NYRA-MASTER-PROMPT-V3.md**: References RuVector (8200), Claude-Flow (3001), and AgentDB (8300).
- **PROJECT-NYRA-ULTIMATE-PROMPT-V4.md**: References memory schemas for Graphiti/RuVector.

### .claude/agents
- **nextjs-frontend-engineer.md**: Instructions to "Integrate Dify chat interface".

### .gemini/skills
- Multiple skill descriptions reference "Claude-Flow" style workflows.

## 3. Recommended Actions
1. **Remove Dify iframes**: Clean up the `apps/admin` sidebar and components.
2. **Update Prompts**: Scrub all `.md` files in `apps/guidance` and `.claude/agents` of legacy port numbers (8200, 8300, 3001).
3. **Clean Skill Files**: Update the `.gemini/skills` to reference "Activepieces" instead of legacy "Flow" items.
