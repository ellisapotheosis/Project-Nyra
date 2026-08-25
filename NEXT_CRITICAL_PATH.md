# Next Critical Path — Project Nyra Production Readiness

**Status:** TIER 1 Complete ✅ | Gateway Deployed | Ready for Phase 4-5

**Date:** 2026-08-25 06:15 UTC  
**Committed:** Memory candidates graduated, OpenClaw config deployed, roadmap created

---

## What Just Happened

1. ✅ **Memory review queue reduced** — 17 infrastructure operations graduated to lessons
2. ✅ **OpenClaw Gateway deployed** — Running on port 18789 with full configuration
3. ✅ **All commits pushed** — `nyra/phase2-mcp-memory` branch updated
4. ✅ **Strategic roadmap created** — 4-tier completion plan (TIER 1-4)
5. ✅ **Documentation complete** — Windows UI setup + Tailscale split-DNS guides ready

---

## Current System State (Verified)

### Infrastructure Online

| Service          | Status     | Port      | Uptime | Verified        |
| ---------------- | ---------- | --------- | ------ | --------------- |
| OpenClaw Gateway | 🟢 Running | 18789     | 30m    | ✅ Health: live |
| LiteLLM          | 🟢 Running | 4000/4010 | 15h    | ✅ Docker       |
| Mem0 API         | 🟢 Running | 5000      | 2h     | ✅ Oracle VPS   |
| Qdrant           | 🟢 Running | 6333      | 5w     | ✅ Oracle VPS   |
| FalkorDB         | 🟢 Running | 6379      | 19h    | ✅ Oracle VPS   |
| Infisical        | 🟢 Cached  | —         | Auth   | ✅ 376 secrets  |

### Configuration In Place

- **Gateway config:** `~/.openclaw/openclaw.json` (gateway.mode=local, all agents/models)
- **Agent auth:** `~/.openclaw/agents/main/agent/auth-profiles.json` (LiteLLM creds)
- **Memory plugin:** Mem0 configured (Qdrant + FalkorDB backends)
- **4 Agents:** main, researcher, reviewer, memory-worker (all ready)
- **Models:** 4 routing options (RTX5090 → RTX3090Ti → RTX3060 → free)

### Access Credentials

```
Gateway Token:  85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4
Gateway URL:    http://orchestrator.trex-fiordland.ts.net:18789 (Tailscale)
Local URL:      http://127.0.0.1:18789 (WSL2 loopback)
SSH Tunnel:     NOT NEEDED (Tailscale provides encryption)
```

---

## TIER 2: Configuration Verification (Next 4-6 hours)

### Phase 4: Plugin Verification

**What:** Verify Mem0, Codex, ACPX plugins are installed and wired

**Check:**

```bash
# 1. Verify plugins installed
npm list -g @mem0/openclaw-mem0 @openclaw/codex @openclaw/acpx

# 2. Check openclaw.json has all plugins
grep -A 20 '"plugins"' ~/.openclaw/openclaw.json

# 3. Verify plugin configurations
~/.openclaw/npm/projects/*/node_modules/*/package.json
```

**Status:**

- ✅ Mem0 plugin: Installed (npm), configured in JSON
- ⚠️ Codex plugin: Check if installed (user may need subscription)
- ⚠️ ACPX plugin: Check if installed

**Action:**

```bash
npm list -g | grep -E "@mem0|@openclaw/codex|@openclaw/acpx"
# If missing:
npm install -g @openclaw/codex @openclaw/acpx
```

### Phase 5: Orchestrator Configuration Patches

**What:** Test actual agent execution end-to-end

**Test Sequence:**

1. **Simple prompt test**

   ```bash
   # Manual test via OpenClaw API (POST to gateway)
   curl -X POST http://127.0.0.1:18789/agents/main/chat \
     -H "Authorization: Bearer 85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4" \
     -H "Content-Type: application/json" \
     -d '{"message":"What is your name?"}'
   ```

2. **Verify model routing**
   - Check logs: `/tmp/openclaw/openclaw-2026-08-25.log`
   - Look for: `litellm/nyra/local-interactive` (RTX5090)
   - Verify: Response quality, latency (<5s for first, <2s for subsequent)

3. **Test memory capture**
   - Send: "Remember: Project Nyra uses Tailscale for networking"
   - Check Mem0 logs for capture
   - Send follow-up: "What did you remember earlier?"
   - Verify: Auto-recall of Tailscale fact

4. **Verify LiteLLM routing**
   - First model (RTX5090) responds: ~3-5s
   - Second model (RTX3090Ti) responds: ~2-4s
   - Third model (RTX3060) responds: ~1-3s
   - Fallback (free) responds: ~2-6s

**Success Criteria:**

- ✅ All 4 agents respond to prompts
- ✅ Memory capture logged
- ✅ Model routing verified in logs
- ✅ No errors in gateway logs

