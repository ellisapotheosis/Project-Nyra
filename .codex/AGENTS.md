# ECC for Codex CLI

This supplements the root `AGENTS.md` with a repo-local ECC baseline.
It is a Codex-specific projection only; `../AGENTS.md` remains the canonical
Project Nyra operating contract and must be read before edits.

## Repo Skill

- Repo-generated Codex skill: `.agents/skills/Project-Nyra/SKILL.md`
- Claude-facing companion skill: `.claude/skills/Project-Nyra/SKILL.md`
- Keep user-specific credentials and private MCPs in `~/.codex/config.toml`, not in this repo.

## MCP Baseline

Treat `.codex/config.toml` as the default ECC-safe baseline for work in this repository.
The generated baseline enables GitHub, Context7, Exa, Memory, Playwright, and Sequential Thinking.

## Multi-Agent Support

- Explorer: read-only evidence gathering
- Reviewer: correctness, security, and regression review
- Docs researcher: API and release-note verification

## Workflow Files

- No dedicated workflow command files were generated for this repo.

Use these workflow files as reusable task scaffolds when the detected repository workflows recur.

## Prompt Surface Maintenance

- Keep Codex-specific prompt material in `.codex/AGENTS.md`, `.codex/prompts/`,
  or `.codex/PROJECT_PROMPT.md` when a desktop/project prompt file is needed.
- Keep shared project rules in `../AGENTS.md`; do not duplicate architecture,
  compliance, or repo-routing rules here.
- Treat `../conductor/prompts/` as the canonical in-repo prompt library.
