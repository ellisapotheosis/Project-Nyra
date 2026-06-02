# Rate Quoting Service

Last updated: 2026-05-24

## Overview

The Rate Quoting service accepts a structured borrower/property/loan scenario and returns
rate candidates from the pricing engine. It is a stateless request/response service — it
does not persist quotes or maintain session state. The Quote Engine (see QUOTE_ENGINE.md)
consumes this service's output to produce the canonical 3-option QuotePackage.

Service path: `services/rate-comparison-engine`
Env var: `RATE_QUOTING_API_URL`
Mock env var: `NYRA_ENABLE_MOCKS=true`

Raw API credentials for upstream pricing providers are never passed to clients or logged.
The service holds credentials server-side only, injected via environment at runtime.

---

## Input Schema

### BorrowerProfile

```json
{
  "credit_score_band": "620-639 | 640-659 | 660-679 | 680-719 | 720-759 | 760+",
  "annual_income_usd": 95000,
  "monthly_debt_usd": 1200,
  "employment_type": "w2 | self_employed | retired | other",
  "self_employed_years": null,
  "assets_usd": 75000,
  "co_borrower": {
    "credit_score_band": "720-759",
    "annual_income_usd": 60000
  }
}
```

`co_borrower` is optional. When present the engine uses the lower of the two credit score
bands for qualification but combines income for DTI calculation.

### PropertyDetails

```json
{
  "address_state": "TX",
  "property_type": "single_family | condo | multi_family | manufactured",
  "appraised_value_usd": 450000,
  "occupancy": "primary | secondary | investment",
  "county": "Travis",
  "flood_zone": false
}
```

### LoanScenario

```json
{
  "loan_purpose": "purchase | refinance | cash_out_refi | heloc",
  "loan_amount_usd": 360000,
  "loan_term_years": 30,
  "loan_type": "conventional | fha | va | usda | jumbo",
  "ltv_pct": 80.0,
  "lock_period_days": 30,
  "points_preference": "zero_points | float",
  "impound_escrow": true
}
```

---

## Output Schema

### RateQuoteResult (success)

```json
{
  "status": "ok",
  "request_id": "rqr_01HABCD",
  "scenario_hash": "sha256-truncated",
  "lock_period_days": 30,
  "quoted_at": "2026-05-24T12:00:00Z",
  "is_mock": false,
  "candidates": [
    {
      "candidate_id": "cand_01H001",
      "rate_pct": 6.875,
      "apr_pct": 7.012,
      "points": 0.0,
      "monthly_pi_usd": 2364.48,
      "total_interest_usd": 491212.8,
      "break_even_months": null,
      "product_code": "CONV30_FNMA",
      "eligible": true,
      "ineligibility_reason": null
    }
  ],
  "ineligible_products": [
    {
      "product_code": "VA30",
      "ineligibility_reason": "borrower_not_va_eligible"
    }
  ]
}
```

`lender_name` is intentionally absent from this schema. The Quote Engine controls lender
visibility per audience context (broker vs. borrower).

### DegradedState (partial or total failure)

```json
{
  "status": "degraded | unavailable",
  "request_id": "rqr_01HABCD",
  "quoted_at": "2026-05-24T12:00:00Z",
  "is_mock": false,
  "health": {
    "pricing_engine": "down | slow | partial",
    "reason": "upstream_timeout | invalid_scenario | rate_sheet_stale",
    "retry_after_seconds": 30
  },
  "candidates": [],
  "partial_candidates": []
}
```

`partial_candidates` may be populated in `degraded` (not `unavailable`) state. The Quote
Engine must treat partial candidates as unconfirmed and must not generate a QuotePackage
from a degraded response without explicit broker acknowledgment.

---

## Mock Mode

When `NYRA_ENABLE_MOCKS=true`, the service bypasses all upstream calls and returns a
deterministic mock response.

Mock response rules:

- `is_mock: true` is always set in the response envelope
- Rates are static, scenario-independent fixtures — not reflective of real market conditions
- Mock data must never be delivered to a borrower without a visible disclaimer
- The Quote Engine propagates `is_mock: true` into the QuotePackage and blocks
  broker-approval send if `is_mock` is true in a production environment

Mock response example:

```json
{
  "status": "ok",
  "request_id": "rqr_MOCK_01",
  "is_mock": true,
  "quoted_at": "2026-05-24T12:00:00Z",
  "candidates": [
    {
      "candidate_id": "mock_low_payment",
      "rate_pct": 7.25,
      "apr_pct": 7.312,
      "points": -0.5,
      "monthly_pi_usd": 2271.16,
      "total_interest_usd": 467217.6,
      "is_mock": true
    },
    {
      "candidate_id": "mock_balanced",
      "rate_pct": 6.875,
      "apr_pct": 6.975,
      "points": 0.0,
      "monthly_pi_usd": 2364.48,
      "total_interest_usd": 491212.8,
      "is_mock": true
    },
    {
      "candidate_id": "mock_low_cost",
      "rate_pct": 6.5,
      "apr_pct": 6.625,
      "points": 1.0,
      "monthly_pi_usd": 2456.23,
      "total_interest_usd": 514234.2,
      "break_even_months": 43,
      "is_mock": true
    }
  ]
}
```

---

## Endpoints

All calls are internal service-to-service only. These endpoints are not exposed to browser
clients or external consumers.

### POST /rate-quotes/request

Full quote request. Returns `RateQuoteResult` or `DegradedState`.

Request body:

```json
{
  "borrower": { "...BorrowerProfile..." },
  "property": { "...PropertyDetails..." },
  "loan": { "...LoanScenario..." },
  "broker_id": "broker_01H000",
  "request_context": "quote_engine | manual_lookup"
}
```

### GET /rate-quotes/:request_id

Retrieve a previously computed quote by request ID. Quotes are cached for 4 hours.
After cache expiry returns `410 Gone` — caller must re-request with fresh scenario.

### GET /rate-quotes/health

Returns service health and rate sheet freshness.

```json
{
  "status": "ok | degraded | unavailable",
  "rate_sheet_age_minutes": 12,
  "rate_sheet_stale_threshold_minutes": 60,
  "upstream_latency_p95_ms": 340
}
```

---

## Security

- Credentials for upstream pricing APIs are held in environment variables, never in source
- All inter-service calls use mutual TLS or internal network isolation
- No raw rate data is written to client-side storage or returned in browser-accessible APIs
- Upstream provider names and product codes are stripped from any payload that crosses
  the internal/external boundary in a borrower context

---

## Error Handling

| HTTP status     | Meaning                      | Action                                                       |
| --------------- | ---------------------------- | ------------------------------------------------------------ |
| 200 ok          | Quotes returned              | Proceed to Quote Engine                                      |
| 200 degraded    | Partial results              | Broker acknowledgment required before QuotePackage           |
| 200 unavailable | Zero results                 | Surface degraded state to broker UI, do not generate package |
| 400             | Invalid scenario input       | Fix scenario fields, do not retry as-is                      |
| 429             | Rate limited                 | Backoff per Retry-After header                               |
| 503             | Upstream pricing engine down | Retry with exponential backoff, max 3 attempts               |

Emits `RateQuoteRequested` on every call and `RateQuoteReturned` or `RateQuoteDegraded`
on every response, regardless of status.
