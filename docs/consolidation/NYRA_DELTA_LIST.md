# Nyra Delta List

This document enumerates gaps and outstanding work identified during consolidation. It should serve as a checklist for future agents.

## Core Repository Gaps
- **Incomplete services:** Several services have scaffolding but require full implementation. Complete `lead-ingestion`, `campaign-service`, `compliance-service`, `communication-service`, `quote-service`, `assistant-service` and `api-gateway` based on the execution plan【858937579590172†L87-L166】. Ensure they expose the specified routes and enforce invariants (e.g., STOP handling, quiet hours, consent).
- **Tests and validation:** Implement unit and integration tests for each service. Validate compliance rules (STOP/unsubscribe/reply pauses), quote deterministic outputs and CRM writing. Add smoke tests to deployment scripts.
- **Domain models:** Define type-safe domain models and shared packages (`crm-types`, `compliance-domain`, `campaign-domain`, `quote-domain`) and use them consistently across services【858937579590172†L26-L50】.
- **Assistant safety:** Build the `assistant-service` to route tool calls through service interfaces, prevent direct database mutations and handle memory retrieval safely.
- **Environment templates:** Create `.env.template` files for each service with all required variables and document them in the secrets reference.

## Frontend Gaps
- **Broker/customer webapp:** The `projectnyra` app needs pages for intake, status, quotes, documents and chat. Integrate API clients and follow UI standards.
- **Admin portal:** Build dashboards and management pages as specified in the execution plan (lead list/detail, campaign & quote management, communications timeline, compliance controls, assistant tooling)【858937579590172†L168-L180】.
- **Landing pages:** Ensure non‑3D and 3D landing pages are separated and each has its own build pipeline. Implement SEO, analytics and conversion tracking.

## RateHunter Specific Gaps
- **Feature implementation:** Implement multi‑channel lead capture, real‑time quotes, calculators, content hub, social proof components and AI assistant integration according to the specs【556230783072290†L35-L49】【556230783072290†L85-L100】.
- **Workflow integration:** Connect lead capture forms to the lead ingestion service and drip campaigns. Ensure classification, eligibility assignment and immediate engagement.

## Infrastructure & Ops
- **Docker Compose:** Audit `infra/hosts` for completeness. Create compose files for any missing nodes. Standardise environment variables and secret mounts.
- **Monitoring & alerts:** Configure metrics dashboards and alerts for service health, CPU/GPU utilisation and error rates.
- **Security hardening:** Review network ingress rules and ensure only authorised subdomains are exposed. Implement secret scanning in CI and enforce dependency upgrades.

## Documentation
- **Mapping files to sections:** Create a repo-to-doc mapping that shows which files implement which sections of the manifest. Document any deviations or deprecated assets.
- **Owner manual:** Document manual actions (MFA, UI flows) in `docs/OWNER_MANUAL_ACTIONS.md`.

This delta list should be updated as tasks are completed or new gaps are identified.
