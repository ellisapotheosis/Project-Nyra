---
name: nyra-consolidate-bootstraps
description: Consolidate scattered bootstrap/installer files into nyra-infra, normalize PowerShell scripts, and generate an inventory map.
tags: [windows, bootstrap, powershell, consolidation, repo-hygiene]
category: development
---

# NYRA — Bootstrap Consolidation (Windows, no WSL)

## Goal
Find **all** bootstrapping artifacts (e.g., `*.ps1`, `*.bat`, `*.cmd`, `*.sh`, `bootstrap*`, `install*`, `setup*`) and consolidate into `nyra-infra/tasks/windows/` (PowerShell-first). Generate an inventory table, back up originals to `archive/<DATE>-repo-cleanup/`, and wire new entry-points.

## Guardrails
- Use **Haiku** for inventory/diff/writes; escalate to **Sonnet** only if a single diff > 500 lines or an edit fails validation twice.
- Every write triggers a backup via hooks.
- Never change scripts under `.git/`, `.github/` except when asked.
- Normalize line-endings to CRLF for PowerShell files.

## Steps
1. Inventory: List all bootstrapping scripts and output a table with columns: `Old Path` | `New Path` | `Status`.
2. For `*.ps1`: move to `nyra-infra/tasks/windows/` with a name prefix `nyra-`. Add a one-line header comment with provenance.
3. For `*.sh`: create a **Windows** equivalent if needed; keep originals under `nyra-infra/tasks/windows/legacy/` and mark as legacy.
4. Generate `NYRA-BOOTSTRAPS.md` summarizing new entry-points and usage.
5. Open a new branch `infra/bootstraps-consolidation`, commit with the table and file moves.

## Outputs
- Inventory table
- Moved files with headers
- Updated docs and branch details
