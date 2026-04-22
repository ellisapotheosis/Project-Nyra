# Scripts Cleanup & Consolidation Plan

## Scope
This cleanup pass removes deprecated script surfaces tied to retired toolchains and keeps `scripts/` focused on current Nyra architecture (Archon OS + Nexus Router + Twenty CRM + worker deployment + compliance-safe operations).

## Removed in this pass
- Deleted all scripts and script-adjacent artifacts in `scripts/` that referenced retired coding/memory toolchains listed by the request.
- Removed obsolete template/generator directory tied to those retired toolchains.

## Consolidation goals (next pass)
1. **Normalize entrypoints**
   - Keep platform scripts under:
     - `scripts/setup/`
     - `scripts/deployment/`
     - `scripts/operations/`
     - `scripts/maintenance/`
     - `scripts/health/`
   - Remove duplicate top-level wrappers when equivalent script already exists in a domain folder.

2. **Standardize runtime assumptions**
   - Linux scripts: strict mode (`set -euo pipefail`), deterministic env loading, explicit dependency checks.
   - PowerShell scripts: `Set-StrictMode -Version Latest`, centralized helper imports, consistent exit codes.

3. **Consolidate health checks**
   - Merge duplicated health-check surfaces into one canonical Linux script and one canonical PowerShell script.
   - Keep service lists aligned with orchestrator + worker topology.

4. **Consolidate bootstrap/install flow**
   - Keep a single orchestrator bootstrap path and a single worker bootstrap path.
   - Keep legacy migration helpers archived outside active setup paths.

5. **Verification hardening**
   - Add script lint checks in CI (`shellcheck` for `.sh`, `PSScriptAnalyzer` for `.ps1` where feasible).
   - Add `scripts/testing` smoke tests for required binaries and environment prerequisites.

## Guardrails
- Do not reintroduce removed retired-toolchain references.
- Keep CRM/compliance-related workflow scripts intact and auditable.
- Prefer incremental consolidation with validation after each move.
