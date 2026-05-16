# Design System, Assets, And Branding

## Intent

Project Nyra needs one coherent brand system across public and internal surfaces while allowing each surface to feel appropriate:

- Landing: personal, premium, borrower-facing, Carrd-inspired.
- Webapp: operational, dense, broker-facing, command-center.
- Tool consoles: technical, neon, status-heavy.

## Brand Names

RateHunter:

- Public borrower-facing brand.
- Logo appears on landing, webapp shell, quote/rate areas, and public contact material.

Nyra:

- AI assistant and internal automation/control-plane identity.
- Appears in assistant, command center, Nexus/OpenClaw tooling, and internal docs.

West Capital Lending:

- Broker/company/legal/licensing context.
- Appears on landing profile/card/footer and verification links.

## Asset Inventory

Use these asset roots:

- `apps/shared/assets/Ratehunter_Logo_Final/**`
- `apps/shared/assets/PFP_New/**`
- `apps/shared/assets/source_uploads/**`
- `apps/shared/assets/uploads/**`
- `apps/shared/assets/webapp-v1-source-material/**` from the source repo path.
- Current app public assets under `apps/ratehunter-landing/public`.
- Current webapp branding under `apps/nyra-webapp/public`.

RateHunter logo pack:

- Use transparent SVG/PNG variants for nav and cards.
- Use white-on-transparent or original-on-transparent for dark surfaces.
- Use high-resolution PNG for hero/card display if SVG sizing is unreliable.
- Use social/business variants only for external/social/export contexts.

Nyra imagery:

- Use PFP/New assets for assistant/profile/avatar contexts only after selecting one consistent persona.
- Avoid mixing multiple AI-generated avatars in the same surface.

Uploaded business assets:

- Calculator spreadsheets inform quote/rate logic but should not be embedded as downloadable public promises without review.
- Campaign docs inform campaign builder templates.
- Soft quote doc informs quote workflow language.
- Declarations/questions PDF informs document/application requirements.
- Intro video can become landing media after compression/accessibility review.
- Business card assets can inform contact/save-card blocks.

## Theme Strategy

Source:

- `apps/guidance/references/webapp-merge-snapshot/next-app/app/globals.css`
- `apps/guidance/references/webapp-merge-snapshot/next-app/components.json`
- `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/index.css`

Requirement:

- Use a CSS-variable-driven shadcn/TweakCN token contract.
- Keep components using semantic tokens: background, foreground, card, border, primary, accent, muted, destructive.
- Avoid one-off inline color values except for provider logos or status accents.

Landing theme:

- Dark glass.
- Purple-blue accent.
- Large monospaced headings.
- Subtle animated dotted/starfield background.
- Rounded cards and pill buttons.
- Personal brand image + QR/contact card.

Webapp theme:

- Dark operations shell.
- Compact nav.
- Data cards with strong hierarchy.
- Purple/blue accent for primary actions.
- Green/amber/red status accents for operational state.
- Clear text contrast.

Mortgage CRM module adaptation:

- The mortgage-crm light kanban is visually strong, but the final webapp is dark.
- Adapt kanban structure and spacing into dark cards rather than switching the whole app to light mode.
- Light mode can be a future theme, not the first consolidation target.

Nexus/tool adaptation:

- Use neon cyan/green/purple only on tool-console pages.
- Keep it contained so the whole product does not become a cyberpunk theme.

## Typography Direction

Landing:

- Keep monospaced display style for large headlines.
- Use readable sans/body text.
- Preserve uppercase tracking labels.

Webapp:

- Use compact, legible UI typography.
- Use uppercase tracking for section labels sparingly.
- Keep numbers large and readable.

Tool consoles:

- Monospace labels and console-like status text are appropriate.

## Motion Direction

Landing:

- Animated background texture.
- Smooth ticker movement.
- Gentle card reveals.
- Respect reduced motion.

Webapp:

- Minimal motion.
- Hover lift for cards.
- Loading skeletons.
- Status pulse only for live health.

Tool consoles:

- Subtle glow and status pulses.

## Screenshot-Driven Decisions

Keep:

- Landing-main dark glass, personal card, wizard, action stack.
- Webapp top nav and route layout.
- Mortgage-crm kanban structure.
- Nexus UI console style.
- Quote desk dark rate cards.

Replace:

- Admin-shell and admin build error states.
- Nyra-admin unstyled output.
- Twenty shell bare page.
- Landing-legacy build error.

Add:

- Landing Market Pulse ticker and deeper market section.
- Webapp service health strip.
- Webapp integration hub.
- Lead cockpit route.
- Nexus tool route.

## Accessibility Requirements

- All ticker content must pause on hover/focus or provide non-animated fallback.
- Color cannot be the only status indicator.
- Buttons and links need visible focus states.
- QR/contact information must also be available as text.
- Rate/market disclaimers must be visible, not hidden only in footer.
- Form fields need labels and validation messages.

## Asset Handling Rules

- Do not move existing `apps/guidance` reference assets.
- Do not duplicate giant asset folders into app public directories without choosing final assets.
- When implementation begins, copy only selected optimized assets into the destination app.
- Keep original source assets in shared/reference locations.
- Avoid committing Zone.Identifier sidecar files if new copies are made.
