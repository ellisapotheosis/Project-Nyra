# Comparisons (what to run)

## Dify vs Open-WebUI (practical, Nyra-oriented)

**Bottom line:**  
- **Dify** = app platform (workflows, knowledge, tool calling, multi-app separation, embed)  
- **Open-WebUI** = “power chat client” (great for internal debugging + multi-model playground)

### Feature matrix (high-level)

| Category | Dify | Open-WebUI |
|---|---|---|
| Primary purpose | Build/deploy AI “apps” with guardrails | General chat UI for LLMs |
| Embed in your webapp | Yes (common use case) | Possible, but not the primary product focus |
| Multi-app separation (Borrower vs Ops) | Strong conceptually | Usually one UI with roles/sessions |
| Workflows (LLM + branches) | Strong | Usually lighter (pipelines/plugins) |
| Knowledge base / RAG UX | Built-in | Often via extensions/pipelines |
| Tool calling | Designed for it; MCP support exists | Can do tools, but depends on setup |
| Teams, org features | Typically present | Varies by deployment |
| Best fit in Nyra | Borrower Concierge + Ops Assistant | Internal “debug console” / emergency fallback |

**Recommendation for Nyra**
- Run **Dify** for all embedded chatbot UX (borrower + ops).
- Keep **Open-WebUI** *optional* for:
  - internal QA, prompt testing across models
  - “break glass” access when Dify apps are mid-migration
- If you keep it: lock behind Cloudflare Access/Tailscale; never public.

## Dify vs Activepieces (they do different jobs)

| Category | Dify | Activepieces |
|---|---|---|
| Core job | LLM app runtime + UX | Automation + connectors + approvals |
| Trigger types | chat/event within app | webhooks, schedules, event-driven automation |
| Best at | conversation, retrieval, app logic | “do the thing”: send SMS/email, update CRM, calendar ops |
| Human approvals | possible, but not core | a first-class pattern |
| MCP tool surface | yes (can publish/consume MCP) | yes (MCP is an integration focus) |
| Nyra usage | Borrower Concierge + Nyra Ops | message delivery + CRM ops + scheduling integrations |

### Do you “need” Activepieces MCP if you embed Dify?
If you want rich third-party integrations (calendar, SMS, email, CRM actions) **without writing custom code for each**:
- keep Activepieces (and/or n8n) and expose actions to agents via MCP (through Nexus)

**Nyra default:**
- Dify calls Nexus → Nexus calls Activepieces MCP tools → Activepieces triggers the actual connector action.

## Why keep n8n too
Activepieces is great for connectors + approvals; n8n shines at:
- long-running timed drip campaigns
- retries/backoff
- complex ETL-style ingestion and data normalization
