# Project Nyra — Strategic Roadmap & Action Plan

**Date:** 2026-08-25  
**Status:** Infrastructure operational. Gateway deployed. Now: Complete configuration → test → ship.

---

## 📊 Current State Assessment

### ✅ OPERATIONAL (Verified Today)

- **OpenClaw Gateway** — Running (port 18789, PID 429841)
- **Memory Stack** — Mem0, Qdrant, FalkorDB, Letta (oracle-vps)
- **LiteLLM** — Running (port 4000 + 4010, Docker)
- **Infisical** — 376 secrets injected, auth cached
- **Docker Contexts** — All 8 worker nodes accessible
- **4 Agents** — main, researcher, reviewer, memory-worker (configured)

### ⚠️ INCOMPLETE / PENDING

| Phase                                    | Status         | Blocker         | Priority  |
| ---------------------------------------- | -------------- | --------------- | --------- |
| **Phase 4:** Plugins (Mem0, Codex, ACPX) | 30%            | None            | 🔴 HIGH   |
| **Phase 5:** Orchestrator patches        | 0%             | Phase 4         | 🔴 HIGH   |
| **Windows OpenClaw UI**                  | Docs ready     | User install    | 🟡 MEDIUM |
| **Split-DNS**                            | Docs ready     | Tailscale admin | 🟡 MEDIUM |
| **End-to-end test**                      | Not started    | Phase 4+5       | 🔴 HIGH   |
| **Memory review queue**                  | 31 candidates  | Review logic    | 🔴 URGENT |
| **State commit**                         | Staged changes | Review          | 🔴 URGENT |

---

## 🎯 Priority Action Plan

### TIER 1: UNBLOCK (Do First — 2-3 hours)

1. **Clear memory review queue** (31 candidates, 35+ days old)
   - Run: `python3 .agent/tools/list_candidates.py`
   - Decide: graduate high-priority ops, reject old duplicates
   - Command: `python3 .agent/tools/graduate.py <id> --rationale "..."`

2. **Commit staged changes**
   - What's staged: `.agent/memory/*`, `.omc/state/*`, `docs/**`
   - Command: Standard git add + commit
   - Branch: `nyra/phase2-mcp-memory`

3. **Fix systemd gateway service** (optional, manual start works)
   - Issue: Exit 216/GROUP on Infisical auth
   - Path: `~/.config/systemd/user/openclaw-gateway.service`
   - Workaround: Manual daemon (`infisical run ... openclaw gateway`) ✅ working

### TIER 2: COMPLETE CONFIGURATION (4-6 hours)

4. **Phase 4: Install remaining plugins**
   - Mem0: `npm install -g @mem0/openclaw-mem0@0.4.1` (already installed)
   - Codex: `npm install -g @openclaw/codex` (verify installed)
   - ACPX: `npm install -g @openclaw/acpx` (verify installed)
   - Action: Verify all 3 in `~/.openclaw/openclaw.json` plugins.allow

5. **Phase 5: Orchestrator configuration patches**
   - Test agent invocation (main → litellm/nyra/local-interactive)
   - Test memory roundtrip (store fact → Mem0 → Qdrant)
   - Validate Infisical secret injection in agent context

6. **Windows OpenClaw companion setup**
   - User downloads app from openclaw.ai/download
   - User enters gateway URL + token (from DEPLOYMENT_SUMMARY.md)
   - Test connection from Windows

### TIER 3: VALIDATE & SHIP (3-4 hours)

7. **End-to-end agent execution test**
   - Simple prompt: "List 3 facts about project Nyra"
   - Verify: Model routing logs, Mem0 capture, response quality
   - Failure modes: Check logs, debug LiteLLM routing

8. **Optional: Tailscale split-DNS**
   - Friendly URLs: openclaw.projectnyra.com, litellm.projectnyra.com, etc.
   - User configures in Tailscale admin console
   - Not blocking but improves usability

