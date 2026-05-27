# 🔗 Direct Links for Secret Rotation

**EMERGENCY ROTATION REFERENCE** - Direct links to API key management for all 50+ compromised services

---

## 🚨 TIER 1 - CRITICAL (Do First)

### GitHub (4 tokens)

**🔗 [GitHub Personal Access Tokens](https://github.com/settings/tokens)**

- Delete: GITHUB_TOKEN, GITHUB_API_KEY, GITHUB_PAT, GH_TOKEN
- Create new tokens with same scopes: `repo`, `workflow`, `write:packages`

### OpenAI (4 keys)

**🔗 [OpenAI API Keys](https://platform.openai.com/api-keys)**

- Delete: OPENAI_API_KEY, OPENAI_API_KEY_CREWAI, OPENAI_API_KEY_NYRA, OPENAI_API_KEY_TERMINAL
- Check usage limits at: [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### Anthropic (1 key)

**🔗 [Anthropic Console API Keys](https://console.anthropic.com/settings/keys)**

- Delete: ANTHROPIC_API_KEY
- Create new Claude API key

### Postgres Database

**💾 Local Database - Change Password Manually**

- Update: POSTGRES_PASSWORD
- Connect and run: `ALTER USER ellisapotheosis PASSWORD 'new_secure_password';`

### Supabase (2 keys)

**🔗 [Supabase Project Settings](https://supabase.com/dashboard/projects)**

- Navigate to your project → Settings → API
- Regenerate: SUPABASE_ANON_KEY, SUPABASE_URL (if needed)

---

## ⚠️ TIER 2 - HIGH IMPACT (Do Today)

### Google APIs (2 keys)

**🔗 [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)**

- Delete: GOOGLE_GEN_LANGUAGE_API_KEY, GOOGLE_SEARCH_API_KEY
- Create new API keys, enable required APIs

### Qdrant (3 keys)

**🔗 [Qdrant Cloud Console](https://cloud.qdrant.io/)**

- Navigate to Clusters → API Keys
- Delete: QDRANT_API_KEY, QDRANT_CLUSTER_API_KEY, QDRANT_CLUSTER_API_KEY_DEFAULT

### Notion (1 key)

**🔗 [Notion Integrations](https://www.notion.so/my-integrations)**

- Delete integration: NOTION_API_KEY
- Create new internal integration

### Groq (1 key)

**🔗 [Groq Console API Keys](https://console.groq.com/keys)**

- Delete: GROQ_API_KEY
- Generate new API key

### Mistral (1 key)

**🔗 [Mistral AI Console](https://console.mistral.ai/api-keys/)**

- Delete: MISTRAL_API_KEY
- Create new API key

---

## 📝 TIER 3 - SPECIALIZED AI SERVICES

### Cerebras

**🔗 [Cerebras Inference API](https://cloud.cerebras.ai/platform)**

- Delete: CEREBRAS_API_KEY

### SambaNova

**🔗 [SambaNova Cloud Console](https://cloud.sambanova.ai/)**

- Delete: SAMBANOVA_API_KEY

### OpenRouter (2 keys)

**🔗 [OpenRouter Keys](https://openrouter.ai/keys)**

- Delete: OPENROUTER_API_KEY, OPENROUTER_API_KEY_DYAD

### HuggingFace

**🔗 [HuggingFace Access Tokens](https://huggingface.co/settings/tokens)**

- Delete: HUGGINGFACE_API_KEY

### ElevenLabs

**🔗 [ElevenLabs Profile](https://elevenlabs.io/app/profile)**

- Delete: ELEVENLABS_API_KEY

### MorphLLM

**🔗 [MorphLLM Dashboard](https://morph.so/dashboard)** (if available)

- Delete: MORPHLLM_API_KEY

### AnythingLLM

**🔗 Check AnythingLLM Instance Settings**

- Delete: ANYTHINGLLM_API_KEY (likely self-hosted)

---

## 🔧 DEVELOPMENT & PRODUCTIVITY TOOLS

### Confident AI

**🔗 [Confident AI Dashboard](https://app.confident-ai.com/)**

- Delete: CONFIDENT_AI_API_KEY

### CopilotKit

**🔗 [CopilotKit Dashboard](https://cloud.copilotkit.ai/)**

- Delete: COPILOTKIT_PUBLIC_API_KEY

### Galileo AI

**🔗 [Galileo Console](https://console.rungalileo.io/)**

- Delete: GALILEO_API_KEY
- Update: GALILEO_LOG_STREAM, GALILEO_PROJECT settings

### JigsawStack

**🔗 [JigsawStack Dashboard](https://jigsawstack.com/dashboard)**

- Delete: JIGSAWSTACK_API_KEY

### LlamaIndex

**🔗 [LlamaCloud Platform](https://cloud.llamaindex.ai/)**

- Delete: LLAMAINDEX_API_KEY

### MEMU

**🔗 [MEMU Dashboard](https://memu.ai/dashboard)** (if available)

- Delete: MEMU_API_KEY

### OpenHands

**🔗 [OpenHands Platform](https://app.all-hands.dev/)** (if available)

- Delete: OPENHANDS_API_KEY

---

## 🌐 BROWSER & SECURITY TOOLS

### Arc Browser

**🔗 [Arc Browser Settings](arc://settings/)**

- Local settings - manually update: ARC_BROWSER_RECOVERY_PHRASE

### Floccus (2 keys)

**🔗 Check your Floccus extension settings**

- Update: FLOCCUS_LINKWARDEN_API_KEY, FLOCCUS_OPENTABS_API_KEY
- These are likely local/self-hosted service keys

### VirusTotal

**🔗 [VirusTotal API](https://www.virustotal.com/gui/my-apikey)**

- Delete: VIRUSTOTAL_API_KEY

---

## 🔒 AUTHENTICATION & SECURITY

### Passwordless.dev

**🔗 [Passwordless.dev Admin Console](https://admin.passwordless.dev/)**

- Regenerate: PASSWORDLESS_PUBLIC_KEY, PASSWORDLESS_SECRET_KEY
- URL: PASSWORDLESS_API_URL (usually static)

### Sentry

**🔗 [Sentry Settings](https://sentry.io/settings/)**

- Navigate to Projects → Your Project → Client Keys (DSN)
- Regenerate: SENTRY_DSN

### Atlassian

**🔗 [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)**

- Delete: ATLASSIAN_API_TOKEN
- Create new token for Jira/Confluence access

---

## 🆔 ADDITIONAL SERVICES (From Warp Environment)

### Notion (Additional)

**🔗 [Notion Integrations](https://www.notion.so/my-integrations)**

- Delete: NOTION_TOKEN (if different from above)

### Flow Nexus

**🔗 Check Flow Nexus Documentation/Dashboard**

- Update: FLOW_NEXUS_TOKEN
- URL: https://api.n8n/Activepieces.io (likely static)

### MetaMCP

**🔗 Check MetaMCP Platform**

- Delete: METAMCP_API key

### Smithery

**🔗 [Smithery Dashboard](https://smithery.ai/dashboard)** (if available)

- Delete: SMITHERY_API_KEY

### Firecrawl

**🔗 [Firecrawl Dashboard](https://www.firecrawl.dev/app)**

- Delete: FIRECRAWL_API_KEY

---

## 🚀 QUICK ACTION PLAN

### Step 1: Immediate (30 minutes)

1. **GitHub**: [tokens](https://github.com/settings/tokens) - Affects CI/CD immediately
2. **OpenAI**: [api-keys](https://platform.openai.com/api-keys) - Core functionality
3. **Anthropic**: [console](https://console.anthropic.com/settings/keys) - AI features

### Step 2: High Priority (2 hours)

4. **Google APIs**: [credentials](https://console.cloud.google.com/apis/credentials)
5. **Postgres**: Local password change
6. **Supabase**: [project settings](https://supabase.com/dashboard/projects)

### Step 3: Batch Processing (4-6 hours)

7. Process remaining services using the links above
8. Set up Infisical for centralized management
9. Test all integrations

---

## 💡 PRO TIPS

- **Open all links in new tabs** for efficient batch processing
- **Use descriptive names** for new keys (e.g., "NYRA-Development-2024")
- **Copy keys to temporary secure location** before updating Infisical
- **Test immediately** after each rotation to catch issues early
- **Document any scope/permission changes** needed for new keys

---

**⚡ Time-saving shortcuts:**

```powershell
# Use rotation helper for guidance
.\scripts\rotate-secrets.ps1 -Action priority

# Quick GitHub/OpenAI rotation
.\scripts\rotate-secrets.ps1 -Action github
.\scripts\rotate-secrets.ps1 -Action openai
```
