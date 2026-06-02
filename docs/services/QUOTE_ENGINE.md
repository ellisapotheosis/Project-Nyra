# Quote Engine

Last updated: 2026-05-24

## Overview

The Quote Engine takes rate candidates from the Rate Quoting service and structures them
into exactly three canonical options for presentation to a borrower. This 3-option shape
is a hard business rule — never fewer, never more. Each option represents a meaningfully
different trade-off along the payment/cost/risk spectrum.

Service path: `services/quote-engine` (generation logic) + `services/quote-api` (HTTP interface)
Upstream dependency: Rate Quoting service (`RATE_QUOTING_API_URL`)

No quote may be sent to a borrower unless a licensed broker has explicitly approved it.
Mock quotes must never be presented to borrowers as real pricing.

---

## The Three Canonical Options (hard rule)

### Option 1 — Lowest Payment

Optimized to minimize the borrower's monthly principal and interest payment.
Typically the longest amortization or a scenario with negative points (lender credit).

| Field                 | Value                                           |
| --------------------- | ----------------------------------------------- |
| `option_type`         | `lowest_payment`                                |
| `selection_rationale` | "Minimizes your monthly out-of-pocket payment." |
| `broker_recommended`  | false                                           |
| Display order         | First                                           |

### Option 2 — Balanced / Recommended Structure

The broker-recommended middle option. Balances payment, total cost, and competitive rate.
If the broker provides no explicit recommendation signal, the engine defaults to the
candidate nearest the median APR with zero origination points.

| Field                 | Value                                           |
| --------------------- | ----------------------------------------------- |
| `option_type`         | `balanced_recommended`                          |
| `selection_rationale` | "Balances monthly payment and total loan cost." |
| `broker_recommended`  | true (always true on this option)               |
| Display order         | Second                                          |

### Option 3 — Lowest Cost / Faster Break-Even

Optimized to minimize total interest paid or achieve the fastest break-even on any
upfront premium. Typically higher monthly payment but lowest lifetime cost.

| Field                 | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| `option_type`         | `lowest_cost_faster_break_even`                            |
| `selection_rationale` | "Lowest total cost; fastest break-even if you pay points." |
| `broker_recommended`  | false                                                      |
| Display order         | Third                                                      |

---

## Input Schema

### RateQuoteRequest

```json
{
  "request_id": "qe_req_01HABC",
  "broker_id": "broker_01H000",
  "lead_id": "lead_01HXYZ",
  "opportunity_id": "opp_01HJKL",
  "rate_quote_result": { "...RateQuoteResult from Rate Quoting service..." },
  "broker_context": {
    "preferred_lenders": ["lender_a", "lender_b"],
    "avoid_lenders": [],
    "recommendation_override": null,
    "notes": "Borrower wants to minimize cash to close."
  }
}
```

---

## Output Schema

### QuotePackage

```json
{
  "quote_id": "qpkg_01HSTU",
  "request_id": "qe_req_01HABC",
  "lead_id": "lead_01HXYZ",
  "opportunity_id": "opp_01HJKL",
  "broker_id": "broker_01H000",
  "generated_at": "2026-05-24T12:01:00Z",
  "is_mock": false,
  "approval_status": "pending | approved | rejected | expired",
  "approved_by": null,
  "approved_at": null,
  "expires_at": "2026-05-24T16:01:00Z",
  "options": [
    {
      "option_type": "lowest_payment",
      "broker_recommended": false,
      "rate_pct": 7.25,
      "apr_pct": 7.312,
      "points": -0.5,
      "monthly_pi_usd": 2271.16,
      "total_interest_usd": 467217.6,
      "break_even_months": null,
      "selection_rationale": "Minimizes your monthly out-of-pocket payment.",
      "candidate_id": "cand_01H003"
    },
    {
      "option_type": "balanced_recommended",
      "broker_recommended": true,
      "rate_pct": 6.875,
      "apr_pct": 6.975,
      "points": 0.0,
      "monthly_pi_usd": 2364.48,
      "total_interest_usd": 491212.8,
      "break_even_months": null,
      "selection_rationale": "Balances monthly payment and total loan cost.",
      "candidate_id": "cand_01H002"
    },
    {
      "option_type": "lowest_cost_faster_break_even",
      "broker_recommended": false,
      "rate_pct": 6.5,
      "apr_pct": 6.625,
      "points": 1.0,
      "monthly_pi_usd": 2456.23,
      "total_interest_usd": 442217.6,
      "break_even_months": 43,
      "selection_rationale": "Lowest total cost; fastest break-even if you pay points.",
      "candidate_id": "cand_01H001"
    }
  ],
  "audit_event_id": "evt_01HWXY"
}
```

