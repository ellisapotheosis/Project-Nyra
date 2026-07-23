# Manual Browser Actions — Infisical Gateway Deployment

These steps require browser access to admin panels. I cannot automate them, but I've provided exact instructions.

---

## ✅ COMPLETED (Autonomous)

- ✓ Infisical Agent Gateway docker-compose overlay created
- ✓ Config YAML and environment templates generated
- ✓ Caddyfile updated with gateway routes
- ✓ Caddy reloaded
- ✓ .gitignore updated for security/infisical .env files
- ✓ Documentation generated

---

## PENDING MANUAL ACTIONS

### 1. Tailscale Split DNS — Private Endpoint Access

**Why:** Enable devices on tailnet to resolve `*.p.projectnyra.com` to oracle-vps, then access private services.

**Status:** OPTIONAL (gateway is internal-only, not needed)

**Browser:** Tailscale Admin Panel (Windows 11)

**Steps:**

1. Open [Tailscale Admin → DNS](https://login.tailscale.com/admin/dns)
2. Under **Nameservers**, click **Add nameserver** → **Custom**
3. Nameserver IP: `100.64.0.3`
4. Check **Restrict to domain**: `projectnyra.com`
5. Save

**Effect:** Devices resolve `*.projectnyra.com` to `100.64.0.3` (oracle-vps Tailscale IP).

**Alternative:** Access via IP directly:
```bash
# Windows 11 or any Tailscale device
curl http://100.64.0.3/api/health
```

---

### 2. Google OAuth Callback — @projectnyra.com Login

**Why:** Enable SSO login for @projectnyra.com email addresses (alias domain in ratehunter.net org).

**Status:** REQUIRED for Cloudflare Access to work with @projectnyra.com email

**Browser:** Google Cloud Console

**Steps:**

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find OAuth client ID: `451503187155-qj69dd3sba33ehj978bolv0051qi74la.apps.googleusercontent.com`
3. Under **Authorized redirect URIs**, add:
   ```
   https://projectnyra.cloudflareaccess.com/cdn-cgi/access/callback
   ```
4. Keep existing `https://ratehunter.cloudflareaccess.com/cdn-cgi/access/callback` in the list (or remove if forcing re-login)
5. **Save**

**Expected Result:** Users can now log in via Google at `projectnyra.cloudflareaccess.com` with @projectnyra.com emails.

---

### 3. Cloudflare Access Policy — Infisical Gateway

**Why:** Protect public `infisical-gateway.projectnyra.com` endpoint with authentication.

**Status:** OPTIONAL (gateway is for internal apps, can restrict to admins)

**Browser:** Cloudflare Zero Trust Dashboard

**Steps:**

1. Go to [Zero Trust → Access → Applications](https://one.dash.cloudflare.com/)
2. Click **Add an application** → **Self-hosted**
3. **Application details:**
   - Application name: `Infisical Gateway`
   - Subdomain: `infisical-gateway`
   - Domain: `projectnyra.com`
4. Click **Next**
5. **Add a policy:**
   - Policy name: `admin-only`
   - Decision: **Allow**
   - Require: `Email`
   - Email list:
     - `edaneandersen@gmail.com`
     - `@projectnyra.com`
6. Click **Next** → **Add application**

**Effect:** Only authenticated users can access `https://infisical-gateway.projectnyra.com`

**Alternative:** Admin-only policy (more restrictive):
```
- Require: Email
- Email: edaneandersen@gmail.com only
```

---

### 4. Infisical Machine Identity Setup

**Why:** Generate credentials for Gateway to authenticate to Agent Vault.

**Status:** REQUIRED before deploying gateway

**Browser:** Infisical Web UI

**Steps:**

1. Open [Infisical dashboard](https://app.infisical.com) (self-hosted or cloud)
2. Go to **Settings** → **Machine Identities**
3. Click **Create machine identity**
4. **Name:** `agent-gateway-dev` (or `-staging`, `-prod`)
5. **Description:** "Gateway service for secret caching and dynamic credentials"
6. **Copy the generated:**
   - **Client ID** → `INFISICAL_BACKEND_MACHINE_IDENTITY_ID`
   - **Client Secret** → `INFISICAL_BACKEND_MACHINE_IDENTITY_KEY`
7. Click **Create**
8. **Permissions:**
   - Check **Can read secrets** for paths:
     - `/domains/project-nyra/dev` (or staging/prod)
     - `/shared/credentials`
     - `/shared/api-keys`
   - Check **Can manage dynamic secrets**
9. **Save permissions**

**Repeat 3x:** Create separate identities for dev, staging, and production.

**Store in:**
```
security/infisical/agent-gateway/dev.env   → use dev identity
security/infisical/agent-gateway/staging.env → use staging identity
security/infisical/agent-gateway/prod.env  → use prod identity
```

---

### 5. Cloudflare Remove Legacy Reusable Policies

**Why:** Clean up old duplicate policies (from prior CF Access standardization).

**Status:** OPTIONAL (already marked for cleanup in previous session)

**Browser:** Cloudflare Zero Trust Dashboard

**Steps:**

1. Go to [Zero Trust → Access → Reusable Policies](https://one.dash.cloudflare.com/)
2. Delete these 8 policies (listed by ID):
   - `e2ceaa83-f34b-48a0-a38e-366ece2d10bb` (2Admin-Personal/Business-Emails)
   - `b6cf6d75-0331-4c14-babd-09a37379ebe9` (nyra-network-policy)
   - `2373a07e-bada-4643-b967-5b8821bda7eb` (Backend/AI/Workers-Service-Tokens)
   - `a8d234d8-00a0-44df-83b5-d65646db85ef` (Cloudflare Workers Preview URLs)
   - `12f98855-6a6b-4319-89b0-1513bb535ac2` (Admin-Personal/Business-Emails)
   - `7c33b9c6-0054-4a67-9a82-b1209bc26af9` (nyra-worker - Production)
   - `af35d03e-0450-4f0d-adcf-f37dca4bb31f` (Allow emails: 11/20/2025)
   - `1ac7d1c3-c95c-42c0-bf46-ebc2af84c203` (Allow emails: 11/17/2025)
3. Click **Delete** on each
4. Dashboard will auto-detach and remove

**Effect:** Cleaner policy landscape, no functional impact (sanitized versions are harmless).

---

## SUMMARY

| Task | Required? | Tool | Effort |
|---|---|---|---|
| Tailscale DNS | Optional | Tailscale Admin | 2 min |
| Google OAuth | Required | Google Cloud | 2 min |
| CF Access Policy (Gateway) | Optional | CF Zero Trust | 3 min |
| Infisical Machine Identity | **REQUIRED** | Infisical UI | 5 min |
| Delete Legacy CF Policies | Optional | CF Zero Trust | 5 min |

**Critical path:** Google OAuth + Infisical Machine Identity (10 minutes)

---

## What Happens If You Skip These?

| Task | Consequence |
|---|---|
| Skip Tailscale DNS | Gateway still accessible via IP (100.64.0.3) but not via domain names on tailnet |
| Skip Google OAuth | @projectnyra.com email login fails; only @ratehunter.net works |
| Skip CF Access Policy | Gateway endpoint publicly accessible (not authenticated) — SECURITY RISK |
| Skip Infisical Machine ID | Gateway container fails to start; logs show auth error |
| Skip Legacy Policy Cleanup | Just cosmetic, no functional impact |

---

## Testing After Completion

```bash
# Test Gateway is accessible from docker network
docker exec -it any-app-container curl http://infisical-gateway:8200/health

# Test Cloudflare public endpoint
curl https://infisical-gateway.projectnyra.com/health
# (Should prompt browser login)

# Test dynamic secrets
docker exec -it any-app-container curl -X POST \
  http://infisical-gateway:8200/api/v1/dynamic-secrets/postgres \
  -H "Content-Type: application/json" \
  -d '{"ttl_hours": 1}'
# (Should return temp DB credentials)
```

---

## Related Docs

- [Infisical Gateway Full Setup Guide](./INFISICAL_GATEWAY_SETUP.md)
- [Cloudflare Access Policies](./docs/cloudflare/)
- [Tailscale Split DNS](./OWNER_MANUAL_ACTIONS.md)
