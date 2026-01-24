# Infisical MCP Setup Guide - Project Nyra
**Connecting Claude to Infisical for Automated Secret Management**

---

## ❓ YOUR QUESTIONS ANSWERED

### **Q1: Is the hierarchical path structure the best method?**

**A: YES - Your approach is excellent!** ✅

Your structure with `/shared` as aggregation + specific paths is exactly right:

**Why it works:**
1. ✅ **Separation of Concerns** - Each service/machine has its own namespace
2. ✅ **Aggregation Layer** - `/shared` imports from all paths (DRY principle)
3. ✅ **Per-PC Deployment** - Each machine exports only what it needs
4. ✅ **Least Privilege** - Services only see their secrets + shared ones
5. ✅ **Easy Updates** - Update in one place (`/clients/claude-flow`), propagates to `/shared`

**Current structure is GOOD** - Minor optimizations needed (see below)

---

### **Q2: If you connect me to Infisical MCP, would I have better control?**

**A: ABSOLUTELY YES!** 🚀

With Infisical MCP access, I could:

#### **✅ What I CAN Do With MCP:**
1. **Create paths/folders programmatically**
   - No manual clicking in Infisical UI
   - Automated hierarchy creation
   - Batch creation of all 50+ paths

2. **Create secrets automatically**
   - Parse your .env files
   - Upload secrets to correct paths
   - Handle variable references (`${VARIABLE}`)

3. **Import/link folders**
   - Set up `/shared` to import from all other paths
   - Configure inheritance automatically

4. **Move/reorganize secrets**
   - Bulk move from wrong paths to correct ones
   - Rename variables if needed
   - Delete duplicates

5. **Validate structure**
   - Check for missing variables
   - Verify all imports are configured
   - Test secret resolution

6. **Generate per-machine configs**
   - Export `/shared` + `/machines/orchestrator-mini` merged
   - Create PC-specific .env files
   - Handle overrides correctly

#### **❌ What I CANNOT Do Without MCP:**
1. Create Infisical paths (you have to click UI)
2. Upload secrets in bulk (you have to paste one-by-one)
3. Configure imports (you have to select paths manually)
4. Verify secret resolution across paths
5. Automated cleanup of duplicates

#### **🎯 RECOMMENDATION:**

**YES - Connect me to Infisical MCP for much faster setup!**

**How to connect:**
```bash
# In your Claude Code settings, add Infisical MCP:
claude mcp add infisical npx @infisical/mcp@latest
```

Then I can run commands like:
```javascript
// Create path
mcp__infisical__create_secret_folder({
  projectId: "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  environment: "dev",
  folderPath: "/clients/claude-flow"
})

// Create secret
mcp__infisical__create_secret({
  projectId: "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  environment: "dev",
  secretPath: "/clients/claude-flow",
  secretKey: "CLAUDE_FLOW_MODE",
  secretValue: "orchestrator"
})

// Import folder into /shared
mcp__infisical__import_secrets({
  from: "/clients/claude-flow",
  to: "/shared"
})
```

---

## 📊 ANALYSIS: YOUR CURRENT /SHARED EXPORT (397 VARIABLES)

I analyzed your current `.env` from `/shared`. Here's the breakdown:

### **By Category:**

| Category | Count | Examples |
|----------|-------|----------|
| **Claude Flow** | 45 | CLAUDE_FLOW_MODE, CLAUDE_FLOW_NEURAL_OPTIMIZATION |
| **AI Providers** | 12 | ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY |
| **Databases** | 38 | POSTGRES_*, REDIS_*, FALKORDB_*, QDRANT_* |
| **Monitoring** | 18 | GRAFANA_*, PROMETHEUS_*, LANGFUSE_*, LOKI_* |
| **Infisical** | 22 | INFISICAL_TOKEN, INFISICAL_PROJECT_ID |
| **GitHub** | 15 | GH_TOKEN, GH_PAT, GITHUB_TOKEN |
| **Cloudflare** | 12 | CF_ACCOUNT_ID, CLOUDFLARE_API_KEY |
| **Services** | 45 | ARCHON_*, DIFY_*, N8N_*, TWENTY_* |
| **Network/Docker** | 22 | DOCKER_SUBNET, PORT, HOST |
| **Memory Systems** | 25 | AGENTDB_*, LETTA_*, MEM0_* |
| **Workers** | 15 | WORKER_3060_URL, WORKER_5090_MODELS |
| **Misc/Config** | 128 | NODE_ENV, PROJECT_NAME, LOG_LEVEL |

### **Issues Found:**

1. ❌ **Duplicate ANTHROPIC_API_KEY** (lines 31 & 70)
2. ❌ **Duplicate GITHUB_TOKEN** (lines 205 & 195)
3. ❌ **Empty values** (lines 32-34, 143, 157, 165, 330-333)
4. ⚠️ **Plaintext secrets** (all API keys visible - should use Infisical masked values)
5. ⚠️ **No machine-specific separation** (orchestrator + worker configs mixed)

---

