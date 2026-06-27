# Nyra Architecture Whitepaper

## 1. System Overview
Project Nyra is an AI‑powered mortgage lead automation platform. Its architecture enforces a strict separation between the **control plane** and the **compute plane**【263234951327427†L6-L12】. The control plane (orchestrator plus cloud VM) manages routing, workflows, memory policies, observability and administrative surfaces. The compute plane consists of GPU workers that host local models for inference.

The control plane runs on:
- **Orchestrator** — an always‑on LAN host that handles routing, observability and memory aggregation【263234951327427†L23-L30】. It exposes public ingress through a tunnel service.
- **Cloud VPS** — a durable cloud host providing stateful services such as CRM, Git hosting and automation tools, along with databases【263234951327427†L31-L35】【263234951327427†L56-L62】.

The compute plane uses GPU workers:
- **Primary** and **secondary** workers for heavy language models【263234951327427†L37-L41】.
- A **utility** worker running smaller models for summarisation and extraction【263234951327427†L37-L42】.

## 2. Core Design Principles
Project Nyra adheres to several principles:
- **CRM is the system of record** – all business data lives in the CRM【263234951327427†L14-L16】.
- **Automation glue is replaceable** – internal workflow tools are glue rather than the business brain【263234951327427†L16-L17】.
- **Assistant is bounded** – OpenClaw is the only assistant surface; critical mutations happen through services【263234951327427†L18-L19】.
- **Compliance first** – STOP handling, reply pauses, unsubscribe, quiet hours and audit logging are enforced【263234951327427†L20-L21】.
- **No secrets in code** – secrets live in environment files or secret managers.
- **No public inference endpoints** – keep workers private and avoid container orchestration platforms【263234951327427†L95-L99】.

## 3. Node Roles
### Orchestrator
- Always‑on control plane host, running Nexus Router, model routing, observability stack, container manager, assistant gateway and tunnel service【263234951327427†L46-L55】.
- Aggregates memory and routes agent requests.

### Cloud VPS
- Hosts durable services such as the CRM, automation glue, Git hosting and databases【263234951327427†L31-L35】【263234951327427†L56-L62】.
- Houses long‑term memory services such as Letta and Mem0.

### GPU Workers
- Primary and secondary nodes run heavy language models【263234951327427†L37-L41】.
- The utility node runs small models for summarisation and background tasks【263234951327427†L37-L42】.

## 4. Control Plane Services
On the orchestrator:
- **Nexus Router** – unified endpoint for agents and memory aggregation.
- **Model router** (LiteLLM) for local/hosted models.
- **Observability stack** (metrics/logging/dashboards).
- **Container management UI**.
- **Assistant gateway** for OpenClaw.
- **Tunnel service** for public ingress【263234951327427†L46-L55】.

On the cloud VPS:
- **CRM** and other stateful services【263234951327427†L56-L62】.
- **Workflow glue** tools.
- **Databases** (SQL, key/value and vector).
- **Memory services** for long‑term context.

## 5. Networking and Security Model
- **Private network:** Nodes join a mesh network with MagicDNS for private addressing【263234951327427†L64-L67】.
- **Public ingress:** Only the control plane hosts expose tunnels. Admin surfaces require access control【263234951327427†L66-L68】.
- **Policy:** Do not expose database ports, worker inference or internal memory endpoints publicly. Use hostnames rather than static IPs. Avoid container orchestration platforms beyond per‑host compose.【263234951327427†L95-L99】.

## 6. Memory Model
- **Mem0** – primary runtime memory store【263234951327427†L70-L74】.
- **OpenMemory MCP** – shared memory management layer.
- **Letta** – long‑term memory manager integrated with other stores【263234951327427†L70-L76】.
- **Nexus Router** – aggregates memory and tool endpoints; all agents use this as their sole interface【263234951327427†L70-L76】.

## 7. Application Surfaces
- **Broker/customer webapp** – central command hub for brokers and customers【263234951327427†L79-L82】.
- **Marketing landing page** – captures leads and integrates with campaigns【263234951327427†L79-L82】.
- **Assistant surface** – chat experience provided by OpenClaw, used across the webapp and landing pages.
- **Admin portal** – operator surface defined in the execution plan (dashboards, management tools)【858937579590172†L168-L180】.

## 8. Repository Layout Guidance
- Place frontends under `apps/*`【263234951327427†L84-L87】.
- Place business services under `services/*`【263234951327427†L84-L88】.
- Use `packages/*` for shared libraries and domain modules.
- Use `workflows/n8n/*` for workflow definitions.
- Use `infra/hosts/<host>` for per‑host Docker Compose; never place runtime compose files elsewhere.
- Use `ops/*` for scripts and operational helpers.

## 9. Non‑Goals
- Avoid orchestrators like Kubernetes or Swarm for now【263234951327427†L95-L99】.
- Do not expose worker endpoints publicly.
- Disallow direct database mutations by assistants; route through services.

## 10. Implementation Roadmap
1. **CRM Data Layer:** Stabilise CRM, model core objects and implement shared client packages【858937579590172†L57-L87】.
2. **Lead Ingestion:** Create `lead‑ingestion` service for normalisation, deduplication and audit logging【858937579590172†L87-L103】.
3. **Campaign Engine:** Implement `campaign‑service` for campaign definitions, scheduling and STOP handling【858937579590172†L104-L116】.
4. **Compliance Service:** Build `compliance‑service` for unsubscribe and consent management【858937579590172†L119-L129】.
5. **Communication Service:** Build service for outbound/inbound messaging across channels【858937579590172†L136-L151】.
6. **Quote Engine:** Build deterministic quoting service with PDFs and history【858937579590172†L152-L166】.
7. **App Surfaces:** Develop admin and broker webapps; integrate chat and enforce compliance【858937579590172†L168-L192】.
8. **Infrastructure Hardening:** Follow infrastructure rules: per‑host compose, private workers, single tunnel endpoint and baseline validations【423519143471560†L4-L29】.

This whitepaper serves as the authoritative design reference for Project Nyra.
