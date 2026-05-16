# 08 Environment Variables and Secrets Register

Never commit actual secret values. Replace with placeholders, Infisical references, Docker secrets, or Vaultwarden-managed values.

|Variable / Config|Purpose|Required?|Safe placeholder/default|Where used|Source/notes|
|---|---|---|---|---|---|
|ORCHESTRATOR_TUNNEL_TOKEN|Bearer token for central MCP/SSE router access|yes|${ORCHESTRATOR_TUNNEL_TOKEN}|MCP client/router config|Untitled2|
|INFISICAL_PROJECT_ID|Infisical project reference|yes|${INFISICAL_PROJECT_ID}|Secret sync/injection|Gitea/setup sources|
|INFISICAL_TOKEN|Infisical auth token; should be short-lived or machine token|yes|${INFISICAL_TOKEN}|Secret sync/injection|Gitea/setup sources|
|OPENAI_API_KEY|Cloud-backed LLM or OpenClaw MVP if used|optional|${OPENAI_API_KEY}|OpenClaw/LiteLLM|Role prompt|
|OPENROUTER_API_KEY|Cloud model fallback/router|optional|${OPENROUTER_API_KEY}|LiteLLM/OpenRouter|multiple sources|
|TWILIO_SID|Twilio SMS integration|yes for SMS|${TWILIO_SID}|Twilio sends/webhooks|multiple sources|
|SENDGRID_API_KEY|SendGrid email integration|yes for email|${SENDGRID_API_KEY}|SendGrid sends/webhooks|inferred from sources|
|LENDINGPAD_API_KEY|LendingPad integration|optional|${LENDINGPAD_API_KEY}|LOS sync|Gemini sources|
|LEADMAILBOX_AUTH|LeadMailbox integration/auth|optional|${LEADMAILBOX_AUTH}|Lead ingestion|Gemini sources|
|LEADMAILBOX_TOKEN|LeadMailbox token|optional|${LEADMAILBOX_TOKEN}|Lead ingestion|extracted|
|LETTA_API_URL|Letta service URL|optional/profile|https://letta.ratehunter.net|Memory manager|multiple sources|
|LETTA_MASTER_PWD|Letta admin/master password|optional/profile|${LETTA_MASTER_PWD}|Letta admin/auth|multiple sources|
|MEM0_API_KEY|Mem0 cloud/platform key if cloud mode|optional|${MEM0_API_KEY}|Mem0 memory|Role prompt|
|HIVE_SCHEMA_REGISTRY_TOKEN|Hive/Grafbase observability/schema token|optional|${HIVE_SCHEMA_REGISTRY_TOKEN}|Hive router/telemetry|Nexus sources|
|CLOUDFLARE_ZERO_TRUST_TOKEN|Cloudflare access/tunnel token|yes for exposed admin UIs|${CLOUDFLARE_ZERO_TRUST_TOKEN}|Cloudflare/Zero Trust|multiple sources|
|ORCHESTRATOR_TUNNEL_TOKEN|MCP router auth token|yes|${ORCHESTRATOR_TUNNEL_TOKEN}|MCP SSE endpoint|Untitled2|
|GITEA_PORT|Gitea HTTP port|optional|3100|Gitea|gitea setup|
|GITEA_SSH_PORT|Gitea SSH port|optional|2222|Gitea|gitea setup|
|GITEA_ROOT_URL|Public/root URL for Gitea|optional|https://git.ratehunter.net/|Gitea|gitea setup|
|GITEA_RUNNER_TOKEN|Gitea runner token|optional|${GITEA_RUNNER_TOKEN}|Gitea Actions|gitea setup|
|GITEA_SSH_KEY|SSH key path/token ref for Gitea|optional|${GITEA_SSH_KEY}|Gitea mirror|gitea setup|
|REVIEW_MODEL|AI reviewer model|optional|anthropic/claude-3.5-sonnet or approved model|Gitea AI reviewer|gitea setup|
|REVIEW_MAX_CHARS|AI reviewer context limit|optional|18000|Gitea AI reviewer|gitea setup|
|N8N_EDITOR_BASE_URL|n8n public/editor URL|yes for n8n|https://n8n.ratehunter.net|n8n|final plan|
|N8N_PAYLOAD_SIZE_MAX|n8n payload size limit|optional|256|n8n|final plan|
|N8N_DISABLE_UI_SECURITY|n8n embed/security toggle; use carefully|optional|false|n8n admin/embed|extracted|
|AP_WEBHOOK_URL|Activepieces webhook URL|yes for AP|https://activepieces.ratehunter.net|Activepieces|absolute plan|
|AP_FRONTEND_URL|Activepieces frontend URL|yes for AP|https://activepieces.ratehunter.net|Activepieces|absolute plan|
|LLM_ENDPOINT|OpenClaw gateway target LLM endpoint|yes|http://worker-rtx5090:8000/v1|OpenClaw gateway|final plan|
|LLM_BASE_URL|LLM router/base URL|optional|http://litellm:4000/v1|LiteLLM/OpenClaw|extracted|
|MODEL_PATH|vLLM model path/name|yes for vLLM|${MODEL_PATH}|GPU workers|final plan|
|SERVER_URL|ClawTeam server URL for worker nodes|yes for ClawTeam|http://orchestrator:8080|ClawTeam node|final plan|
|OPENCLAW_API_URL|OpenClaw API/gateway URL|optional|http://orchestrator:PORT|Nerve/webapp|extracted|
|KYUTAI_UNMUTE_CFG|Kyutai Unmute config|optional/profile|${KYUTAI_UNMUTE_CFG}|Voice/TTS/STT|multiple sources|
|UNMUTE_OPENAI_API_KEY|Unmute/OpenAI-compatible API key if needed|optional|${UNMUTE_OPENAI_API_KEY}|Voice pipeline|extracted|
|SLACK_WEBHOOK|Slack notification webhook|optional|${SLACK_WEBHOOK}|Composio/alerts|extracted|

