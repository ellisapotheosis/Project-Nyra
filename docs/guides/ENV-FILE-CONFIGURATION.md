# Environment File Configuration Guide
**Date**: 2026-01-25  
**Purpose**: Configure tools to use .env files from `infra/configs/` instead of repo root

---

## 📍 New .env File Locations

After consolidation, .env files are organized in `infra/configs/`:

```
infra/configs/
├── environments/
│   ├── .env.development
│   ├── .env.production
│   ├── .env.ci
│   └── .env.master
├── orchestrator/
│   └── .env.orchestrator
├── workers/
│   ├── .env.worker-3060
│   ├── .env.worker-3090ti
│   └── .env.worker-5090
├── claude-flow/
│   ├── .env.claude-flow
│   ├── .env.dev
│   └── .env.prod
└── [other configs...]
```

**Root .env files (keep these)**:
- `.env` - Active environment (symlink or copy)
- `.env.example` - Template for developers

---

## 🔧 Configuration Options

### Option 1: Symlink (Recommended for Development)

Create a symbolic link in repo root pointing to your active environment:

```powershell
# Development environment
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\environments\.env.development"

# Orchestrator environment
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\orchestrator\.env.orchestrator"
```

**Benefits**:
- ✅ Tools expect .env in root (Claude, Docker, Node apps)
- ✅ Changes to target file automatically reflected
- ✅ No duplication
- ⚠️ Requires admin privileges on Windows

**To switch environments**:
```powershell
# Switch to production
Remove-Item .env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\environments\.env.production"
```

---

### Option 2: Environment Variables

Set environment variables to point to config files:

```powershell
# Set for current session
$env:NYRA_ENV_PATH = "C:\Dev\Projects\Repos\Project-Nyra\infra\configs\environments\.env.development"
$env:CLAUDE_FLOW_ENV = "C:\Dev\Projects\Repos\Project-Nyra\infra\configs\claude-flow\.env.dev"
$env:DOTENV_CONFIG_PATH = "infra\configs\environments\.env.development"

# Make permanent (add to PowerShell profile)
notepad $PROFILE
# Add these lines:
# $env:NYRA_ENV_PATH = "C:\Dev\Projects\Repos\Project-Nyra\infra\configs\environments\.env.development"
# $env:CLAUDE_FLOW_ENV = "C:\Dev\Projects\Repos\Project-Nyra\infra\configs\claude-flow\.env.dev"
```

**Update your code to read these**:
```javascript
// In Node.js
const envPath = process.env.NYRA_ENV_PATH || '.env';
require('dotenv').config({ path: envPath });
```

---

### Option 3: dotenv-cli (Recommended for Scripts)

Install dotenv-cli to load env files from any location:

```powershell
# Install globally or in project
pnpm add -D dotenv-cli
```

**Update package.json scripts**:
```json
{
  "scripts": {
    "dev": "dotenv -e infra/configs/environments/.env.development -- turbo dev",
    "dev:orchestrator": "dotenv -e infra/configs/orchestrator/.env.orchestrator -- pnpm dev",
    "dev:worker-3060": "dotenv -e infra/configs/workers/.env.worker-3060 -- pnpm dev",
    "build": "dotenv -e infra/configs/environments/.env.production -- turbo build",
    "claude-flow": "dotenv -e infra/configs/claude-flow/.env.dev -- npx claude-flow"
  }
}
```

**Run commands with custom env**:
```powershell
pnpm dotenv -e infra/configs/environments/.env.development -- node server.js
```

---

### Option 4: Docker Compose env_file

Update `docker-compose.yml` to point to new locations:

```yaml
services:
  app:
    env_file:
      - ./infra/configs/environments/.env.development
      - ./infra/configs/orchestrator/.env.orchestrator
```

---

### Option 5: Copy on Demand (CI/CD)

For CI/CD or temporary setups, copy the env file to root:

```powershell
# Development
Copy-Item infra\configs\environments\.env.development .env -Force

# Production
Copy-Item infra\configs\environments\.env.production .env -Force
```

**Add to .gitignore** (already done):
```
.env
```

---

## 🤖 Tool-Specific Configuration

### Claude Code / Warp AI

Claude typically reads `.env` from repo root. Use **Option 1 (Symlink)** or **Option 5 (Copy)**:

```powershell
# Create symlink to development env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\environments\.env.development"
```

### Claude Flow

Claude Flow can be configured via `infra/configs/claude-flow/claude-flow.config.json`:

```json
{
  "envFile": "../environments/.env.development",
  "envFiles": [
    "../environments/.env.development",
    "../claude-flow/.env.dev"
  ]
}
```

Or use environment variable:
```powershell
$env:CLAUDE_FLOW_ENV = "infra\configs\claude-flow\.env.dev"
```

### Infisical MCP

Infisical pulls from cloud, but for local override:

```json
// .mcp.json
{
  "mcpServers": {
    "infisical": {
      "command": "docker",
      "args": ["..."],
      "env": {
        "INFISICAL_ENV_PATH": "infra/configs/environments/.env.development"
      }
    }
  }
}
```

