# Exact Reference Map (Updated 2026-05-12)

## Canonical Domain Strategy
- **projectnyra.com**: Authenticated internal cockpit (`apps/cockpit`).
- **ratehunter.net**: Public broker landing page (`apps/landing`).

## Active Application Entrypoints

### 1. Internal Cockpit (Project Nyra)
- **Root Path**: [apps/cockpit](/home/ellisapotheosis/repos/project-nyra/apps/cockpit)
- **Homepage (Mission Overview)**: [apps/cockpit/src/app/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/cockpit/src/app/page.tsx)
- **Leads Registry**: [apps/cockpit/src/app/(broker)/leads/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/cockpit/src/app/(broker)/leads/page.tsx)
- **Pipeline Kanban**: [apps/cockpit/src/app/(broker)/pipeline/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/cockpit/src/app/(broker)/pipeline/page.tsx)
- **Fleet Control**: [apps/cockpit/src/app/(ops)/fleet/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/cockpit/src/app/(ops)/fleet/page.tsx)
- **Mempalace (3D Memory)**: [apps/cockpit/src/app/(ops)/memory/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/cockpit/src/app/(ops)/memory/page.tsx)

### 2. Public Landing (RateHunter)
- **Root Path**: [apps/landing](/home/ellisapotheosis/repos/project-nyra/apps/landing)
- **Homepage**: [apps/landing/src/app/page.tsx](/home/ellisapotheosis/repos/project-nyra/apps/landing/src/app/page.tsx)
- **Lead Capture Wizard**: [apps/landing/src/components/LeadCaptureWizard.tsx](/home/ellisapotheosis/repos/project-nyra/apps/landing/src/components/LeadCaptureWizard.tsx)
- **Borrower Chat**: [apps/landing/src/components/BorrowerChatWidget.tsx](/home/ellisapotheosis/repos/project-nyra/apps/landing/src/components/BorrowerChatWidget.tsx)

## Shared Logic & UI Shards
- **@nyra/ui**: [packages/ui](/home/ellisapotheosis/repos/project-nyra/packages/ui) - Shared component library.
- **@nyra/assets**: [packages/assets](/home/ellisapotheosis/repos/project-nyra/packages/assets) - Central logo and brand repository.
- **@nyra/domain-models**: [packages/domain-models](/home/ellisapotheosis/repos/project-nyra/packages/domain-models) - Type-safe mortgage entities.

## Archived Prototypes (Reference Only)
All deprecated codebases are moved to:
- [apps/guidance/references/consolidated-archive-20260512](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/consolidated-archive-20260512)
- [services/archived](/home/ellisapotheosis/repos/project-nyra/services/archived)

Primary historical snapshots:
- Foundation Pass Base: [apps/guidance/references/foundation-pass-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/foundation-pass-snapshot)
- WebApp Merge Legacy: [apps/guidance/references/webapp-merge-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot)

## Theme/Token References
- Canonical Palette: **Dark Mode / Indigo / Seafoam / Neon Pink**.
- Primary tokens: Indigo-600 (Primary), Turquoise-500 (Secondary), Pink-500 (Alerts).
- Visualization: Sacred Geometry (MerKaBa, Tesseract) used as metaphor for memory and reasoning duality.
