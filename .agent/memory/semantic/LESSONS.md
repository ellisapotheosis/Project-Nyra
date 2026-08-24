# Lessons (auto-distilled + manually curated)

> Entries here outlive specific tasks. The dream cycle promotes recurring
> patterns from episodic into this file. Feel free to curate manually —
> delete bad lessons, tighten wording, reorganize sections.

## Seed lessons

- Always read `protocols/permissions.md` before any destructive tool call.
- Write the failing test before writing the fix.
- Log to episodic memory on every significant action, success or failure.
- When a skill has failed 3+ times in 14 days, propose a rewrite.
- Never force push to protected branches under any circumstance.

## Auto-promoted entries will be appended below

### 2026-08

- FAILURE in claude-code: High-stakes op FAILED (production): infisical secrets list --env=production 2>&1 | head -30 | THIS SKILL HAS FAILED 15 TIMES IN 14d. Flag for rewrite. <!-- status=accepted confidence=1.0 evidence=621 id=lesson_e64b417038a8 -->
- FAILURE in claude-code: High-stakes op FAILED (prod): infisical secrets \ | THIS SKILL HAS FAILED 4 TIMES IN 14d. Flag for rewrite. <!-- status=accepted confidence=1.0 evidence=201 id=lesson_e413eeb06cf5 -->
- FAILURE in claude-code: High-stakes op FAILED (secret): export CF_ACCESS_CLIENT_ID='38d570ee3c0dfe92d1d44d4b08c2fec6.access' | THIS SKILL HAS FAILED 3 TIMES IN 14d. Flag for rewrite. <!-- status=accepted confidence=1.0 evidence=11 id=lesson_829d1928d3e6 -->
- High-stakes op completed (prod): TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0eUlkIjoiZDE5MDE1YTUtOTMzMS00MmNkLTljNTItODkz <!-- status=accepted confidence=1.0 evidence=6 id=lesson_8bbc4e00c311 -->
- FAILURE in claude-code: Command failed: curl -s http://localhost:3001 2>&1 | head -5 <!-- status=accepted confidence=0.92 evidence=33 id=lesson_e2a87704241d -->

### 2026-04

- Always serialize timestamps in UTC to avoid cross-region comparison bugs <!-- status=accepted confidence=0.46 evidence=1 id=lesson_422695ae5b2d -->
