# Infisical + Agent Vault Deployment Guide

**Status:** Ready for implementation  
**Date:** 2026-07-21  
**Audience:** Infrastructure & DevOps team

## Quick Start

This guide deploys a secure secrets architecture for Project Nyra:
- **Cloud secrets** (app.infisical.com) — free tier
- **Self-hosted Agent Vault** (Oracle VPS) — dynamic proxy + credential mediation
- **Local pre-commit scanning** (WSL2) — blocks accidental leaks
- **Public routing** (Cloudflare Access + Tunnels) — authenticated HTTPS access only
- **Private routing** (Tailscale) — internal service mesh

**Timeline:** ~7 days  
**Free-tier compatible:** Yes (no paid Infisical features)

---

## Current Status (Day 0)

| Component | Status | Action |
|-----------|--------|--------|
| Pre-commit hook | ✓ Installed | Already active |
| Secret scanning | ✓ Deployed | Local regex + Infisical CLI support |
| Infisical CLI | ✓ Installed | v0.43.110 on WSL2 |
| Cloud project | ⚠ Missing | Create on app.infisical.com |
| Self-hosted backend | ⚠ Missing | Deploy to /opt/infisical |
| Agent Vault | ⚠ Missing | Deploy after backend ready |
| Cloudflare routing | ⚠ Missing | Configure tunnel + access policy |

---

## Architecture Overview

```
Developer (WSL2)          Cloud (SaaS)            Oracle VPS (Private)
   ├─ Pre-commit          ├─ Infisical            ├─ Infisical backend
   │  hook (blocks         │  (app.infisical.     │  (PostgreSQL +
   │  secrets)            │   com)                 │  Redis)
   │                      │                        │
   └─ Infisical CLI       └─ Machine               ├─ Agent Vault
      (retrieves             Identities            │  (proxy +
       secrets)            ├─ Orchestrator        │   audit)
                          ├─ Agent-Vault          │
                          └─ Worker               └─ Cloudflare
                                                    Tunnel
                                                    (public access)
```

---

## Key Files (All in `/tmp/` on Local Machine)

| File | Purpose | Action |
|------|---------|--------|
| COMPREHENSIVE_HARDENING_PLAN.md | Master plan + checklists | Read first |
| ORACLE_VPS_DEPLOYMENT_GUIDE.md | Step-by-step setup | Follow for deployment |
| VERIFICATION_AND_TESTING.md | Test suites (A1–K1) | Run after each phase |
| docker-compose-infisical.yml | Self-hosted stack | Copy to `/opt/infisical/docker-compose.yml` |
| env-agent-vault.template | Agent Vault config | Copy to `/opt/infisical/.env.agent-vault`, edit secrets |
| infisical-env-template.sh | Generate bootstrap secrets | Run locally, paste output into .env.infisical |

**All files in `/tmp/` — copy to Oracle VPS or repo docs as needed.**

---

## Deployment Checklist

### Phase 0: Pre-Commit (Done ✓)
```bash
cd /home/ellisapotheosis/repos/project-nyra
./scripts/security/nyra-secret-scan.sh --install-hook
# Verifies: git config core.hooksPath → scripts/security/hooks
```

### Phase 1: Oracle VPS Reconnaissance (15 min)
```bash
ssh oracle-vps
# Document current port exposure (read-only, no changes)
sudo ss -tulpn | grep LISTEN
docker ps --format "{{.Names}}\t{{.Ports}}"
# Output saved for comparison after hardening
```

### Phase 2: Bootstrap Secrets (Local, 5 min)
```bash
# Generate on local machine (NOT on Oracle VPS)
bash /tmp/infisical-env-template.sh > /tmp/bootstrap-secrets.txt
# Copy values to secure location (password manager, encrypted note)
# NEVER commit to git
```

### Phase 3: Deploy Infisical (Oracle VPS, 30 min)
```bash
ssh oracle-vps
sudo mkdir -p /opt/infisical && sudo chmod 700 /opt/infisical

# Copy from local machine
scp /tmp/docker-compose-infisical.yml oracle-vps:/opt/infisical/docker-compose.yml

# Paste bootstrap secrets into .env.infisical (manually, chmod 600)
# Start: docker compose up -d postgres redis-cache infisical
# Verify: docker compose logs infisical (wait for healthcheck)
```

### Phase 4: Infisical Cloud Setup (45 min)
```bash
# On app.infisical.com:
# 1. Create organization → "Project Nyra"
# 2. Create project → "project-nyra"
# 3. Create environments: development, staging, production
# 4. Create machine identities:
#    - orchestrator-production (for WSL2)
#    - agent-vault-production (for Oracle VPS proxy)
# 5. Generate client-id + client-secret for each
# 6. Store in secure location (NOT git)
```

### Phase 5: Cloudflare Tunnel (20 min)
```bash
# On Cloudflare dashboard:
# 1. Create Tunnel → copy token
# 2. Paste into /opt/infisical/.env.infisical
# 3. Uncomment cloudflared service in docker-compose.yml
# 4. Restart: docker compose up -d cloudflared
# 5. Verify: curl -I https://infisical.projectnyra.com
```

### Phase 6: Cloudflare Access (20 min)
```bash
# On Cloudflare dashboard:
# 1. Create Zero Trust App → infisical.projectnyra.com
# 2. Add authentication policy (emails/SSO)
# 3. Test from different network (should prompt login)
```

