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

## Publish `security.txt` and key URLs for `projectnyra.com` + `ratehunter.net`

**Status:** Complete as of 2026-07-15. Cloudflare Security Center serves
`security.txt` at the zone layer, and Cloudflare R2 serves the OpenPGP key
files from `cdn.projectnyra.com`.

**What is already done in repo:**

- `apps/projectnyra/public/.well-known/security.txt`
- `apps/projectnyra/public/.well-known/pgp-key.asc`
- `apps/ratehunter/public/.well-known/security.txt`
- `apps/ratehunter/public/.well-known/pgp-key.asc`

The published public key fingerprint is:

- `6EFC 0D95 7A11 8EB7 DD3B F48C 41DB BAF8 8224 9BA5`

Current production URLs:

- `https://projectnyra.com/.well-known/security.txt`
- `https://ratehunter.net/.well-known/security.txt`
- `https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc`
- `https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc`

Cloudflare resources:

- R2 bucket: `nyra-cdn-assets`
- R2 custom domain: `cdn.projectnyra.com`
- R2 object prefix: `security/`

See `docs/operations/SECURITY_DISCLOSURE_ASSETS.md` for the current runbook.

Resolved drift:

- `app.projectnyra.com` is the primary webapp and remains Access-gated.
- `projectnyra.com` is the public 3D landing page.
- `projectnyra.com` Security TXT was updated on 2026-07-15 so `canonical`
  contains only `https://projectnyra.com/.well-known/security.txt`.
- A short-lived Cloudflare token scoped to `projectnyra.com` Zone Settings was
  created for that update and revoked after the API call completed.

**Historical fallback steps only:**

1. In Cloudflare DNS / Tunnel config, make sure these hostnames resolve:
   - `projectnyra.com` → Oracle tunnel
   - `www.projectnyra.com` → Oracle tunnel
   - `app.projectnyra.com` → Oracle tunnel
   - `ratehunter.net` → Cloudflare Pages project
2. If the app-local fallback must be public, add a Cloudflare Access
   bypass/public rule for:
   - `https://app.projectnyra.com/.well-known/*`
     so app-local fallback files stay publicly fetchable even if the app hostname
     is otherwise Access-gated.
3. Verify these URLs load publicly:
   - `https://projectnyra.com/.well-known/security.txt`
   - `https://ratehunter.net/.well-known/security.txt`
   - `https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc`
   - `https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc`
4. In Cloudflare dashboard, for each domain:
   - Go to **Security** → **Settings**
   - Set the **Encryption** / public key URL to the exact R2 `.asc` URL:
     - `https://cdn.projectnyra.com/security/projectnyra-pgp-key.asc`
     - `https://cdn.projectnyra.com/security/ratehunter-pgp-key.asc`

**Important:** Do not paste the bare site homepage into the Encryption field.
It must be the direct HTTPS URL of the public key file.

---

## Repair Oracle VPS compose `.env` from Infisical

**Status:** Complete as of 2026-07-17. `ssh oracle-vps` is working again,
the local WSL Tailscale client is authenticated, and the Oracle compose `.env`
was repaired from Infisical with a remote backup.

Current evidence from 2026-07-17:

- `ssh oracle-vps` works and lands on `nyra-oracle-vnic` as `ubuntu`.
- Remote file exists:
  `/home/ubuntu/project-nyra/infra/hosts/oracle-vps/.env`
- The prior remote file was backed up to:
  `/home/ubuntu/project-nyra/infra/hosts/oracle-vps/.env.bak.20260717T082210Z`
- Repaired file validation:
  - `466` lines
  - `364` active assignments
  - `364` unique keys
  - `0` invalid dotenv lines
  - `0` duplicate keys
- `docker compose -f infra/hosts/oracle-vps/docker-compose.yml --env-file infra/hosts/oracle-vps/.env config --quiet`
  passes on Oracle.
- Docker context `oracle` works again.

Use the repair helper for future refreshes:

```bash
DRY_RUN=1 bash ops/scripts/repair-oracle-env-from-infisical.sh
bash ops/scripts/repair-oracle-env-from-infisical.sh
```

Defaults used by the script:

