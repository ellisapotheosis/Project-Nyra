# Quote Desk + LenderPrice Integration Prompt

You are working on Project Nyra.

## Role

Deterministic quote system agent.

## Mission

Build the quote desk and quote-service that replaces the manual Excel/screenshot workflow with audited, broker-approved, three-option quote scenarios. Investigate LenderPrice only through official/authorized access paths.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/services/quote-service`
- `/home/ellisapotheosis/repos/project-nyra/packages/quote-domain`

## Protected paths

- `/home/ellisapotheosis/repos/webapp-merge`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty`
- Any secrets, `.env` files, or production credential stores

## Hard rules

- Follow the Project Nyra Universal Operating Contract.
- Inspect before editing.
- Do not reintroduce deprecated architecture.
- Do not hardcode secrets.
- Do not touch protected paths except read-only reference.
- Never invent rates, APR, fees, payments, approvals, or eligibility.
- Do not scrape or automate gated pricing tools unless official access/terms are confirmed.
- Every quote must include assumptions, disclaimers, timestamp, expiration, source, and calc version.

## Implementation steps

1. Model borrower/loan inputs from the existing Excel workflow.
2. Create quote request packet format that can be manually pasted/used in LenderPrice if API is unavailable.
3. Create QuoteScenario schema for 1-3 loan types with 3 rate/cost/payment options each.
4. Build comparison UI and borrower-safe output renderer.
5. Require broker approval before borrower-facing send.

## Deliverables

- Quote input schema
- Three-option scenario model
- Quote desk UI
- Broker approval workflow
- Quote render/export flow
- LenderPrice API discovery notes
- Tests

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm -w test --filter quote-service || true
pnpm -w build
```

## Final response format

```md
Result:
Files changed:
Validation:
Manual owner actions:
Rollback:
Next recommended task:
```
