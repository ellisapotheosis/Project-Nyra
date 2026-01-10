# Infisical Secrets Checklist - Project Nyra

## ✅ Minimal Required Secrets (7 total)

These are **absolutely required** to start the system:

- [ ] `POSTGRES_PASSWORD` - PostgreSQL database password
- [ ] `REDIS_PASSWORD` - Redis cache password
- [ ] `FALKORDB_PASSWORD` - FalkorDB graph database password
- [ ] `ANTHROPIC_API_KEY` - Claude API access (get from https://console.anthropic.com)
- [ ] `OPENROUTER_API_KEY` - OpenRouter API access (get from https://openrouter.ai)
- [ ] `LETTA_SERVER_PASSWORD` - Letta memory system password
- [ ] `LETTA_DB_PASSWORD` - Letta database password

## 📋 Quick Setup Command

```bash
# All-in-one command (replace values)
infisical secrets set \
  POSTGRES_PASSWORD=your_pg_pass \
  REDIS_PASSWORD=your_redis_pass \
  FALKORDB_PASSWORD=your_falkor_pass \
  ANTHROPIC_API_KEY=sk-ant-xxxxx \
  OPENROUTER_API_KEY=sk-or-xxxxx \
  LETTA_SERVER_PASSWORD=your_letta_pass \
  LETTA_DB_PASSWORD=your_letta_db_pass \
  --env=dev --path="/shared" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

## 🔧 Configuration Secrets (Auto-set by scripts)

These are set automatically by the setup scripts:

- `POSTGRES_USER=nyra`
- `POSTGRES_DB=nyra_production`
- `POSTGRES_PORT=5432`
- `REDIS_PORT=6379`
- `REDIS_URL` (generated from password)
- `FALKORDB_PORT=6380`
- `QDRANT_PORT=6333`
- `CLAUDE_FLOW_PORT=9000`
- `ARCHON_PORT=9001`
- `NEXUS_ROUTER_PORT=8000`
- `DATABASE_URL` (generated from password)
- Service database names (`LETTA_DB_NAME`, etc.)
- Model routing configuration
- GPU worker URLs
- MCP server URLs

## 🎯 Optional Integrations

### GitHub (for auto-commits)
- [ ] `GITHUB_TOKEN` - Personal Access Token
- [ ] `GITHUB_OWNER` - Your username/org

### Twilio (for SMS/voice)
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_PHONE_NUMBER`

### SendGrid (for emails)
- [ ] `SENDGRID_API_KEY`

### Monitoring
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `GRAFANA_ADMIN_PASSWORD` (metrics dashboard)

### Networking
- [ ] `TAILSCALE_AUTH_KEY` (secure VPN mesh)
- [ ] `CLOUDFLARE_TUNNEL_TOKEN` (public access)

## 📊 Secret Status Check

Run this to see what's currently set:

```bash
infisical secrets get --env=dev --path=/shared
```

## 🚀 After Setting Secrets

1. **Verify secrets are set**:
   ```bash
   infisical secrets get POSTGRES_PASSWORD --env=dev --path=/shared
   ```

2. **Start the services**:
   ```bash
   cd infra/docker
   ./start-all.ps1 -Environment dev
   ```

3. **Check system health**:
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:9000/health
   ```

## 🔐 Password Generation

Generate strong passwords with:

### PowerShell
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### Linux/Mac
```bash
openssl rand -base64 32
```

### Online (last resort)
https://passwordsgenerator.net/ (32 characters, all character types)

## 📝 Secret Values Template

Copy this template and fill in your values:

```bash
# === REQUIRED SECRETS ===
POSTGRES_PASSWORD=___________
REDIS_PASSWORD=___________
FALKORDB_PASSWORD=___________
ANTHROPIC_API_KEY=sk-ant-___________
OPENROUTER_API_KEY=sk-or-___________
LETTA_SERVER_PASSWORD=___________
LETTA_DB_PASSWORD=___________

# === OPTIONAL: GITHUB ===
GITHUB_TOKEN=ghp____________
GITHUB_OWNER=___________

# === OPTIONAL: TWILIO ===
TWILIO_ACCOUNT_SID=AC___________
TWILIO_AUTH_TOKEN=___________
TWILIO_PHONE_NUMBER=+1___________

# === OPTIONAL: EMAIL ===
SENDGRID_API_KEY=SG.___________
```

## 🎓 Setup Scripts Available

### Interactive PowerShell (Full)
```powershell
cd infra/infisical
.\set-all-secrets.ps1 -Environment dev
```

### Bash Script (Minimal)
```bash
cd infra/infisical
chmod +x set-minimal-secrets.sh
./set-minimal-secrets.sh dev
```

### Manual Commands
See: `docs/deployment/INFISICAL-SECRETS-REFERENCE.md`

## ✨ Pro Tips

1. **Different passwords** for each service
2. **32+ character** random passwords
3. **Never commit** secrets to git
4. **Different secrets** for dev/staging/prod
5. **Rotate secrets** every 90 days
6. **Use Machine Identity** for CI/CD
7. **Enable MFA** on Infisical account

---

**Need Help?** See `docs/deployment/QUICK-START.md` or `docs/deployment/INFISICAL-SECRETS-REFERENCE.md`
