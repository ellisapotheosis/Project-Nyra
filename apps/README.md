# Nyra Apps Directory

This folder contains active app entrypoints only. Historical prompts, reference
snapshots, and old screenshots were moved out of the repo to storage.

## Canonical App Roles

| Path               | Status                   | Role                                                                                           |
| :----------------- | :----------------------- | :--------------------------------------------------------------------------------------------- |
| `apps/projectnyra` | Canonical product app    | Project Nyra broker/admin/assistant surface for `projectnyra.com` and `app.projectnyra.com`.   |
| `apps/ratehunter`  | Canonical public landing | Personal mortgage brokerage landing page for `ratehunter.net` only.                            |
| `apps/twentycrm`   | CRM runtime app boundary | Workspace wrapper for the Twenty CRM system of record; runtime compose remains under `infra/`. |

## Retired App Material

`apps/guidance` was retired from this repo on 2026-05-29 and copied to:

`/home/ellisapotheosis/repos/storage/project-nyra-apps-cleanup-20260529-202626/apps-guidance`

The newest/current screenshot set was also copied separately to:

`/home/ellisapotheosis/repos/storage/project-nyra-apps-cleanup-20260529-202626/current-screenshots-from-newest-guidance-folder`

Older standalone app prototypes such as `admin`, `mortgage-crm`, `nexusUI`,
`twenty`, and `twenty-crm` are archive material unless reintroduced through a
new migration plan. Useful product routes now belong in `apps/projectnyra`.

## 📚 Specification Index

To ensure consistency and compliance, every component in this directory (and related services) follows a strict `SPEC.md`. **Review these before making changes.**

| Component          | Spec Location                                                          | Focus                                            |
| :----------------- | :--------------------------------------------------------------------- | :----------------------------------------------- |
| **Project Nyra**   | [`/apps/projectnyra/docs/SPEC.md`](./projectnyra/docs/SPEC.md)         | Product app, broker workspace, assistant, admin. |
| **RateHunter**     | [`/apps/ratehunter/README.md`](./ratehunter/README.md)                 | Personal mortgage landing and lead capture.      |
| **Twenty CRM**     | [`/apps/twentycrm/README.md`](./twentycrm/README.md)                   | CRM runtime boundary and local scripts.          |
| **CRM API**        | [`/services/crm-api/SPEC.md`](../services/crm-api/SPEC.md)             | Data Layer, Lead Normalization, CRM Sync.        |
| **n8n Workflows**  | [`/services/n8n-workflows/SPEC.md`](../services/n8n-workflows/SPEC.md) | Drip Engine, Twilio/SendGrid, TCPA Kill-Switch.  |
| **Nyra Assistant** | [`/services/openclaw/SPEC.md`](../services/openclaw/SPEC.md)           | Persona, Hermes Inference, Mem0 Persistence.     |
| **Quote Engine**   | [`/services/quote-api/SPEC.md`](../services/quote-api/SPEC.md)         | Pricing, Micros, PDF Generation.                 |

## 🛠️ Global Guidance (TL;DR)

- **Tech Stack**: Next.js, Tailwind v4, pnpm, shadcn/ui.
- **Design**: TweakCN oklch themes. No hex colors.
- **Compliance**: TCPA/CAN-SPAM is non-negotiable. Always log activities to Twenty CRM.
- **Inference**: Use the **Nexus Router** (port 6000) for all LLM/MCP tasks.
- **CRM data**: Twenty CRM data lives in the `twenty-db` Postgres volume managed
  by `infra/hosts/oracle-vps/docker-compose.yml`. Project Nyra app routes mirror
  and link CRM workflows; they do not own CRM state.

## 🚀 Execution Playbook

Refer to [`/SYSTEM_BLUEPRINT.md`](../SYSTEM_BLUEPRINT.md) for the master architectural map.
