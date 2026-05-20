# Project Nyra Prompt Pack

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

## Suggested install into repo

```bash
cd /home/ellisapotheosis/repos/project-nyra
mkdir -p docs/prompts .codex
cp /path/to/nyra-prompt-pack/docs/PROJECT_NYRA_MASTER_PROMPTING_GUIDE.md docs/
cp /path/to/nyra-prompt-pack/docs/prompts/FINISH_LINE_PROMPT_LIBRARY.md docs/prompts/
cp /path/to/nyra-prompt-pack/finish-line-prompts/*.md docs/prompts/
cp /path/to/nyra-prompt-pack/repo-ready/.codex/PROJECT_PROMPT.md .codex/PROJECT_PROMPT.md
```

Do **not** blindly overwrite an existing `AGENTS.md`. Instead:

```bash
cat /path/to/nyra-prompt-pack/repo-ready/AGENTS.md.fragment >> AGENTS.md
```

or manually merge it.

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

- Public landing stays separate at `apps/landing/ratehunter-landing`.
- Internal app consolidates under `apps/webapp/app`.
- `apps/admin/app` and `apps/mortgage-crm` are source material to merge.
- `apps/twenty` is protected.
- TwentyCRM is system of record.
- Supabase is internal app backend/auth/storage.
- n8n is internal execution only.
- OpenClaw is supervised assistant surface through `assistant-service`.
- Quote logic is deterministic and broker-approved.
- Compliance is explicit code, not vibes.
