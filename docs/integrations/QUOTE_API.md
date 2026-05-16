# QUOTE_API.md

## Role

Deterministic calculation of mortgage scenarios.

## Outputs

Every quote MUST return 3 distinct options:

1. **Lowest Payment**: Optimized for monthly cash flow.
2. **Balanced**: Recommended mortgage structure.
3. **Lowest Cost**: Optimized for long-term savings and break-even.

## Implementation

The active service is `services/quote-api`, a Python/FastAPI service. The canonical endpoints are:

- `POST /api/quotes/generate`
- `POST /api/v1/quote`

The current deterministic implementation returns:

- `LOWEST_PAYMENT` / `Buy-down`
- `BALANCED` / `Standard par`
- `LOWEST_COST` / `Lender credit`

Each option includes principal and interest, taxes, insurance, HOA, PMI when applicable, cash to close, APR, points, assumptions, and calculation trace. The service is deterministic until live rate sheets are configured.

## CRM Boundary

`services/quote-api` calculates quote options. `services/crm-api` mirrors generated or approved quote artifacts to Twenty CRM. Assistants and UI surfaces must not calculate or invent quote terms.
