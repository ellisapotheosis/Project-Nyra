# Infisical Migration Quick Start Guide

**Generated:** 2026-01-22
**Purpose:** Organize 397 secrets from `/shared` into structured paths

## 📋 Pre-Flight Checklist

Before starting the migration, ensure:

- [ ] Infisical CLI installed (`infisical --version`)
- [ ] Environment variable `INFISICAL_ACCESS_TOKEN` is set
- [ ] You have admin access to project `apotheosis` (ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`)
- [ ] PowerShell 5.1+ or PowerShell Core 7+
- [ ] Backup of current `/shared` secrets (already have: `.env` file)

## 🚀 Migration Steps

### Step 1: Review the Migration Plan

Read the comprehensive analysis:
```powershell
code migration\MIGRATION-REPORT.md
```

**Key findings:**
- 397 variables categorized into 65+ paths
- 7 duplicates found (including different `GOOGLE_API_KEY` values!)
- Organized into providers, machines, databases, clients, services, config, security, monitoring, workflows

### Step 2: Test Folder Creation (Dry Run)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infisical-path-plan-kit\migration
.\create-folders.ps1 -DryRun
```

### Step 3: Create Folder Structure

```powershell
.\create-folders.ps1
```

This creates 65+ folders organized hierarchically.

**Expected output:**
- ✓ Created: ~65 folders
- ⊘ Skipped: ~17 (already exist like /providers, /machines, /clients)
- ✗ Failed: 0

### Step 4: Test Migration (Dry Run)

```powershell
.\migrate-secrets.ps1 -DryRun
```

Review the categorization output. This shows:
- Which secrets go to which paths
- Any uncategorized variables
- Total count per path

### Step 5: Execute Migration

```powershell
.\migrate-secrets.ps1
```

When prompted:
```
Proceed with migration? (yes/no)
```
Type `yes` and press Enter.

**This will:**
- Move all 397 secrets to organized paths
- Skip secrets with empty values
- Report success/failure for each secret

**Expected duration:** 5-10 minutes (depends on API rate limits)

### Step 6: Handle Duplicates

**Critical:** You have duplicate `GOOGLE_API_KEY` with **different values**:
- Line 192: `AIzaSyB9whIHRcycHdGKr8tFuKe5KAVGm6cDAqs`
- Line 208: `AIzaSyAGoltxkY3Ef8XSq7Pr-8fZsoBPz_gz6ZE`

**Action required:**
1. Determine which key is correct (test both in Google API Console)
2. Delete the incorrect one from Infisical:
   ```powershell
   infisical secrets delete "GOOGLE_API_KEY" --path="/providers/google" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN"
   ```
3. Set the correct one:
   ```powershell
   infisical secrets set "GOOGLE_API_KEY" "correct_key_here" --path="/providers/google" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN"
   ```

**Other duplicates to consolidate:**
- `ANTHROPIC_API_KEY` vs `CLAUDE_API_KEY` (same value, keep both for compatibility)
- GitHub tokens (7 different PATs - review and consolidate)
- Docker Hub credentials (multiple entries)
- `INFISICAL_ACCESS_TOKEN` vs `INFISICAL_TOKEN` (same value)

### Step 7: Set Up Imports in /shared

After organizing secrets into specific paths, configure `/shared` to import from all paths:

**Option A: Manual (Infisical Dashboard)**
1. Go to https://app.infisical.com/
2. Navigate to project `apotheosis` → Environment `dev` → Folder `/shared`
3. Click "Import Secrets" for each path:
   - `/providers/*`
   - `/machines/*`
   - `/databases/*`
   - `/clients/*`
   - `/services/*`
   - `/config/*`
   - `/security/*`
   - `/monitoring/*`
   - `/workflows/*`

**Option B: CLI (if supported in your Infisical version)**
```powershell
# This command may vary based on Infisical CLI version
infisical secrets import --from="/providers/anthropic" --to="/shared" --env="dev" --projectId="..."
```

### Step 8: Generate Per-Machine Configs

Export machine-specific `.env` files:

**For Orchestrator (Area51 mini):**
```powershell
infisical export --path="/shared" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv > .env.orchestrator
infisical export --path="/machines/orchestrator-mini" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv >> .env.orchestrator
```

**For Worker PC2 (RTX 3060):**
```powershell
infisical export --path="/shared" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv > .env.worker-rtx3060
infisical export --path="/machines/worker-rtx3060" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv >> .env.worker-rtx3060
```

**For Worker PC3 (RTX 5090):**
```powershell
infisical export --path="/shared" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv > .env.worker-rtx5090
infisical export --path="/machines/worker-rtx5090" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv >> .env.worker-rtx5090
```

**For Worker PC4 (RTX 3090 Ti):**
```powershell
infisical export --path="/shared" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv > .env.worker-rtx3090ti
infisical export --path="/machines/worker-rtx3090ti" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --format=dotenv >> .env.worker-rtx3090ti
```

### Step 9: Validate

Test that services can access their secrets:

**Test Anthropic API:**
```powershell
$anthKey = infisical secrets get "ANTHROPIC_API_KEY" --path="/providers/anthropic" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --plain
curl -H "x-api-key: $anthKey" https://api.anthropic.com/v1/messages
```

**Test Database Connection:**
```powershell
$pgPass = infisical secrets get "POSTGRES_PASSWORD" --path="/databases/postgres" --env="dev" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --token="$env:INFISICAL_ACCESS_TOKEN" --plain
# Use $pgPass to test postgres connection
```

**Test Each Service:**
- Claude Flow
- Nexus Router
- Archon OS
- AgentDB
- Each database
- Each GPU worker

### Step 10: Clean Up

After validation:

1. **Remove old /shared secrets** (optional, for clean slate):
   ```powershell
   # ⚠️ DANGER: Only do this after confirming imports work!
   # infisical secrets delete --path="/shared" --all
   ```

2. **Update documentation**:
   - Update README with new secret paths
   - Update deployment guides
   - Update developer onboarding docs

3. **Update CI/CD**:
   - Update GitHub Actions to use new paths
   - Update Docker Compose `.env` references
   - Update deployment scripts

## 📊 Migration Results

After completing the migration, you should have:

✅ **65+ organized folders** in Infisical
✅ **397 secrets** categorized by function
✅ **Per-machine configs** for 4 PCs
✅ **Import structure** in `/shared` for easy aggregation
✅ **Clean separation** of concerns (providers, machines, services, config, security)
✅ **Duplicate resolution** plan

## 🔧 Troubleshooting

### Issue: "Invalid secret path" error

**Cause:** Git Bash translating paths to Windows paths
**Solution:** Use PowerShell instead of Git Bash

### Issue: "Failed to create folder"

**Cause:** Parent folder doesn't exist
**Solution:** Run `create-folders.ps1` which creates parents first

### Issue: "Rate limit exceeded"

**Cause:** Too many API calls
**Solution:** Add delay between secrets:
```powershell
Start-Sleep -Milliseconds 100  # Add to migration script
```

### Issue: Secret value too long

**Cause:** Infisical has character limits
**Solution:** For multi-line secrets (like certificates), store as file or use Infisical file storage

### Issue: Can't find secrets after migration

**Cause:** Imports not configured in `/shared`
**Solution:** Set up imports (Step 7)

## 📚 Additional Resources

- **Infisical Docs:** https://infisical.com/docs
- **Project Dashboard:** https://app.infisical.com/project/8374cea9-e5e8-4050-bda4-b91f25ab30ef
- **Migration Report:** `migration/MIGRATION-REPORT.md`
- **Claude.md Config:** `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`

## 🎯 Next Steps After Migration

1. **Test all services** with new secret structure
2. **Update Project-Nyra docker-compose** to use new paths
3. **Configure per-PC .env files** on each machine
4. **Set up Infisical CLI** on all 4 machines
5. **Automate secret sync** via Infisical agent or cron jobs
6. **Add new secrets** to appropriate paths (not /shared)
7. **Document secret ownership** (who can access what)
8. **Set up secret rotation** schedule for sensitive keys

## ⏱️ Estimated Timeline

- ✅ **Step 1-2:** Review plan (10 mins) - DONE
- ⚠️ **Step 3:** Create folders (2 mins) - PENDING
- ⚠️ **Step 4:** Test migration (1 min) - PENDING
- ⚠️ **Step 5:** Execute migration (5-10 mins) - PENDING
- ⚠️ **Step 6:** Handle duplicates (15 mins) - PENDING
- ⚠️ **Step 7:** Set up imports (10 mins) - PENDING
- ⚠️ **Step 8:** Generate machine configs (5 mins) - PENDING
- ⚠️ **Step 9:** Validate (30 mins) - PENDING
- ⚠️ **Step 10:** Clean up (15 mins) - PENDING

**Total:** ~90 minutes

---

**Status:** Ready to execute
**Last Updated:** 2026-01-22
**Contact:** Use Infisical Slack for support
