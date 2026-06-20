# Email Setup Guide - Project Nyra

## Overview

Use **Google Workspace** as primary email hosting with **Cloudflare Email Routing** as a FREE forwarding/spam filtering layer.

---

## Phase 1: Google Workspace Setup (15 minutes)

### Step 1: Verify Domain Ownership

1. Log into Google Admin Console: https://admin.google.com
2. Navigate to **Domains** → **Manage domains**
3. Click **Add domain** → Enter `ratehunter.com`
4. Google will provide a TXT record like:
   ```
   google-site-verification=ABC123XYZ456...
   ```

### Step 2: Add DNS Record to Cloudflare

1. Log into Cloudflare Dashboard: https://dash.cloudflare.com
2. Select `ratehunter.com` domain
3. Go to **DNS** → **Records**
4. Click **Add record**:
   - **Type**: TXT
   - **Name**: @ (root)
   - **Content**: `google-site-verification=ABC123XYZ456...`
   - **TTL**: Auto
   - **Proxy status**: DNS only (gray cloud)
5. Click **Save**
6. Wait 5-10 minutes, then click **Verify** in Google Admin Console

### Step 3: Configure MX Records

1. In Cloudflare DNS, **delete any existing MX records**
2. Add Google Workspace MX records (in priority order):

| Type | Name | Priority | Content                 | TTL  | Proxy    |
| ---- | ---- | -------- | ----------------------- | ---- | -------- |
| MX   | @    | 1        | ASPMX.L.GOOGLE.COM      | Auto | DNS only |
| MX   | @    | 5        | ALT1.ASPMX.L.GOOGLE.COM | Auto | DNS only |
| MX   | @    | 5        | ALT2.ASPMX.L.GOOGLE.COM | Auto | DNS only |
| MX   | @    | 10       | ALT3.ASPMX.L.GOOGLE.COM | Auto | DNS only |
| MX   | @    | 10       | ALT4.ASPMX.L.GOOGLE.COM | Auto | DNS only |

### Step 4: Add SPF Record

Add TXT record for email authentication:

- **Type**: TXT
- **Name**: @ (root)
- **Content**: `v=spf1 include:_spf.google.com ~all`
- **TTL**: Auto

### Step 5: Configure DKIM

1. In Google Admin Console, go to **Apps** → **Google Workspace** → **Gmail**
2. Click **Authenticate email**
3. Click **Generate new record** for `ratehunter.com`
4. Google provides a CNAME record like:
   ```
   Name: google._domainkey
   Value: v=DKIM1; k=rsa; p=MIGfMA0GCS...
   ```
5. Add this CNAME record in Cloudflare DNS
6. Click **Start authentication** in Google Admin Console

### Step 6: Configure DMARC (Optional but Recommended)

Add TXT record:

- **Type**: TXT
- **Name**: `_dmarc`
- **Content**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@ratehunter.com`
- **TTL**: Auto

### Step 7: Create User Accounts

1. In Google Admin Console, go to **Users**
2. Click **Add new user**
3. Create accounts:
   - `contact@ratehunter.com` (main support)
   - `leads@ratehunter.com` (n8n campaign sender)
   - `noreply@ratehunter.com` (automated emails)
   - `[yourname]@ratehunter.com` (personal)

### Step 8: Test Email

1. Send test email TO `contact@ratehunter.com` from external email
2. Send test email FROM `contact@ratehunter.com` to external email
3. Check spam score: https://www.mail-tester.com

---

## Phase 2: Cloudflare Email Routing (10 minutes)

### Step 1: Enable Email Routing

1. In Cloudflare Dashboard, select `ratehunter.com`
2. Go to **Email** → **Email Routing**
3. Click **Get started**
4. Cloudflare will auto-configure DNS records

### Step 2: Add Destination Addresses

1. Click **Destination addresses** → **Add destination address**
2. Add your Google Workspace addresses:
   - `contact@ratehunter.com`
   - `leads@ratehunter.com`
3. Cloudflare sends verification emails - click links to verify

### Step 3: Create Routing Rules

1. Go to **Routing rules** → **Create address**
2. Create catch-all rule:
   - **Custom address**: `*@ratehunter.com` (catch-all)
   - **Action**: Send to → `contact@ratehunter.com`
3. Create specific forwards:
   - `support@ratehunter.com` → `contact@ratehunter.com`
   - `info@ratehunter.com` → `contact@ratehunter.com`
   - `sales@ratehunter.com` → `leads@ratehunter.com`

### Step 4: Test Forwarding

Send test email to `random123@ratehunter.com` - should forward to `contact@ratehunter.com`

---

## Phase 3: n8n Integration (5 minutes)

### Configure n8n Email Node

1. Open n8n workflow editor
2. Add **Gmail** node (not SMTP - use Gmail API)
3. Configure OAuth2:
   - **Email**: `leads@ratehunter.com`
   - **Client ID**: Get from Google Cloud Console
   - **Client Secret**: Get from Google Cloud Console
4. Authenticate and grant permissions

### Daily Sending Limits

- **Free Gmail**: 500 emails/day
- **Google Workspace Business Plus**: 2,000 emails/day
- **n8n campaigns**: Stay under 1,800/day (90% of limit)

---

## Security Best Practices

### 1. Enable 2FA

- Go to Google Admin Console → **Security** → **2-Step Verification**
- Enforce 2FA for all users

### 2. Configure App Passwords

- For n8n SMTP (if not using Gmail API)
- User account → **Security** → **App passwords**

### 3. Monitor Email Logs

- Google Admin Console → **Reports** → **Email log search**
- Check for bounces, spam reports, delivery failures

### 4. Set Up Alerts

- Google Admin Console → **Rules** → **Email** → **Email alerts**
- Alert on: Suspicious activity, mass emails, spam reports

---

## Troubleshooting

### Email Not Receiving

1. Check MX records in Cloudflare: `dig MX ratehunter.com`
2. Verify Google Workspace is active
3. Check spam folder
4. Check Google Admin Console → **Reports** → **Email log search**

### Email Going to Spam

1. Verify SPF, DKIM, DMARC records
2. Check sender reputation: https://www.senderscore.org
3. Warm up new email addresses (start with 50 emails/day, increase gradually)
4. Use authenticated SMTP/Gmail API (never unauthenticated SMTP)

### Cloudflare Forwarding Not Working

1. Verify destination email is verified
2. Check Cloudflare Email Routing dashboard for errors
3. Test with simple rule first (single address forward)

---

## Cost Summary

| Service                        | Cost          | Benefit                                   |
| ------------------------------ | ------------- | ----------------------------------------- |
| Google Workspace Business Plus | $22/month     | 2,000 emails/day, 2TB storage, AppSheet   |
| Cloudflare Email Routing       | FREE          | Spam filtering, catch-all, backup routing |
| **Total**                      | **$22/month** | Professional email system                 |

**ROI**: Breaks even at 1 mortgage closed per year.

---

## Next Steps

1. ✅ Complete Google Workspace DNS verification
2. ✅ Configure MX, SPF, DKIM, DMARC records
3. ✅ Create user accounts
4. ✅ Enable Cloudflare Email Routing
5. ✅ Test email sending and receiving
6. ✅ Integrate with n8n workflows
7. ✅ Monitor deliverability for 7 days
8. ✅ Gradually increase sending volume
