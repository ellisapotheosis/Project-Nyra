# Mortgage Pricing Integrations Guide

Owner-only setup guide for connecting Project Nyra's Quote API to Rocket Mortgage / Rocket Pro TPO, Lender Price, and LendingPad integrated pricing.

Last verified: 2026-05-12.

## Executive Summary

Project Nyra should not connect the webapp directly to pricing vendors. The correct boundary is:

```text
apps/nyra-webapp
  -> Next.js quote proxy routes
  -> services/quote-api
  -> provider adapter layer
  -> Rocket / Lender Price / LendingPad / other PPE or LOS systems
```

Current Nyra state:

- `apps/nyra-webapp/app/api/quote/compare-loan-types/route.ts` proxies to `QUOTE_API_URL` and returns `503` when quote math is not configured.
- `services/quote-api/CONTRACT.md` says the quote service owns quote generation and must return exactly three scenarios: lowest payment, balanced, and lowest cost.
- The webapp must stay thin. It can request, display, approve, and explain quote data, but it must not calculate official rates or fabricate pricing.

Vendor reality:

- Rocket Mortgage / Rocket Pro TPO does not appear to publish a self-serve public rate quote API spec. Public evidence points to broker portal tools, partner/TPO integrations, and LOS handoff flows.
- Lender Price does publish a developer-account page and markets a pricing API/PPE platform, but API docs and credentials are gated behind a developer account or commercial onboarding.
- LendingPad publishes API terms that require NDA, agreement, provisioning, and Lender Edition access. LendingPad also has built-in knowledge-base flows for Rocket Mortgage and Lender Price pricing.

## Source Links

- Rocket Pro TPO technology announcement: https://www.rocketcompanies.com/press-release/rocket-pro-tpo-announces-major-initiatives-to-grow-strengthen-and-protect-mortgage-brokers-businesses/
- LendingPad Rocket Mortgage integration KB: https://lendingpad.com/kb/lendingpad-and-rocket-mortgage
- Lender Price developer portal: https://lenderprice.com/api/
- Lender Price enterprise pricing engine: https://lenderprice.com/mortgage-loan-pricing-engine/
- LendingPad API terms: https://lendingpad.com/api-terms
- LendingPad Lender Price setup KB: https://lendingpad.com/kb/how-to-set-up/run-lender-price-pricing-engine

## Target Nyra Architecture

Use `services/quote-api` as the integration owner.

```text
Lead / borrower scenario
  -> Nyra Quote API canonical request
  -> ProviderPricingAdapter
     -> RocketPricingAdapter
     -> LenderPricePricingAdapter
     -> LendingPadPricingAdapter or LendingPadLosAdapter
  -> Normalize provider response
  -> Quote API returns CanonicalQuoteResponse
  -> CRM API mirrors approved quote artifact
  -> Webapp displays results
```

Do not:

- Put vendor credentials in React or Next.js client code.
- Scrape Rocket, Lender Price, or LendingPad portals.
- Let the assistant invent unavailable rates, APR, points, fees, or cash-to-close numbers.
- Treat public marketing pages as API contracts.

## Canonical Provider Adapter Contract

The backend agent should add an adapter interface inside `services/quote-api`, not inside `apps/nyra-webapp`.

Recommended adapter shape:

```python
class ProviderPricingAdapter(Protocol):
    provider_name: str

    async def price(self, request: CanonicalQuoteRequest) -> ProviderPricingResult:
        ...
```

Recommended normalized request fields:

- Lead ID and correlation ID.
- Loan purpose: purchase, rate-term refi, cash-out refi, HELOC.
- State, county if available, and property ZIP if vendor requires it.
- Property type, occupancy, property value, purchase price, appraised value.
- Loan amount, down payment, LTV, CLTV if applicable.
- Credit score bucket or exact score, depending on vendor terms.
- Term, amortization type, loan type filter, lock period.
- Broker compensation mode and comp value, if allowed by vendor contract.
- Borrower-paid vs lender-paid compensation, if allowed by vendor contract.
- Known taxes, insurance, HOA, MI flags, VA funding fee flags, FHA MIP flags.

Recommended normalized response fields:

- Provider name and provider quote ID.
- Product name, investor/lender name, loan type, term, amortization type.
- Rate, APR, points, price, lender credit, discount cost.
- Monthly principal and interest, estimated escrow, MI, total payment.
- Closing costs, cash to close, lock period, expiration timestamp.
- Eligibility result and reason codes for ineligible products.
- Raw provider response snapshot stored server-side for audit.
- Calculation trace and input hash.