- `INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef`
- `INFISICAL_ENV=prod`
- `INFISICAL_PATH=/hosts/oracle-vps`
- `ORACLE_VPS_SSH_HOST=oracle-vps`
- `ORACLE_VPS_ENV_PATH=/home/ubuntu/project-nyra/infra/hosts/oracle-vps/.env`

The script:

1. Authenticates with `INFISICAL_TOKEN` or Universal Auth env vars when present.
2. Exports the Infisical path to a private temp file.
3. Validates dotenv syntax, including quoted multiline values, without printing
   secret values.
4. Uploads the validated file to Oracle.
5. Backs up the current remote `.env`.
6. Installs the repaired file with mode `600`.
7. Revalidates the remote file without printing secret values.

After repair, validate compose without dumping resolved secrets:

```bash
ssh oracle-vps 'cd ~/project-nyra && docker compose -f infra/hosts/oracle-vps/docker-compose.yml --env-file infra/hosts/oracle-vps/.env config --quiet'
```

---

## Supabase public gateway hostname

**Status:** The active public gateway is `https://api.projectnyra.com`, routed
through the Oracle tunnel to `supabase-kong:8000`. Do not configure a separate
`supabase.projectnyra.com` route unless the public hostname is intentionally
changed everywhere; the app and self-hosted GoTrue configuration already use
the `api` hostname.

Validate after any tunnel or DNS change:

```bash
SUPABASE_URL=https://api.projectnyra.com bash scripts/verify-supabase.sh
```

## Cloudflare Pages credentials and production variables

**Blocked by:** the current shell's Cloudflare API token is unauthorized and the
Supabase anon key is not present locally. An owner must replace/refresh these
values before running the Pages automation:

```bash
export CLOUDFLARE_API_TOKEN=REPLACE_ME_CLOUDFLARE_PAGES_TOKEN
export CLOUDFLARE_ACCOUNT_ID=REPLACE_ME_CLOUDFLARE_ACCOUNT_ID
export SUPABASE_ANON_KEY=REPLACE_ME_PUBLIC_SUPABASE_ANON_KEY
node scripts/deploy-cloudflare-pages.js
```

The token must have account Pages project read/write access. The script refuses
to publish a placeholder key and writes the configured variables to both preview
and production deployment configs. Validate afterward with:

```bash
SUPABASE_URL=https://api.projectnyra.com \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  bash scripts/verify-supabase.sh
```

## Reauthenticate Cloudflare MCP Portal admin credential (Grafbase Nexus)

**Blocked by:** OAuth admin-credential reauthentication requires an interactive browser login — Cloudflare's API has no endpoint to complete the OAuth authorization-code exchange on your behalf.

**Symptom:** `claude mcp` (or any MCP client) connecting to `mcp-gateway.projectnyra.com` gets `invalid_token` / `401` from the portal, even with valid MCP-client OAuth registration.

**Root cause:** Cloudflare Access's MCP Server Portal (`mcp-server-portal`) holds a stored admin OAuth credential for its backend server `nyra` (`https://nexus-router.projectnyra.com/mcp`, served by the `ghcr.io/grafbase/nexus:stable` container, config at `infra/hosts/oracle-vps/nexus.toml`). That credential is now invalid (`status: stale`, `"Invalid oauth credentials. Please contact your administrator"`) — most likely invalidated by a `NEXUS_JWT_SECRET` rotation in Infisical `/clients/nexus` sometime after the credential was originally issued.

**Steps (one-time, ~2 min):**

1. [Cloudflare Zero Trust dashboard](https://one.dash.cloudflare.com/) → **Access controls** → **AI controls** → **MCP servers** tab
2. Select **Project Nyra Nexus** (`nyra`) → **Edit** → **Authenticate server**
3. Log in when redirected to Nexus's OAuth login page — this issues a fresh admin credential and refresh token
4. Confirm server status flips from `stale`/`Error` to `Ready`

**Also flagged (not fixed, no action needed unless you want it gone):** a second, orphaned MCP server registration named `nexus-router-mcp` exists in the same Cloudflare account (`auth_type: bearer`, pointing at `https://nexus.projectnyra.com` — that's actually the `apps/projectnyra` webapp's Nexus UI page, not an MCP endpoint). It isn't attached to the active portal and isn't causing the auth failure, but it's stale config. Delete via `DELETE /accounts/{account_id}/access/ai-controls/mcp/servers/nexus-router-mcp` if you want it cleaned up.
