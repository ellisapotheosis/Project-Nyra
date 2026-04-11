# Integrations Matrix and Lead Sources

This document summarizes the various data sources, services and external
integrations used by the Nyra AI stack.  It provides a high‑level matrix
showing how leads are ingested, how AI tools and MCP servers are wired into
the platform, and the status of each integration.

## Lead ingestion sources

Nyra collects leads from multiple vendors and channels.  Each source may
deliver leads via email, API or file attachments.  The ingestion pipeline
consists of Activepieces/n8n flows, parsers and the `lead_ingest` service
running on the orchestrator.  All leads are normalized into the `nyra_ai`
database and then synced to TwentyCRM.

| Source         | Description | Integration method | Status |
|---------------|-------------|--------------------|--------|
| **LendingTree** | Leads purchased via LendingTree; includes borrower contact info and loan parameters. | Primary ingestion through email parser and IMAP integration.  Optionally integrate via HTTP API if the vendor provides an endpoint. | **Planned** |
| **FreeRateUpdate** | Leads delivered through emails with CSV attachments. | Ingest via email parser: Activepieces listens to the inbox, downloads attachments, parses CSV and posts to `lead_ingest`. | **Planned** |
| **LeadMailbox** | Centralized portal aggregating leads from multiple vendors. | Use the vendor’s API or email forwarding.  Configure Activepieces to poll and forward leads to the orchestrator. | **Planned** |
| **Direct APIs** | Some vendors offer REST APIs or webhook callbacks. | Build connectors in `lead_ingest` to pull data periodically or receive push notifications.  Store events in the `lead_events` table. | **Planned** |
| **Email inbox** | Generic inbound email address where vendors send leads. | Use the n8n/Activepieces IMAP trigger to parse inbound emails.  Regex and template matching extract fields.  Parsed leads are stored in `nyra_ai` and then inserted into TwentyCRM via the Twenty API. | **In progress** |

## AI tooling integrations

| Component                  | Purpose | Integration details | Status |
|---------------------------|---------|---------------------|--------|
| **Claude‑Flow v3**        | Orchestrates multi‑agent Claude‑based tasks and exposes MCP for Claude Code. | Configured via `claude-flow.config.json` within the repository.  Runs as a container in the `ai` stack and exposes endpoints to Claude Code. | **Integrated** |
| **Agentic‑Flow**          | Provides agent orchestration and optimization; optional addition. | Can be installed via `pnpm` and run alongside Claude‑Flow.  Register hooks to call the RuVector memory and manage agent states. | **Optional** |
| **RuVector Postgres**     | High‑performance vector search and memory store. | Loaded as an extension in `nyra_ai` DB; exposed via SQL and the `MemoryManager` to store patterns and run HNSW queries【10†L150-L156】. | **Integrated** |
| **Redis**                 | Message queues and caching. | Used by n8n/Activepieces for job execution, by LiteLLM for state, and by AIService for caching conversation context. | **Integrated** |
| **LiteLLM / Nexus router** | Unified LLM gateway for OpenAI, Anthropic, DeepSeek and other providers. | Deployed via Docker; environment variables supply API keys.  All AI calls from Claude‑Flow, Agentic‑Flow and AIService route through this gateway for cost and model selection. | **Integrated** |
| **n8n / Activepieces**    | Workflow automation platforms. | Hosted as containers in the stack.  Used to orchestrate lead ingestion, CRM updates and notifications.  Integrations and flows are defined via their respective GUIs. | **In progress** |

## MCP servers and connectors

Nyra leverages Model Context Protocol (MCP) servers to expose or consume specialized APIs.  Claude Code can connect to these servers via `claude mcp add <name> -- <command>`.

| MCP Server                         | Capability | Notes |
|------------------------------------|-----------|-------|
| **Twenty MCP (OleApp)**            | Programmatic access to TwentyCRM entities (contacts, deals, tasks). | Use to manipulate CRM data, run queries and manage objects via Claude Code. |
| **Agentics MCP**                   | Provides agent memory and task management via AgentDB. | Use to introspect agent state, register tasks and retrieve logs. |
| **Supabase MCP**                   | Exposes Supabase database functions. | Not currently used but available if future modules require Supabase. |
| **Dify MCP servers**               | Provides integration with Dify and other AI chat UIs. | Useful when building a Dify Chat UI on top of Nyra. |
| **Cloudflare MCP**                 | Automates Cloudflare DNS, Access and Tunnel operations. | Use to programmatically manage Cloudflare configuration via Claude Code. |
| **OpenRouter / LiteLLM MCP**       | Provides a local proxy to multiple LLM providers. | Included as part of the AI stack; can be configured for OpenAI, DeepSeek, Gemini and Anthropic models. |

## CRM and SaaS integrations

* **TwentyCRM:** The core CRM platform; integrated via direct database access (for reads) and via API (for writes and complex operations).  The `twenty` DB remains separate from `nyra_ai` to isolate AI memory from CRM core.
* **Dify Chat UI:** Optional front‑end chat interface for leads and clients.  Connects to AIService and the LLM router.  Use Cloudflare Tunnel to expose this UI.
* **Composio:** SaaS integration tool; can connect to calendars, Slack, and other services.  Use in Activepieces flows to add calendar events or notifications.

This matrix will evolve as new sources and services are added.  Each new integration should be documented here with its method, security considerations and status.