# RateHunter.net Design Brief

## Purpose

`ratehunter.net` is the public borrower-facing marketing and lead-capture page
for Ellis Andersen. It should feel fast, trustworthy, personal, and conversion
oriented without exposing Project Nyra internal tools, CRM views, or subscriber
operations.

## Audience

- Borrowers comparing purchase, refinance, HELOC, and specialty mortgage
  options.
- Referral partners who need a quick way to book, share contact details, or send
  a borrower to intake.
- Existing borrowers returning for secure upload, application, or chat support.

## Experience Goals

- First viewport makes the human broker, RateHunter brand, and primary actions
  unmistakable.
- Lead capture is visible without making the page feel like a generic form.
- Borrowers can choose the right path: schedule, quote intake, application
  portal, HELOC, secure upload, phone, SMS, or email.
- Compliance copy stays clear: rate/market content is educational and
  non-binding.
- No internal Project Nyra, CRM, MCP, admin, or worker links appear publicly.

## Visual Direction

- Theme: Apotheosis dark mortgage concierge.
- Mood: premium, direct, slightly cinematic, but still legible and broker
  professional.
- Palette:
  - Background: near-black `oklch(0.1448 0 0)`.
  - Primary: indigo/purple `oklch(0.5038 0.2937 285.3753)`.
  - Secondary: seafoam/turquoise `oklch(0.8653 0.1475 204.0171)`.
  - Alert/accent: neon pink `oklch(0.5597 0.2956 301.9121)`.
  - Surfaces: glass panels over black with subtle violet borders.
- Typography:
  - Display: Michroma or mono-futurist for hero name and brand marks.
  - Body: Electrolize/system sans with high contrast and generous leading.
  - Eyebrows: Space Mono, uppercase, wide tracking.

## Page Structure

1. Sticky compact nav: RateHunter brand, Quote, Services, Contact, Consult CTA.
2. Hero: Ellis portrait, contact card, roles, broker/company context, schedule
   and quote CTAs.
3. Action grid: schedule, application portal, HELOC quote, encrypted upload,
   company profile, contact card.
4. Quote intake: borrower-first lead capture wizard with consent language.
5. Service lines: purchase strategy, refinance/equity, residential/commercial,
   fast execution.
6. Trust and proof: lender access, reputation, integrated guidance, licensing.
7. Market pulse: educational indicators and disclaimers.
8. Contact footer: phone, SMS, email, address, license verification, social
   links.
9. Borrower chat widget: supportive, bounded, non-rate-hallucinating guidance.

## Component Rules

- Use real broker/person assets where available; avoid generic stock visuals.
- Keep primary CTAs as buttons with icons.
- Keep lead form controls large enough for mobile use.
- Avoid nested cards; use one level of glass panels for major modules.
- Keep dense copy inside readable panel widths.
- Keep market data labeled as watch/educational, not a rate quote.
- Do not add subscriber dashboard links or internal diagnostics.

## Responsive Behavior

- Mobile first viewport should show brand, broker identity, and one clear CTA
  before secondary links.
- Hero stacks into portrait/contact content followed by CTAs and intake.
- Sticky nav stays compact and avoids horizontal overflow.
- Chat widget must not obscure quote intake controls or legal copy.

## Accessibility And Compliance

- All images need useful alt text.
- Button labels must describe destination or action.
- Color contrast must stay readable against glass surfaces.
- Motion must honor reduced-motion preferences.
- Lead capture must preserve consent language and avoid collecting unnecessary
  sensitive information.
- Quote and rate copy must avoid guaranteed terms unless returned by the quote
  service.

## Do Not Include

- CRM, MCP, OpenClaw, Nexus, Twenty, n8n, Activepieces, Grafana, Portainer, or
  worker links.
- Internal admin screenshots or route names.
- Subscriber-only command center functions.
- Public claims that the assistant can approve loans, guarantee rates, or send
  messages without broker review.

## Success Criteria

- Borrower can understand who Ellis is and start the correct action in under 10
  seconds.
- Public source scan finds no internal Project Nyra admin/tool links.
- Mobile form and chat remain usable without overlap.
- Landing build and lint pass.
