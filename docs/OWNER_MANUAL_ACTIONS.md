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

**Blocked by:** Cloudflare DNS / Access / Security dashboard settings require
owner login.

**What is already done in repo:**

- `apps/projectnyra/public/.well-known/security.txt`
- `apps/projectnyra/public/.well-known/pgp-key.asc`
- `apps/ratehunter/public/.well-known/security.txt`
- `apps/ratehunter/public/.well-known/pgp-key.asc`

The published public key fingerprint is:

- `6EFC 0D95 7A11 8EB7 DD3B F48C 41DB BAF8 8224 9BA5`

**Steps (one-time, ~10 min):**

1. In Cloudflare DNS / Tunnel config, make sure these hostnames resolve:
   - `projectnyra.com` → Oracle tunnel
   - `www.projectnyra.com` → Oracle tunnel
   - `app.projectnyra.com` → Oracle tunnel
   - `ratehunter.net` → Cloudflare Pages project
2. In Cloudflare Access, add a bypass/public rule for:
   - `https://app.projectnyra.com/.well-known/*`
   so `security.txt` and `pgp-key.asc` stay publicly fetchable even if the app
   hostname is otherwise Access-gated.
3. Verify these URLs load publicly:
   - `https://projectnyra.com/.well-known/security.txt`
   - `https://projectnyra.com/.well-known/pgp-key.asc`
   - `https://app.projectnyra.com/.well-known/security.txt`
   - `https://ratehunter.net/.well-known/security.txt`
   - `https://ratehunter.net/.well-known/pgp-key.asc`
4. In Cloudflare dashboard, for each domain:
   - Go to **Security** → **Settings**
   - Set the **Encryption** / public key URL to the exact `.asc` URL:
     - `https://projectnyra.com/.well-known/pgp-key.asc`
     - `https://ratehunter.net/.well-known/pgp-key.asc`

**Important:** Do not paste the bare site homepage into the Encryption field.
It must be the direct HTTPS URL of the public key file.