## Secret Names

Store these in Infisical or another approved secret manager. Do not commit them.

```text
QUOTE_PROVIDER_DEFAULT=lenderprice

ROCKET_TPO_ENABLED=false
ROCKET_TPO_CLIENT_ID=
ROCKET_TPO_CLIENT_SECRET=
ROCKET_TPO_AUTH_URL=
ROCKET_TPO_API_BASE_URL=
ROCKET_TPO_PARTNER_ID=
ROCKET_TPO_ACCOUNT_ID=

LENDERPRICE_ENABLED=false
LENDERPRICE_API_BASE_URL=
LENDERPRICE_CLIENT_ID=
LENDERPRICE_CLIENT_SECRET=
LENDERPRICE_USERNAME=
LENDERPRICE_PASSWORD=
LENDERPRICE_COMPANY_ID=
LENDERPRICE_ACCOUNT_ID=

LENDINGPAD_ENABLED=false
LENDINGPAD_API_BASE_URL=
LENDINGPAD_CLIENT_ID=
LENDINGPAD_CLIENT_SECRET=
LENDINGPAD_API_KEY=
LENDINGPAD_COMPANY_ID=
LENDINGPAD_ENVIRONMENT=sandbox
```

Only enable a provider after sandbox calls pass and legal/compliance has approved the vendor terms.

## Rocket Mortgage / Rocket Pro TPO

### What Is Publicly Confirmed

Rocket Pro TPO serves brokers and partner institutions. Rocket's public material references broker portal technology, Pathfinder, Rocket Connect, and a pricing calculator. LendingPad's Rocket KB describes a Rocket integration that supports SSO when assigning Rocket to a file, brokered-loan support, loan-file data transfer, dates, and statuses.

The public material found does not provide a direct unauthenticated rate quote API spec for Nyra to implement against.

### Best Integration Path

Use one of these paths, in this order:

1. Direct Rocket Pro TPO partner API, if Rocket enables one for your account.
2. LendingPad's Rocket integration for loan registration and status/date handoff.
3. Manual Rocket portal handoff until Rocket grants API access.

### Owner Steps

1. Confirm the business account:
   - You need an active Rocket Pro TPO broker/partner relationship.
   - Confirm whether the account is approved for API or LOS/POS integration access.

2. Contact the Rocket AE or partner support:
   - Ask for "Rocket Pro TPO API or LOS/POS integration access for pricing, eligibility, loan registration, and status sync."
   - Ask whether rate/pricing can be retrieved by API or only through the broker portal/pricing calculator.
   - Ask whether your LendingPad integration is the supported integration path.

3. Request the actual contract package:
   - Sandbox base URL.
   - Production base URL.
   - OAuth or SSO details.
   - Client ID and client secret.
   - Partner/account identifiers.
   - Required request schema for pricing or registration.
   - Allowed caching window.
   - Audit and disclosure requirements.
   - Rate-lock restrictions.
   - Error-code documentation.

4. If Rocket only enables LendingPad integration:
   - Follow the LendingPad Rocket setup path.
   - Keep Nyra's Rocket adapter in `not_configured` state.
   - Use Nyra to package loan scenario data and link the user to the LendingPad/Rocket workflow.

5. If Rocket enables a quote/pricing API:
   - Backend agent implements `RocketPricingAdapter` in `services/quote-api`.
   - Adapter maps Nyra's canonical quote request to Rocket's request schema.
   - Adapter stores raw Rocket response in quote audit storage.
   - Adapter normalizes eligible results into Nyra pricing scenarios.
   - Quote API selects exactly three options or returns a clear "not enough eligible results" error.

### Rocket Questions To Send

```text
We are building a backend-only quote service for Project Nyra. Does Rocket Pro TPO provide an API for pricing/eligibility/rate quote retrieval for brokered loans, or is pricing only available through the Rocket portal and approved LOS/POS integrations?

If API access is available, please provide:
- NDA/API agreement steps
- sandbox and production provisioning process
- authentication method
- API base URLs
- pricing request and response schemas
- product/eligibility reason codes
- rate-lock and cache restrictions
- required audit/disclosure language
- allowed data retention period for raw pricing responses
- whether LendingPad is the preferred integration route for our account
```

