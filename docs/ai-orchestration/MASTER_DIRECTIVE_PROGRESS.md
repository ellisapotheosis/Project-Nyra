# Master Directive: Project Nyra System Convergence

## Execution Status Report

**Started:** 2026-08-25 02:45 UTC
**Status:** IN PROGRESS (Phase 2 - OpenClaw Install)
**Blockers:** npm install timeout (large dependency tree)

---

## Phase 1: Environment Audit & Conflict Cleanup ✅ COMPLETE

### Findings

- ✅ No old OpenClaw containers running
- ✅ Port 18789 (OpenClaw gateway) is free
- ✅ Node 22.22.1 installed
- ✅ Existing ~/.openclaw/openclaw.json backed up to timestamped file
- ✅ ~/.openclaw/workspace directory created and secured (700 perms)

### Actions Taken

```bash
# Backup existing config
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.YYYYMMDD-HHMMSS

# Create workspace
mkdir -p ~/.openclaw/workspace && chmod 700 ~/.openclaw ~/.openclaw/workspace
```

---

## Phase 2: Runtime & Core OpenClaw Installation 🔄 IN PROGRESS

### Current Action

```bash
npm install -g openclaw@latest
```

**Status:** Running on orchestrator WSL (PID remote, started 02:45 UTC)

**Expected Duration:** npm installs typically 2-5 min for CLI tools; OpenClaw may be larger

**Next Steps (when install completes):**

1. Verify: `openclaw --version`
2. Validate schema: `openclaw config schema --json`
3. Proceed to Phase 3

---

## Phase 3: Secret Injection & Embedding Probing 🔲 QUEUED

### Infisical Status

- ✅ Infisical CLI v0.43.125 available (`/usr/bin/infisical`)
- ✅ `infisical run` command available for secret injection
- ⏳ Awaiting OpenClaw install to proceed

### Commands Prepared

```bash
# Launch Infisical-injected environment
infisical run --env=dev --path=/hosts/orchestrator -- bash

# Probe LiteLLM for embedding dimensions
EMBED_DIM="$(curl -fsS -H "Authorization: Bearer ${LITELLM_OPENCLAW_KEY}" \
  -H 'Content-Type: application/json' "${LITELLM_BASE_URL}/embeddings" \
  -d '{"model":"nyra/embedding","input":"dimension probe"}' | jq '.data[0].embedding | length')"
```

---

## Phase 4: Plugin Setup & Model Auth 🔲 QUEUED

### Plugins to Install

- `@falkordb/openclaw-mem0@0.4.1`
- `@openclaw/codex`
- `@openclaw/acpx`

### Authentication Required

- Claude Code subscription (native CLI auth)
- OpenAI API key (for OpenRouter fallback)
- Anthropic API (via native `claude auth`)

---

## Phase 5: Patch Orchestrator Gateway Configuration 🔲 QUEUED

### Configuration File

`/tmp/nyra-openclaw.patch.json5` — 125+ line config patch covering:

- Gateway mode, port (18789), auth (token + Tailscale)
- Model providers (LiteLLM, OpenRouter, vLLM)
- Agents (main, researcher, reviewer, memory-worker)
- Plugins (mem0, codex, acpx)
- MCP servers (nexus)
- Browser & eval policies

---

## Phase 6: Subsystem Ecosystem Integration 🔲 QUEUED

### Subsystems to Integrate

1. **Omnigent** — Governance layer (ALLOW/DENY/ASK policies)
2. **ClawTeam + OpenHarness** — Multi-worker orchestration
3. **Nerve UI** — Workspace UI (tailscale DNS)
4. **Mission Control Audit** — Read-only forensics (HARDENED)
5. **AgentsMesh CI** — Config drift detection

---

## Validation & Verification Checklist 🔲 QUEUED

### Smoke Tests (6 total)

| Test                | Command                                       | Status                   |
| ------------------- | --------------------------------------------- | ------------------------ |
| Local Model Route   | `openclaw agent ... "NYRA_LOCAL_GREEN"`       | ⏳ Blocked on Phase 2    |
| Free Route Fallback | `openclaw agent ... model: litellm/nyra/free` | ⏳ Blocked on Phase 2    |
| Claude Subscription | Native OAuth login                            | ⏳ Blocked on Phase 2    |
| Codex Subscription  | OpenAI OAuth login                            | ⏳ Blocked on Phase 2    |
| Mem0 + FalkorDB     | Vector/graph collection reachable             | ⏳ Needs Phase 3 secrets |
| Nexus MCP           | Streamable HTTP endpoint responds             | ⏳ Needs Phase 5 config  |

---

## Known Blockers & Mitigation

| Blocker                         | Impact                | Mitigation                                   |
| ------------------------------- | --------------------- | -------------------------------------------- |
| **npm install timeout**         | Phases 3-6 stalled    | Waiting for install; estimated 5-10 min      |
| **Interactive OAuth**           | Claude/Codex auth     | User must complete browser login             |
| **Infisical secrets**           | Secret injection      | Already verified (`infisical run` available) |
| **Orchestrator Docker context** | Remote container mgmt | Workaround: use default context              |
| **LiteLLM embedding probe**     | Mem0 setup            | Depends on Phase 3 Infisical secrets         |

---

## Owner Actions Required

1. ⏳ **Allow npm install to complete** (~5-10 min; SSH tunnel may timeout)
2. 👤 **Complete Claude OAuth login** (Phase 4) — browser required
3. 👤 **Complete Codex OAuth login** (Phase 4) — browser required
4. 👤 **Optional: Verify Nexus MCP** (Phase 6) — requires Portal tool invocation

---

## Estimated Timeline

- **Phase 1:** ✅ 3 min (completed)
- **Phase 2:** ⏳ 5-10 min (npm install running)
- **Phase 3:** 5 min (once Phase 2 completes)
- **Phase 4:** 15+ min (includes OAuth browser steps)
- **Phase 5:** 10 min (config patch + validation)
- **Phase 6:** 20 min (subsystem integration)
- **Validation:** 10 min (smoke test suite)

**Total Estimated:** 60-90 min from npm install completion

---

## Next Report

Will update when:

1. ✅ OpenClaw install completes
2. ✅ Phase 3 secrets injected
3. ✅ Phase 4 authentication complete