### Node.js Applications

Update your app's dotenv loading:

```javascript
// Load from custom path
require('dotenv').config({ 
  path: process.env.DOTENV_CONFIG_PATH || 'infra/configs/environments/.env.development' 
});
```

Or use dotenv-cli in package.json (see Option 3 above).

### Next.js Applications

Next.js looks for `.env.local`, `.env.development`, etc. in root. Options:

1. **Symlink** (Option 1)
2. **Copy to root** with npm script:
   ```json
   {
     "scripts": {
       "predev": "cp infra/configs/environments/.env.development .env.local",
       "dev": "next dev"
     }
   }
   ```

### Turborepo

Turborepo reads `.env` from package root by default. Use symlinks or:

```json
// turbo.json
{
  "globalEnv": [
    "DOTENV_CONFIG_PATH=infra/configs/environments/.env.development"
  ]
}
```

---

## 🎯 Recommended Setup by PC

### Orchestrator PC (Minisforum UH680)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra

# Create symlink to orchestrator env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\orchestrator\.env.orchestrator" -Force

# Verify
Get-Content .env | Select-String "ORCHESTRATOR"
```

### Worker PC - RTX 3060 (M15R7 Laptop)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra

# Create symlink to worker-3060 env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\workers\.env.worker-3060" -Force

# Verify
Get-Content .env | Select-String "WORKER.*3060"
```

### Worker PC - RTX 3090Ti (Desktop)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra

# Create symlink to worker-3090ti env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\workers\.env.worker-3090ti" -Force
```

### Worker PC - RTX 5090 (Area-51 Laptop)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra

# Create symlink to worker-5090 env
New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\workers\.env.worker-5090" -Force
```

---

## 🔐 Infisical Integration

For production, use Infisical to sync secrets:

```powershell
# Export from Infisical to local env file
infisical export --env=dev --format=dotenv > infra\configs\environments\.env.development

# Import from local env file to Infisical
infisical import --env=dev infra\configs\environments\.env.development
```

**Update .mcp.json to use Infisical**:
```json
{
  "mcpServers": {
    "infisical": {
      "command": "docker",
      "args": [
        "run", "--rm",
        "-e", "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID",
        "-e", "INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET",
        "ghcr.io/infisical/mcp-infisical:latest"
      ]
    }
  }
}
```

---

## ✅ Verification Checklist

After setting up env files, verify:

```powershell
# 1. Check symlink exists (if using Option 1)
Get-Item .env | Select-Object LinkType, Target

# 2. Verify file loads correctly
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV)"

# 3. Test Docker Compose
docker-compose config

# 4. Test Turborepo
pnpm turbo run build --dry-run

# 5. Test Claude Flow
npx claude-flow status
```

---

## 🚨 Troubleshooting

### Symlink Permission Denied
Run PowerShell as Administrator or enable Developer Mode:
```
Settings > Update & Security > For Developers > Developer Mode: ON
```

### Docker Can't Find .env
Use absolute path in docker-compose.yml:
```yaml
env_file:
  - C:/Dev/Projects/Repos/Project-Nyra/infra/configs/environments/.env.development
```

### Node App Can't Load .env
Explicitly set path:
```javascript
require('dotenv').config({ path: 'infra/configs/environments/.env.development' });
```

### Claude Flow Not Reading Custom Env
Set environment variable:
```powershell
$env:CLAUDE_FLOW_CONFIG = "infra\configs\claude-flow\claude-flow.config.json"
```

---

## 📋 Quick Reference

| Tool | Recommended Option | Command |
|------|-------------------|---------|
| Claude Code | Symlink | `New-Item -ItemType SymbolicLink -Path ".env" -Target "infra\configs\environments\.env.development"` |
| Claude Flow | Config File | Set `envFile` in `claude-flow.config.json` |
| Docker Compose | env_file | `env_file: - ./infra/configs/environments/.env.development` |
| Node Scripts | dotenv-cli | `dotenv -e infra/configs/environments/.env.development -- node app.js` |
| Turborepo | Symlink or globalEnv | Symlink `.env` or set in `turbo.json` |
| Next.js | Copy Script | `cp infra/configs/environments/.env.development .env.local` |
| Infisical | Import/Export | `infisical export --env=dev --format=dotenv > .env` |

---

## 🎯 Current Setup Status

**Root directory (after consolidation)**:
- ✅ `.env.example` - Template (keep in version control)
- ⚠️ `.env` - Active environment (create symlink or copy, NOT in version control)

**Organized configs**:
- ✅ `infra/configs/environments/` - Environment-specific configs
- ✅ `infra/configs/orchestrator/` - Orchestrator PC config
- ✅ `infra/configs/workers/` - Worker PC configs (3060, 3090Ti, 5090)
- ✅ `infra/configs/claude-flow/` - Claude Flow configs

**Next step**: Choose your option (1-5) and configure accordingly!
