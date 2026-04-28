# Project Nyra: AI-Powered Mortgage Platform Blueprint

## 🌌 System Overview

## 🗺️ Architectural Mapping
| Blueprint Category | Implementation | Component |
| :--- | :--- | :--- |
| **1. Multi-Channel Campaigns** | n8n + SendGrid + Twilio | `services/n8n-workflows` |
| **2. Unified Messaging Inbox** | WebApp (Next.js) | `apps/webapp` |
| **3. CRM Lead Management** | Twenty CRM | `infra/oracle-vps` |
| **4. Loan Process Automation** | n8n + CRM Triggers | `services/crm-api` |
| **5. Data Integration** | Nexus Router (MCP) | `services/nexus-router` |
| **6. Analytics Dashboard** | WebApp + PostgreSQL | `apps/webapp` |
| **8. AI Lead Scoring** | OpenClaw + Nexus Router | `services/openclaw` |

## 🚀 Deployment Strategy
1. **Orchestrator (Control Plane)**: nexus-router, n8n, twenty-crm (Oracle/OneVM).
2. **Worker (Inference Plane)**: Hermes UI, OpenClaw, Ollama (RTX 3090).
3. **Interface (User Plane)**: WebApp (Next.js), Cloudflare Tunnels.

## 🤖 Global Agent Guidance
- **Safety**: Never log PII. Respect TCPA/Compliance STOP keywords.
- **Tech**: TypeScript, pnpm, Tailwind v4, shadcn/oklch.
- **Workflow**: All data moves from `WebApp -> CRM API -> Twenty CRM`. All AI moves through `Nexus Router`.
