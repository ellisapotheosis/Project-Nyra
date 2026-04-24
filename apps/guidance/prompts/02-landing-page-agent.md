# Prompt: Public Landing Page Agent

You are building the public borrower-facing site for `ratehunter.net`.

## Canonical Destination

- [apps/landing/ratehunter-landing](/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing)

## Primary Design Source

- [Carrd scrape](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/ratehunter.carrd.co-landing-page-webscraped-code)

## Secondary Content/Feature Sources

- [current localhost:3101 page source](/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing/src/app/page.tsx)
- [LeadCaptureWizard](/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing/src/components/LeadCaptureWizard.tsx)
- [BorrowerChatWidget](/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing/src/components/BorrowerChatWidget.tsx)
- uploaded logos:
  [ratehunter_logo](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/ratehunter_logo)

## Hard Constraints

1. This app is only for `ratehunter.net`
2. Do not integrate internal admin/webapp/CRM routes
3. Preserve Carrd identity:
   - overall layout
   - content order
   - background
   - personal information
   - buttons, links, phone, Calendly, bio, job titles
4. Replace generic UI elements with shadcn + magicUI where it improves implementation without changing the page’s personality
5. Keep Cloudflare Pages compatibility
6. Do not delete or alter the external backup repo at `/home/ellisapotheosis/repos/webapp-merge`

## Desired Outcome

Rebuild the Carrd site as a polished Next.js landing page that:
- feels like Ellis Andersen’s actual public broker/branch-manager website
- preserves Carrd’s structure and moving-background identity
- incorporates the stronger borrower-facing copy and interactive functionality from the current `localhost:3101` implementation

## Specific Content To Preserve From Carrd

- Ellis Andersen identity
- Branch Manager / Mortgage Broker / Real Estate Agent positioning
- all phone numbers
- all links
- all CTAs
- Calendly
- bio
- personal titles and info

## Specific Functionality To Add From `localhost:3101`

- professional service blocks
- better borrower trust/compliance copy
- lead intake wizard
- borrower chat widget

## Theme Direction

Use shadcn + magicUI thoughtfully, but do not turn the site into a generic SaaS page.
If the animated Carrd background is performant and maintainable, preserve or faithfully reproduce it.

## Deliverables

1. Updated public landing implementation
2. Notes on what was preserved from Carrd
3. Notes on what was added from current `localhost:3101`
4. Any required env/config notes for chat, lead capture, or Calendly

