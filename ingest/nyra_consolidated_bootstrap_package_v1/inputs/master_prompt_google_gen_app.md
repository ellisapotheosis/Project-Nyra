# Google Generative App Builder Master Prompt for Project Nyra

**Goal:** Create a minimal yet extensible suite of applications for the Project‑Nyra ecosystem using Google’s Generative App Builder (Gen App Builder).  The generated apps should scaffold the public‑facing landing page, the Clawdbot agent assistant, and a lightweight administrative UI.  These apps **must not be coupled to the Project‑Nyra GitHub repository** – they should use environment variables and API endpoints to interact with services hosted on your orchestrator PC (Nexus Router, Claude‑Flow/Moltbot, Archon OS, n8n, and TwentyCRM).  The objective is to accelerate UI scaffolding and provide your multi‑agent stack with a clear starting point for integration and further development.

## Context

- **Project‑Nyra**: a multi‑agent platform integrating AI tools (Claude‑Flow, Agentic‑Flow, Archon OS, n8n/ActivePieces, Moltbot UI, etc.), a mortgage‑drip campaign system, a CRM (TwentyCRM), and your own mortgage brokerage business logic.  The codebase lives in a GitHub repository, but the Gen App Builder outputs should not pull code from there directly.
- **Infrastructure**: four PCs on a LAN accessible via Tailscale/Cloudflared.  The orchestrator PC runs containers (Nexus Router, Claude‑Flow, n8n, Archon OS) under Docker Compose and exposes them via reverse proxy.  Worker PCs supply GPU cycles for local model inference with vllm/ollama.  Databases include **RuVector + Postgres** (vector store with HNSW index), **Graphiti** for graph queries (backed by **FalkorDB on Redis**), **AgentDB** (Postgres) and **Redis** for caching.
- **Apps**:  The Gen App Builder will be used to build:
  1. **Landing Page & Marketing Site** – a simple Next.js or React site describing West Capital Lending / Project‑Nyra and capturing lead information (name, contact, loan type).  It should call your orchestrator’s API to submit leads into TwentyCRM and trigger drip campaigns.
  2. **Clawdbot UI** – a chat‑based assistant front‑end that lets you converse with your multi‑agent system (Claude‑Flow or Moltbot) about mortgage leads, CRM data, or other tasks.  It should support rich messages (tables, forms, file attachments).  Use WebSockets or HTTP streaming for real‑time responses.
  3. **Admin Portal** – a lightweight dashboard for monitoring campaigns, lead status, system health, and vector‑memory introspection.  It should display data from Graphiti (FalkorDB) and RuVector, show logs, and offer basic control toggles (start/stop campaigns, run migrations).  Optionally integrate Archon OS’s Kanban UI inside an iframe or as a React component.
- **Technologies**:  Use Google Gen App Builder’s supported frameworks (typically Node.js with Express or Python Flask) to generate backend services.  For the UI, choose React/Next.js if available.  Ensure that each app reads configuration from environment variables and does not hardcode any secrets.  Use TypeScript where possible for safety.

## Deliverables & Requirements

1. **Project Structure** – Ask the Gen App Builder to scaffold three separate applications within a single Google Cloud project.  Suggest a top‑level monorepo layout:
   - `/landing/` – landing page
   - `/clawdbot-ui/` – chat assistant
   - `/admin-portal/` – dashboards
   Each should build independently and deployable via Cloud Run or Cloud Functions.
