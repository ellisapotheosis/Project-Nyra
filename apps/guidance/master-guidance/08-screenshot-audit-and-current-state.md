# Screenshot Audit And Current State

## Purpose

This audit translates the current screenshot evidence into executive decisions. It tells agents what to harvest, what to ignore, and what needs repair.

Screenshot root:

- `/home/ellisapotheosis/repos/project-nyra/screenshots`

## Summary Decisions

- `webapp` is the destination for the internal product.
- `landing-main` is the public visual baseline.
- `mortgage-crm` is the strongest source for pipeline/kanban UX.
- `nexus-ui` is the strongest source for tool-console UX.
- `admin`, `admin-shell`, `nyra-admin`, `landing-legacy`, and `twenty-shell` are not final visual baselines.
- The legacy HTML prototype is not a screenshot folder, but it is an important source for campaign operations and should be harvested conceptually.

## `screenshots/landing-main/index.png`

Current state:

- Strong dark personal-brand landing page.
- Good Carrd-like identity.
- Contains Ellis profile, QR/contact card, quote wizard, service sections, action stack, footer licensing, and borrower chat.
- Uses large monospaced typography and dark glass cards.

Harvest:

- Whole visual direction.
- Hero split.
- Ellis profile card.
- Quote wizard placement.
- Trust/service cards.
- Action stack.
- Compliance footer.
- Borrower chat placement.

Improve:

- Add slim Market Pulse ticker near top.
- Add lower Market Pulse/news section.
- Ensure rate/market content is educational and non-binding.
- Tighten mobile behavior and accessibility.

Final target:

- `apps/ratehunter-landing`.

## `screenshots/landing-legacy/index.png`

Current state:

- Build error: Tailwind used directly as PostCSS plugin; requires `@tailwindcss/postcss` or config repair.

Harvest:

- Only inspect source if landing-main lacks unique content.

Ignore:

- Screenshot visual state.
- Broken build output.

Final target:

- Not a product destination.

## `screenshots/webapp/index.png`

Current state:

- Correct internal shell and navigation.
- Good separation from public landing.
- Shows overview, assistant, campaigns, leads, quotes, pipeline, CRM, applications, admin, OpenClaw, Nexus.
- Content is still shallow and self-referential.

Harvest:

- Top nav structure.
- Internal domain badge.
- Dark TweakCN token layer.
- Route shell.

Improve:

- Replace “Nyra is now one internal webapp” implementation note with real broker daily command dashboard.
- Add queue, timeline, service health, CRM sync, quote desk preview, and quick actions.

Final target:

- Keep and deepen.

## `screenshots/webapp/_assistant.png`

Current state:

- Good split between active leads, timeline, and assistant.
- Shows CRM connected and model route status.
- Timeline is empty until lead selection.

Harvest:

- Layout.
- Lead-aware assistant pattern.
- Model/status row.

Improve:

- Add compliance-aware action cards.
- Add timeline event types.
- Add degraded states for CRM, Nexus, OpenClaw.
- Prevent direct mutation.

## `screenshots/webapp/_campaigns.png`

Current state:

- Functional but shallow active enrollment table.
- Tabs for active leads, builder, analytics.

Harvest:

- Route presence.
- Basic enrollment table.

Improve:

- Add legacy dashboard campaign cards, KPI row, campaign timeline, recent leads assignment, compliance queue.

## `screenshots/webapp/_campaigns_builder_1.png`

Current state:

- Better than placeholder: step cards with timing, channel, template, add touchpoint, save.

Harvest:

- Step-card structure.
- Timing/channel/template fields.
- Add touchpoint block.

Improve:

- Add compliance validation, preview, audience, provider, retry, and publish controls.

## `screenshots/webapp/_leads.png`

Current state:

- Clean dark lead list with summary cards and lead cards.
- Good basic lead metadata.

Harvest:

- Summary metrics.
- Lead cards.
- Credit band/campaign/source/next touch fields.

Improve:

- Add scoring/grade from admin.
- Add filters, compliance flags, bulk assignment.
- Add link to lead cockpit.

## `screenshots/webapp/_quotes.png`

