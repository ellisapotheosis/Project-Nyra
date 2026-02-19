# Your Action Items - Right Now
**Time Required:** 20 minutes
**Then:** Switch to WSL

---

## 🎯 DO THESE 3 THINGS

### 1. DELETE Worker Tunnels (5 minutes)

**Go to:** https://dash.cloudflare.com/ → Networks → Tunnels

**Find and click DELETE on:**
- ❌ `worker-m15r7` (3280936b-7bbd-40ed-a6fc-02c42d6a11f0)
- ❌ `worker-rtx5090` (efbf6950-9c82-49d0-aaf6-9c0421e1b424)
- ❌ `worker-rtx3090ti` (97279b58-b066-434c-a447-3e8fc7e0abb5)

**DO NOT delete:** orchestrator-essential ✅

### 2. DELETE Unnecessary Access Apps (5 minutes)

**Go to:** https://one.dash.cloudflare.com/ → Access → Applications

**Find and click DELETE on:**
- ❌ `nyra-worker` (Cloudflare Workers - not needed)
- ❌ `DASH SSO` (testing)
- ❌ `SAAS` (Github testing)

**DO NOT delete:**
- ✅ `project-nyra` (nyra.ratehunter.net)
- ✅ `TwentyCRM` (crm.ratehunter.net)
- ✅ `Automation Webapp` (flow.ratehunter.net)

### 3. Verify Orchestrator Tunnel is Online (2 minutes)

**In same Tunnels page:**
- Look for: `orchestrator-essential`
- Status should show: 🟢 Online
- Should have 4 connections (LAX01, LAX05, LAX10, etc.)

**Test it works:**
```powershell
curl https://ratehunter.net
curl https://crm.ratehunter.net
```

---

## ✨ After You Delete Those:

**You're done with Cloudflare cleanup!**

Your setup is now:
- ✅ 1 tunnel (orchestrator)
- ✅ 37 domains configured
- ✅ Workers internal-only (Tailscale)
- ✅ Simple and secure

---

## 🎓 Why You're Deleting These

### Worker Tunnels ❌
- Unnecessary - orchestrator is your gateway
- Security risk - GPU APIs shouldn't be public
- Tailscale IPs work fine for internal communication

### Cloudflare Workers ❌
- You already have an orchestrator handling logic
- Workers would be redundant and add cost
- No performance benefit for your use case

### Testing Apps ❌
- SSO/Github apps for testing
- Not needed for production
- Can create them again later if needed

---

## ⏭️ What's Next (After This)

1. **Switch to WSL**
2. **Run the agent handoff prompt**
3. **Deploy workers** (RTX 5090, 3060, 3090)
4. **Test end-to-end connectivity**

---

## 📋 Verification Checklist

After deleting, verify:
- [ ] Orchestrator tunnel: ✅ Online with 4 connections
- [ ] Worker tunnels: ❌ All deleted
- [ ] Access apps: 3 left (project-nyra, TwentyCRM, Automation Webapp)
- [ ] DNS routes: 37 total (verify: `cloudflared tunnel route dns list`)
- [ ] Public URL works: `curl https://ratehunter.net`

---

## 🚀 Then Tell Me:

Once you've deleted everything:

```
✅ Deleted 3 worker tunnels
✅ Deleted nyra-worker app
✅ Deleted DASH SSO app
✅ Deleted Github SAAS app
✅ Orchestrator tunnel still online
✅ Ready to switch to WSL
```

Then I'll give you the WSL prompt and you're home free!

---

**This is the FINAL cleanup. After this, everything is simple and production-ready.**
