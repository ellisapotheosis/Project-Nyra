# Landing Market Ticker And Finishing Touches

## Executive Decision

The landing page should get both:

- A slim scrolling Market Pulse ticker near the top of the page.
- A richer lower Market Pulse section with rate cards, market news, and borrower-friendly explanation.

This is not optional. It is one of the strongest ways to reuse the rate/market intelligence already present in the repo while making the public landing feel alive and useful.

## Source Material

- `apps/ratehunter-landing/src/lib/market-data.ts`
- `apps/ratehunter-landing/src/lib/validation.ts`
- `apps/ratehunter-landing/src/app/page.tsx`
- `screenshots/landing-main/index.png`
- Legacy HTML pricing engine comparison.
- Admin quote desk current rate sheet.

## Top Ticker Placement

Place the ticker after the hero/wizard block or directly below the top nav if the hero becomes too tall on desktop.

Preferred desktop order:

1. Nav.
2. Hero split.
3. Slim Market Pulse ticker.
4. Trust cards.

Preferred mobile order:

1. Nav.
2. Hero/intake.
3. Ticker as horizontal scroll cards, not forced marquee if it hurts usability.

## Ticker Items

Default items:

- 10Y Treasury.
- 30Y Conventional.
- 15Y Conventional.
- 30Y FHA.
- 30Y VA.
- HELOC Variable.
- HELOAN Fixed.

Each item should show:

- Product label.
- Indicative rate or yield.
- APR if available.
- Trend up/down/flat.
- Source label.
- Last updated or “hourly model.”

Default source labels:

- “Treasury feed.”
- “10Y + spread model.”
- “Indicative market model.”
- “Quote service when connected.”

## Ticker Copy

Short label:

> Market Pulse

Short disclaimer:

> Educational snapshot only. Not a loan estimate or commitment.

Long disclaimer near lower section:

> These market figures are educational snapshots derived from public Treasury data, configured model spreads, or connected rate services when available. Final rate, APR, payment, points, eligibility, lock terms, and approval depend on lender review, borrower qualifications, property, loan type, occupancy, credit, fees, and market conditions.

## Ticker Visual Direction

- Dark glass pill strip.
- Purple/blue accent line.
- Small trend icons.
- Monospace numeric rates.
- Smooth marquee on desktop.
- Manual horizontal scroll on mobile.
- Pause on hover/focus.
- Respect reduced motion.

Avoid:

- Bright stock-market casino feel.
- Overly dense small text.
- “lowest rate” marketing claims.

## Lower Market Pulse Section

Purpose:

- Explain the ticker.
- Show larger rate cards.
- Add market/news feed.
- Route borrower back to quote intake.

UI blocks:

- Section title: “Market Pulse, translated into mortgage context.”
- Rate cards for the same ticker items.
- News list from `getNewsFeed()`.
- “What this means” text:
  - Rates move daily.
  - APR and payment depend on scenario.
  - Wholesale lender shopping can reveal options.
  - Start quote intake for borrower-specific review.
- CTA: “Start Quote Intake.”

## Data Policy

Initial implementation:

- Use existing `fetchTreasury10Y`, `buildRateCards`, and `getNewsFeed`.
- If fetch fails, use fallback values and label them as fallback/model.
- Do not persist user-specific quote values in this public section.

Future service-backed implementation:

- Replace model spreads with quote/rate service feed.
- Keep the same disclaimer.
- Add source and last-updated display.

## Compliance Copy Placement

Ticker:

- Tiny disclaimer visible inline.

Lower Market Pulse:

- Full disclaimer in normal readable text.

Quote wizard success state:

- Repeat that final rates/approval depend on lender review.

Footer:

- Existing licensing and Equal Housing language.

## Finishing Touches For Landing

Hero:

- Make wizard feel like the main conversion flow.
- Keep Ellis profile card and QR/contact visible.
- Add microcopy under CTA: “No hard credit pull from this intake alone” only if verified. Otherwise do not add this claim.

Cards:

- Use consistent radius and glass borders.
- Add subtle icon accents.
- Keep language personal and advisory.

Chat:

- Keep “Ask Nyra” accessible.
- Ensure chat does not cover CTA on mobile.
- Use education-only disclaimer.

Performance:

- Optimize large images.
- Avoid loading huge logo/social asset variants.
- Lazy-load chat if needed.

Mobile:

- Collapse nav.
- Stack hero.
- Make ticker manually scrollable.
- Keep contact buttons sticky or easy to reach.

## Acceptance Criteria

- Ticker exists near top.
- Lower Market Pulse exists.
- Both have visible educational disclaimer.
- No internal links appear on public landing.
- Quote wizard and borrower chat remain available.
- Landing still feels like landing-main, not a generic finance dashboard.
