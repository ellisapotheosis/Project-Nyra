# Owner Manual Actions

Steps that require a human login, MFA, or dashboard UI because the API is blocked.

---

## Move CF Access App Launcher to projectnyra.cloudflareaccess.com

**Blocked by:** Cloudflare API error `12106` — `auth_domain_cannot_be_updated_dash_sso`.
Dashboard SSO is active on this account, which locks the team domain via API.

**Steps (one-time, ~3 min):**

1. Go to [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) → **Settings** → **Authentication**
2. Under **Cloudflare dashboard SSO**, click **Disable** (temporarily)
3. Run this curl (all env vars already in `~/.zsh/99-secrets.zsh`):

```bash
source ~/.zsh/99-secrets.zsh
curl -s -X PUT "https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/access/organizations" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "auth_domain": "projectnyra.cloudflareaccess.com",
    "name": "projectnyra.com",
    "login_design": {
      "background_color": "#000000",
      "logo_path": "https://ratehuntercom.wordpress.com/wp-content/uploads/2025/11/nyra-avatar-512-v9.png",
      "header_text": "Sign in with your Account Credentials",
      "footer_text": "Not intended for borrower use, licensed MLO professionals only!"
    }
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print('success:', d.get('success'), '| new domain:', d.get('result',{}).get('auth_domain'))"
```

4. Re-enable Cloudflare Dashboard SSO in the same settings page
5. Update any external IdP (Google Workspace, GitHub OAuth App) callback URLs from
   `https://ratehunter.cloudflareaccess.com/cdn-cgi/access/callback` →
   `https://projectnyra.cloudflareaccess.com/cdn-cgi/access/callback`

**Effect:** All active CF Access sessions across all apps are invalidated. Users re-login on next visit. The App Launcher will live at `https://projectnyra.cloudflareaccess.com`.

---

## Migrate admin app Prisma client to CF Workers-compatible adapter

**Context:** `apps/admin` uses `prisma-client-js` with a `postgresql` datasource. Standard
Prisma client includes native binary drivers that don't run in V8 isolates (CF Workers). The
build succeeds (client is generated at build time), but database calls will fail at runtime.

**Options (choose one):**

**Option A — Prisma Accelerate (HTTP proxy, easiest):**

1. Sign up at [prisma.io/accelerate](https://www.prisma.io/accelerate) and create a project
2. Replace `DATABASE_URL` with the Accelerate connection string
3. In `apps/admin/prisma/schema.prisma`, add:
   ```prisma
   generator client {
     provider        = "prisma-client-js"
     previewFeatures = ["driverAdapters"]
   }
   ```
4. In your DB init code, use `@prisma/adapter-accelerate`
5. Add `DATABASE_URL` (Accelerate URL) to Infisical `prod` environment

**Option B — Cloudflare D1 (serverless SQLite, no external DB):**

1. Create a D1 database: `wrangler d1 create nyra-admin`
2. Add to `apps/admin/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "nyra-admin"
   database_id = "<id from above>"
   ```
3. Switch Prisma provider to `sqlite` + `@prisma/adapter-d1`
4. Migrate schema: `wrangler d1 migrations apply nyra-admin`

**Current state:** Build succeeds, app deploys to `admin.projectnyra.com`. Database pages
(kanban, leads) will error at runtime until one of the above options is implemented.
