# Quote API Contract

`services/quote-api` is the canonical deterministic quote service.

## Responsibilities

- Accept normalized `QuoteRequest` inputs.
- Generate exactly three pricing scenarios: lowest payment, balanced, lowest cost.
- Return calculations, assumptions, and calculation traces.
- Produce quote history and PDF/document handoff metadata.
- Persist or mirror approved quote artifacts through CRM API.

## Forbidden

- The webapp must not calculate official quote terms.
- Assistants may explain returned quote data but must not invent rates, payments, costs, or APR.
- CRM API stores quote mirrors; it does not calculate quote values.

## Frontend Calls

- `POST /api/quotes/generate`
- `POST /api/v1/quote`
- `GET /api/quotes/:id`
- `GET /api/leads/:leadId/quotes`
- `POST /api/quotes/:id/approve`
- `POST /api/quotes/:id/pdf`

## Response Shape

Quote responses must conform to `QuoteSchema`:

- `leadId`
- optional `loanScenarioId`
- `status`
- `options`: exactly three `PricingScenarioSchema` entries
- optional `selectedOptionId`
- optional `expiresAt`
- optional `createdAt`

Each pricing scenario includes rate, APR, points, monthly payment, cash to close, closing costs, assumptions, and calculation trace.

## Deterministic Option Matrix

`POST /api/quotes/generate` and `POST /api/v1/quote` return exactly three options:

- `LOWEST_PAYMENT` / `Buy-down`: lower note rate, positive discount points, higher cash to close.
- `BALANCED` / `Standard par`: base note rate, no points, no lender credit.
- `LOWEST_COST` / `Lender credit`: higher note rate, negative points, lower cash to close.

The canonical endpoint includes principal and interest, property taxes, insurance, HOA, and PMI in `monthlyPayment`. PMI is applied deterministically for conventional-style loans above 80 percent LTV and omitted for VA, USDA, HELOC, and loans at or below 80 percent LTV. Generic `/quote` supports zero interest for edge-case amortization tests.

## Audit Evidence

Every generated quote includes source model/version, rate sheet reference when available, assumptions, input hash, and correlation ID.
