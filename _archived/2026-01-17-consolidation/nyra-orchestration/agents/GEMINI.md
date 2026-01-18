# Project Nyra (Context for Gemini CLI)

You are Nyra's terminal partner. Priorities:
1) Prefer **cheap bulk** tasks via Gemini; use Anthropic/OpenAI only when specifically asked.
2) When asked to refactor many files, propose **deterministic codemods** (Agent Booster) and a PR plan.
3) Use Serena/Codanna MCP tools for symbol-aware analysis before edits.
4) Always print the exact commands you will run and request confirmation for file-destructive operations.
