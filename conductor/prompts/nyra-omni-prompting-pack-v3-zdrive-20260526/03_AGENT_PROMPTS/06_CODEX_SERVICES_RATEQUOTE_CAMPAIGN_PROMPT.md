# Prompt 06 — Mortgage Services: RateQuoting, Quote Engine, Campaign Engine, CRM API

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Create/update backend service contracts for CRM API, quote engine, rate quoting service/API, and campaign engine. Do not touch UI/theme/components.

SERVICE PURPOSE:
These services power the money path: incoming lead -> normalized CRM record -> consent-gated campaign -> reply classification -> quote/rate request -> broker approval -> borrower communication -> audit/memory.

REQUIRED SERVICES:
1. CRM API
   - canonical lead/person/opportunity mapping
   - TwentyCRM sync
   - Supabase app-state sync if required
   - audit on all mutations
2. Rate Quoting Service
   - accepts borrower/property/loan scenario input
   - returns structured rate quote candidates or degraded/unavailable state
   - never exposes raw credentials
   - can be mocked deterministically
3. Quote Engine
   - produces exactly three canonical options:
     a. Lowest Payment Option
     b. Balanced / Recommended Structure
     c. Lowest Cost / Faster Break-Even Option
   - uses rate quoting inputs if available
   - never claims mock output as real pricing
   - requires broker approval before borrower-facing send
4. Campaign Engine
   - campaign templates
   - enrollment state
   - channel actions
   - wait/branch/retry
   - STOP/DNC immediate stop
   - missed-call ping
   - voice/conversation/TTS workflow hooks
   - Activepieces primary execution mapping
   - n8n fallback mapping if needed

REQUIRED ACTIONS:
1. Create service contracts and mock implementations.
2. Create OpenAPI-like docs or typed API docs if repo convention exists.
3. Create integration event schemas.
4. Create audit events for all service mutations.
5. Create tests for quote determinism, campaign stop, consent gate, CRM mutation audit, degraded rate quoting.
6. Create docs:
   - docs/services/CRM_API.md
   - docs/services/RATE_QUOTING.md
   - docs/services/QUOTE_ENGINE.md
   - docs/services/CAMPAIGN_ENGINE.md
   - docs/services/MORTGAGE_EVENT_SCHEMA.md

FINAL RESPONSE:
Files changed, tests, mock limitations, real-integration TODOs, next steps.
```