## Lender Price

### What Is Publicly Confirmed

Lender Price has a developer portal for creating a developer account and markets an enterprise PPE built on flexible APIs. LendingPad's Lender Price setup guide describes three levels:

- Level 1 marketplace pricing without credentials inside LendingPad.
- Level 2 marketplace pricing with individual LO setup.
- Level 3 paid private pricing using username, password, and client ID from Lender Price.

For direct Nyra backend integration, use the Lender Price developer-account path rather than the LendingPad iframe flow.

### Best Integration Path

Use direct Lender Price API access for Nyra Quote API pricing. Use LendingPad's Lender Price integration only when the operator wants pricing inside LendingPad loan files.

### Owner Steps

1. Create/request the developer account:
   - Go to https://lenderprice.com/api/
   - Submit the developer account form.
   - Use the company email tied to the mortgage operation.

2. Request API onboarding:
   - Ask for sandbox credentials.
   - Ask whether your account should use marketplace pricing, broker pricing, or paid private pricing.
   - Ask whether your account needs company-level credentials or per-LO credentials.

3. Collect credentials:
   - API base URL.
   - Auth type.
   - Client ID.
   - Client secret or password.
   - Company/account ID.
   - LO/user IDs if required.
   - Product/channel identifiers.

4. Configure Nyra secrets:
   - Set `LENDERPRICE_ENABLED=true`.
   - Populate the `LENDERPRICE_*` secrets.
   - Keep `QUOTE_PROVIDER_DEFAULT=lenderprice` if Lender Price is the main pricing source.

5. Backend implementation:
   - Add `LenderPricePricingAdapter` under `services/quote-api`.
   - Add request validation before sending anything to Lender Price.
   - Map canonical request fields to Lender Price's pricing scenario schema.
   - Normalize eligible products and pricing adjustments.
   - Persist raw response snapshots and the normalized result.
   - Return exactly three Nyra options when possible.

6. Validation:
   - Run sandbox pricing for purchase, rate-term refi, cash-out refi, FHA, VA, and conventional scenarios.
   - Compare Nyra-normalized pricing against Lender Price's UI for the same inputs.
   - Confirm ineligible reason codes are preserved.
   - Confirm no webapp code contains Lender Price credentials.

### Lender Price Questions To Send

```text
We are integrating Project Nyra's backend quote service with Lender Price PPE. Please provide developer onboarding for API-based product/pricing/eligibility retrieval.

Please confirm:
- sandbox and production API base URLs
- authentication method
- whether credentials are company-level, user-level, or both
- required fields for purchase/refi scenarios
- supported channels for broker/wholesale pricing
- product and eligibility response schemas
- lock-period and compensation fields
- whether raw API responses may be stored for audit
- allowed cache duration for pricing responses
- error-code and ineligible-product documentation
```

## LendingPad Integrated Pricing

### What Is Publicly Confirmed

LendingPad's API terms say API access is for approved systems, evaluation occurs after NDA, API is available to Lender Edition clients, an API agreement is required before development/provisioning, and support beyond basic key/testing-site access may be billed.

LendingPad also documents built-in setup for Lender Price pricing inside each loan file. Users click a "Get Price" action that opens the Lender Price UI in an iframe. For paid private pricing, LendingPad requires credentials provided by Lender Price.

### Best Integration Path

There are two different LendingPad paths. Pick one deliberately:

1. `Nyra -> Lender Price direct -> LendingPad mirror`
   - Best for Project Nyra automation.
   - Nyra owns quote comparison and audit.
   - Selected quote or loan metadata can later be pushed to LendingPad if API access allows.

2. `LendingPad -> integrated Lender Price iframe`
   - Best for human operators already working in a LendingPad loan file.
   - Nyra does not control the pricing flow.
   - Nyra should link or hand off, not scrape or automate the iframe.

### Owner Steps For LendingPad API Access

1. Confirm LendingPad edition:
   - API access is gated to Lender Edition clients according to LendingPad's API terms.
   - Confirm account edition, fees, and whether the company is API-eligible.

2. Execute required paperwork:
   - NDA.
   - API agreement.
   - Any vendor/security review.
   - Any paid support package required for development.

3. Request API provisioning:
   - Sandbox/test site.
   - API keys or OAuth credentials.
   - Documentation.
   - Import/export timing constraints.
   - Rate limits.
   - Loan-file create/update endpoints.
   - Pricing-provider action endpoints, if any.

