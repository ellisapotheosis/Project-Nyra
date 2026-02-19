# BOOTSTRAP.ENV GUIDE

## What This File Is

\ootstrap.env\ is a **comprehensive, production-ready environment variable template** that contains:
- All variables needed to bootstrap project-nyra
- Clear categorization of requirements (REQUIRED, OPTIONAL, SECRET)
- Suggested Infisical folder structure
- Default values where applicable
- Inline documentation

**250 lines | 7.8 KB | 100+ variables**

---

## How to Use It

### Step 1: Review the File
\\\ash
cat bootstrap.env
\\\

### Step 2: Understand the Sections

#### [BOOTSTRAP] - Set automatically by installer
- PC_NAME, PC_ROLE, PC_TYPE
- LAN_IP, NODE_ENV, LOG_LEVEL
- **These are overwritten by the bootstrap installer**

#### [REQUIRED] - Must configure before deployment
- Database URLs and credentials
- API keys (OpenAI, Anthropic, etc.)
- Network config (Cloudflare, Tailscale)
- Service credentials (Dify, n8n, etc.)
- **Do not deploy without these**

#### [OPTIONAL] - Can use defaults
- Claude-Flow settings
- GPU/inference configuration
- Monitoring and observability
- Application port settings
- **Safe to leave empty or use defaults**

#### [SECRET] - Store in Infisical (NOT git)
- JWT_SECRET
- SESSION_SECRET
- ENCRYPTION_KEY
- **NEVER commit these to git**

#### [SERVICE] - Docker/CI settings
- COMPOSE_PROJECT_NAME
- CI flags
- GitHub tokens
- **Used by automation**

### Step 3: Gather Your Values

For each REQUIRED variable:

1. **API Keys** - Get from your service provider:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com
   - Google: Google Cloud Console
   - etc.

2. **Database** - Set based on your infrastructure:
   - If using Docker: postgres:5432, redis:6379
   - If self-hosted: Your actual connection strings

3. **Network** - Configure for your setup:
   - Cloudflare tunnel ID from tunnel config
   - Tailscale auth key from account
   - Domain and email for certificates

4. **Services** - Each service (Dify, n8n, etc.) has its own:
   - API endpoint URL
   - Authentication key/token
   - Port numbers

### Step 4: Update Your Values

**Option A: Direct Edit**
\\\ash
# Edit locally
nano bootstrap.env
# Fill in all REQUIRED values
# Keep OPTIONAL empty for now
# Add SECRETS to Infisical (don't keep in .env)
\\\

**Option B: Using Infisical**
\\\ash
# Get values from Infisical
infisical secrets list --path /shared
infisical secrets list --path /machines/orchestrator

# Copy to bootstrap.env
# Only put non-secrets in .env
\\\

### Step 5: Migrate Secrets to Infisical

**Use the suggested structure in the file:**

\\\
/shared/
  api-keys/
    openai/
      key: OPENAI_API_KEY
      org_id: OPENAI_ORG_ID
    anthropic/
      key: ANTHROPIC_API_KEY
  database/
    postgres/
      url: DATABASE_URL
      user: POSTGRES_USER
      password: POSTGRES_PASSWORD
  cloudflare/
    tunnel/
      id: CLOUDFLARE_TUNNEL_ID
      token: CLOUDFLARE_TOKEN
  security/
    jwt_secret: JWT_SECRET
    session_secret: SESSION_SECRET
    encryption_key: ENCRYPTION_KEY

/machines/
  orchestrator/
    credentials/
      all-secrets-here
  worker-rtx3060/
    credentials/
      gpu-specific-secrets
\\\

### Step 6: Use When Bootstrapping

`ash
# Option 1: Copy to .env
cp bootstrap.env .env
# Edit .env with your actual values
# Run bootstrap

# Option 2: Use with bootstrap installer
# The installer will merge bootstrap.env with existing .env

# Option 3: Use for reference
# Keep as template, build your real .env from scratch
`

---

## Key Points

✅ **Do Review Everything**
- Each variable has a purpose
- Not all are used in every setup
- Some are optional but useful

✅ **Security**
- NEVER commit secrets to git
- Use Infisical for sensitive values
- [SECRET] section is for you to move

✅ **Flexibility**
- Leave OPTIONAL blank if not needed
- Services can work with defaults
- Customize as your setup evolves

✅ **Reference**
- Keep this file as documentation
- Shows all possible configuration options
- Update as you add new services

---

## Quick Configuration Checklist

### For Orchestrator PC:
- [ ] Review [BOOTSTRAP] section (pre-filled by installer)
- [ ] Fill in [REQUIRED] Database section
- [ ] Add API keys (OpenAI, Anthropic, etc.)
- [ ] Configure Cloudflare tunnel
- [ ] Add Tailscale auth key
- [ ] Set service URLs (Dify, n8n, etc.)
- [ ] Move all secrets to Infisical
- [ ] Use merged .env for bootstrap

### For Worker PCs:
- [ ] Review [BOOTSTRAP] section (pre-filled by installer)
- [ ] Configure GPU settings (Ollama, vLLM)
- [ ] Set Redis connection (points to orchestrator)
- [ ] Optional: Monitoring/observability
- [ ] Use merged .env for bootstrap

---

## Common Patterns

### Database Only (Minimal)
`nv
DATABASE_URL=postgresql://localhost/nyra
REDIS_URL=redis://localhost:6379/0
PC_NAME=orchestrator
PC_ROLE=orchestrator
`

### Full Stack (All Services)
`nv
[use all values from bootstrap.env]
[fill in all REQUIRED sections]
[move secrets to Infisical]
`

### GPU Worker (Inference Only)
`nv
OLLAMA_BASE_URL=http://orchestrator:11434
REDIS_URL=redis://orchestrator:6379/0
GPU_DEVICE=cuda
PC_NAME=worker-rtx3090ti
PC_ROLE=worker
`

---

## Troubleshooting

**Q: "Missing required variable X"**
A: Check [REQUIRED] section, make sure it's filled

**Q: "Service can't connect"**
A: Verify URLs/hostnames are reachable from all services

**Q: "Secret exposed"**
A: Move to Infisical, update .env to reference it

**Q: "Port already in use"**
A: Change port in [OPTIONAL] APPLICATION SETTINGS

---

## File Location

**Keep bootstrap.env at project root:**
\\\
project-nyra/
  bootstrap.env          ← Your template (commit to git)
  .env                   ← Your actual values (in .gitignore)
  .env.example           ← Old example (deprecated, use bootstrap.env)
\\\

---

## Next Steps

1. ✅ Review bootstrap.env
2. ⏳ Gather your API keys and credentials
3. ⏳ Configure your infrastructure details
4. ⏳ Set up Infisical secrets
5. ⏳ Create your actual .env from bootstrap.env
6. ⏳ Run bootstrap installer