9. **Documentation & handoff**
   - Update PROJECT_ROADMAP.md with completion status
   - Create final DEPLOYMENT_CHECKLIST.md for operations
   - Archive old docs (archive/*)

### TIER 4: ENHANCEMENTS (Later, Optional)

10. **Portal MCP integration** (blocked on interactive OAuth)
11. **Additional UI surfaces** (AionUI, ClawTeam web interface, etc.)
12. **Custom MCP servers** (Nexus routing for internal tools)
13. **Monitoring & logging** (Prometheus + Grafana setup)

---

## 📋 Immediate Next Steps (Do Now)

### Step 1: Clear Review Queue (15 min)

```bash
cd ~/repos/project-nyra
python3 .agent/tools/list_candidates.py | head -50
# Review each candidate (high-priority first)
# Graduate: infra ops, secret ops, config deployments
# Reject: old duplicates, superseded entries, failed experiments

# Example:
python3 .agent/tools/graduate.py 831089d17679 \
  --rationale "High-stakes docker inspection completed successfully, worker node configs verified"

python3 .agent/tools/graduate.py 2f0434f7bdbd \
  --rationale "Production env setup verified, Infisical secrets injected successfully"

# For stale/bad entries:
python3 .agent/tools/reject.py <id> --reason "Superseded by later work" or "Duplicate entry"
```

### Step 2: Commit State (5 min)

```bash
git status  # Review changes
git add -A  # Stage all
git commit -m "chore(phase2): graduate memory candidates, deploy openclaw gateway config"
```

### Step 3: Verify Gateway Stability (5 min)

```bash
# Health check
curl -fsS http://127.0.0.1:18789/health

# Check logs
tail -20 /tmp/openclaw/openclaw-2026-08-25.log

# Verify agent auth
cat ~/.openclaw/agents/main/agent/auth-profiles.json
```

### Step 4: Test Agent Invocation (10 min)

```bash
# (To be implemented in Phase 4-5 completion)
# For now: Verify agents are configured
ls -la ~/.openclaw/agents/*/agent/
```

---

## 📊 Completion Timeline

| Phase              | Effort     | ETA            | Owner                                    |
| ------------------ | ---------- | -------------- | ---------------------------------------- |
| TIER 1 (Unblock)   | 2-3h       | Now            | Claude (execute)                         |
| TIER 2 (Configure) | 4-6h       | +3-6h          | Claude (phase 4) + Claude (phase 5 test) |
| TIER 3 (Validate)  | 3-4h       | +6-10h         | Claude + User (Windows app)              |
| **TOTAL TO SHIP**  | **12-16h** | **2026-08-26** | —                                        |

---

## 🎯 Success Criteria

### Gateway Operational ✅

- [ ] Health check returns `{"ok":true,"status":"live"}`
- [ ] Responds to authenticated requests with gateway token

### Agents Working ✅

- [ ] All 4 agents respond to prompts
- [ ] Model routing verified (uses correct GPU per model)
- [ ] LiteLLM returns valid responses

### Memory Functional ✅

- [ ] Mem0 plugin captures interactions
- [ ] Facts stored in Qdrant (vectors)
- [ ] Facts retrievable (auto-recall in subsequent prompts)

### Windows UI Connected ✅

- [ ] Windows OpenClaw app connects to gateway
- [ ] Can invoke agents from Windows UI
- [ ] Responses visible in app console

### Deployment Ready ✅

- [ ] All uncommitted changes committed
- [ ] Documentation updated
- [ ] No blocking errors in logs

---

## 🚀 Ship Criteria

**Ready to ship when:**

1. ✅ TIER 1 complete (review queue cleared, committed)
2. ✅ TIER 2 complete (plugins verified, config tested)
3. ✅ TIER 3 complete (E2E test passed, Windows UI verified)
4. ✅ Documentation updated
5. ✅ No production errors in 1h running log

**Estimated ship date:** 2026-08-26 EOD

---

## 📞 Known Blockers & Workarounds

| Issue                   | Status              | Workaround                           |
| ----------------------- | ------------------- | ------------------------------------ |
| Systemd auth (exit 216) | Known               | Use manual daemon (working)          |
| Portal OAuth            | Interactive only    | Out of scope for Claude              |
| Memory API DNS          | Oracle network only | Run tests inside Oracle VPC          |
| WSL2 keyring            | WSL limitation      | Cache auth locally, deploy artifacts |

---

## 💾 Configuration Backups

**Keep these safe:**

- `~/.openclaw/openclaw.json.last-good` (working config)
- `~/.openclaw/agents/main/agent/auth-profiles.json` (LiteLLM creds)
- `docs/ai-orchestration/DEPLOYMENT_SUMMARY.md` (token + URLs)

---

**Status:** Ready to execute TIER 1 → TIER 2 → TIER 3 → Ship

Proceed when ready. All infrastructure in place. Last blockers are config verification + plugin installation.
