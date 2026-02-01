# Project Nyra – AI‑Augmented Open‑Source CRM Whitepaper

## Introduction

Project Nyra aims to transform the open‑source **TwentyCRM** platform into an intelligent, self‑improving customer‑relationship management (CRM) system.  TwentyCRM already provides robust contact management, deal tracking, workflow automation and a modern NestJS/React codebase.  By integrating Nyra’s **Claude‑powered agent framework** and **RuVector** semantic memory we unlock contextual suggestions, automated data enrichment and continuous learning.  Sales representatives become more productive while the system quietly learns what works and tailors its advice accordingly.

The core idea is simple: capture patterns from past interactions, store them as vector embeddings, then bring them back when a similar context arises.  A large language model (LLM) orchestrated via Nyra’s agents synthesizes these patterns with real‑time data, producing actionable suggestions, summaries and answers.

This whitepaper summarises the goals, design choices and guiding principles for the AI integration.  It is not a full implementation guide; rather it outlines why each component exists and how they work together.

## Goals

1. **Augment user productivity** – reduce manual effort by automatically enriching leads, recommending next actions and drafting communications.  A salesperson should spend less time gathering information and more time closing deals.
2. **Leverage past knowledge** – learn from successful (and failed) interactions.  When the system recognises a pattern it should reuse it; when something fails it should record what not to do.  Embeddings and RuVector make these patterns searchable.
3. **Maintain high usability** – suggestions must be clear, non‑intrusive and optional.  Users stay in control: they may ignore, accept or modify AI recommendations.  The UI integrates seamlessly with TwentyCRM’s existing design.
4. **Ensure trust and transparency** – every AI action is logged and explained.  When a suggestion is presented, users can click “why?” to see supporting patterns or reasoning.  Sensitive data is anonymised and never leaves the system without consent.
5. **Scale securely** – run continuous AI services on an always‑on orchestrator PC, while allowing laptop workers to connect, disconnect and wake GPU nodes as needed.  Memory grows with use; orchestrator resources are budgeted to fit in 16 GB RAM.

## System Overview

The enhanced system comprises four high‑level subsystems:

1. **TwentyCRM core** – unmodified CRM backend (NestJS) and frontend (React).  Contains contacts, deals, tasks and a workflow engine.  We extend it with new endpoints to call the AI module and new UI components for suggestions.

2. **AI service** – a NestJS module (or separate microservice) that orchestrates agent workflows.  It receives contexts (e.g. new lead, idle deal, user query), queries RuVector for similar patterns, composes prompts and calls the appropriate LLM (Anthropic Claude or OpenAI GPT).  It returns structured suggestions, analyses or answers.

3. **RuVector memory store** – a Postgres‑backed vector database storing embeddings of past events, summaries and patterns.  Each entry contains a high‑dimensional vector, metadata tags and a pointer to the original record.  An HNSW index ensures sub‑millisecond approximate nearest‑neighbour searches.

4. **UI components** – a chat widget and context‑sensitive panels within the CRM frontend.  They display AI suggestions, allow users to ask free‑form questions and provide buttons for applying or dismissing recommendations.  Settings panels give administrators control over automation thresholds.

These components are orchestrated by a **24/7 orchestrator PC**.  GPU workers are woken via Wake‑on‑LAN when heavy compute (embeddings, fine‑tuning) is needed.  All secrets and keys are managed via Infisical.  External access is gated by Tailscale and Cloudflare Tunnels.

## Memory and Learning

Nyra uses **RuVector** to persist and recall knowledge.  At a high level:

- When an event completes (e.g. a deal is won, an email is sent or a lead is enriched), a summary of what happened and why is encoded via an embedding model (e.g. `text-embedding-3-small` or `fastembed`), producing a 1536‑dimensional vector.  This vector, along with metadata (`type`, `tags`, `referenceId`, etc.), is inserted into the `nyra_ai` database.  RuVector automatically maintains an HNSW index【10†L150-L156】.
- When the AI service needs context (e.g. to suggest a next action), it builds an embedding of the current state and queries RuVector for the top‐k similar patterns.  These retrieved patterns become examples in the prompt, enabling few‑shot reasoning without expensive fine‑tuning.
- A small helper library (MemoryManager) abstracts the insertion and retrieval logic, allowing the rest of the system to remain agnostic of the storage technology.

