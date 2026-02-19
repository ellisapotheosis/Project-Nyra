# Cloudflare Access - Quick Setup Guide
**For: Project Nyra**
**Time Required:** 15 minutes
**Method:** One app per domain (what you're already doing)

---

## ✅ What You Already Have

You've already created apps for:
- ✅ admin.ratehunter.net
- ✅ crm.ratehunter.net (TwentyCRM)
- ✅ (any others you set up)

**Just keep doing that!** This is the correct approach.

---

## 📋 Apps You Need to Create

Go to: https://one.dash.cloudflare.com/ → **Access** → **Applications**

For each domain below, click **Add Application** → **Self-hosted** → Fill in:

### 1. Secrets Manager
```
Name: Infisical Secrets
Domain: secrets.ratehunter.net
Policy: Admin Only
  ├─ Action: Allow
  ├─ Include: Emails: ellis@ratehunter.net
Auth Method: Google OAuth (or One-Time PIN)
Session: 12 hours
```

### 2. Grafana Monitoring
```
Name: Grafana Monitoring
Domain: grafana.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 3. Claude Flow Dashboard
```
Name: Claude Flow Dashboard
Domain: flow.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 4. Orchestrator
```
Name: Orchestrator Dashboard
Domain: orchestrator.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 5. Nexus Router (API Gateway)
```
Name: Nexus Router
Domain: nexus.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 6. n8n Workflows
```
Name: n8n Workflows
Domain: n8n.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 7. Activepieces
```
Name: Activepieces
Domain: flows.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 8. Webhook Manager
```
Name: Webhook Manager
Domain: hooks.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 9. Dify Chat
```
Name: Dify Chat UI
Domain: chat.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 10. Prometheus Metrics
```
Name: Prometheus Metrics
Domain: metrics.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 11. API Documentation
```
Name: API Gateway
Domain: api.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 12. Log Viewer
```
Name: Log Viewer
Domain: logs.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

### 13. File Storage
```
Name: File Storage
Domain: files.ratehunter.net
Policy: Team Access
  ├─ Action: Allow
  ├─ Include: Email domain: @ratehunter.net
Auth Method: Google OAuth
Session: 24 hours
```

---

## 🎯 Why Each Domain Gets Its Own App

Each app can have different policies:
- **Admin-only apps:** Restricted to you
- **Team apps:** Open to @ratehunter.net emails
- **Public apps:** No authentication

If you create one mega-app with 10 domains, they all share the SAME policy. That's less secure and less flexible.

---

## ✅ Domains Already Handled (No Cloudflare Access Needed)

These are either:
- Public (no auth) → ratehunter.net, nyra.ratehunter.net
- Have their own auth → broker portal

**Don't create Access apps for these.**

---

## 🧪 Testing

After creating each app, test:

```powershell
# Should ask for login
curl https://admin.ratehunter.net
curl https://secrets.ratehunter.net
curl https://grafana.ratehunter.net

# Should show Cloudflare Access login page
# If you're logged in to Google/GitHub, you'll auto-auth
```

---

## 💡 Pro Tips

1. **Use Google OAuth** - Easiest for team members with Gmail
2. **Set session to 24 hours** - Balance security & convenience
3. **Admin apps = 12 hours** - Shorter session for sensitive services
4. **Email domain over individual emails** - Easier to manage (@ratehunter.net matches everyone)

---

## ⏱️ Time Breakdown

- Add each app: ~1 minute
- 13 apps total: ~15 minutes
- Test all: ~5 minutes

**Total: ~20 minutes**

---

**That's it!** You're essentially doing exactly what you've already been doing for admin and crm - just repeat for the other domains.
