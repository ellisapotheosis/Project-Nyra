# ProjectNyra.com Landing Design Brief

## Purpose

The `projectnyra.com` landing page is the marketing front door for Project Nyra
as a platform. It should explain the product value to brokers, operators, and
partners without behaving like the logged-in command center.

## Audience

- Mortgage brokers evaluating automation and AI-assisted operations.
- Small teams that need lead intake, follow-up, quote, compliance, and CRM
  coordination.
- Technical/operations partners validating that Nyra is serious about audit,
  compliance, and bounded assistant behavior.

## Experience Goals

- Present Project Nyra as a real mortgage automation product, not a generic AI
  demo.
- Separate the public product story from the subscriber webapp and internal
  admin surfaces.
- Make compliance, CRM ownership, and quote determinism part of the value prop.
- Provide clear conversion paths: request access, book demo, view security
  posture, or sign in.

## Visual Direction

- Theme: dark indigo/seafoam product launch, quieter than RateHunter but still
  high-signal.
- Mood: controlled, premium, operational, trusted.
- Palette:
  - Background: near-black / dark graphite.
  - Primary: indigo/purple for brand and primary CTA.
  - Secondary: seafoam/turquoise for live-system and trust highlights.
  - Alert: neon pink only for compliance/risk emphasis.
  - Surfaces: restrained panels, not dashboard cards everywhere.
- Typography:
  - Display type for product name and major section headings.
  - Compact sans/mono for system labels, compliance claims, and architecture
    notes.

## Page Structure

1. Hero: Project Nyra name, literal offer/category, concise platform value,
   product screenshot or real command surface preview, primary CTA.
2. Problem: lead chaos, manual follow-up, quote spreadsheet drift, compliance
   risk, scattered tools.
3. Platform modules:
   - Lead ingestion and dedupe.
   - Campaign orchestration.
   - Compliance gates and audit logging.
   - Deterministic quote service.
   - Broker command center.
   - Bounded assistant tooling.
4. Architecture trust band: Twenty CRM as system of record, n8n/Activepieces as
   execution glue, assistant cannot directly mutate CRM/database.
5. Workflow story: lead arrives, normalized, checked, enrolled, quoted, logged,
   surfaced to broker.
6. Security/compliance: STOP, unsubscribe, reply pause, quiet hours, HITL
   approval, audit events.
7. CTA: request access, book demo, sign in.

## Component Rules

- Use a real product screenshot or high-fidelity app preview as the hero media.
- Keep hero copy outside cards.
- Avoid marketing filler and generic AI buzzwords.
- Use icon+label blocks for platform modules.
- Use simple sequence diagrams or timeline rows for workflow explanation.
- Do not expose internal hostnames, secrets, raw MCP endpoints, or worker URLs.

## Content Rules

- Headline should be the product/category, not a vague value prop.
- Supporting copy can explain automation, CRM, compliance, and assistant
  boundaries.
- Claims should be operationally true and testable.
- Use "request access" or "book demo" unless self-serve signup is actually
  enabled.
- Keep `ratehunter.net` positioned as a public broker landing page, not the
  Project Nyra product domain.

## Responsive Behavior

- First viewport must show product identity, CTA, and a hint of next section.
- Mobile should prioritize short copy, one screenshot/preview, and two CTAs.
- Architecture/trust details can collapse into stacked rows.

## Accessibility And Compliance

- Screenshot/preview media needs useful alt text.
- CTAs must be reachable by keyboard.
- Avoid text over busy imagery unless contrast is controlled.
- Compliance descriptions must not imply the platform replaces legal or broker
  review.

## Do Not Include

- Full subscriber workflow controls.
- Internal dashboard navigation.
- Raw service URLs or infrastructure hostnames.
- Claims that n8n or the assistant is the business brain.
- Claims that the assistant can invent quote terms.

## Success Criteria

- A broker understands what Project Nyra does within one scroll.
- Public page has no internal-only route leakage.
- Marketing page remains clearly separate from daily-use subscriber webapp.
- Landing build, lint, and source scan pass.
