# Current Infisical Imports Analysis
**Your /shared path imports - Completeness Check**

---

## ✅ CURRENT IMPORTS TO /SHARED (44 paths)

### **Base & Security**
1. ✅ `/base`
2. ✅ `/security`
3. ✅ `/security/infisical`

### **Source Control**
4. ✅ `/github`
5. ✅ `/gitea`

### **Routing/Proxies**
6. ✅ `/router`

### **Clients (22 paths)**
7. ✅ `/clients/claude-flow`
8. ✅ `/clients/claude-code`
9. ✅ `/clients/agentdb`
10. ✅ `/clients/archon`
11. ✅ `/clients/flow-nexus`
12. ✅ `/clients/nexus-router`
13. ✅ `/clients/composio`
14. ✅ `/clients/dify`
15. ✅ `/clients/mem0` (appears twice - lines 18 & 37)
16. ✅ `/clients/n8n`
17. ✅ `/clients/ollama`
18. ✅ `/clients/openmemory`
19. ✅ `/clients/owui` (Open WebUI)
20. ✅ `/clients/exa-mcp`
21. ✅ `/clients/desktopcommander`
22. ✅ `/clients/slack`
23. ✅ `/clients/graphiti`
24. ✅ `/clients/docker-hub`
25. ✅ `/clients/activepieces`
26. ✅ `/clients/cloudflare`
27. ✅ `/clients/letta`

### **Databases (10 paths)**
28. ✅ `/databases/redis`
29. ✅ `/databases/supabase`
30. ✅ `/databases/postgres` (appears twice - lines 13 & 28)
31. ✅ `/databases/qdrant-local`
32. ✅ `/databases/mongo`
33. ✅ `/databases/letta`
34. ✅ `/databases/twenty`
35. ✅ `/databases/neo4j`
36. ✅ `/databases/falkordb`
37. ✅ `/databases/minio`

### **Monitoring**
38. ✅ `/monitoring`

### **Apps**
39. ✅ `/apps/twenty`

---

## ❌ MISSING IMPORTS (Based on your 397 variables)

### **🚨 CRITICAL MISSING (AI Providers)**
```
❌ /providers/anthropic       - ANTHROPIC_API_KEY (lines 31, 70)
❌ /providers/openai          - OPENAI_API_KEY (line 321)
❌ /providers/google          - GOOGLE_API_KEY (lines 208, 192)
❌ /providers/openrouter      - OPENROUTER_API_KEY (line 323)
❌ /providers/deepseek        - (if using)
❌ /providers/gemini          - GEMINI_API_KEY (line 192)
```

**Impact:** You have AI provider keys in your .env but no dedicated `/providers/*` paths!
These are currently likely in `/base` or scattered across client paths.

**Fix:** Create `/providers/anthropic`, `/providers/openai`, etc. and move keys there.

---

### **⚠️ HIGH PRIORITY MISSING**

#### **Machines (Per-PC Configs)**
```
❌ /machines/orchestrator-mini    - Area51 specific config
❌ /machines/worker-rtx3060       - PC2 GPU worker config
❌ /machines/worker-rtx5090       - PC3 GPU worker config (primary)
❌ /machines/worker-rtx3090ti     - PC4 GPU worker config
```

**Variables affected:**
- `WORKER_3060_URL`, `WORKER_3060_MODELS` (lines 391-392)
- `WORKER_5090_URL`, `WORKER_5090_MODELS` (lines 395-396)
- `WORKER_3090_URL`, `WORKER_3090_MODELS` (lines 393-394)
- Machine-specific: `HOST_ROLE`, `GPU_TYPE`, `OLLAMA_HOST`

**Impact:** No machine-specific overrides! All PCs would get same config.

---

#### **Shared Subcategories**
```
❌ /shared/shared-base             - Global defaults (PROJECT_*, NODE_ENV)
❌ /shared/shared-network          - Network config (DOCKER_SUBNET, INTERNAL_NETWORK)
❌ /shared/shared-observability    - Monitoring defaults
```

**Current situation:** You have `/base` but not organized shared subcategories.
Your current `/base` might contain these - should be split into `/shared/shared-*`

---

### **📦 MEDIUM PRIORITY MISSING**

#### **Additional Clients/Services**
```
❌ /clients/ruvector         - RUVECTOR_*, RUV_SWARM_* (lines 364-366)
❌ /clients/ruv-swarm        - (same as above, depending on your naming)
❌ /clients/bitwarden        - BITWARDEN_MCP_URL (line 63)
❌ /clients/agentic-flow     - AGENTIC_FLOW_TRAINING (line 27)
❌ /clients/agent-booster    - AGENT_BOOSTER_ENABLED (line 28)
❌ /clients/langfuse         - LANGFUSE_* (lines 260-262)
```

**Variables found:**
- Line 27: `AGENTIC_FLOW_TRAINING='true'`
- Line 28: `AGENT_BOOSTER_ENABLED='true'`
- Line 63: `BITWARDEN_MCP_URL='http://bitwarden-mcp:4003'`
- Lines 260-262: LANGFUSE_* vars
- Lines 364-366: RUV_SWARM_* vars

---

