# Infisical Export Methodology for Project Nyra

**Purpose**: Complete guide to exporting, documenting, and managing Infisical secrets across the 4-PC distributed architecture

**Last Updated**: 2026-01-16
**Applies To**: Orchestrator + 3 Worker PCs

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Export Methods](#export-methods)
3. [Folder Structure](#folder-structure)
4. [Authentication](#authentication)
5. [Complete Export Workflow](#complete-export-workflow)
6. [Secret Documentation](#secret-documentation)
7. [Automated Scripts](#automated-scripts)
8. [Best Practices](#best-practices)

---

## Overview

Project Nyra uses **Infisical** for centralized secrets management across 4 PCs:
- **Orchestrator** (192.168.1.101) - All services + MCP servers
- **Worker 1** (192.168.1.102) - RTX 3060
- **Worker 2** (192.168.1.103) - RTX 5090
- **Worker 3** (192.168.1.104) - RTX 3090 Ti

**Available Interfaces**:
- **Infisical CLI** - Command-line management
- **Infisical SDK** - Programmatic access (Node.js/Python/Go)
- **Infisical MCP** - 9 tools via Model Context Protocol (port 8006)
- **Infisical Web** - Dashboard at https://app.infisical.com

---

## Export Methods

### Method 1: CLI Export (Recommended)

**Full JSON Export with Folder Structure**:
```bash
infisical export \
  --env=production \
  --path=/nyra \
  --recursive \
  --format=json \
  --output-file=secrets-export.json
```

**Output Formats**:
- `json` - Structured data with metadata
- `yaml` - Human-readable configuration
- `dotenv` - `.env` file format
- `csv` - Spreadsheet compatible

**Key Flags**:
- `--recursive` - Include all subfolders
- `--path` - Start from specific folder path
- `--env` - Target environment (dev/staging/production)
- `--tags` - Filter by tags (e.g., `--tags=database,api`)
- `--silent` - Suppress CLI output (for scripts)

**Export Specific PC Secrets**:
```bash
# Orchestrator
infisical export --env=production --path=/nyra/orchestrator --format=json

# Worker 1
infisical export --env=production --path=/nyra/worker-1 --format=json

# Worker 2
infisical export --env=production --path=/nyra/worker-2 --format=json

# Worker 3
infisical export --env=production --path=/nyra/worker-3 --format=json
```

### Method 2: CLI Listing (Structure Only)

**List Secrets with Metadata**:
```bash
infisical secrets \
  --env=production \
  --path=/nyra \
  --recursive
```

**Output Shows**:
- Secret keys (names)
- Folder paths
- Last updated timestamps
- Tags
- Comments/descriptions

### Method 3: SDK Programmatic Export

**Node.js Example**:
```javascript
const { InfisicalClient } = require("@infisical/sdk");

const client = new InfisicalClient({
  auth: {
    universalAuth: {
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    }
  },
  cacheTTL: 600 // 10 minutes
});

// Export all secrets from a path
async function exportSecrets(environment, path) {
  const secrets = await client.listSecrets({
    environment: environment,
    projectId: process.env.INFISICAL_PROJECT_ID,
    path: path,
    recursive: true,
    includeImports: true
  });

  return secrets;
}

// Export all environments
async function exportAllEnvironments() {
  const environments = ["dev", "staging", "production"];
  const allSecrets = {};

  for (const env of environments) {
    allSecrets[env] = await exportSecrets(env, "/nyra");
  }

  return allSecrets;
}
```

### Method 4: MCP Natural Language

Using Infisical MCP server (already configured in `docker-compose.infisical.yml`):

**Via Claude Desktop/Code**:
```
"List all secrets in the production environment under /nyra/orchestrator"
"Get the PostgreSQL password from production secrets"
"Show all API keys in the shared secrets folder"
```

**Available MCP Tools**:
1. `list-secrets` - List secrets with filtering
2. `get-secret` - Retrieve specific secret value
3. `create-secret` - Add new secret
4. `update-secret` - Modify existing secret
5. `delete-secret` - Remove secret
6. `create-folder` - Organize secrets
7. `create-environment` - Manage environments
8. `create-project` - Project management
9. `invite-members-to-project` - Access control

---

## Folder Structure

### Recommended Organization

```
/nyra/
├── shared/                    # Secrets used by all PCs
│   ├── api-keys/
│   │   ├── ANTHROPIC_API_KEY
│   │   ├── GOOGLE_AI_API_KEY
│   │   ├── EXA_API_KEY
│   │   └── OPENROUTER_API_KEY
│   ├── databases/
│   │   ├── POSTGRES_PASSWORD
│   │   ├── REDIS_PASSWORD
│   │   └── CHROMA_TOKEN
│   └── services/
│       ├── GITHUB_TOKEN
│       └── TWILIO_ACCOUNT_SID
│
├── orchestrator/              # Orchestrator-specific (PC1)
│   ├── network/
│   │   ├── STATIC_IP=192.168.1.101
│   │   ├── MAC_ADDRESS
│   │   └── GATEWAY=192.168.1.1
│   ├── tailscale/
│   │   └── TAILSCALE_AUTH_KEY
│   ├── cloudflared/
│   │   └── CLOUDFLARED_TOKEN
│   └── services/
│       ├── GITEA_SECRET_KEY
│       └── N8N_ENCRYPTION_KEY
│
├── worker-1/                  # Worker 1 (RTX 3060) - PC2
│   ├── network/
│   │   ├── STATIC_IP=192.168.1.102
│   │   └── MAC_ADDRESS
│   ├── gpu/
│   │   ├── GPU_TYPE=rtx_3060
│   │   └── VRAM_GB=12
│   └── orchestrator-url/
│       └── ORCHESTRATOR_URL=https://...
│
├── worker-2/                  # Worker 2 (RTX 5090) - PC3
│   ├── network/
│   │   ├── STATIC_IP=192.168.1.103
│   │   └── MAC_ADDRESS
│   ├── gpu/
│   │   ├── GPU_TYPE=rtx_5090
│   │   └── VRAM_GB=32
│   └── orchestrator-url/
│       └── ORCHESTRATOR_URL=https://...
│
└── worker-3/                  # Worker 3 (RTX 3090 Ti) - PC4
    ├── network/
    │   ├── STATIC_IP=192.168.1.104
    │   └── MAC_ADDRESS
    ├── gpu/
    │   ├── GPU_TYPE=rtx_3090ti
    │   └── VRAM_GB=24
    └── orchestrator-url/
        └── ORCHESTRATOR_URL=https://...
```

### Path Naming Rules

- **Allowed**: Alphabets, numbers, dashes
- **Not Allowed**: Spaces, special characters (except `-`)
- **Case Sensitive**: Yes
- **Max Depth**: Unlimited nesting

---

## Authentication

### Option 1: Universal Auth (Recommended for Production)

**Setup**:
1. Go to Project Settings → Access Control → Machine Identities
2. Create new Machine Identity
3. Select "Universal Auth"
4. Generate client credentials

**Use in CLI**:
```bash
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID="your-client-id"
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET="your-client-secret"

infisical login --method=universal-auth \
  --client-id=$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID \
  --client-secret=$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET
```

**Use in SDK**:
```javascript
const client = new InfisicalClient({
  auth: {
    universalAuth: {
      clientId: process.env.INFISICAL_CLIENT_ID,
      clientSecret: process.env.INFISICAL_CLIENT_SECRET
    }
  }
});
```

**Use in Docker**:
```yaml
environment:
  - INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=${INFISICAL_CLIENT_ID}
  - INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
```

### Option 2: Interactive Login (Development)

```bash
infisical login
# Opens browser for authentication
```

### Option 3: Access Token (CI/CD)

```bash
export INFISICAL_TOKEN="your-access-token"
infisical export --format=json
```

---

## Complete Export Workflow

### Step 1: Authenticate

```bash
# Interactive login
infisical login

# Or use Universal Auth
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID="..."
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET="..."
infisical login --method=universal-auth
```

### Step 2: Export Full Structure

```bash
# Create export directory
mkdir -p exports/infisical

# Export production secrets (all PCs)
infisical export \
  --env=production \
  --path=/nyra \
  --recursive \
  --format=json \
  --output-file=exports/infisical/production-full.json

# Export development secrets
infisical export \
  --env=dev \
  --path=/nyra \
  --recursive \
  --format=json \
  --output-file=exports/infisical/dev-full.json
```

### Step 3: Export PC-Specific Secrets

```bash
# Orchestrator
infisical export \
  --env=production \
  --path=/nyra/orchestrator \
  --format=dotenv \
  --output-file=exports/infisical/orchestrator.env

# Worker 1
infisical export \
  --env=production \
  --path=/nyra/worker-1 \
  --format=dotenv \
  --output-file=exports/infisical/worker-1.env

# Worker 2
infisical export \
  --env=production \
  --path=/nyra/worker-2 \
  --format=dotenv \
  --output-file=exports/infisical/worker-2.env

# Worker 3
infisical export \
  --env=production \
  --path=/nyra/worker-3 \
  --format=dotenv \
  --output-file=exports/infisical/worker-3.env
```

### Step 4: Export Shared Secrets

```bash
infisical export \
  --env=production \
  --path=/nyra/shared \
  --format=json \
  --output-file=exports/infisical/shared-secrets.json
```

### Step 5: Generate Documentation

```bash
# List all secrets with metadata
infisical secrets \
  --env=production \
  --path=/nyra \
  --recursive \
  > exports/infisical/secrets-list.txt
```

---

## Secret Documentation

### Template Generation (Hidden Values)

**Bash Script** (`scripts/generate-env-template.sh`):
```bash
#!/bin/bash
# Generate .env.example from Infisical secrets

SECRETS_JSON="exports/infisical/production-full.json"
OUTPUT_FILE=".env.example"

echo "# Project Nyra Environment Variables" > $OUTPUT_FILE
echo "# Generated from Infisical on $(date)" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Parse JSON and create template
jq -r '.[] | "\(.key)=<\(.key | ascii_downcase)>"' $SECRETS_JSON >> $OUTPUT_FILE

echo "Template generated: $OUTPUT_FILE"
```

**PowerShell Script** (`scripts/Generate-EnvTemplate.ps1`):
```powershell
# Generate .env.example from Infisical secrets

$SecretsJson = Get-Content "exports/infisical/production-full.json" | ConvertFrom-Json
$OutputFile = ".env.example"

"# Project Nyra Environment Variables" | Out-File $OutputFile
"# Generated from Infisical on $(Get-Date)" | Add-Content $OutputFile
"" | Add-Content $OutputFile

foreach ($secret in $SecretsJson) {
    "$($secret.key)=<$($secret.key.ToLower())>" | Add-Content $OutputFile
}

Write-Host "Template generated: $OutputFile"
```

### Masked Export (Structure + Hints)

**Node.js Script** (`scripts/export-masked-secrets.js`):
```javascript
const fs = require('fs');

function maskValue(key, value) {
  if (!value) return '<empty>';
  if (value.length <= 4) return '****';

  // Show first 4 and last 4 characters
  const start = value.substring(0, 4);
  const end = value.substring(value.length - 4);
  const masked = '*'.repeat(Math.min(value.length - 8, 20));

  return `${start}${masked}${end} (${value.length} chars)`;
}

function exportMaskedSecrets(inputFile, outputFile) {
  const secrets = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  const masked = secrets.map(secret => ({
    key: secret.key,
    value: maskValue(secret.key, secret.value),
    path: secret.path || '/nyra',
    type: secret.type || 'shared',
    comment: secret.comment || '',
    tags: secret.tags || []
  }));

  fs.writeFileSync(outputFile, JSON.stringify(masked, null, 2));
  console.log(`Masked export created: ${outputFile}`);
}

// Usage
exportMaskedSecrets(
  'exports/infisical/production-full.json',
  'exports/infisical/production-masked.json'
);
```

---

## Automated Scripts

### Full Export Script

**Bash** (`scripts/export-all-secrets.sh`):
```bash
#!/bin/bash
set -euo pipefail

EXPORT_DIR="exports/infisical/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "🔐 Exporting Infisical secrets to $EXPORT_DIR"

# Authenticate
if [ -z "${INFISICAL_TOKEN:-}" ]; then
  echo "Logging in to Infisical..."
  infisical login
fi

# Export production
echo "Exporting production environment..."
infisical export --env=production --path=/nyra --recursive \
  --format=json --output-file="$EXPORT_DIR/production-full.json"

# Export development
echo "Exporting development environment..."
infisical export --env=dev --path=/nyra --recursive \
  --format=json --output-file="$EXPORT_DIR/dev-full.json"

# Export PC-specific
for PC in orchestrator worker-1 worker-2 worker-3; do
  echo "Exporting $PC secrets..."
  infisical export --env=production --path="/nyra/$PC" \
    --format=dotenv --output-file="$EXPORT_DIR/$PC.env"
done

# List all secrets
echo "Generating secrets list..."
infisical secrets --env=production --path=/nyra --recursive \
  > "$EXPORT_DIR/secrets-list.txt"

echo "✅ Export complete: $EXPORT_DIR"
```

**PowerShell** (`scripts/Export-AllSecrets.ps1`):
```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.0

$ErrorActionPreference = "Stop"
$ExportDir = "exports/infisical/$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Force -Path $ExportDir | Out-Null

Write-Host "🔐 Exporting Infisical secrets to $ExportDir" -ForegroundColor Cyan

# Authenticate
if (-not $env:INFISICAL_TOKEN) {
    Write-Host "Logging in to Infisical..." -ForegroundColor Yellow
    infisical login
}

# Export production
Write-Host "Exporting production environment..." -ForegroundColor Yellow
infisical export --env=production --path=/nyra --recursive `
    --format=json --output-file="$ExportDir/production-full.json"

# Export development
Write-Host "Exporting development environment..." -ForegroundColor Yellow
infisical export --env=dev --path=/nyra --recursive `
    --format=json --output-file="$ExportDir/dev-full.json"

# Export PC-specific
$PCs = @("orchestrator", "worker-1", "worker-2", "worker-3")
foreach ($PC in $PCs) {
    Write-Host "Exporting $PC secrets..." -ForegroundColor Yellow
    infisical export --env=production --path="/nyra/$PC" `
        --format=dotenv --output-file="$ExportDir/$PC.env"
}

# List all secrets
Write-Host "Generating secrets list..." -ForegroundColor Yellow
infisical secrets --env=production --path=/nyra --recursive `
    > "$ExportDir/secrets-list.txt"

Write-Host "✅ Export complete: $ExportDir" -ForegroundColor Green
```

---

## Best Practices

### Security

1. **Never Commit Secrets to Git**
   - Add `*.env`, `*secrets*.json` to `.gitignore`
   - Use `.env.example` templates instead

2. **Use Machine Identities**
   - Preferred over service tokens (deprecated)
   - Granular permissions per PC/service
   - Supports IP allowlisting

3. **Rotate Credentials Regularly**
   - API keys: Every 90 days
   - Database passwords: Every 180 days
   - Access tokens: Every 30 days

4. **Implement Least Privilege**
   - Create separate identities per PC
   - Limit folder access per identity
   - Read-only for workers, read-write for orchestrator

5. **Enable Audit Logging**
   - Track all secret access
   - Monitor failed auth attempts
   - Set up alerts for suspicious activity

### Organization

1. **Consistent Naming Convention**
   - Use `SCREAMING_SNAKE_CASE` for all keys
   - Prefix by category: `DB_`, `API_`, `GPU_`
   - Suffix by environment: `_DEV`, `_PROD` (if not using Infisical environments)

2. **Use Folder Hierarchy**
   ```
   /nyra/
     shared/           # All PCs
     orchestrator/     # PC1 only
     worker-1/         # PC2 only
     worker-2/         # PC3 only
     worker-3/         # PC4 only
   ```

3. **Add Comments and Tags**
   - Document secret purpose in comments
   - Use tags: `database`, `api`, `network`, `gpu`
   - Include rotation schedule in comments

4. **Maintain Templates**
   - Update `.env.example` on secret additions
   - Document required vs optional secrets
   - Include value format hints

### Backup

1. **Regular Exports**
   - Automated weekly exports to encrypted storage
   - Version-controlled templates
   - Offline backup in Bitwarden

2. **Export Formats**
   - JSON: Full metadata preservation
   - YAML: Human-readable backups
   - dotenv: Service-ready format

3. **Test Recovery**
   - Quarterly disaster recovery drills
   - Verify export/import procedures
   - Document recovery steps

---

## Related Documentation

- [USER-ACTION-GUIDE.md](./USER-ACTION-GUIDE.md) - Manual setup steps
- [BOOTSTRAP-ORCHESTRATION-PROMPT.md](./BOOTSTRAP-ORCHESTRATION-PROMPT.md) - Full bootstrap spec
- [env-export-best-practices.md](../../docs/research/env-export-best-practices.md) - Research findings
- [Infisical CLI Documentation](https://infisical.com/docs/cli/overview)
- [Infisical SDK Documentation](https://infisical.com/docs/sdks/overview)

---

**Last Updated**: 2026-01-16
**Maintainer**: Project Nyra Team
**Support**: See `bootstrap/docs/USER-ACTION-GUIDE.md` for troubleshooting