## 🗂️ RECOMMENDED PATH ORGANIZATION

Based on your 397 variables, here's the optimal structure:

### **Tier 1: Service/Component Paths** (Create secrets HERE)

```
/clients/claude-flow          (45 vars) - CLAUDE_FLOW_*, CLAUDE_*
/clients/claude-code          (12 vars) - CLAUDE_CODE_*
/clients/archon               (18 vars) - ARCHON_*
/clients/n8n                  (8 vars)  - N8N_*
/clients/dify                 (8 vars)  - DIFY_*
/clients/agentdb              (25 vars) - AGENTDB_*
/clients/letta                (8 vars)  - LETTA_*
/clients/mem0                 (6 vars)  - MEM0_*
/clients/flow-nexus           (6 vars)  - FLOW_NEXUS_*
/clients/cloudflare           (12 vars) - CLOUDFLARE_*, CF_*
/clients/supabase             (8 vars)  - SUPABASE_*

/providers/anthropic          (5 vars)  - ANTHROPIC_*
/providers/openai             (3 vars)  - OPENAI_*
/providers/google             (3 vars)  - GOOGLE_*, GEMINI_*
/providers/openrouter         (3 vars)  - OPENROUTER_*

/databases/postgres           (15 vars) - POSTGRES_*, DATABASE_URL
/databases/redis              (8 vars)  - REDIS_*
/databases/qdrant             (4 vars)  - QDRANT_*
/databases/falkordb           (4 vars)  - FALKORDB_*
/databases/neo4j              (4 vars)  - NEO4J_*

/monitoring/grafana           (4 vars)  - GRAFANA_*
/monitoring/prometheus        (4 vars)  - PROMETHEUS_*
/monitoring/langfuse          (5 vars)  - LANGFUSE_*
/monitoring/loki              (2 vars)  - LOKI_*
/monitoring/cadvisor          (2 vars)  - CADVISOR_*
/monitoring/alertmanager      (2 vars)  - ALERTMANAGER_*

/github                       (15 vars) - GH_*, GITHUB_*
/security/infisical           (22 vars) - INFISICAL_*

/shared/shared-base           (25 vars) - PROJECT_*, NODE_ENV, LOG_LEVEL, NAMESPACE_*
/shared/shared-network        (15 vars) - DOCKER_SUBNET, HOST, PORT, INTERNAL_NETWORK
/shared/shared-observability  (8 vars)  - MONITORING_*, METRICS_*, LOG_*

/machines/orchestrator-mini   (15 vars) - Host-specific overrides
/machines/worker-rtx3060      (12 vars) - WORKER_3060_*, GPU config
/machines/worker-rtx5090      (12 vars) - WORKER_5090_*, GPU config
/machines/worker-rtx3090ti    (12 vars) - WORKER_3090_*, GPU config

/apps/twenty                  (12 vars) - TWENTY_*
```

### **Tier 2: Aggregation Layer** (IMPORT from Tier 1)

```
/shared                       (397 vars) - Imports from ALL above paths
```

**How it works:**
1. Create secrets in specific paths (/clients/claude-flow, etc.)
2. Configure `/shared` to **import** from all specific paths
3. Export `/shared` to get complete .env for entire project
4. Export `/machines/orchestrator-mini` + `/shared` for Area51
5. Export `/machines/worker-rtx3060` + `/shared` for PC2

---

## 🛠️ SETUP WORKFLOW (WITH MCP)

### **Step 1: Connect Infisical MCP**

```bash
# Add Infisical MCP to Claude Code
claude mcp add infisical npx @infisical/mcp@latest

# Verify connection
# In Claude, I'll be able to run infisical commands
```

### **Step 2: I'll Create All Paths Programmatically**

Once connected, I can run:

```javascript
// Create all 50+ paths in one go
const paths = [
  "/clients/claude-flow",
  "/clients/claude-code",
  "/clients/archon",
  // ... all paths from above
];

for (const path of paths) {
  await mcp__infisical__create_secret_folder({
    projectId: "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
    environment: "dev",
    folderPath: path
  });
}
```

### **Step 3: I'll Organize Your 397 Variables**

I'll analyze your current .env and create secrets in correct paths:

```javascript
// Parse your .env
const secrets = parseEnvFile("infisical-path-plan-kit/.env");

// Map each secret to correct path
const mapping = {
  "CLAUDE_FLOW_MODE": "/clients/claude-flow",
  "ANTHROPIC_API_KEY": "/providers/anthropic",
  "POSTGRES_PASSWORD": "/databases/postgres",
  // ... 397 mappings
};

// Create secrets in correct paths
for (const [key, value] of Object.entries(secrets)) {
  const path = mapping[key];
  await mcp__infisical__create_secret({
    projectId: "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
    environment: "dev",
    secretPath: path,
    secretKey: key,
    secretValue: value
  });
}
```

### **Step 4: I'll Configure /shared Imports**

