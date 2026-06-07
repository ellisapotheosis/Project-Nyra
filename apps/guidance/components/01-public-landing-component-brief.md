# Component Brief: Public Landing

Target:

- [apps/ratehunter/landing](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing)

Source-of-truth design:

- [Carrd scrape](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/ratehunter.carrd.co-landing-page-webscraped-code)

Functional content/features to merge in:

- [Current landing homepage](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing/src/app/page.tsx)
- [LeadCaptureWizard](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing/src/components/LeadCaptureWizard.tsx)
- [BorrowerChatWidget](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing/src/components/BorrowerChatWidget.tsx)

Must preserve from Carrd:

- background and animated texture behavior
- layout rhythm and section sequencing
- bio, titles, phone, links, buttons, personal branding
- Calendly integration
- all borrower-facing identity content

May replace:

- raw Carrd buttons
- raw Carrd form elements
- non-semantic layout wrappers

Replace with:

- shadcn components
- magicUI flourishes where they do not break Carrd identity

Must not include:

- admin routes
- broker dashboards
- CRM pages
- coworker/internal flows
