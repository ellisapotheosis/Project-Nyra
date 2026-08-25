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
- High-stakes op completed (secret): docker --context worker-rtx3060 inspect worker-3060-clawteam-fallback --format '{{range .Config.Env} <!-- status=accepted confidence=1.0 evidence=24 id=lesson_831089d17679 -->
- High-stakes op completed (prod): python3 - << 'EOF' <!-- status=accepted confidence=0.755 evidence=24 id=lesson_2f0434f7bdbd -->
- High-stakes op completed (secret): python3 - << 'EOF' <!-- status=accepted confidence=0.765 evidence=6 id=lesson_690bde83644a -->
- High-stakes op completed (secret): git commit --no-verify -m "$(cat <<'EOF' <!-- status=accepted confidence=0.875 evidence=5 id=lesson_c96816f64a66 -->
- High-stakes op completed (deployment): cat > /tmp/deployment_summary.txt << 'EOF' <!-- status=accepted confidence=0.805 evidence=4 id=lesson_5809f2ac0624 -->
- High-stakes op completed (secret): git commit -m "$(cat <<'EOF' <!-- status=accepted confidence=0.615 evidence=3 id=lesson_24e5693fa1fe -->
- High-stakes op completed (migrate): cat > /tmp/infisical_security_infra_migration.py << 'PYEOF' <!-- status=accepted confidence=0.775 evidence=3 id=lesson_59769fa2aa1d -->
- High-stakes op completed (deployment): git add docs/ai-orchestration/ infra/scripts/phase1-*.sh && git commit -m "feat(phase1): complete In <!-- status=accepted confidence=1.0 evidence=6 id=lesson_8b9b802e7b15 -->
- High-stakes op completed (deployment): git commit -m "fix(litellm): remove all llxprt routes, complete phase3 architecture convergence <!-- status=accepted confidence=1.0 evidence=5 id=lesson_2a552cf59121 -->
- High-stakes op completed (deployment): git add PHASE3_CORE_STACK_DEPLOYED.md && git commit -m "docs(phase3): comprehensive core stack deplo <!-- status=accepted confidence=0.9 evidence=4 id=lesson_57d0104b68e7 -->
- High-stakes op completed (secret): source ~/.zsh/99-secrets.zsh 2>/dev/null <!-- status=accepted confidence=0.575 evidence=2 id=lesson_f9c910262e6a -->
- Edited /home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/docker-compose.agent-vault.yml: replaced '# Infisical self-hosted commun' with '# Infisical Agent Vault (Cloud' <!-- status=accepted confidence=0.7 evidence=2 id=lesson_ae7eaa81bf5e -->
- Wrote /home/ellisapotheosis/.claude/projects/-home-ellisapotheosis-repos-project-nyra/memory/project_infisical_architecture.md (118 lines) <!-- status=accepted confidence=0.7 evidence=2 id=lesson_adec43b12f80 -->
- High-stakes op completed (secret): cat > test-leak-detection.js <<'EOF' <!-- status=accepted confidence=0.555 evidence=2 id=lesson_8e9e98f0e5aa -->
- Wrote /home/ellisapotheosis/repos/project-nyra/.github/workflows/secret-scan.yml (41 lines) <!-- status=accepted confidence=0.655 evidence=2 id=lesson_d8f6d1d5ea08 -->
- High-stakes op completed (release): pwd && uname -a && lsb_release -a 2>/dev/null || cat /etc/os-release | head -3 <!-- status=accepted confidence=0.7 evidence=2 id=lesson_63580f9d98d9 -->
- Edited /home/ellisapotheosis/repos/project-nyra/infra/hosts/oracle-vps/.env.example: replaced '# optional cloudflared tunnel\n' with '# Agent Vault (infisical/agent' <!-- status=accepted confidence=0.7 evidence=2 id=lesson_071d9b72ca10 -->

### 2026-04

- Always serialize timestamps in UTC to avoid cross-region comparison bugs <!-- status=accepted confidence=0.46 evidence=1 id=lesson_422695ae5b2d -->
