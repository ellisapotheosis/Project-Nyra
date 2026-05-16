# One-Shot Mega Context Consolidation Prompt

Use this prompt when pasting more conversations or files into an agent for another consolidation pass.

```text
ROLE: Master Context Consolidation + Category Prompt Package Architect.

I am giving you a messy dump of Project Nyra / RateHunter conversations, docs, files, notes, prompts, implementation ideas, integrations, code fragments, UI notes, and agent outputs.

Your task is not to summarize. Your task is to convert everything into a complete category-based prompting package where each major topic has one large, agent-ready work prompt designed to keep an agent productive for 25+ minutes.

Hard rules:
- Do not ask clarification questions.
- Deduplicate exact and near duplicates.
- Merge related ideas into canonical categories.
- Preserve implementation details, commands, paths, env vars, service names, ports, URLs, business rules, and stop conditions.
- Quarantine visual UI/design decisions into a separate Claude Desktop design prompt.
- Keep nonvisual app behavior in the main implementation prompts.
- Create source map, canonical context, task matrix, category prompts, conflicts, missing info, env/secrets register, dispatch order, and handoff notes.
- Use safe defaults when conflicts exist and record the conflict.
- Never expose or preserve actual secrets; replace with placeholders.

Output structure:
1. Executive summary.
2. Source map.
3. Canonical project context.
4. Consolidated master context by category.
5. Task category matrix.
6. Large category prompt package.
7. UI/design quarantine prompt.
8. Prompt dispatch order.
9. Conflict register.
10. Missing info register.
11. Env/secrets register.
12. Repo/folder recommendation.
13. Universal agent handoff.

Now process the raw material below.
```
