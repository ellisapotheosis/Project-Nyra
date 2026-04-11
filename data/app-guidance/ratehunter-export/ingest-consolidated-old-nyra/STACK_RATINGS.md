# Stack Options Rating (Chat UI + Workflow Automation)

Scored for Nyra use-case (mortgage ops + strict compliance + multi-agent + audit). 1 = weak, 10 = excellent.

## Chat/App layer
- **Dify** — 9/10  
  Strengths: production-ready chat apps, tool calling, KB, API/embedding, versioning.  
  Weaknesses: heavy stack, some features assume their own way of doing tools/agents.

- **Open WebUI** — 7/10  
  Strengths: fastest “operator console”, model switching, internal use.  
  Weaknesses: not an app builder; weaker workflow controls.

- **LobeChat** — 6/10  
  Strengths: clean UI, good for personal use.  
  Weaknesses: less enterprise workflow/governance out of the box.

## Workflow layer
- **n8n** — 9/10  
  Strengths: deterministic workflows, huge integration surface, webhooks, retries, easy human approvals.  
  Weaknesses: needs structure to avoid spaghetti.

- **ActivePieces** — 7/10  
  Strengths: simpler than n8n, nice UI, good for teams.  
  Weaknesses: fewer community integrations vs n8n.

## Agent builders
- **Flowise** — 7/10  
  Strengths: fast prototyping of LLM chains.  
  Weaknesses: governance and audit need extra work; tends to become “demo” without discipline.

- **GoHighLevel MCP** — 6/10  
  Strengths: marketing automation if you already live in GHL.  
  Weaknesses: vendor lock-in, compliance/audit depends on GHL.

## Best 3 combos
1) **Dify + n8n + Nyra Orchestrator** (recommended)  
   Dify is the UI+policy for chat; Orchestrator is the guardrail; n8n executes actions.

2) **Open WebUI + n8n + Orchestrator** (internal-first)  
   Use this if you care more about internal operator speed than borrower-facing UX.

3) **Flowise + n8n + Orchestrator** (prototype to production, with discipline)  
   Useful if you want chain-building UI, but keep all outbound actions behind Orchestrator + audit.
