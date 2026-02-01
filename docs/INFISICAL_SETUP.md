# Infisical Setup Guide - Project Nyra

## Current Issue: Export Command Hanging

**Symptom**: Running `infisical export` hangs in PowerShell
**Root Cause**: Not logged in to Infisical
**Solution**: Login from WSL/Ubuntu terminal (see below)

## Quick Fix

### Option 1: Interactive Login (Ubuntu/WSL Terminal)

```bash
# Open Ubuntu/WSL terminal (NOT PowerShell)
cd ~/projects/project-nyra

# Login interactively
infisical login --interactive

# After successful login, run export
./scripts/infisical-export.sh dev /shared .env
```

### Option 2: Universal Auth (Recommended for CI/CD)

1. **Create a Universal Auth Identity in Infisical Dashboard:**
   - Go to https://app.infisical.com
   - Navigate to your project: "Project Nyra"
   - Go to Settings → Access Control → Machine Identities
   - Click "Create Identity"
   - Choose "Universal Auth"
   - Copy the `Client ID` and `Client Secret`

2. **Store credentials securely:**

```bash
# Add to your .bashrc or .zshrc (already in your .env)
export INFISICAL_CLIENT_ID="your-client-id"
export INFISICAL_CLIENT_SECRET="your-client-secret"

# Reload shell
source ~/.zshrc
```

3. **Login with Universal Auth:**

```bash
infisical login \
  --method=universal-auth \
  --client-id="$INFISICAL_CLIENT_ID" \
  --client-secret="$INFISICAL_CLIENT_SECRET"
```

4. **Export secrets:**

```bash
./scripts/infisical-export.sh dev /shared .env
```

## Why PowerShell Hangs

PowerShell on Windows cannot properly display the interactive authentication prompt that Infisical tries to show. This causes the command to appear "hung" even though Infisical is waiting for input.

**Always use WSL/Ubuntu terminal for Infisical commands.**

## Helper Script Usage

We've created a helper script at `scripts/infisical-export.sh`:

```bash
# Basic usage (exports dev environment, /shared path, to .env)
./scripts/infisical-export.sh

# Custom environment
./scripts/infisical-export.sh prod /shared .env.production

# Custom path and output
./scripts/infisical-export.sh staging /api .env.staging
```

## Troubleshooting

### "Not logged in" error

```bash
# Check login status
infisical login 2>&1 | grep -i "logged"

# Login again
infisical login --interactive
```

### "Invalid token" or authentication errors

```bash
# Clear credentials and re-login
rm -rf ~/.config/infisical
infisical login --interactive
```

### Cannot find secrets

```bash
# Verify project configuration
cat .infisical.json

# Should show:
# {
#   "workspaceId": "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
#   ...
# }
```

## Environment Structure

Project Nyra uses this Infisical structure:

```
Project: project-nyra (8374cea9-e5e8-4050-bda4-b91f25ab30ef)
├── dev/
│   ├── /shared          # Shared secrets across services
│   ├── /web             # Frontend secrets
│   └── /services        # Backend secrets
├── staging/
│   └── ...
└── prod/
    └── ...
```

## Best Practices

1. **Never commit `.env` files** - they contain secrets
2. **Use machine identities for CI/CD** - don't use personal credentials
3. **Rotate tokens regularly** - especially in production
4. **Use path-based organization** - separate concerns by path
5. **Always run from WSL** - avoid PowerShell for Infisical commands

## Git Credential Manager Setup

Git credential manager is now configured. When you push:

```bash
git push origin main
# Enter your GitHub username
# Enter your Personal Access Token (not password)
# Credentials will be saved for future use
```

Create a token at: https://github.com/settings/tokens

## Next Steps

1. Login to Infisical: `infisical login --interactive`
2. Export secrets: `./scripts/infisical-export.sh`
3. Verify .env was created: `ls -la .env`
4. Test with: `source .env && echo $ANTHROPIC_API_KEY`

---

**Last Updated**: 2026-01-25
