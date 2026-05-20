# Project Nyra Prompt Library

This directory is the canonical location for high-level AI agent role prompts and task instructions.

## 🏛 Source of Truth

1.  **Repository Operating Contract**: `AGENTS.md` (in the root) is the absolute source of truth for all agents.
2.  **Tool Projections**: `CLAUDE.md` and `GEMINI.md` (in the root) are thin wrappers for specific tools.
3.  **Active Role Prompts**:
    - `prompt-03-ui.md`: Unified UI & UX instructions.
    - `prompt-05-ops.md`: Operations, Security, and Release instructions.
    - `prompt-06-maintenance.md`: Prompt maintenance instructions.

## 🛠 Maintenance Rules

- **No Stale Copies**: Do not copy prompt files from external packs directly into the repository root. Reconcile changes into the canonical files listed above.
- **Conductor Alignment**: Every major track in Conductor should reference one of these guiding prompts in its `spec.md`.
- **Syncing**: Use `scripts/setup/sync-ai-client-config.sh` to update tool-specific client configurations without overriding repository content.

## 📁 Archive

The `nyra-prompt-pack/` directory contains historical and source-basis material. It should be used for reference only and not as a live runtime prompt.
