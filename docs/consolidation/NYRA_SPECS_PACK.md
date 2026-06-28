# Project Nyra Specifications Pack

## RateHunter.net Summary

RateHunter.net is the customer‑facing lead‑generation portal. It must capture and qualify mortgage leads across web, phone, SMS and email channels, offer instant engagement and optimize conversion. Success metrics include high lead capture and conversion rates and low response times. Key features include multi‑channel lead capture, dynamic quote generation integrated with pricing engines, an interactive mortgage calculator for self‑service exploration, and an educational content hub for buyers and refinancers. The system must automatically classify leads and enforce consent and TCPA compliance.

### RateHunter Acceptance Criteria

- FR‑001: Progressive web form captures name, phone, email, loan type and property details
- FR‑002: Click‑to‑call integration with tracking and automatic CRM record creation
- FR‑003: SMS opt‑in capture with immediate double‑opt‑in confirmation
- FR‑004: Real‑time quote generation via LOS/quote‑service integration
- FR‑005: Mobile‑first responsive design with sub‑3s page load on 4G
- FR‑006: Lead source attribution tracked across all channels
- FR‑007: TCPA consent capture and storage before any outbound communication
- FR‑008: A/B testing framework for conversion optimization

## Project Nyra Webapp Summary

The broker/customer webapp acts as the command center for Project Nyra. It provides secure conversational guidance, lead progression, quote coordination and compliant communication. The webapp handles assistant UX and dashboards, orchestrates tasks to internal services, triggers workflows in n8n/Activepieces and enforces guardrails such as STOP/unsubscribe and audit logging. Core functional domains include lead intake and qualification, campaign orchestration, assistant tool invocation, compliance runtime and quote coordination. Integrations include n8n, Activepieces, Twilio, SendGrid and voice loops.

### Webapp Acceptance Criteria

- Dashboard displays lead pipeline, active campaigns and compliance status
- Lead detail view shows full communication timeline and consent state
- Campaign management allows create/pause/resume/cancel with immediate compliance enforcement
- Quote views show deterministic 3‑option scenarios with cost breakdowns
- Assistant chat surface integrates OpenClaw with guardrailed tool invocations
- All mutations log AuditEvents to the CRM timeline

## Backend Service Overview

- **CRM API** (`services/crm-api`) – Accepts lead payloads, normalizes and deduplicates data and writes records into Twenty CRM.
- **Campaign Engine** (`services/campaign-service`) – Manages campaign definitions, scheduling, pause/resume and reply‑based pausing.
- **Compliance Layer** (`services/compliance-service`) – Enforces STOP/unsubscribe, quiet hours and audit logging.
- **Communication Service** (`services/communication-service`) – Handles outbound sends, inbound replies, provider callbacks and timeline synchronization.
- **Quote Service** (`services/quote-service`) – Returns deterministic mortgage quotes and cost breakdowns.
- **Assistant Service** (`services/assistant-service`) – Hosts the OpenClaw assistant, dispatches tool invocations and manages session memory.
- **API Gateway** (`services/api-gateway`) – Consolidates endpoints and manages authentication and rate limiting.

## Product Invariants

These rules are non‑negotiable and must be enforced in every service:

1. **Safety Gates** – All outbound communication MUST pass through `ComplianceService` (STOP detection) and `ApprovalService` (HITL gate).
2. **Audit Mandate** – Every mutation or communication MUST log an `AuditEvent` via `AuditLogger` to the CRM timeline.
3. **Logical Scaffolding** – Use `@nyra/domain-models` for all type contracts and `@nyra/integration-adapters` for all third‑party SDK calls.
4. **Quote Integrity** – Quotes come from `services/quote-service` only. The assistant must never hallucinate rates or costs.
5. **STOP Enforcement** – STOP/unsubscribe/reply pauses halt outreach immediately across all channels.
6. **CRM Primacy** – Twenty CRM is the system of record. All business data lives there.
7. **Assistant Boundary** – The assistant surface cannot directly mutate CRM or databases; all changes route through services.

## Infrastructure & UI Standards

Docker Compose files live under `infra/hosts/<host>`; worker nodes remain private on Tailscale and only the orchestrator runs Cloudflared. Application surfaces respect environment segregation (local, staging, production) with strict Cloudflare‑protected ingress in production.

### UI Conventions

- Dark Mode / Indigo / Seafoam / Neon Pink palette (no light mode)
- shadcn/ui + Magic UI + Tailwind with oklch colors
- High professional density, broker‑facing aesthetic
- Shared tweakcn design tokens across all surfaces
