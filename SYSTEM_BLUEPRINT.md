# Project Nyra: AI-Powered Mortgage Platform Blueprint

## 🌌 System Overview

## 🗺️ Architectural Mapping

| Blueprint Category             | Implementation                 | Component                       |
| :----------------------------- | :----------------------------- | :------------------------------ |
| **1. Multi-Channel Campaigns** | n8n + SendGrid + Twilio        | `packages/integration-adapters` |
| **2. Unified Messaging Inbox** | Project Nyra (projectnyra.com) | `apps/projectnyra`              |
| **3. CRM Lead Management**     | Twenty CRM                     | `infra/hosts/oracle-vps`        |
| **4. Loan Process Automation** | CRM Triggers + activepieces    | `packages/crm-client`           |
| **5. Data Integration**        | Nexus Router (MCP)             | `services/nexus-router`         |
| **6. Analytics Dashboard**     | Cockpit + PostgreSQL           | `apps/projectnyra`              |
| **8. AI Lead Scoring**         | OpenClaw + Hermes-3            | `services/openclaw`             |

## 🚀 Deployment Strategy

1. **Orchestrator (Control Plane)**: nexus-router, n8n, twenty-crm (Oracle/OneVM).
2. **Worker (Inference Plane)**: vLLM, OpenClaw, Ollama (RTX 5090).
3. **Interface (User Plane)**: projectnyra.com (Cockpit), ratehunter.net (Landing).

## 🤖 Global Agent Guidance

- **Safety**: Never log PII. Respect TCPA/Compliance STOP keywords.
- **Tech**: TypeScript, pnpm, Tailwind v4, shadcn/oklch.
- **Workflow**: All data moves from `WebApp -> CRM API -> Twenty CRM`. All AI moves through `Nexus Router`.
