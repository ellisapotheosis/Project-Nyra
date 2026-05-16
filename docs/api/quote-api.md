# Quote API

`services/quote-api` is the deterministic pricing calculation service. Apps and assistants may explain returned quote data, but they must not fabricate rates, payments, APR, fees, or quote options.

## Health

`GET /health`

Response:

```json
{
  "ok": true,
  "version": "2.1.0",
  "service": "nyra-quote-api"
}
```

## Canonical Quote Generation

`POST /api/quotes/generate`

Alias:

`POST /api/v1/quote`

Sample request:

```json
{
  "leadId": "lead_sample_001",
  "requestedBy": "broker_sample",
  "requestedAt": "2026-05-14T18:00:00.000Z",
  "baseRate": 6.75,
  "termYears": 30,
  "loanScenario": {
    "purpose": "PURCHASE",
    "loanAmount": { "amountCents": 45000000, "currency": "USD" },
    "propertyValue": { "amountCents": 50000000, "currency": "USD" },
    "downPayment": { "amountCents": 5000000, "currency": "USD" },
    "annualTaxes": { "amountCents": 720000, "currency": "USD" },
    "annualInsurance": { "amountCents": 180000, "currency": "USD" },
    "monthlyHoa": { "amountCents": 0, "currency": "USD" },
    "pmiRateBps": 60,
    "state": "CA",
    "occupancy": "PRIMARY",
    "loanType": "CONVENTIONAL",
    "creditScore": 740
  }
}
```

The response conforms to `QuoteSchema` and always contains exactly three options:

- `LOWEST_PAYMENT` / `Buy-down`: lower note rate, positive points, higher cash to close.
- `BALANCED` / `Standard par`: base note rate, no points.
- `LOWEST_COST` / `Lender credit`: higher note rate, lender credit, lower cash to close.

Each option includes:

- `rate`
- `apr`
- `points`
- `monthlyPayment`
- `cashToClose`
- `closingCosts`
- `assumptions`
- `calculationTrace`

## Deterministic Rules

- `monthlyPayment` includes principal and interest, taxes, insurance, HOA, and PMI where applicable.
- PMI is applied to conventional-style loans above 80 percent LTV.
- PMI is omitted for VA, USDA, HELOC, and loans at or below 80 percent LTV.
- Cash to close is down payment plus estimated closing costs plus point cost, with lender credit reducing cash to close.
- Quotes expire 24 hours after generation.
- Generic `/quote` accepts `annual_interest_rate: 0` for amortization edge-case tests.

## CRM Handoff

Generated quotes are not delivered directly to borrowers by this service. `services/crm-api` mirrors approved or sent quote artifacts to Twenty CRM, and broker approval is required before borrower delivery.