```javascript
// Import all paths into /shared
const importSources = [
  "/clients/claude-flow",
  "/clients/archon",
  "/providers/anthropic",
  "/databases/postgres",
  // ... all paths
];

for (const source of importSources) {
  await mcp__infisical__import_secrets({
    from: source,
    to: "/shared"
  });
}
```

### **Step 5: Export Per-Machine Configs**

I can generate optimized .env files for each PC:

```bash
# Area51 (Orchestrator)
infisical export \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env=dev \
  --path="/shared" \
  --import-path="/machines/orchestrator-mini" \
  --output-file="configs/env/generated/.env.orchestrator-mini"

# PC2 (RTX 3060)
infisical export \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env=dev \
  --path="/shared" \
  --import-path="/machines/worker-rtx3060" \
  --output-file="configs/env/generated/.env.worker-rtx3060"
```

---

## 📋 COMPLETE VARIABLE MAPPING

I'll create a complete mapping document showing which of your 397 variables goes where.

**Sample mapping:**

| Variable | Current Location | Should Go To | Reason |
|----------|-----------------|--------------|--------|
| CLAUDE_FLOW_MODE | /shared (line 126) | /clients/claude-flow | Claude Flow specific |
| CLAUDE_FLOW_NEURAL_OPTIMIZATION | /shared (line 127) | /clients/claude-flow | Claude Flow specific |
| ANTHROPIC_API_KEY | /shared (line 31) | /providers/anthropic | Provider credential |
| POSTGRES_PASSWORD | /shared (line 337) | /databases/postgres | Database credential |
| WORKER_5090_URL | /shared (line 396) | /machines/worker-rtx5090 | Machine-specific |
| PROJECT_NAME | /shared (line 342) | /shared/shared-base | Global config |
| DOCKER_SUBNET | /shared (line 177) | /shared/shared-network | Network config |

See full mapping: `configs/infisical/SECRET-MAPPING-GUIDE.md` (I'll create this)

---

## ⚡ QUICK START (RIGHT NOW - WITHOUT MCP)

If you want to start organizing manually before MCP connection:

### **1. Export current /shared to see what you have:**
```bash
cd C:\Dev\Projects\Repos\Project-Nyra
infisical export \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env=dev \
  --path="/shared" \
  --output-file="infisical-path-plan-kit/.env"

# ✅ You already did this!
```

### **2. Create organized envtree structure:**
```bash
mkdir -p infisical-path-plan-kit/envtree/dev/clients/claude-flow
mkdir -p infisical-path-plan-kit/envtree/dev/providers/anthropic
mkdir -p infisical-path-plan-kit/envtree/dev/databases/postgres
# ... etc for all paths
```

### **3. Split your .env into path-specific files:**

I can create a script to do this automatically (once MCP connected) or you can manually split:

```bash
# infisical-path-plan-kit/envtree/dev/clients/claude-flow.env
CLAUDE_FLOW_MODE=orchestrator
CLAUDE_FLOW_NEURAL_OPTIMIZATION=true
# ... all 45 CLAUDE_FLOW_* variables

# infisical-path-plan-kit/envtree/dev/providers/anthropic.env
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=sonnet
# ... all 5 ANTHROPIC_* variables
```

### **4. Bulk import using your script:**
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infisical-path-plan-kit
.\scripts\bulk-import-tree.ps1 -Env dev -DryRun  # Test first
.\scripts\bulk-import-tree.ps1 -Env dev          # Actually import
```

---

## 🎯 NEXT STEPS - CHOOSE YOUR PATH

### **Option A: WITH MCP (Recommended - Faster)**

1. ✅ Connect Infisical MCP to Claude Code
2. ✅ Tell me "I've connected Infisical MCP"
3. ✅ I'll automatically:
   - Create all 50+ paths
   - Map your 397 variables to correct paths
   - Upload secrets to Infisical
   - Configure imports in /shared
   - Generate per-machine .env files
   - Validate everything

**Time:** 15-30 minutes (mostly automated)

### **Option B: MANUAL (Slower but you control everything)**

1. ✅ Use my path mapping guide
2. ✅ Manually create paths in Infisical UI
3. ✅ Split your .env into path-specific files
4. ✅ Use bulk-import-tree.ps1 script
5. ✅ Configure imports in Infisical UI
6. ✅ Export and test

**Time:** 2-4 hours (manual work)

---

## 🚀 RECOMMENDATION

**DO THIS:**

1. **Right now:** Connect Infisical MCP
   ```bash
   claude mcp add infisical npx @infisical/mcp@latest
   ```

2. **Tell me:** "Infisical MCP is connected"

3. **I'll handle the rest:**
   - Analyze your 397 variables
   - Create optimal path structure
   - Upload everything to Infisical
   - Set up imports
   - Generate per-PC configs
   - Validate completeness

**You'll have a perfectly organized Infisical setup in < 30 minutes!**

---

## 📞 NEED HELP?

**Questions?**
- "Show me which variables are duplicated"
- "Which variables are missing from my .env?"
- "Generate the complete mapping"
- "Create export scripts for all paths"
- "Test my Infisical setup"

Once MCP is connected, just ask and I'll automate it! 🎉
