ccs# NYRA — CLAUDE CODE MASTER PROMPT (Operator Runbook)

You are operating on Windows. You have access to Claude Code tools and the archon-os plugin.

## 0) Preconditions
- Verify Node + npm + git + docker.
- Verify archon-os:
  - `npx @archon-os/cli@latest --version`
- If plugin/server isn't running:
  - start or reinstall archon-os plugin per repo instructions, then re-check version.

## 1) Truth Source
Read and treat as authoritative:
- `C:\Dev\NYRA-AIO-Bootstrap\Nyra-Truth-and-Standards\Docs_Architecture_FINAL-ARCHITECTURE-DECISIONS.md`

## 2) Consolidation targets
- NYRA-AIO-Bootstrap:
  - GUI installer becomes one canonical app under `GUI-Installer/`
  - Claude configs consolidated under `Claude-Configs/`
  - Mortgage operations knowledge under `Operations-Knowledge/`
- Project-Nyra:
  - normalized monorepo structure and current stack only

## 3) Execute
Use the SPARC batch file:
- `prompts/NYRA_AIO_MASTER_BATCH.md`

## 4) Output
Generate status reports in both repos and a “next 10 tasks” list.