#### **Monitoring Subcategories**
```
❌ /monitoring/grafana       - GRAFANA_* (lines 210-211)
❌ /monitoring/prometheus    - PROMETHEUS_* (line 343)
❌ /monitoring/loki          - LOKI_* (line 275)
❌ /monitoring/langfuse      - LANGFUSE_* (lines 260-262)
❌ /monitoring/cadvisor      - CADVISOR_PORT (line 65)
❌ /monitoring/alertmanager  - ALERTMANAGER_PORT (line 30)
```

**Current:** You have `/monitoring` but not sub-organized.

---

### **🔧 LOW PRIORITY MISSING**

#### **Adapters/Routing**
```
❌ /adapters/openai-via-openrouter  - You have this in envtree!
❌ /adapters/litellm                - LITELLM_* (lines 270-272)
```

**Note:** Found `envtree/dev/adapters/openai-via-openrouter.env` but not imported to `/shared`

---

#### **Additional Apps**
```
❌ /apps/ratehunter      - RateHunter landing page (if separate from main)
❌ /apps/dify            - (currently in /clients/dify, should it be /apps/dify?)
❌ /apps/nexus-dashboard - Nexus dashboard
```

**Decision needed:** Should dify, owui, nexus-dashboard be `/apps/*` or `/clients/*`?
- `/apps/*` = Separate applications with own lifecycle
- `/clients/*` = Services/tools called by main app

---

## 🔄 DUPLICATES FOUND

### **Duplicate Imports:**
1. ⚠️ `/clients/mem0` - **IMPORTED TWICE** (your list shows it at positions 15 & 37)
2. ⚠️ `/databases/postgres` - **IMPORTED TWICE** (positions 13 & 28)

**Action:** Remove duplicate imports from /shared configuration

---

### **Duplicate Variables in .env:**
1. `ANTHROPIC_API_KEY` - Lines 31 & 70 (same value)
2. `GITHUB_TOKEN` - Lines 205, 195, 199, 206 (multiple with slightly different names)
3. `GOOGLE_API_KEY` - Lines 208 & 192 (different values!)
   - Line 192: `AIzaSyB9whIHRcycHdGKr8tFuKe5KAVGm6cDAqs`
   - Line 208: `AIzaSyAGoltxkY3Ef8XSq7Pr-8fZsoBPz_gz6ZE`
4. `INFISICAL_TOKEN` - Lines 257 & 238 (same value)

**Action:** Keep in one path only, remove duplicates

---

## 📝 RECOMMENDATIONS

### **1. Add Missing Provider Paths** 🚨 CRITICAL
```bash
# Create these paths in Infisical:
/providers/anthropic
/providers/openai
/providers/google
/providers/openrouter
/providers/gemini

# Move variables:
ANTHROPIC_API_KEY -> /providers/anthropic
OPENAI_API_KEY -> /providers/openai
GOOGLE_API_KEY -> /providers/google
OPENROUTER_API_KEY -> /providers/openrouter
```

Then import to /shared:
```
/shared imports from:
  - /providers/anthropic
  - /providers/openai
  - /providers/google
  - /providers/openrouter
```

---

### **2. Add Machine-Specific Paths** ⚠️ HIGH PRIORITY
```bash
# Create:
/machines/orchestrator-mini
/machines/worker-rtx3060
/machines/worker-rtx5090
/machines/worker-rtx3090ti

# Each contains:
- HOST_ROLE (orchestrator vs worker)
- GPU_TYPE, GPU_VRAM (workers only)
- OLLAMA_HOST (0.0.0.0:11434 on workers, routes to workers on orchestrator)
- WORKER_*_URL (for orchestrator to know worker URLs)
- Machine-specific overrides
```

**Import strategy:**
- `/shared` does NOT import from `/machines/*`
- Each PC exports `/shared` + `/machines/<its-machine>`
- This gives machine-specific overrides

---

### **3. Organize Shared Subcategories** 📦 MEDIUM
```bash
# Split /base into:
/shared/shared-base         (PROJECT_NAME, NODE_ENV, LOG_LEVEL)
/shared/shared-network      (DOCKER_SUBNET, INTERNAL_NETWORK)
/shared/shared-observability (MONITORING_*, METRICS_*)

# Remove /base or keep as legacy
```

---

### **4. Split Monitoring Path** 🔧 LOW PRIORITY
```bash
# Split /monitoring into:
/monitoring/grafana
/monitoring/prometheus
/monitoring/loki
/monitoring/langfuse
/monitoring/cadvisor
/monitoring/alertmanager

# Then /monitoring imports from all sub-paths
# Then /shared imports from /monitoring
```

---

### **5. Add Missing Client Paths** 📦 MEDIUM
```bash
/clients/bitwarden
/clients/agentic-flow
/clients/agent-booster
/clients/ruvector
/clients/ruv-swarm  # Or same as ruvector?
```

---

### **6. Fix Duplicates** ⚠️ IMPORTANT
```bash
# Remove duplicate imports:
- Remove one of the two /clients/mem0 imports
- Remove one of the two /databases/postgres imports

# Consolidate duplicate variables:
- Keep ANTHROPIC_API_KEY in /providers/anthropic only
- Keep GOOGLE_API_KEY in /providers/google only (decide which key to use!)
- Consolidate GitHub tokens (GH_TOKEN, GH_PAT, GITHUB_TOKEN - pick one name)
```