Current state:

- Strong quote desk baseline.
- Shows websocket fallback warning, KPI row, current rate sheet, recent quotes.

Harvest:

- Quote desk layout.
- Fallback wording.
- Rate cards and recent quote cards.

Improve:

- Add pricing engine comparison, export image, provider connectivity, quote generation entry, approval state.

## `screenshots/webapp/_pipeline.png`

Current state:

- Metrics and recent activity only.

Harvest:

- Dark metrics card treatment.

Improve:

- Add mortgage-crm kanban.
- Add lanes, filters, stage counts, lead cards.

## `screenshots/webapp/_crm.png`

Current state:

- Shallow CRM mirror.

Improve:

- Add sync health, object map, recent writes, failures, field mapping, webhook state, Twenty link.

## `screenshots/webapp/_applications.png`

Current state:

- Basic application list.

Improve:

- Add document/disclosure/e-sign status and milestone details.

## `screenshots/webapp/_admin.png`

Current state:

- Admin route exists inside webapp.

Improve:

- Convert to operator dashboard and integration hub.

## `screenshots/webapp/_tools_openclaw.png`

Current state:

- Thin OpenClaw proxy/chat test panel.

Improve:

- Add gateway health, model route, allowed tools, Studio link, recent failures.

## `screenshots/mortgage-crm/index.png`

Current state:

- Strong light CRM/pipeline design.
- Sidebar, search, KPI cards, kanban container, lead lanes.

Harvest:

- Pipeline KPI concepts.
- Rounded white card language where useful.
- Kanban lanes and lead-card structure.
- Search and filter concepts.

Final target:

- `/pipeline`, `/crm`, `/leads`, `/applications` inside webapp.

## `screenshots/mortgage-crm/_leads_1.png`

Current state:

- Lead/detail concepts likely useful.

Harvest:

- Lead detail and CRM-backed application concepts.

## `screenshots/nexus-ui/index.png`

Current state:

- Strong neon control-plane UI.
- Shows Nexus Router Console, groups, tools, LLM providers, toggles, side nav, save/refresh.

Harvest:

- Use as `/tools/nexus` visual baseline.
- Status cards.
- Toggle cards.
- Tool group side nav.

Final target:

- Native webapp tool page or embedded module.

## `screenshots/admin-shell/index.png`

Current state:

- Build error: missing `@/components/layout/ClientWrapper`.

Harvest:

- None from screenshot.
- Source may still contain useful layout ideas.

## `screenshots/admin/_quotes.png`

Current state:

- Build error: `page.tsx` missing root layout.

Harvest:

- Source quote desk, not screenshot.

## `screenshots/admin/_leads.png`

Current state:

- Admin source has useful lead scoring and management concepts.

Harvest:

- Total/new/qualified/average score cards.
- Lead grade.
- Source/status/assigned fields.

## `screenshots/nyra-admin/index.png`

Current state:

- CSS/layout broken: content appears unstyled, text-heavy, overlapping dark background.

Harvest:

- Dashboard metric categories.
- Recent activity.
- System alerts.
- Quick actions.

Ignore:

- Visual layout and CSS.

## `screenshots/twenty-shell/index.png`

Current state:

- Bare shell with instruction text.

Harvest:

- Confirmation that Twenty shell should not be visually merged.

Final target:

- Link to real Twenty CRM.

## Legacy HTML Prototype

Path:

- `/home/ellisapotheosis/repos/project-nyra/apps/shared/assets/webapp-v1-source-material/index.html`

Harvest:

- Campaign Dashboard layout.
- Campaign types sidebar: refinance, cash-out, home equity, purchase.
- Quick Connect: Rocket Mortgage, LenderPrice, Advantage Credit.
- Integrations: Twilio, LeadMailbox CRM, Gmail, Outlook.
- Recent leads assignment.
- Campaign timeline.
- Pricing engine comparison.
- Campaign builder cards.
- Fixed communication panel.
- Theme switcher concept.

Rebuild:

- In webapp routes using shadcn/TweakCN components.

Do not:

- Copy raw CDN Tailwind/FontAwesome HTML into Next.js.
