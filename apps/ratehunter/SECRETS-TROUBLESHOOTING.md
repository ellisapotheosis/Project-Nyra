# Cloudflare Pages Secrets Troubleshooting Guide

This guide helps resolve issues with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets for the GitHub Actions deployment workflow.

## 🔍 Understanding the Issue

When deploying to Cloudflare Pages via GitHub Actions, you may encounter errors like:

```
❌ Missing required secrets: CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
```

This happens because of a **scope mismatch** between where secrets are configured and where the workflow looks for them.

## 📊 Secret Sources & Priority

The deployment workflow supports two methods for obtaining secrets:

### Method 1: Direct GitHub Repository Secrets (Recommended)

Secrets are stored directly in GitHub repository settings.

**Priority**: ✅ Checked first, always preferred if available

**Configuration**:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add these repository secrets:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Method 2: Infisical Integration (Fallback)

Secrets are fetched from Infisical and used as environment variables.

**Priority**: Used only if direct secrets are not found

**Configuration**:

1. Set up Infisical integration for your repository
2. Add these secrets in Infisical under `/shared` path:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. Configure the appropriate Infisical token in GitHub secrets:
   - `INFISICAL_TOKEN` - General token
   - `INFISICAL_TOKEN` - Infisical retains dev, stag, prod (development, staging, and production are the non truncated versions) environment  versions of all secrets such as this one. 

## 🔧 Step-by-Step Troubleshooting

### Step 1: Verify Secret Existence

**For Direct GitHub Secrets:**

1. Go to repository → Settings → Secrets and variables → Actions
2. Look for `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
3. If missing, add them

**For Infisical:**

```bash
# Log in to Infisical CLI
infisical login

# Check if secrets exist in the correct environment
infisical export --env=prod --path=/shared --format=dotenv | grep CLOUDFLARE
```

### Step 2: Check Secret Scope

GitHub has different secret scopes:

| Scope                    | Access                                  |
| ------------------------ | --------------------------------------- |
| **Repository secrets**   | Available to all workflows in the repo  |
| **Environment secrets**  | Only available in specific environments |
| **Organization secrets** | Available to selected repos in the org  |

**Common Issue**: Secrets are in an environment (e.g., `production`) but the workflow job doesn't specify that environment.

**Solution**: The updated workflow now handles environments properly. Ensure your secrets are at the **repository level** (not environment level) for easiest setup.

### Step 3: Check Infisical Environment Mapping

The workflow maps GitHub environments to Infisical environments:

| Workflow Environment  | Infisical Environment |
| --------------------- | --------------------- |
| `production`          | `prod` or 'production'|
| `preview` / `staging` | `stag` or 'staging'   |
| Other                 | `dev` or 'development'|

Ensure your Infisical secrets are in the correct environment.

### Step 4: Verify Infisical Token Permissions

Your Infisical token needs read access to the secrets path:

```bash
# Test token permissions
INFISICAL_TOKEN=your-token infisical export --env=prod --path=/shared
```

Expected output should include `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## ✅ Recommended Setup (Quickest Fix)

The simplest fix is to add secrets directly to GitHub:

### Get Your Cloudflare Credentials

1. **Account ID**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select any website
   - Look on the right sidebar for "Account ID"
   - Copy the 32-character hex string

2. **API Token**:
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use template: "Edit Cloudflare Pages"
   - Or create custom token with permissions:
     - `Cloudflare Pages:Edit`
     - `Account:Read`
   - Copy the generated token (shown only once!)

### Add to GitHub

1. Go to your repository settings: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add `CLOUDFLARE_ACCOUNT_ID` with your account ID
4. Add `CLOUDFLARE_API_TOKEN` with your API token

### Trigger Deployment

Re-run the failed workflow or push a change to trigger deployment:

```bash
git commit --allow-empty -m "chore: trigger cloudflare deployment"
git push
```

## 🔒 Security Best Practices

1. **Use Minimal Permissions**: Create API tokens with only the permissions needed (Cloudflare Pages:Edit)

2. **Rotate Tokens Regularly**: Regenerate API tokens every 90 days

3. **Use Environment-Specific Tokens**: Consider different tokens for production vs preview

4. **Enable 2FA**: Enable two-factor authentication on your Cloudflare account

5. **Audit Access**: Regularly review who has access to secrets

## 🔗 Infisical Sync Configuration

If using Infisical's GitHub sync feature:

1. Ensure sync is configured for the correct repository
2. Verify the sync target is "Repository secrets" (not "Environment secrets" unless intended)
3. Check sync status in Infisical dashboard

**Infisical Project Configuration:**

```yaml
Project ID: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
Path: /shared
Environments: dev, staging, prod
```

## 📝 Workflow Configuration Reference

The workflow checks for secrets in this order:

```yaml
# 1. Direct secrets (preferred)
apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

# 2. Environment variables from Infisical (fallback)
apiToken: ${{ env.CLOUDFLARE_API_TOKEN }}
accountId: ${{ env.CLOUDFLARE_ACCOUNT_ID }}
```

## 🆘 Still Having Issues?

If you've tried everything above and still have issues:

1. **Check Workflow Logs**: Look for specific error messages in the GitHub Actions run
2. **Verify Token Validity**: Test your Cloudflare token with:
   ```bash
   cloudflare-token-verify-command
   ```
3. **Check Cloudflare Project Exists**: Ensure the `ratehunter-landing` project exists in Cloudflare Pages
4. **Open an Issue**: Create a GitHub issue with the full error log (redact any secrets!)

## 📚 Related Documentation

- [Cloudflare Pages Deploy Action](https://github.com/cloudflare/pages-action)
- [Infisical GitHub Integration](https://infisical.com/docs/integrations/cicd/github-actions)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