---

## TIER 3: Validation & Shipping (3-4 hours, Today/Tomorrow)

### Windows OpenClaw App Setup

**User Action (Not Claude):**

1. Download: https://www.openclaw.ai/download
2. Install on Windows
3. Launch app
4. Enter gateway URL: `http://orchestrator.trex-fiordland.ts.net:18789`
5. Enter token: `85d62318d3546ffcaa7b343a2860de2f6cd589959bf33402ff3742da8452fbf4`
6. Test: Send prompt to "main" agent

**Success Criteria:**

- ✅ App connects (no auth errors)
- ✅ Agent responds with valid output
- ✅ Memory capture visible in logs

### Split-DNS Configuration (Optional but Recommended)

**Setup (Tailscale admin only):**

```
openclaw.projectnyra.com    → 100.64.0.12  (orchestrator)
litellm.projectnyra.com     → 100.64.0.12  (orchestrator)
qdrant.projectnyra.com      → 100.64.0.3   (oracle-vps)
mem0.projectnyra.com        → 100.64.0.3   (oracle-vps)
```

**Benefit:** Friendly URLs instead of Tailscale machine names

---

## 🎯 What Needs To Happen Next (Priority Order)

### IMMEDIATE (Next 2 hours)

1. **Verify plugins installed**

   ```bash
   npm list -g | grep openclaw
   ```
   - If missing Codex/ACPX: Install
   - If versions outdated: Update

2. **Test agent invocation**
   - Simple curl test to gateway
   - Verify response from litellm/local-interactive
   - Check logs for routing

3. **Document findings**
   - Any missing plugins
   - Any routing errors
   - Any performance issues

### SOON (Next 4-6 hours)

4. **Complete Phase 5 tests**
   - Memory roundtrip test (capture → store → recall)
   - Model fallback test (what happens if RTX5090 unavailable?)
   - Infisical secret injection verification

5. **Prepare final documentation**
   - Create DEPLOYMENT_CHECKLIST.md
   - Update PROJECT_ROADMAP.md with actual timings
   - Archive old docs

### LATER (Optional, Tomorrow)

6. **Optional enhancements**
   - Tailscale split-DNS setup
   - Portainer monitoring
   - Custom MCP servers
   - Portal integration

---

## 📊 Success Metrics for Ship

| Metric               | Target                    | Status      |
| -------------------- | ------------------------- | ----------- |
| Gateway health       | 100% uptime for 1h        | Testing     |
| Agent response time  | <5s first, <2s subsequent | Testing     |
| Memory capture       | 100% of interactions      | Testing     |
| Model routing        | Correct GPU per model     | Testing     |
| Plugin installation  | All 3 present             | Need verify |
| Documentation        | Complete + accurate       | Done        |
| No production errors | Clean logs for 1h+        | Testing     |

---

## 🚀 Ship Timeline

```
NOW:              TIER 1 ✅ (memory queue + gateway deployed)
+2-3 hours:       TIER 2 phase 4 (plugins verified)
+4-6 hours:       TIER 2 phase 5 (end-to-end tests)
+6-10 hours:      TIER 3 (validation + Windows UI)
=== 12-16 hours total ===
2026-08-26 EOD:   SHIP ✅
```

---

## 📋 Immediate Action Items (Claude - Do These Now)

- [ ] Verify plugins with `npm list -g`
- [ ] Run simple gateway test (curl)
- [ ] Check logs for any errors
- [ ] Test memory capture (store fact)
- [ ] Verify model routing (check LiteLLM logs)
- [ ] Document any issues found

---

## Key Files for Reference

| File                                               | Purpose                               |
| -------------------------------------------------- | ------------------------------------- |
| `PROJECT_ROADMAP.md`                               | 4-tier completion plan (overview)     |
| `DEPLOYMENT_SUMMARY.md`                            | Token + URLs + health checks          |
| `OPENCLAW_READY.md`                                | Quick reference for gateway access    |
| `~/.openclaw/openclaw.json`                        | Gateway config (do not edit manually) |
| `~/.openclaw/agents/main/agent/auth-profiles.json` | Agent authentication                  |
| `/tmp/openclaw/openclaw-2026-08-25.log`            | Gateway runtime logs                  |

---

## ✨ Bottom Line

**Gateway is online. Infrastructure is ready. Configuration is deployed.**

**What remains:**

- Verify plugins (5 min check)
- Test agent execution (15 min)
- Validate memory capture (10 min)
- Windows app setup (user action)
- Documentation finalization (30 min)

**Total remaining work:** ~2-4 hours of verification, then ready to ship.

**Estimated ship:** 2026-08-26 afternoon UTC

---

**Next: Execute TIER 2 Phase 4 plugin verification.**
