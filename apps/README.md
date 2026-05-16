# Nyra Apps Directory

Welcome, Agent. This folder contains the user-facing interfaces and administrative surfaces for Project Nyra.

## 📚 Specification Index
To ensure consistency and compliance, every component in this directory (and related services) follows a strict `SPEC.md`. **Review these before making changes.**

| Component | Spec Location | Focus |
| :--- | :--- | :--- |
| **Main WebApp** | [`/apps/nyra-webapp/SPEC.md`](./nyra-webapp/SPEC.md) | Broker command center, shadcn/oklch, dashboard. |
| **CRM API** | [`/services/crm-api/SPEC.md`](../services/crm-api/SPEC.md) | Data Layer, Lead Normalization, CRM Sync. |
| **n8n Workflows** | [`/services/n8n-workflows/SPEC.md`](../services/n8n-workflows/SPEC.md) | Drip Engine, Twilio/SendGrid, TCPA Kill-Switch. |
| **Nyra Assistant** | [`/services/openclaw/SPEC.md`](../services/openclaw/SPEC.md) | Persona, Hermes Inference, Mem0 Persistence. |
| **Quote Engine** | [`/services/quote-api/SPEC.md`](../services/quote-api/SPEC.md) | Pricing, Micros, PDF Generation. |

## 🛠️ Global Guidance (TL;DR)
- **Tech Stack**: Next.js, Tailwind v4, pnpm, shadcn/ui.
- **Design**: TweakCN oklch themes. No hex colors.
- **Compliance**: TCPA/CAN-SPAM is non-negotiable. Always log activities to Twenty CRM.
- **Inference**: Use the **Nexus Router** (port 6000) for all LLM/MCP tasks.

## 🚀 Execution Playbook
Refer to [`/SYSTEM_BLUEPRINT.md`](../SYSTEM_BLUEPRINT.md) for the master architectural map.