---

## 📋 COMPLETE RECOMMENDED IMPORT LIST

### **For /shared to import from:**

```
✅ /base (or split into /shared/shared-*)
✅ /security
✅ /security/infisical
✅ /github
✅ /gitea (if using)
✅ /router

❌ ADD: /providers/anthropic
❌ ADD: /providers/openai
❌ ADD: /providers/google
❌ ADD: /providers/openrouter

✅ /clients/claude-flow
✅ /clients/claude-code
✅ /clients/agentdb
✅ /clients/archon
✅ /clients/flow-nexus
✅ /clients/nexus-router
✅ /clients/composio
✅ /clients/dify
✅ /clients/mem0 (remove duplicate)
✅ /clients/n8n
✅ /clients/ollama
✅ /clients/openmemory
✅ /clients/owui
✅ /clients/exa-mcp
✅ /clients/desktopcommander
✅ /clients/slack
✅ /clients/graphiti
✅ /clients/docker-hub
✅ /clients/activepieces
✅ /clients/cloudflare
✅ /clients/letta
❌ ADD: /clients/bitwarden
❌ ADD: /clients/agentic-flow
❌ ADD: /clients/agent-booster
❌ ADD: /clients/ruvector

✅ /databases/redis
✅ /databases/supabase
✅ /databases/postgres (remove duplicate)
✅ /databases/qdrant-local
✅ /databases/mongo
✅ /databases/letta
✅ /databases/twenty
✅ /databases/neo4j
✅ /databases/falkordb
✅ /databases/minio

✅ /monitoring (or split into sub-paths)
  ❌ ADD (optional): /monitoring/grafana
  ❌ ADD (optional): /monitoring/prometheus
  ❌ ADD (optional): /monitoring/loki
  ❌ ADD (optional): /monitoring/langfuse

✅ /apps/twenty

❌ DO NOT IMPORT: /machines/* (these are per-PC overrides)
```

---

## 🎯 PRIORITY ACTION ITEMS

### **DO NOW (Critical):**
1. ✅ Create `/providers/anthropic` path
2. ✅ Create `/providers/openai` path
3. ✅ Create `/providers/google` path
4. ✅ Create `/providers/openrouter` path
5. ✅ Move AI provider keys to respective paths
6. ✅ Import `/providers/*` paths into `/shared`

### **DO TODAY (High Priority):**
7. ✅ Create `/machines/orchestrator-mini`
8. ✅ Create `/machines/worker-rtx3060`
9. ✅ Create `/machines/worker-rtx5090`
10. ✅ Create `/machines/worker-rtx3090ti`
11. ✅ Add machine-specific variables to each
12. ✅ Remove duplicate imports (mem0, postgres)

### **DO THIS WEEK (Medium):**
13. ✅ Add missing client paths (bitwarden, agentic-flow, etc.)
14. ✅ Split `/base` into `/shared/shared-*` subcategories
15. ✅ Organize monitoring into sub-paths (optional)

---

## 🚀 IF I HAD INFISICAL MCP ACCESS

I could automate ALL of this:

```javascript
// 1. Create missing paths
const missingPaths = [
  "/providers/anthropic",
  "/providers/openai",
  "/providers/google",
  "/providers/openrouter",
  "/machines/orchestrator-mini",
  "/machines/worker-rtx3060",
  "/machines/worker-rtx5090",
  "/machines/worker-rtx3090ti",
  "/clients/bitwarden",
  "/clients/agentic-flow",
  "/clients/agent-booster",
  "/clients/ruvector"
];

for (const path of missingPaths) {
  await createPath(path);
}

// 2. Move variables to correct paths
await moveSecret("ANTHROPIC_API_KEY", from: "/shared", to: "/providers/anthropic");
await moveSecret("OPENAI_API_KEY", from: "/shared", to: "/providers/openai");
// ... etc

// 3. Fix duplicates
await removeDuplicateImport("/shared", "/clients/mem0");
await removeDuplicateVariable("/shared", "ANTHROPIC_API_KEY", keepLine: 31);

// 4. Configure imports
await addImport("/shared", from: "/providers/anthropic");
await addImport("/shared", from: "/providers/openai");
// ... etc

// 5. Validate
const validation = await validateSecrets("/shared");
console.log(validation); // Shows missing, duplicates, etc.
```

**This would take 2-3 minutes with MCP vs. 2-3 hours manually!**

---

## 📞 NEXT STEPS

**Want me to automate this?**

1. Connect Infisical MCP: `claude mcp add infisical npx @infisical/mcp@latest`
2. Tell me: "Infisical MCP connected"
3. I'll fix everything automatically!

**OR prefer manual:**

Use this document as your checklist and create paths in Infisical UI.

---

**Questions?**
- "Show me which variables should go in /providers/anthropic"
- "Generate the split .env files for each path"
- "Create the import configuration"
- "Validate my current setup"

Just ask! 🚀
