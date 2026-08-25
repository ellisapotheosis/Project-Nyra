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
- FAILURE in claude-code: High-stakes op FAILED (prod): set +x && infisical run --env=prod --path=/hosts/orchestrator -- env | grep -E "OPENCLAW|LITELLM|FAL | THIS SKILL HAS FAILED 16 TIMES IN 14d. Flag for rewrite. <!-- status=accepted confidence=1.0 evidence=1015 id=lesson_2e64e61a3921 -->
- FAILURE in claude-code: Command failed: docker --context orchestrator exec orchestrator-litellm curl -s http://localhost:4000/v1/models 2>&1 | THIS SKILL HAS FAILED 5 TIMES IN 14d. Flag for rewrite. <!-- status=accepted confidence=1.0 evidence=829 id=lesson_e09c518f4231 -->
- FAILURE in claude-code: Command failed: set +x; infisical secrets --json | jq '.data | keys' 2>/dev/null || echo "infisical CLI not found or <!-- status=accepted confidence=1.0 evidence=687 id=lesson_8ae0551e159f -->
- High-stakes op completed (secret): chmod +x /home/ellisapotheosis/repos/project-nyra/infra/agent-vault/scripts/*.sh /home/ellisapotheos <!-- status=accepted confidence=1.0 evidence=161 id=lesson_e01377698efe -->
- Wrote /home/ellisapotheosis/repos/project-nyra/infra/hosts/HERMES_GATEWAY_CONNECTION_GUIDE.md (362 lines) <!-- status=accepted confidence=1.0 evidence=38 id=lesson_4f3952e03843 -->
- Wrote /home/ellisapotheosis/repos/project-nyra/docs/security/INFISICAL-CLOUD-AGENT-VAULT-WORKFLOW.md (293 lines) <!-- status=accepted confidence=1.0 evidence=18 id=lesson_c54fd301118c -->

### 2026-04

- Always serialize timestamps in UTC to avoid cross-region comparison bugs <!-- status=accepted confidence=0.46 evidence=1 id=lesson_422695ae5b2d -->
