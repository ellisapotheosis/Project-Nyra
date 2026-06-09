# Infisical Migration Scripts

PowerShell scripts for migrating Project Nyra secrets to Infisical.

## 📁 Scripts Overview

| Script                            | Description                             | Usage                   |
| --------------------------------- | --------------------------------------- | ----------------------- |
| `upload-all-secrets.ps1`          | **Master script** - Uploads all secrets | Primary entry point     |
| `upload-shared-secrets.ps1`       | Uploads shared secrets (API keys)       | Called by master script |
| `upload-orchestrator-secrets.ps1` | Uploads PC1 orchestrator secrets        | Called by master script |
| `upload-worker-secrets.ps1`       | Uploads PC2/PC3/PC4 worker secrets      | Called by master script |

## 🚀 Quick Start

### Prerequisites

1. Install Infisical CLI:

```powershell
npm install -g @infisical/cli
```

2. Login to Infisical:

```powershell
infisical login
```

3. Create project (if not exists):

```powershell
infisical projects create --name "project-nyra"
```

### Run Migration

```powershell
# Navigate to scripts directory
cd C:\Dev\Projects\Repos\Project-Nyra\scripts\infisical

# Load environment variables
Get-Content ..\..\..\.env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$' -and -not $_.StartsWith('#')) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

# Dry run (preview only)
.\upload-all-secrets.ps1 -Environment development -DryRun

# Actual upload
.\upload-all-secrets.ps1 -Environment development
```

## 📊 What Gets Uploaded

### Shared Secrets (/shared)

- API keys (Anthropic, Google, OpenRouter, GitHub)
- Domain configuration
- Environment variables

### Orchestrator Secrets (/orchestrator/\*)

- Database passwords (PostgreSQL, Redis, FalkorDB)
- Service encryption keys (n8n, OpenClaw UI, TwentyCRM, Letta)
- Admin credentials
- Communication secrets (Twilio, SMTP)
- Business service configs
- MCP server ports

### Worker Secrets

- **PC2 RTX 3060** (/worker-rtx3060): Ollama configuration
- **PC3 RTX 5090** (/worker-rtx5090): vLLM + LMCache settings
- **PC4 RTX 3090 Ti** (/worker-rtx3090ti): vLLM + LMCache settings

## 🔒 Security Notes

- Scripts automatically mask sensitive values in output
- Generated secrets use cryptographically secure random values
- Failed uploads are reported but don't block other uploads
- Dry run mode available for validation

## 📖 Next Steps After Upload

1. **Verify in Infisical Dashboard**:
   - Login to Infisical web console
   - Check project "project-nyra"
   - Verify all paths have correct secrets

2. **Configure Access Control**:

```powershell
# Grant worker read-only access to /shared
infisical access grant worker@ratehunter.com --role viewer --path /shared

# Grant orchestrator admin full access
infisical access grant admin@ratehunter.com --role admin --path /orchestrator
```

3. **Update Docker Compose Files**:

```powershell
# PC1 (Orchestrator)
infisical run --token="$INFISICAL_TOKEN" --projectId="$INFISICAL_PROJECT_ID" --env=production --path=/shared --path=/orchestrator -- docker-compose -f docker-compose.orchestrator.yml up -d

# PC2 (RTX 3060)
infisical run --token="$INFISICAL_TOKEN" --projectId="$INFISICAL_PROJECT_ID" --env=production --path=/shared --path=/worker-rtx3060 -- docker-compose -f docker-compose.worker-rtx3060.yml up -d

# PC3 (RTX 5090)
infisical run --token="$INFISICAL_TOKEN" --projectId="$INFISICAL_PROJECT_ID" --env=production --path=/shared --path=/worker-rtx5090 -- docker-compose -f docker-compose.worker-rtx5090.yml up -d

# PC4 (RTX 3090 Ti)
infisical run --token="$INFISICAL_TOKEN" --projectId="$INFISICAL_PROJECT_ID" --env=production --path=/shared --path=/worker-rtx3090ti -- docker-compose -f docker-compose.worker-rtx3090ti.yml up -d
```

4. **Test Secret Retrieval**:

```powershell
# List shared secrets
infisical secrets --path /shared --env development

# Get specific secret
infisical secrets get ANTHROPIC_API_KEY --token "$INFISICAL_TOKEN" --projectId "$INFISICAL_PROJECT_ID" --path /shared --env development

# Export to .env format
infisical secrets --path /shared --env development --format dotenv > .env.shared
```

## 🛠️ Troubleshooting

### Error: "Infisical token not found"

```powershell
# Re-login
infisical login
```

### Error: "Secret already exists"

```powershell
# Update existing secret
infisical secrets set MY_SECRET "new-value" --token "$INFISICAL_TOKEN" --projectId "$INFISICAL_PROJECT_ID" --path /shared --env development
```

### Error: "Permission denied"

```powershell
# Check your access level
infisical user me

# Request access from admin
```

### Error: "Environment variable not set"

Make sure you loaded .env file before running scripts:

```powershell
Get-Content ..\..\..\.env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$' -and -not $_.StartsWith('#')) {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
```

## 📚 Related Documentation

- [INFISICAL-STRUCTURE.md](../../configs/env/INFISICAL-STRUCTURE.md) - Complete hierarchy and access control
- [ENVIRONMENT_VARIABLES.md](../../docs/environment/ENVIRONMENT_VARIABLES.md) - Variable reference
- [4PC-DISTRIBUTED-ARCHITECTURE.md](../../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - System architecture

---

**Last Updated**: 2026-01-18
**Maintained By**: Security-Architect Agent
