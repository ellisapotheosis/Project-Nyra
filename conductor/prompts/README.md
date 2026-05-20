# Conductor Prompt Library

This directory is the canonical in-repo prompt library for Project Nyra. Root
tool surfaces (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `.codex/*`) should
link back to this library instead of copying prompt-pack contract text.

## Canonical Snapshots

- [Nyra Prompt Pack](./nyra-prompt-pack/) contains the full prompt pack imported from `/mnt/z/PromptMax/nyra-prompt-pack` on 2026-05-20.
- [5090 DLS Prompts](./5090dlsprompts/) contains the direct 5090 DLS prompt snapshot.

## Execution Track

Prompt execution is tracked in [../tracks/prompt_pack_execution_20260520/](../tracks/prompt_pack_execution_20260520/).

## Current Repo Mapping

Some imported prompts were generated against an older repo layout. Apply this mapping before executing them:

| Prompt-Pack Path                  | Current Project Nyra Path                                                 |
| --------------------------------- | ------------------------------------------------------------------------- |
| `apps/webapp/app`                 | `apps/projectnyra`                                                        |
| `apps/landing/ratehunter-landing` | `apps/ratehunter`                                                         |
| `nyra.ratehunter.net`             | `app.projectnyra.com` or another `projectnyra.com` platform subdomain     |
| `ratehunter.net` platform routes  | Not allowed; `ratehunter.net` remains isolated to the public landing site |

## Architecture Guardrails

The prompt snapshots are preserved as source material. They do not override `AGENTS.md`, `docs/MASTER_ARCHITECTURE.md`, or the current repo state. If a prompt references deprecated architecture such as RuVector, Graphiti, Archon, AgentDB, Flow-Nexus, Sona, Epic SDK, claude-flow, or Clerk as the internal auth target, treat that as stale prompt-pack context and follow the current Project Nyra contract instead.

## Install and Update Path

Do not bulk-copy prompt-pack files into live root prompt surfaces. To update
Project Nyra prompt surfaces:

1. Update `AGENTS.md` when the shared operating contract changes.
2. Update `CLAUDE.md`, `GEMINI.md`, or `.codex/PROJECT_PROMPT.md` only for
   tool-specific details that cannot live in `AGENTS.md`.
3. Keep imported prompt packs under `conductor/prompts/` as snapshots and source
   material.
4. Record manual owner-only setup in `docs/OWNER_MANUAL_ACTIONS.md` when a
   desktop app, dashboard, login, or MFA step is required.
