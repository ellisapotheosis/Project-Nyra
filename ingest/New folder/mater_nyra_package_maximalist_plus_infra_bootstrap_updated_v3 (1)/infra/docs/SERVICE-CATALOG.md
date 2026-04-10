# Service Catalog

This catalog enumerates each service defined in the Nyra stack.  It is
organized by profile and includes a brief description of the service's
function and dependencies.

| Service             | Profile(s)       | Description |
|---------------------|------------------|-------------|
| **nexus-router**    | core            | Central MCP + LLM gateway using Grafbase/Nexus.  Routes requests to LLM providers and MCP servers. |
| **archon**          | core            | Knowledge hub and MCP server.  Stores documentation, tasks, and memory. |
| **infisical**       | core            | Secrets management server.  Provides dynamic secret injection and audit logs. |
| **gitea**           | core            | Internal Git server hosting the Project Nyra codebase and other repos. |
| **postgres-archon** | databases       | Dedicated Postgres instance for Archon data. |
| **postgres-gitea**  | databases       | Dedicated Postgres for Gitea. |
| **postgres-infisical** | databases   | Dedicated Postgres for Infisical. |
| **postgres-twenty** | databases, crm  | Database for Twenty CRM. |
| **postgres-nyra_ai** | databases, vector | RuVector Postgres cluster for embeddings and semantic search. |
| **redis**           | databases       | General‑purpose cache and session store (port 6380). |
| **falkordb**        | databases       | Graph database engine for temporal knowledge graphs (letta). |
| **prometheus**      | observability   | Metrics collection for all services. |
| **grafana**         | observability   | Visualization dashboard. |
| **loki**            | observability   | Log aggregation. |
| **n8n**             | workflows       | Workflow automation engine. |
| **postgres-n8n**    | workflows       | Database for n8n state. |
| **activepieces**    | workflows       | Alternative workflow engine with a drag‑and‑drop builder. |
| **postgres-activepieces** | workflows | Database for Activepieces. |
| **twentycrm**       | crm             | System of Record CRM for leads, contacts, loans, etc. |
| **letta**           | memory          | Long‑term conversation memory service. |
| **postgres-letta**  | memory          | Database for Letta. |
| **quote-api**       | apps            | API for generating mortgage quote comparisons. |
| **campaign-engine** | apps            | Manages drip campaigns (SMS/email/voicemail). |
| **admin-ui**        | apps, ui        | Nyra admin panel for campaigns, leads, quotes, and system monitoring. |
| **dify**            | ui             | Borrower chat assistant built on Dify. |
| **postgres-dify**   | ui             | Database for Dify. |
| **serena**          | mcp            | Code analysis and refactoring MCP. |
| **gemini-assistant** | mcp           | Google Gemini assistant MCP for coding and technical Q&A. |

### Optional Services

The following services are not included by default but may be useful in specific deployments:

| Service          | Profiles        | Notes |
|------------------|----------------|-------|
| **qdrant**       | vector        | Alternative vector DB used by older versions of Nyra.  Kept for reference. |
| **zep**          | memory        | Document memory service.  Superseded by RuVector + Letta. |
| **letta**     | graph         | Temporal graph API for letta.  Launch if using graph queries outside FalkorDB. |
| **ruvector-api** | vector        | Standalone RuVector HTTP API (requires Qdrant).  Not needed if using RuVector Postgres. |
