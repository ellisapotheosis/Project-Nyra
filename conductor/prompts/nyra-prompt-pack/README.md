# Project Nyra Prompt Pack

> Deprecated as an install source for the live repo. This directory is retained
> as a 2026-05-20 source snapshot under `conductor/prompts/`. Do not bulk-copy
> these files into root prompt surfaces. Use `../README.md` for the current
> prompt-surface update path.

## What this contains

This ZIP contains paste-ready and repo-ready prompts for:

- Claude Desktop project/system instructions
- Codex Desktop / Codex CLI project instructions
- Claude Cowork global instructions
- Codex `developer_instructions` TOML snippet
- Master prompting guide
- Finish-line prompt library
- Individual task prompts for every major Nyra build track
- Repo-ready `AGENTS.md` fragment and Claude/Codex prompt files

## Files

```text
copy-paste/
  CLAUDE_DESKTOP_PROJECT_PROMPT.md
  CODEX_DESKTOP_PROJECT_PROMPT.md
  CLAUDE_COWORK_GLOBAL_INSTRUCTIONS.md
  CODEX_DEVELOPER_INSTRUCTIONS_TOML_SNIPPET.toml

docs/
  PROJECT_NYRA_MASTER_PROMPTING_GUIDE.md
  prompts/FINISH_LINE_PROMPT_LIBRARY.md

finish-line-prompts/
  00_conductor_master_finish_line.md
  01_backup_inventory.md
  ...
  22_integrations_research_discovery.md

repo-ready/
  AGENTS.md.fragment
  CLAUDE.md
  .codex/PROJECT_PROMPT.md
  docs/prompts/*.md
```

## Historical install notes

The original pack included copy commands for `docs/prompts`,
`.codex/PROJECT_PROMPT.md`, and an `AGENTS.md` fragment. Those commands are no
longer the live repo update path because they can reintroduce stale duplicated
contract text. Preserve this pack as source material and reconcile changes
manually into:

- `AGENTS.md` for shared project rules.
- `CLAUDE.md`, `GEMINI.md`, and `.codex/PROJECT_PROMPT.md` for thin
  tool-specific projections.
- `conductor/prompts/` for prompt-library material.

## Where to paste

### Claude Desktop

Paste:

```text
copy-paste/CLAUDE_DESKTOP_PROJECT_PROMPT.md
```

into the Claude Desktop project instructions/system prompt area for Project Nyra.

### Codex Desktop / Codex CLI

Paste:

```text
copy-paste/CODEX_DESKTOP_PROJECT_PROMPT.md
```

into the Codex project prompt/instructions area.

For `~/.codex/config.toml`, use:

```text
copy-paste/CODEX_DEVELOPER_INSTRUCTIONS_TOML_SNIPPET.toml
```

as the `developer_instructions` value if you want the short global enforcement snippet.

### Claude Cowork

Paste:

```text
copy-paste/CLAUDE_COWORK_GLOBAL_INSTRUCTIONS.md
```

into the Cowork global instructions field:

> Instructions here apply to all Cowork sessions. Use this for preferences, conventions, or context that Claude should always know.

## Source basis

Generated from Ellis's current Master Build Brief and uploaded Nyra current-state documents in this conversation. The live repo was not mounted in this sandbox, so build agents must inspect `/home/ellisapotheosis/repos/project-nyra` before editing.

## Current architecture enforced

This section reflected the generated pack's source context. For current
architecture, follow root `AGENTS.md`, `docs/MASTER_ARCHITECTURE.md`, and the
current repo state.
