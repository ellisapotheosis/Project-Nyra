# Apps Documentation

Application docs are split by user-facing surface.

| Folder                         | Scope                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`projectnyra/`](projectnyra/) | Broker/customer webapp plus internal admin/operator pages. Use this for UI, Nexus/OpenClaw assistant surface, quote UI, and app-facing API docs. |
| [`ratehunter/`](ratehunter/)   | Marketing landing page and lead-capture surface.                                                                                                 |

Cross-app business components live outside this folder:

- Twenty CRM: [`../components/twenty-crm/`](../components/twenty-crm/)
- Campaign automation and n8n/Activepieces: [`../components/automation/`](../components/automation/)
- Communication providers: [`../components/communications/`](../components/communications/)
- Workflow JSON exports: [`../workflows/n8n/`](../workflows/n8n/)

## App invariants

- `apps/projectnyra` owns the broker/customer assistant experience through OpenClaw-facing pages and service boundaries.
- Admin/operator UI should be implemented as protected Project Nyra pages/components unless a separate app is explicitly justified.
- `apps/ratehunter` stays focused on marketing and lead capture.