2. **API Proxy & Nexus Router** – Instruct the builder to generate a proxy layer that forwards API calls to your orchestrator PC through a single endpoint (the Nexus Router).  The proxy should support authentication (e.g., API key) and route paths like `/crm/leads`, `/ai/chat`, `/graph/queries` to the appropriate internal services.
3. **Environment Variables** – Request that the builder set up a `.env` template with variables such as:
   ```env
   NEXUS_ROUTER_URL=https://<your‑domain>.com
   NEXUS_API_KEY=<secure token>
   CLAUDE_API_MODEL=claude-3-sonnet
   MOLT_BOT_ENABLED=true
   RUVECTOR_URL=https://<ruvector-service>.local
   GRAPHITI_REDIS_URL=redis://<host>:<port>
   POSTGRES_URL=postgres://user:pass@host:port/dbname
   GOOGLE_APP_CREDENTIALS=... # GCP service account json
   ````
   These values will be supplied at runtime by your orchestrator PC or secret manager (e.g., Infisical).  The Gen App Builder should reference them using `process.env.*` without defaulting to sensitive values.
4. **OAuth & Auth** – Include optional Google Sign‑In or a simple API key mechanism to restrict access to the admin portal.  The landing page can remain public.
5. **Lead Form & Campaign Trigger** – The landing page must feature a form capturing name, contact details, loan purpose, and optional property information.  On submission, the app should call `POST /crm/leads` on the proxy, which will insert the lead into TwentyCRM and trigger a drip campaign through n8n.
6. **Chat UI** – The Clawdbot interface should:
   - Allow free‑text queries and display streaming responses.
   - Provide buttons or quick actions to fetch lead info (“Show lead details for ID X”) and run rate comparisons using your Excel spreadsheet logic.
   - Support file uploads (e.g., borrowers uploading documents) and send them to the orchestrator via the proxy.
   - Include a sidebar showing memory patterns retrieved from RuVector/Graphiti.
7. **Admin Portal** – The portal should:
   - Show a dashboard with counts of active leads, campaigns, memory items, and system load (CPU/GPU of worker PCs).
   - Provide a table or graph view of the FalkorDB graph (through Graphiti API) and allow simple CRUD operations on nodes/edges.
   - Provide a simple Kanban or calendar view for tasks (pulling from Archon OS’s tasks API if available).
   - Expose toggles to enable/disable features (e.g., use Moltbot vs. Claude‑Flow, switch memory backend, start/stop campaigns).
8. **CI/CD & Deployment** – Suggest using GitHub Actions to build and deploy the generated apps to Google Cloud Run.  Provide instructions for containerizing each app (Dockerfiles) and hooking into your orchestrator’s CI/CD process.

## Example Prompt to Provide to Gen App Builder

> **Build a multi‑app project in Google Generative App Builder:**
>
> **Apps:**  A public landing page, a chat assistant called Clawdbot, and an admin portal.  Use React/Next.js for the UI and Express (Node.js) for backend endpoints.  Structure the monorepo as `/landing`, `/clawdbot-ui`, and `/admin-portal` with their own `package.json`.  Include Dockerfiles for each app.
>
> **Proxy Layer:**  Create a Node.js API server that proxies requests to my on‑premises orchestrator via the environment variable `NEXUS_ROUTER_URL`.  Implement routes `/crm/leads`, `/ai/chat`, `/graph/queries`, and `/vector/search`.  Each route should forward HTTP requests to `${process.env.NEXUS_ROUTER_URL}/api/...` with the provided `NEXUS_API_KEY`.
>
> **Environment Configuration:**  Generate a `.env.example` file listing `NEXUS_ROUTER_URL`, `NEXUS_API_KEY`, `CLAUDE_API_MODEL`, `MOLT_BOT_ENABLED`, `RUVECTOR_URL`, `GRAPHITI_REDIS_URL`, `POSTGRES_URL`, and `GOOGLE_APP_CREDENTIALS`.  Use these variables in the code with `process.env`.
>
> **Landing Page:**  Build a responsive marketing page that describes my mortgage brokerage and AI‑powered CRM.  Include a lead form capturing name, email, phone, loan type (purchase, refinance, HELOC, etc.), property value, and notes.  On submission, send a POST request to `/crm/leads` of the proxy.  After submission, thank the user and explain next steps.
>
> **Clawdbot UI:**  Build a chat interface that connects to `/ai/chat` of the proxy.  Use WebSockets for streaming responses if supported, otherwise fallback to HTTP long polling.  Include a sidebar showing recent leads and quick actions (e.g., “Show rates for lead ID”).  Support file uploads via input and send them as `multipart/form-data` to `/crm/upload` on the proxy.
>
> **Admin Portal:**  Build a secure dashboard with Google Sign‑In (if available) or API key auth.  Show metrics by calling `/crm/stats`, `/vector/stats`, and `/graph/stats`.  Provide a page to visualize the graph by calling `/graph/queries` with Cypher queries.  Provide toggles to enable Moltbot or Claude‑Flow by setting `MOLT_BOT_ENABLED` via the proxy’s `/config` endpoint.  Use a Kanban board for tasks by calling `/archon/tasks` if available.
>
> **Deployment:**  Configure Cloud Run services for each app with separate Dockerfiles.  Provide instructions on how to deploy using `gcloud run deploy`.  Provide a GitHub Actions workflow that builds and pushes images to Google Artifact Registry.

---

This prompt instructs the Gen App Builder to generate scaffolded applications that satisfy your multi‑agent architecture while remaining decoupled from the Project‑Nyra codebase.  After generation, you will need to integrate the generated code with your orchestrator by filling in API endpoints, customizing UI components (e.g., your branding, colors via Tweak/SHadcn), and connecting to Moltbot or Claude‑Flow as appropriate.