## Additional uppercase tokens extracted from archive

These appeared in the source material and may need review if implementation agents encounter them:

```text
ABSURD_MAXIMALISM
AI_REVIEW_SETUP
ANYTHING_RAG
CLAUDE_CONFIG_DIR
CLAUDE_PLUGIN_ROOT
CLOUDFLARE_ZERO_TRUST_TOKEN
COGNITIVE_STATE_ENGINE
COGNITIVE_STATE_ENGINE_V4
CONSOLIDATION_INDEX
DOMAIN_MAP
EXECUTION_COMMAND
EXECUTION_MODE
EXECUTION_STRICTNESS
GENERIC_TIMEZONE
GITEA_MIRROR_URL
GITEA_PORT
GITEA_ROOT_URL
GITEA_RUNNER_REGISTRATION_TOKEN
GITEA_RUNNER_TOKEN
GITEA_SSH_KEY
GITEA_SSH_PORT
GRID
GROQ_API_KEY
HIVE_SCHEMA_REGISTRY_TOKEN
HUB_DIR
HYBRID
INFISICAL_PROJECT_ID
INFISICAL_TOKEN
KEY
KYUTAI_RAID_CFG
KYUTAI_UNMUTE_CFG
LEADMAILBOX_AUTH
LEADMAILBOX_TOKEN
LENDINGPAD_API_KEY
LETTA_API_URL
LETTA_MASTER_PWD
LETTA_PWD
LLM_BASE_URL
LLM_ENDPOINT
LLM_PROVIDER_URL
LOCAL_LLM_KEY
MARKET_SNIPER_V4
MEM0_API_KEY
MODEL_PATH
MORTGAGE_DATA_SENTINEL
MORTGAGE_SNIPER_V3
N8N_DISABLE_UI_SECURITY
N8N_EDITOR_BASE_URL
N8N_PAYLOAD_SIZE_MAX
NEKO_ENGINEER_GOD
NODE_ENV
NYRA_GATEWAY_SINGULARITY
NYRA_UI_DESIGN_CONSOLIDATION
OMC_PLUGIN_ROOT
OMNIPOTENT_INFRA_ARCHITECT
OMNIPOTENT_INFRA_ARCHITECT_MODE
OMNI_LIFECYCLE_ORCHESTRATOR
OPENAI_API_KEY
OPENCLAW_API_URL
OPENCLAW_BASE_URL
OPENCLAW_CHAT_UI_PLAN
OPENCLAW_FUTURE_ROUTING
OPENCLAW_INTEGRATION
OPENCLAW_INTEGRATION_PLAN
OPENCLAW_OPERATIONS
OPENROUTER_API_KEY
ORCHESTRATOR_TUNNEL_TOKEN
OUTPUT_DIR
OUTPUT_REQUIREMENT
PERFECTIONIST_MAXIMALISM
PORT
PRE_CLONE_CHECKLIST
PROJECT_NYRA_APOTHEOSIS_V4
PROJECT_NYRA_GATEWAY
PROJECT_NYRA_SINGULARITY_PROMPT
RAG_OUTPUT
RAID
README_SETUP
RECURSIVE_ARCHITECT_MODE
REVIEW_MAX_CHARS
REVIEW_MODEL
SECRET
SERVER_URL
SLACK_WEBHOOK
STAGING_DIR
SUBSCRIPTION_API_SERVER_3060
SUBSCRIPTION_PROXY_GATEWAY
SYSTEM_ACTIVATE
TELEPHONIC_AI_NEGOTIATOR
TUNNEL_AUTH_KEY
TWILIO_SID
UNMUTE_OPENAI_API_KEY
VCS_STATUS_
VCS_STATUS_LOCAL_BRANCH
VCS_STATUS_NUM_UNTRACKED
WORKFLOW_CUSTOMIZATION
YOUR_3060_CONTEXT_NAME
YOUR_LINUX_USERNAME
YOUR_MODEL
YOUR_USERNAME
YOUR_WINDOWS_USERNAME
```
