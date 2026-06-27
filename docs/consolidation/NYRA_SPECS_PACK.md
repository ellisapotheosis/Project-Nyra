# Project Nyra Specifications Pack

## RateHunter.net Summary

RateHunter.net is the customer‑facing lead‑generation portal. It must capture and qualify mortgage leads across web, phone, SMS and email channels, offer instant engagement and optimize conversion. Success metrics include high lead capture and conversion rates and low response times. Key features include multi‑channel lead capture, dynamic quote generation integrated with pricing engines, an interactive mortgage calculator for self‑service exploration, and an educational content hub for buyers and refinancers. The system must automatically classify leads and enforce consent and TCPA compliance.

## Project Nyra Webapp Summary

The broker/customer webapp acts as the command center for Project Nyra. It provides secure conversational guidance, lead progression, quote coordination and compliant communication. The webapp handles assistant UX and dashboards, orchestrates tasks to internal services, triggers workflows in n8n/Activepieces and enforces guardrails such as STOP/unsubscribe and audit logging. Core functional domains include lead intake and qualification, campaign orchestration, assistant tool invocation, compliance runtime and quote coordination. Integrations include n8n, Activepieces, Twilio, SendGrid and voice loops.

## Backend Service Overview

- **CRM API** – Accepts lead payloads, normalizes and deduplicates data and writes records into Twenty CRM.
- **Campaign Engine** – Manages campaign definitions, scheduling, pause/resume and reply‑based pausing.
- **Compliance Layer** – Enforces STOP/unsubscribe, quiet hours and audit logging.
- **Communication Service** – Handles outbound sends, inbound replies, provider callbacks and timeline synchronization.
- **Quote Service** – Returns deterministic mortgage quotes and cost breakdowns.
- **Assistant Service** – Hosts the OpenClaw assistant, dispatches tool invocations and manages session memory.
- **API Gateway** – Consolidates endpoints and manages authentication and rate limiting.

## Infrastructure & UI Standards

Docker Compose files live under `infra/hosts/<host>`; worker nodes remain private on Tailscale and only the orchestrator runs Cloudflared. Application surfaces respect environment segregation (local, staging, production) with strict Cloudflare‑protected ingress in production.
