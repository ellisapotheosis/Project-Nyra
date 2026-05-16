# Component Harvest Matrix

## Purpose

This matrix tells future agents exactly where to move concepts from old apps and prototypes. It is intentionally decisive.

## Destination Matrix

| Source | Harvest | Destination | Rebuild strategy |
| --- | --- | --- | --- |
| `apps/nyra-webapp` | Shell, nav, route structure, dark token layer | Keep in place | Deepen existing pages |
| `apps/ratehunter-landing` | Landing page, wizard, chat, market helpers | Keep in place | Add ticker/market pulse and polish |
| `apps/admin/app` | Metrics, quote desk, leads scoring, alerts, quick actions | `apps/nyra-webapp` | Rebuild concepts, avoid broken structure |
| `apps/mortgage-crm` | Pipeline kanban, domain entities, Twenty service references | `apps/nyra-webapp` | Rebuild pages and adapters |
| `apps/nexusUI` | Nexus console design and settings/status endpoints | `apps/nyra-webapp/app/tools/nexus` | Rebuild or embed component after path normalization |
| `apps/twenty` | None visually | Access-gated link | Leave untouched |
| `apps/twenty-crm` | Config, scripts, MCP, sync, env refs | `/crm/settings`, `/admin/integrations`, service docs | Reference only |
| Legacy HTML prototype | Campaign ops, communication drawer, lender quick-connect, pricing comparison | `/campaigns`, `/campaigns/builder`, `/quotes`, `/leads/[leadId]` | Rebuild in React components |
| `nyra-admin` screenshot/source | Metrics, alerts, quick actions | `/admin` | Rebuild concepts only |
| Carrd scrape | Public identity and ordering | Landing | Preserve personality |

## Webapp Overview Harvest

From legacy HTML:

- Total leads.
- Active campaigns.
- Today’s calls.
- Emails sent.
- Recent leads.
- Campaign timeline.
- Pricing engine comparison teaser.

From admin:

- Today’s leads.
- Active quotes.
- Pipeline value.
- Conversion rate.
- Compliance score.
- System alerts.

Build in `/`:

- Command dashboard with lead queue, campaign timeline, quote preview, CRM sync, service health, quick actions.

## Assistant Harvest

From current webapp:

- Active leads rail.
- Unified timeline area.
- Chat panel.
- OpenClaw proxy integration.

From legacy HTML:

- Communication drawer.
- Channel icons and STOP instruction checkbox concept.

Build in `/assistant` and lead cockpit:

- Lead-aware assistant.
- Draft-only communication panel until send services are wired.
- Safe action cards.

## Campaign Harvest

From legacy HTML:

- Campaign cards for Refinance Blitz, Home Equity Pro, Purchase Power.
- Completion/response progress bars.
- Campaign timeline with Twilio/Gmail/Outlook badges.
- Campaign builder cards.
- Campaign types sidebar.

From current webapp:

- Enrollment table.
- Tabs.
- Builder route.

Build in `/campaigns`:

- KPI row, campaign cards, enrollment table, timeline, assignment queue, analytics preview.

Build in `/campaigns/builder`:

- Step cards with timing, channel, template, provider, compliance, retry, and preview.

## Lead Harvest

From admin:

- Lead score and grade.
- Source/status/location/assigned fields.
- Summary cards.

From mortgage-crm:

- Kanban style.
- Lead/application domain concepts.
- Contact actions.

From current webapp:

- Lead card route and dark theme.

Build in `/leads`:

- Filterable lead inbox.
- Lead cards/table.
- Bulk campaign assignment.

Build in `/leads/[leadId]`:

- Lead cockpit with timeline, quotes, campaigns, docs, CRM sync, compliance.

## Quote Harvest

From admin:

- Current rates.
- Recent quotes.
- Websocket live/offline state.
- Quote generation form.
- Search/filter.

From current webapp:

- Dark quote desk baseline.

From legacy HTML:

- Pricing engine comparison and export image concept.

From landing:

- Market data helper concepts.

Build in `/quotes`:

- Operational quote desk with rate cards, recent quotes, provider comparison, lock expiration queue, generate quote CTA.

## Pipeline Harvest

From mortgage-crm:

- KPI row.
- Kanban board.
- Lanes and filter chips.
- Rounded light CRM card language.

From current webapp:

- Dark shell and metrics treatment.

Build in `/pipeline`:

- Dark-shell route with kanban module adapted from mortgage-crm.

## CRM Harvest

From current webapp:

- CRM mirror route.

From twenty-crm:

- Setup/config/scripts/webhook/integration concepts.

From crm-api spec:

- Boundary and object model.

Build in `/crm` and `/crm/settings`:

- Sync health, object map, recent writes/failures, field mapping, webhook status, Twenty link.

## Tool Harvest

From Nexus UI:

- Entire visual language for `/tools/nexus`.
- Status/settings APIs as reference.

From OpenClaw route:

- Thin proxy test.

From shared docs:

- Dify/n8n/Activepieces roles.

Build in `/admin/integrations`:

- Tool cards and health states.

Build in `/tools/*`:

- Status wrappers and access-gated deep links.

## Landing Harvest

From landing-main:

- Keep primary structure.

From `market-data.ts`:

- Rate cards and news feed.

From shared assets:

- RateHunter logo pack.
- Profile/persona images if appropriate.

Build in landing:

- Top ticker and lower Market Pulse.
- Better finishing touches and compliance labels.

## Explicit Non-Harvest

- Do not copy `apps/twenty` visual shell.
- Do not copy nyra-admin broken CSS.
- Do not import legacy HTML CDN Tailwind.
- Do not preserve Clerk from mortgage-crm as final auth direction.
- Do not preserve broken websocket assumptions as required.
- Do not create a second internal admin product.