4. Decide what Nyra should do with LendingPad:
   - Create/update loan files only.
   - Read loan status and key dates.
   - Push selected quote metadata.
   - Trigger integrated pricing, only if LendingPad explicitly supports it by API.
   - Read integrated pricing results, only if LendingPad explicitly supports it by API.

5. Configure LendingPad Lender Price integration for operators:
   - In LendingPad, activate Lender Price under pricing providers.
   - For Level 1, do not enter credentials.
   - For Level 2, have each LO create/retain their Lender Price username, then coordinate with LendingPad support.
   - For Level 3, obtain username, password, and client ID from Lender Price and enter them in LendingPad's pricing action contacts.

6. Backend implementation:
   - Add `LendingPadLosAdapter` for loan-file sync, not quote math.
   - Only add `LendingPadPricingAdapter` if LendingPad gives an API for pricing trigger/result retrieval.
   - Store LendingPad loan IDs and provider action IDs in quote audit metadata.
   - Preserve the distinction between LendingPad LOS records and Nyra canonical quote records.

### LendingPad Questions To Send

```text
We are building a backend integration from Project Nyra to LendingPad. We need to understand what the API supports for loan-file sync and pricing.

Please confirm:
- whether our account is Lender Edition and API-eligible
- NDA/API agreement steps
- sandbox/test-site provisioning
- API auth method and key provisioning
- loan create/update/read endpoints
- whether integrated pricing actions can be triggered by API
- whether Lender Price pricing results can be read/exported by API
- import/export timing and rate limits
- required support package or approved consultant requirements
- data retention and audit requirements
```

## Recommended Build Order

1. Keep `apps/nyra-webapp` unchanged except for endpoint/status display improvements.
2. Add provider adapter interfaces in `services/quote-api`.
3. Add a `mock_provider` adapter with fixture responses for tests.
4. Add `lenderprice` first because it has the clearest public developer-account path.
5. Add `lendingpad_los` second for loan-file/status sync.
6. Add `rocket` only after Rocket confirms direct API access, or keep it as a manual/LendingPad handoff.
7. Add admin settings to show provider health:
   - configured
   - credentials present
   - sandbox reachable
   - production enabled
   - last successful quote
   - last vendor error

## Backend Acceptance Criteria

- Quote API supports provider selection by configuration.
- Quote API returns `503 provider_not_configured` when credentials are missing.
- Quote API never falls back to fake rates for production quotes.
- Every provider request has a correlation ID.
- Every provider response stores raw audit evidence server-side.
- Every normalized quote returns exactly three scenarios or a clear error.
- Ineligible products preserve reason codes.
- Provider credentials never appear in frontend bundles, logs, screenshots, or committed files.
- Tests cover mocked success, no eligible products, auth failure, provider timeout, and malformed response.

## Webapp Acceptance Criteria

- Webapp calls only Nyra quote proxy routes or Quote API.
- Webapp displays provider/status metadata returned by Quote API.
- Webapp shows a clear unavailable state when provider credentials are missing.
- Webapp never calculates official quote terms.
- Assistant can explain returned quote data but cannot generate its own pricing.

## Manual Owner Checklist

- [ ] Rocket Pro TPO AE confirms whether direct pricing API access exists for your account.
- [ ] Rocket API/LOS/POS integration agreement received, or Rocket marked as LendingPad/manual-only.
- [ ] Lender Price developer account requested.
- [ ] Lender Price sandbox credentials received.
- [ ] LendingPad account edition and API eligibility confirmed.
- [ ] LendingPad NDA/API agreement completed if API access is needed.
- [ ] LendingPad Lender Price pricing provider configured for operator workflow.
- [ ] All vendor secrets entered into Infisical, not committed.
- [ ] Backend agent receives actual vendor API docs after NDA before implementation.

## Do Not Start Coding Until These Are Available

For each direct API provider:

- Signed API/NDA terms, if required.
- Sandbox credentials.
- API base URL.
- Auth documentation.
- Pricing request/response schema.
- Error and eligibility reason-code schema.
- Vendor permission to store raw responses for audit.
- Vendor guidance on quote expiration/cache duration.

Without those items, the correct backend behavior is a provider stub that returns `provider_not_configured` or `manual_handoff_required`.
