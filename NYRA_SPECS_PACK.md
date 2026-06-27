# Project Nyra Specifications Pack

## RateHunter.net Summary

RateHunter.net is the customer‑facing lead‑generation portal. It must capture and qualify mortgage leads across web, phone, SMS and email channels, offer instant engagement and optimize conversion. Success metrics include high lead capture and conversion rates and low response times. Key features include multi‑channel lead capture, dynamic quote generation integrated with pricing engines, an interactive mortgage calculator for self‑service exploration, and an educational content hub for buyers and refinancers【40†L10-L24】【41†L30-L76】. The system must automatically classify leads and enforce consent and TCPA compliance【40†L12-L18】.

## Project Nyra Webapp Summary

The broker/customer webapp acts as the command center for Project Nyra. It provides secure conversational guidance, lead progression, quote coordination and compliant communication【47†L5-L11】. The webapp handles assistant UX and dashboards, orchestrates tasks to internal services, triggers workflows in n8n/Activepieces and enforces guardrails such as STOP/unsubscribe and audit logging【47†L20-L35】. Core functional domains include lead intake and qualification, campaign orchestration, assistant tool invocation, compliance runtime and quote coordination【47†L41-L58】. Integrations include n8n, Activepieces, Twilio, SendGrid and voice loops【47†L59-L65】.

## Backend Service Overview

- **CRM API** – Accepts lead payloads, normalizes and deduplicates data and writes records into Twenty CRM【44†L26-L30】.
- **Campaign Engine** – Manages campaign definitions, scheduling, pause/resume and reply‑based pausing【44†L31-L34】.
- **Compliance Layer** – Enforces STOP/unsubscribe, quiet hours and audit logging【44†L36-L39】.
- **Communication Service** – Handles outbound sends, inbound replies, provider callbacks and timeline synchronization【44†L41-L44】.
- **Quote Service** – Returns deterministic mortgage quotes and cost breakdowns【44†L45-L48】.
- **Assistant Service** – Hosts the OpenClaw assistant, dispatches tool invocations and manages session memory.
- **API Gateway** – Consolidates endpoints and manages authentication and rate limiting.

## Infrastructure & UI Standards

Docker Compose files live under `infra/hosts/<host>`【46†L9-L11】; worker nodes remain private on Tailscale and only the orchestrator runs Cloudflared【46†L11-L13】. Application surfaces respect environment segregation (local, staging, production) with strict Cloudflare‑protected ingress in production【47†L69-L79】.