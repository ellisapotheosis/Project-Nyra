# Project Nyra Consolidation & Integration Plan (2026-05-12)

## 🎯 Objectives
- **Domain Separation**: Establish `ratehunter.net` as the public landing page and `projectnyra.com` as the internal cockpit.
- **Scaffolding**: Transition to a high-fidelity Turborepo structure using `src/` directories and shared packages.
- **Redundancy Removal**: Archive deprecated prototypes and consolidate feature-complete components.

## 🗺️ Domain Mapping
| Target Domain | Repository Path | Audience | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **ratehunter.net** | `apps/landing` | Borrowers | Public lead capture, rate deck, personal broker branding. |
| **projectnyra.com** | `apps/cockpit` | Brokers/Ops | Internal command hub for leads, quotes, campaigns, and AI fleet. |

## 🏗️ Monorepo Structure (New Canonical)
- **`apps/cockpit`**: Internal Next.js application (Project Nyra).
- **`apps/landing`**: Public Next.js application (RateHunter).
- **`packages/ui`**: Shared design system (Indigo/Seafoam palette, MagicUI components).
- **`packages/domain-models`**: Shared Zod schemas and types.
- **`packages/crm-client`**: Shared GraphQL/REST client for TwentyCRM.
- **`packages/integration-adapters`**: Logic for Twilio, SendGrid, Activepieces, etc.

## 📂 Deprecated Folders & Migration Status
| Deprecated Folder | Migration Action | Canonical Replacement |
| :--- | :--- | :--- |
| `apps/nyra-webapp` | Refactored & Renamed | `apps/cockpit` |
| `apps/ratehunter-landing` | Refactored & Renamed | `apps/landing` |
| `apps/nyra-landing` | Archived | Integrated into `apps/cockpit/src/app/page.tsx` (Internal Landing). |
| `apps/projectnyra-webapp` | Archived | Replaced by `apps/cockpit`. |
| `apps/ratehunter.net` | Archived | Replaced by `apps/landing`. |
| `apps/webapp` | Archived | Replaced by `apps/cockpit`. |
| `services/mortgage-assistant-api` | Archived | Integrated into `services/crm-api`. |
| `services/ratehunter-api` | Archived | Consolidated into `services/crm-api` and `apps/landing`. |
| `services/assistant-service` | Archived | Replaced by `services/openclaw`. |
| `services/ruvector-search` | Archived | Integrated into `services/mem0`. |
| `services/lead-capture-api` | Archived | Unified with `services/crm-api`. |
| `container_index.js` | Archived | `apps/guidance/references/consolidated-archive-20260512/` |
| `generate_oracle_onevm_pack.sh` | Archived | `apps/guidance/references/consolidated-archive-20260512/` |
| `cert.pem / key.pem` | Archived | `apps/guidance/references/consolidated-archive-20260512/` |

## 🧩 Feature Integration Map
- **Lead Capture Wizard**: Moved from `ratehunter-landing` legacy to `apps/landing/src/components/LeadCaptureWizard.tsx`.
- **Mempalace (3D Memory)**: Logic moved to `apps/cockpit/src/app/(ops)/memory/`, UI components to `packages/ui`.
- **AI Fleet Control**: Integrated into `apps/cockpit/src/app/(ops)/fleet/`.
- **Pricing Engine**: Consolidated into `apps/cockpit/src/app/(broker)/quotes/`.
- **Campaign Builder**: Consolidated into `apps/cockpit/src/app/(broker)/campaigns/`.
- **Pipeline Kanban**: Integrated from legacy crm into `apps/cockpit/src/app/(broker)/pipeline/`.
- **Responsive Navigation**: Implemented `Sheet` component in `packages/ui` for high-density mobile navigation in `AppShell`.
- **Internal Landing**: `apps/cockpit` homepage transformed into a high-fidelity "Mission Protocol" hero section.

## 🛠️ Verification Checklist
- [x] Turborepo `pnpm build` passing for all apps.
- [x] Shared `@nyra/ui` package linked and functional.
- [x] Type-safe mock data synchronized between UI and backend.
- [x] Public/Internal domain boundaries strictly enforced.
- [x] Visual snapshots (screenshots) captured for foundation pass.

## 🚀 Immediate Handoff Actions
1. **Infisical**: Populate live secrets for `ratehunter.net` (Cloudflare) and `projectnyra.com` (Oracle VPS).
2. **DNS**: Point `ratehunter.net` to Cloudflare Pages and `projectnyra.com` to the Oracle VPS.
3. **Deployment**: Run `pnpm build` at root to verify production readiness.