---

## Selection Algorithm

1. Filter `RateQuoteResult.candidates` to `eligible: true` only.
2. Sort eligible candidates by `monthly_pi_usd` ascending.
3. **Option 1 (Lowest Payment)**: candidate with lowest `monthly_pi_usd`. If a
   negative-points candidate produces a lower payment than a zero-points candidate,
   prefer it.
4. **Option 3 (Lowest Cost)**: candidate with lowest `total_interest_usd`. On tie,
   prefer lowest `break_even_months`. This is typically the highest-points candidate.
5. **Option 2 (Balanced)**: from remaining candidates, select the one closest to the
   median APR with zero or lowest-magnitude points. Apply `broker_context.preferred_lenders`
   as a tiebreaker.
6. If fewer than 3 distinct eligible candidates exist after filtering, the engine returns
   `QuoteGenerationError` with reason `insufficient_candidates`. A partial QuotePackage
   is never produced.

The same candidate may not appear in two options. If the algorithm would assign the same
candidate to two slots, step back and select the next-closest candidate for the lower-priority
slot (priority order: Option 2 > Option 1 > Option 3).

---

## Broker Approval Gate

**Hard rule**: A QuotePackage with `approval_status: pending` must not be delivered to a
borrower via any channel (SMS, email, portal link). The Campaign Engine enforces this check
before every send. Attempting to bypass it will emit a `QuoteMockBlockedSend` or
`QuoteUnapprovedBlockedSend` audit event and halt the send.

Approval lifecycle:

1. Quote Engine generates QuotePackage, writes to `quote_packages` with `approval_status: pending`
2. Emits `QuoteGenerated` audit event
3. Broker receives in-app notification and email
4. Broker calls `POST /quotes/:quote_id/approve` or `POST /quotes/:quote_id/reject`
5. On approve: `approval_status` set to `approved`, `approved_by` and `approved_at` written,
   `QuoteApproved` audit event emitted
6. QuotePackage is now eligible for borrower-facing delivery via Campaign Engine
7. On reject: `approval_status` set to `rejected`, broker may request a new quote with
   modified scenario or broker_context

Quotes expire 4 hours after generation. An expired quote requires re-generation and
re-approval before delivery.

---

## Mock Mode

When `is_mock: true` is propagated from the upstream Rate Quoting response:

- QuotePackage carries `is_mock: true` throughout its lifecycle
- In production: `QuoteSent` is hard-blocked if `is_mock: true`
- In development/staging: mock quotes may be sent with `[MOCK PRICING — NOT REAL]`
  prepended to all borrower-facing copy
- Broker UI must display a prominent `MOCK DATA` badge on any QuotePackage where `is_mock: true`
- Mock packages may still be approved in non-production environments for workflow testing

---

## Audit Events

| Trigger                                  | Event type                   |
| ---------------------------------------- | ---------------------------- |
| Quote package generated                  | `QuoteGenerated`             |
| Broker approves                          | `QuoteApproved`              |
| Broker rejects                           | `QuoteRejected`              |
| Quote sent to borrower                   | `QuoteSent`                  |
| Quote expired without send               | `QuoteExpired`               |
| Mock quote blocked from prod send        | `QuoteMockBlockedSend`       |
| Unapproved quote blocked from send       | `QuoteUnapprovedBlockedSend` |
| Degraded upstream, package not generated | `RateQuoteDegraded`          |

---

## Error States

| Error                     | Meaning                                            | Recovery                                                    |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `insufficient_candidates` | Fewer than 3 eligible candidates from Rate Quoting | Re-run with relaxed scenario or wait for rate sheet refresh |
| `rate_quote_degraded`     | Upstream returned degraded state                   | Surface degraded notice to broker; do not generate package  |
| `scenario_invalid`        | Missing or invalid fields in RateQuoteRequest      | Fix input fields and resubmit                               |
| `broker_not_authorized`   | `broker_id` lacks permission for this lead         | Check CRM ownership assignment                              |
| `quote_expired`           | QuotePackage past 4-hour TTL                       | Re-generate and re-approve                                  |
| `duplicate_request`       | Identical scenario hash within 5 minutes           | Return cached QuotePackage reference                        |
