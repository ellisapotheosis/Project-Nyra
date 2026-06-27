# Project Nyra Delta List (Remaining Work)

This list identifies gaps and outstanding tasks across the Project Nyra stack. It is derived from the execution plans and specifications【44†L20-L53】【40†L10-L24】.

## Core Services

- **CRM API** – Implement normalization, deduplication and write logic; generate data models for loan, campaign enrollment, communication log and quote【44†L20-L30】.
- **Campaign Engine** – Build campaign definition schema, scheduling, pause/resume and reply‑based pausing【44†L31-L34】.
- **Compliance Layer** – Implement STOP/unsubscribe handling, quiet hours, suppression lists and audit logging【44†L36-L39】.
- **Communication Service** – Complete outbound send logic, provider callback handling and inbound reply ingestion; integrate timeline synchronization【44†L41-L44】.
- **Quote Service** – Develop FastAPI endpoints for deterministic mortgage quote generation, including cost breakdowns and multi‑option scenarios【44†L45-L48】.
- **Assistant Service** – Deploy OpenClaw as a bounded assistant; implement memory session management and tool invocation routing.

## Supporting Libraries

- Define strong type schemas for CRM objects and event payloads.
- Build shared authentication middleware and error‑handling utilities.
- Implement testing frameworks and generate unit/integration tests across services.

## Frontend Applications

- **Broker/Customer Webapp (`apps/projectnyra`)** – Build React/Next.js pages for dashboards, lead intake, campaign intelligence, quote display, compliance alerts and assistant chat【47†L5-L24】【47†L41-L58】.
- **Admin Portal** – Develop admin settings and monitoring interface (user management, campaign configuration, compliance logs).
- **Landing Pages** – Create both non‑3D and 3D landing page implementations with responsive design and SEO optimization; connect forms to the RateHunter API.

## RateHunter.net

- Implement the multi‑channel lead capture form and backend integration【40†L30-L43】.
- Integrate real‑time quote generation with the quote service【41†L1-L14】.
- Build the interactive mortgage calculator and educational content hub【41†L30-L76】.
- Add analytics instrumentation and A/B testing hooks to optimize conversion metrics.

## Infrastructure & Operations

- Finalize Docker Compose files under `infra/hosts/` and verify service dependencies【46†L9-L27】.
- Implement health‑check and monitoring scripts; integrate Prometheus and Grafana dashboards.
- Document environment setup procedures and bootstrap scripts for new nodes.
- Establish CI/CD pipelines for services and frontends; define staging and production deployment tasks.
- Validate Tailscale and Cloudflare configuration for domain routing【38†L16-L20】【46†L35-L39】.

## Secrets & Environment Management

- Create `.env.example` templates for each service with complete variable lists.
- Configure Infisical vaults for all environments and document retrieval procedures.
- Establish secret rotation schedules and ensure free‑plan limits are tracked.
- Audit repository for hard‑coded secrets and remove them.

## Documentation

- Consolidate this delta list into the master whitepaper and update the architecture guide.
- Write onboarding guides for developers and operators.
- Provide runbooks for incident response and compliance procedures.