By storing not just successes but also failures, the system learns what not to do.  Each memory entry includes metadata about outcome, cost and user feedback, enabling more nuanced retrieval (e.g. only positive patterns when recommending a next step).

## Workflow Automation

TwentyCRM already has a trigger–action framework.  We extend it with **AI actions**.  A trigger might be “lead created” or “deal idle for 14 days”; the action calls the AI service with a context object.  The AI returns suggestions or autopopulates fields, which are then either applied immediately or presented to the user for approval.  Examples:

• **Lead enrichment** – When a new lead arrives, the AI fetches company details, news and contact info, summarises it and suggests the next best step.  The summary is stored in the lead’s record; the suggestion is displayed in the UI.
• **Idle deal nudging** – If a deal remains in negotiation for too long, the AI compares it to similar deals and suggests offering a discount or scheduling a call.  A one‑click button creates a task or drafts an email.
• **Lost deal analysis** – When a deal is lost, the AI analyses reasons (from the record and past patterns) and recommends a follow‑up or process improvement.  The analysis is recorded for future learning.

Automation levels are configurable.  Operators can set the system to manual (always ask before acting), semi‑automatic (auto‑enrich leads but ask before sending emails) or full automatic (apply trusted patterns directly).  All actions are logged for auditing.

## Security and Privacy

AI assistants handle sensitive customer information, so we enforce strict policies:

- **Data minimisation** – only the data needed for the current task is sent to the LLM.  Identifiers (names, emails) are masked or pseudonymised unless necessary.
- **Secrets management** – API keys and credentials live in Infisical.  The AI service reads them from environment variables; developers never hardcode secrets.
- **Zero‑trust access** – all external access is through Cloudflare Tunnels and Tailscale.  The orchestrator PC does not expose ports directly to the internet.  Access is gated by Cloudflare Access policies (MFA and allowed emails).
- **Audit logging** – every AI call is logged with timestamp, user, input context and output suggestion.  Logs are stored in the `ai_audit_log` table in `nyra_ai`, accessible only to administrators.
- **Compliance** – the system is designed to meet GDPR/CCPA requirements: memory entries can be exported or deleted on request, and the system ensures that personal data is processed only with consent.

## Performance and Scaling

The orchestrator PC (Ryzen 7 6800H, 16 GB RAM) hosts Postgres, Redis, LiteLLM, n8n and the AI service.  To stay within memory limits:

- Postgres is configured with 4 GB memory, with the RuVector HNSW index using ~2 GB (see `docs/04_RAM_BUDGET.md`).
- Redis is limited to 512 MB.
- The AI service uses asynchronous job queues (BullMQ) to process long‑running tasks.  Jobs such as enrichment and lost‑deal analysis run in background workers to keep API responses responsive.
- Laptop workers run UI heavy components (TwentyCRM frontend, Dify or other dashboards) when needed; they connect to the orchestrator via Docker tunnels.  GPU workloads (embedding generation) wake the 3090 Ti worker via Wake‑on‑LAN.

## Conclusion

Project Nyra’s AI augmentation introduces contextual intelligence into a robust open‑source CRM.  By combining Claude‑powered reasoning with a self‑growing semantic memory, the system evolves with every interaction.  It provides proactive recommendations, reduces mundane tasks and surfaces insights that previously required intuition.  Careful attention to security, transparency and performance ensures that this power is deployed responsibly.

This whitepaper acts as the conceptual foundation for subsequent design and implementation documents.  The following files in the `docs/` folder provide a deeper dive into architecture, data models, deployment, operations, integrations and threat modelling.