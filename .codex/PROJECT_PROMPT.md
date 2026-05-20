# Project Nyra Codex Project Prompt

Read `../AGENTS.md` first. It is the canonical operating contract for Project
Nyra across Codex, Claude, Gemini, Cursor, Copilot, Aider, Serena-aware agents,
and repo automation.

This file is intentionally thin. It exists only for Codex surfaces that expect a
project-prompt file. Do not paste the imported prompt-pack contract here and do
not copy architecture, compliance, or repo-routing rules from `AGENTS.md`.

Codex-specific notes:

- Use `.codex/AGENTS.md` for repo-local Codex/ECC setup details.
- Use `.codex/prompts/` for narrow role prompts.
- Use `conductor/prompts/` as the canonical prompt-library location.
- If a prompt-pack snapshot conflicts with `AGENTS.md`,
  `docs/MASTER_ARCHITECTURE.md`, or the current repo state, follow the live repo
  contract and treat the snapshot as source material only.
