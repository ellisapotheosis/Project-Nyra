# Nyra Apps Directory

Welcome, Agent. This folder contains the user-facing interfaces and administrative surfaces for Project Nyra.

## Canonical App Roles

| Path                      | Status                                  | Role                                                                                                                           |
| :------------------------ | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `apps/projectnyra`        | Canonical product app                   | Project Nyra broker/admin/assistant surface for `projectnyra.com` and `app.projectnyra.com`. Keep product-admin routes here. |
| `apps/ratehunter/landing` | Canonical public landing                | Personal mortgage brokerage landing page for `ratehunter.net` only.                                                            |
| `apps/mortgage-crm`       | Migration source                        | Older standalone CRM prototype; migrate useful lead, Kanban, domain, and compliance ideas into `apps/projectnyra` or services. |
| `apps/admin`              | Migration source                        | Older standalone admin prototype; migrate or archive into `apps/projectnyra/app/(admin)` if the page is product-admin only.    |
| `apps/nexusUI`            | Separate active control-plane app       | Access-gated Nexus Router UI linked from Project Nyra, not embedded into the broker app.                                       |
| `apps/openmemoryUI`       | Future control-plane app                | Create only if OpenMemory becomes a standalone UI with its own deploy lifecycle; otherwise keep it inside `apps/projectnyra`.   |
| `apps/twenty`             | Temporary bootstrap shell               | Transitional Twenty shell/source copy. Keep isolated until detached.                                                           |
| `apps/twenty-crm`         | Temporary integration/bootstrap package | TwentyCRM integration scripts and MCP support; runtime compose belongs under `infra/hosts`.                                    |

## 📚 Specification Index

To ensure consistency and compliance, every component in this directory (and related services) follows a strict `SPEC.md`. **Review these before making changes.**

| Component          | Spec Location                                                          | Focus                                            |
| :----------------- | :--------------------------------------------------------------------- | :----------------------------------------------- |
| **Project Nyra**   | [`/apps/projectnyra/docs/SPEC.md`](./projectnyra/docs/SPEC.md)         | Product app, broker workspace, assistant, product-admin. |
| **RateHunter**     | [`/apps/ratehunter/landing/README.md`](./ratehunter/landing/README.md) | Personal mortgage landing and lead capture.      |
| **CRM API**        | [`/services/crm-api/SPEC.md`](../services/crm-api/SPEC.md)             | Data Layer, Lead Normalization, CRM Sync.        |
| **n8n Workflows**  | [`/services/n8n-workflows/SPEC.md`](../services/n8n-workflows/SPEC.md) | Drip Engine, Twilio/SendGrid, TCPA Kill-Switch.  |
| **Nyra Assistant** | [`/services/openclaw/SPEC.md`](../services/openclaw/SPEC.md)           | Persona, Hermes Inference, Mem0 Persistence.     |
| **Quote Engine**   | [`/services/quote-api/SPEC.md`](../services/quote-api/SPEC.md)         | Pricing, Micros, PDF Generation.                 |

## 🛠️ Global Guidance (TL;DR)

- **Tech Stack**: Next.js, Tailwind v4, pnpm, shadcn/ui.
- **Design**: TweakCN oklch themes. No hex colors.
- **Compliance**: TCPA/CAN-SPAM is non-negotiable. Always log activities to Twenty CRM.
- **Inference**: Use the **Nexus Router** (port 6000) for all LLM/MCP tasks.

## 🚀 Execution Playbook

Refer to [`/SYSTEM_BLUEPRINT.md`](../SYSTEM_BLUEPRINT.md) for the master architectural map.
