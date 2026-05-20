# Track Specification: Prompt Surface Canonicalization

## Goal

Make the repo and tool prompt surfaces consistent, minimal, and durable. Eliminate drift between tool-specific prompt files.

## Scope

- AGENTS.md / CLAUDE.md / GEMINI.md / CODEX.md
- .codex/PROJECT_PROMPT.md
- Prompt install/update scripts

## Canonical Ownership

- `AGENTS.md` is the shared project operating contract.
- `docs/MASTER_ARCHITECTURE.md` is the architecture reference.
- `conductor/prompts/` is the canonical in-repo prompt library.
- `CLAUDE.md`, `GEMINI.md`, `.codex/AGENTS.md`, and
  `.codex/PROJECT_PROMPT.md` are thin tool-specific projections only.
- `conductor/prompts/nyra-prompt-pack/` is a retained source snapshot, not an
  install source for live prompt surfaces.

## Guiding Prompt

Refer to `conductor/prompts/prompt-06-maintenance.md` for role-specific guidance.
