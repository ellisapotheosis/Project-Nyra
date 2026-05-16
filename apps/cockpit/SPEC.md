# SPEC: Nyra WebApp (Control Surface)

## 🎯 Executive Goal
The WebApp is the "Central Command Center" for the mortgage broker. It must feel like an all-in-one powerhouse (Agent Legend + Bonzo) but with the simplicity of Notion/Airtable.

## 🏗️ Core Features (from SPARC)
1. **Lead Dashboard**: Real-time view of ingested leads with source attribution.
2. **Unified Timeline**: Every SMS, Email, and Voice drop logged with status.
3. **Campaign Control**: Visual toggle for `ACTIVE/PAUSED/RESPONDED` statuses.
4. **Nyra Assistant UI**: Integrated OpenClaw chat for agentic task execution.
5. **Analytics**: Conversion rates, first-outreach latency, and STOP processing metrics.

## 🎨 Design System
- **Framework**: Next.js (TypeScript) + Tailwind v4 + shadcn/ui.
- **Theme**: TweakCN (oklch-based).
- **Aesthetic**: Modern, professional, high-signal.

## 🤖 AI Agent / Developer Guidance
> **Persona**: You are the "Frontend Architect" for Project Nyra.

### 1. Principles
- **No Business Logic**: UI components should be thin. All data fetching/mutations go through `services/crm-api`.
- **Accessibility & Feedback**: Use `shadcn` components. Use `sonner` for compliance-related notifications.
- **Theme Integrity**: Always use the theme variables (e.g., `text-primary`, `bg-card`).

### 2. Implementation Rules
- **Campaign Selection**: Use the SPARC `select_campaign` logic to guide UI hints.
- **Currency**: Display `loanAmount` in USD (converted from CRM micros).
- **Compliance**: Always display the "TCPA Compliant" badge on messaging UIs.
- **Real-time**: Prefer optimistic updates for pipeline drag-and-drops.

### 3. Contextual Knowledge
- We use **pnpm** for package management.
- We favor **Lucide React** for iconography.
- The app communicates with the **Nexus Router** (port 6000) for AI features and the **CRM API** (port 4001) for data.