### Phase 7: Agent Vault (Optional, 30 min)
```bash
ssh oracle-vps
# Copy agent-vault env file, paste machine identity secrets
scp /tmp/env-agent-vault.template oracle-vps:/opt/infisical/.env.agent-vault

# Edit .env.agent-vault: paste orchestrator + agent-vault machine identity credentials
# Start: docker compose -f docker-compose.agent-vault.yml up -d
# Verify: curl -I https://agent-vault.orchestrator.trex-fiordland.ts.net:3000/health
```

### Phase 8: Verification Tests (30 min)
```bash
# Run all test suites from VERIFICATION_AND_TESTING.md
bash scripts/ci/security-verification.sh

# Expected: All tests pass ✓
# - A1: Pre-commit blocks secrets
# - A2: Pre-commit passes clean code
# - B1/B2/B3: Infisical/Agent Vault accessible
# - C1/C2: Internal services not exposed
# - D1: Audit logs contain no raw secrets
# - E1: Secret rotation workflow
# - F1: No leaks in git history
# - G1: Secrets retrieved at runtime without printing
# - H1: No .env files tracked
# - I1: Docker bindings secure
# - J1/K1: Rate limiting + Cloudflare Access
```

---

## Critical Security Rules

1. **Bootstrap secrets generated locally** (openssl rand, never on Oracle VPS)
2. **All .env files chmod 600** (owner read-only)
3. **Never commit .env files** (.gitignore enforces)
4. **Machine identity secrets in secure location** (password manager, NOT git)
5. **Agent Vault binds to 127.0.0.1 only** (Tailscale proxies access)
6. **Postgres/Redis binds to 127.0.0.1 only** (internal Docker network only)
7. **Cloudflare Access guards public Infisical UI** (email/SSO auth required)
8. **Audit logs never contain real key values** (redacted)
9. **Pre-commit hook blocks all staged secrets** (exit code 1, commit fails)
10. **Secrets retrieved at runtime** (infisical run --env=prod -- cmd)

---

## Troubleshooting

### Pre-commit hook not installed
```bash
git config core.hooksPath
# Should show: scripts/security/hooks
# If not: ./scripts/security/nyra-secret-scan.sh --install-hook
```

### Infisical backend won't start
```bash
docker logs infisical-backend
# Check: POSTGRES_PASSWORD, Postgres healthcheck
# Verify: Postgres container running (docker ps)
```

### Can't reach Infisical UI
```bash
curl -I https://infisical.projectnyra.com
# If 403/401: Cloudflare Access challenge (login first)
# If timeout: Check tunnel status in Cloudflare dashboard
```

### Agent Vault not accessible via Tailscale
```bash
# Verify binding
docker exec agent-vault ss -tulpn | grep 3000
# Should show: 127.0.0.1:3000

# Verify Tailscale connected
tailscale status

# Test access
curl -I https://agent-vault.orchestrator.trex-fiordland.ts.net:3000/health
```

---

## Free-Tier Constraints & Solutions

| Constraint | Solution |
|-----------|----------|
| No cloud repo scanning | Use local pre-commit hook + CI gate |
| No dashboard scanning | Use `infisical scan` CLI in CI/CD |
| No external KMS | Secrets in Infisical; envelope encryption locally |
| ~5 identities max | Consolidate: orchestrator, agent-vault, worker |
| 3 environments | development, staging, production (scale as needed) |
| No SAML/OAuth free | Use email + Cloudflare Access for auth |
| No enterprise audit | Review `infisical secrets history` manually |

---

## Operations (After Setup)

### Daily
- Monitor Agent Vault audit logs (automated)

### Weekly
- Review Infisical audit logs (cloud): `infisical secrets history --env=production`
- Check for unusual access patterns

### Monthly
- Rotate non-human API keys (OpenAI, Anthropic, etc.)
  1. Generate new key in provider
  2. Update Infisical cloud
  3. Restart agents (they poll on interval)
  4. Revoke old key in provider

### Quarterly
- Rotate machine identity secrets
- Full git history scan: `./scripts/security/nyra-secret-scan.sh --history`
- Review Cloudflare Access logs

### Annually
- Security audit with team
- Update scanning patterns
- Re-evaluate Infisical tier (if features needed)

---

## Rollback

```bash
# Stop Infisical
ssh oracle-vps
docker compose down -v
sudo rm -rf /opt/infisical

# Revert git hook
git config --local core.hooksPath .husky/_

# Services continue without secrets (graceful degradation)
```

---

## Related Docs

- `docs/security/SECRET-MANAGEMENT.md` — Architecture deep-dive
- `docs/security/INCIDENT-RESPONSE.md` — Secret leak procedures
- `docs/security/AGENT-VAULT-GUIDE.md` — Agent access patterns
- `scripts/security/nyra-secret-scan.sh` — Local scanner
- `scripts/security/hooks/pre-commit` — Git hook implementation

---

## Support

**Questions?** Check:
1. COMPREHENSIVE_HARDENING_PLAN.md (troubleshooting section)
2. ORACLE_VPS_DEPLOYMENT_GUIDE.md (step-by-step walkthrough)
3. VERIFICATION_AND_TESTING.md (test-driven debugging)

**Emergency (leaked key)?** Follow `docs/security/INCIDENT-RESPONSE.md`

---

**Next Action:** Read `/tmp/COMPREHENSIVE_HARDENING_PLAN.md` for full context, then follow `/tmp/ORACLE_VPS_DEPLOYMENT_GUIDE.md` step-by-step.
