# Landing And Lead Capture Spec

## Intent

`apps/ratehunter-landing` is the public RateHunter site. It should feel like Ellis Andersen's actual mortgage and real estate advisory front door, not a generic SaaS landing page.

The `landing-main` screenshot is the visual baseline. The public site should keep the dark personal-brand layout, Ellis profile card, quote wizard, borrower chat, service cards, action stack, contact blocks, and compliance footer.

## Canonical Destination

- App: `apps/ratehunter-landing`.
- Domain: `ratehunter.net`.
- Deployment target: Cloudflare Pages.
- Audience: borrowers, referral partners, and prospects.

## Source Material

- Visual baseline: `/home/ellisapotheosis/repos/project-nyra/screenshots/landing-main/index.png`.
- Current source: `apps/ratehunter-landing/src/app/page.tsx`.
- Lead wizard: `apps/ratehunter-landing/src/components/LeadCaptureWizard.tsx`.
- Borrower chat: `apps/ratehunter-landing/src/components/BorrowerChatWidget.tsx`.
- Market data helper: `apps/ratehunter-landing/src/lib/market-data.ts`.
- Validation helper: `apps/ratehunter-landing/src/lib/validation.ts`.
- RateHunter logos: `apps/shared/assets/Ratehunter_Logo_Final/**` and current public assets.
- Legacy landing screenshot: broken build; ignore visually unless source contains unique content.
- Carrd scrape references in `apps/guidance/references/**`.

## Public Page Structure

1. Navigation:
   - RateHunter logo.
   - Links: Get Quote, Services, Contact.
   - Phone CTA.
   - Keep compact pill shape and dark glass treatment.

2. Hero:
   - Left Ellis identity/profile card with titles, NMLS/licensing, QR/contact card, schedule, call, text, and direct contact.
   - Right borrower intake headline and quote wizard.
   - Preserve the “Start your quote without the usual friction” direction.

3. Slim Market Pulse ticker:
   - Place below hero/nav or between hero and trust cards.
   - Continuous horizontal ticker or responsive card strip.
   - Items: 10Y Treasury, 30Y Conventional, 15Y Conventional, FHA, VA, HELOC, HELOAN.
   - Show product, indicative rate/APR where available, trend, and source label.
   - Label clearly: “Educational market snapshot - not a loan estimate or commitment.”

4. Trust cards:
   - Hundreds of approved lenders/investors.
   - A+ BBB/five-star reputation.
   - Borrower chat, quote intake, document guidance.
   - Licensed mortgage and real estate guidance.

5. Advisory approach:
   - Keep the strong large typography.
   - Explain wholesale lender shopping, speed, tailored loan structure, and one advisor.

6. Service grid:
   - Purchase Mortgage Strategy.
   - Refinance & Equity.
   - Residential & Commercial.
   - Fast Borrower-Friendly Execution.
   - Add HELOC/reverse/specialty references where already present.

7. Action stack:
   - Schedule Time With Me.
   - Mortgage Quote/Application Portal.
   - Fixed Rate HELOC Quote.
   - Encrypted Document Uploads.
   - West Capital Lending.
   - Save Contact Info.

8. Lower Market Pulse section:
   - Larger rate cards sourced from `market-data.ts`.
   - News/market feed from existing `getNewsFeed()` helper.
   - Plain-English “what this means for borrowers” copy.
   - CTA back to quote wizard.

9. Contact/social section:
   - Phone, email, office, verification links, socials.
   - Preserve licensing and company profile links.

10. Compliance footer:
   - Mortgage services subject to lender review, borrower qualification, and market conditions.
   - Equal Housing Opportunity.
   - NMLS and company licensing.
   - Chat and intake are educational/routing tools, not binding credit decisions.

11. Borrower chat widget:
   - Educational guidance only.
   - Suggested prompts about rates, docs, closing, quote versus APR.
   - Must not fabricate quote terms.

## Lead Wizard Requirements

The wizard should capture:

- Loan purpose.
- Property state/type.
- Purchase/refinance/cash-out/HELOC intent.
- Estimated price/value/loan amount.
- Credit band where appropriate.
- Contact name/email/phone.
- Preferred contact method.
- Consent for SMS/email/voice.
- Disclosure version and timestamp.

Submission behavior:

- Submit through lead intake boundary, not directly to Twenty from the browser.
- Use validation from `validation.ts`.
- Show success state that says Nyra is analyzing scenario/current rate sheets without promising approval or rates.
- On failure, preserve entered values and show clear retry/contact fallback.

## Borrower Chat Requirements

The borrower chat can:

- Explain loan types.
- Explain documents.
- Explain rate versus APR.
- Explain timeline and next steps.
- Route the borrower to quote intake or contact.

The borrower chat cannot:

- Promise approval.
- Quote exact final rates.
- Give legal/tax advice.
- Write CRM directly.
- Enroll a borrower into campaigns without consent.

## Market Ticker Rules

The ticker is approved and should be built. It should be visually cool but legally conservative.

Allowed:

- “Market snapshot.”
- “Indicative model.”
- “Treasury plus spread.”
- “Updated hourly/daily.”
- “Educational only.”

Avoid:

- “Your rate.”
- “Guaranteed.”
- “Approved.”
- “Locked.”
- “Lowest rate.”
- “Instant approval.”

Default copy:

> Market Pulse: indicative mortgage market snapshot for education only. Final rate, APR, payment, points, eligibility, and approval depend on lender review, borrower qualifications, property, loan terms, and market conditions.

## Finishing Touches

- Use RateHunter logo variants intentionally: dark nav logo, footer logo, social-safe logo.
- Add subtle animated background/starfield/grid consistent with landing-main.
- Keep large monospaced headings where landing-main uses them.
- Keep card radius, dark glass, and purple-blue accent system.
- Add focus states, reduced-motion handling, and mobile-safe layout for the ticker and wizard.
- Do not let the page become a generic startup template.

## Out Of Scope

- Internal broker dashboard routes.
- CRM pages.
- n8n/Activepieces/OpenClaw/Nexus admin pages.
- Public exposure of internal tools.
