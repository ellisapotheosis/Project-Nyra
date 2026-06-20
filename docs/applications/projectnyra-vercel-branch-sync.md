# Project Nyra Vercel Branch Sync

## Separate Checkout

The Vercel/v0 webapp reference checkout lives at:

```text
/home/ellisapotheosis/repos/project-nyra-webapp-v0
```

It was created from `github/v0/ellisapotheosis-680b2db9` at commit `83a6ebe5f`.

## Integrated Into `apps/projectnyra`

- `next-themes` provider setup
- Header theme switcher
- Radix dropdown menu primitive needed by the switcher
- TweakCN/shadcn CSS variable theme structure
- Webapp logo assets under `apps/projectnyra/public/branding/webapp`

## Theme Name Mapping

The Vercel/v0 branch used generated names that did not match the local TweakCN folders. The current canonical names are:

| Canonical name     | Local TweakCN folder | Vercel/v0 generated name | Notes                                                                               |
| ------------------ | -------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| Mint Midnight      | `Mint_Midnight`      | `neon-violet`            | Same dark theme family; class renamed to `mint-midnight`.                           |
| Mint Midnight Glow | `Mint_Midnight_Glow` | `midnight-mint`          | Same dark theme family; class renamed to `mint-midnight-glow`.                      |
| Apotheosis         | `APOTHEOSIS2`        | `astral-indigo`          | `APOTHEOSIS2` is now the canonical Apotheosis theme; class renamed to `apotheosis`. |
| Virtus             | `Apotheosis`         | `cosmic-purple`          | Former Apotheosis theme is now Virtus; class renamed to `virtus`.                   |

The Project Nyra app uses the dark TweakCN values for these named themes because the Vercel/v0 branch implemented theme switching through named root classes instead of light/dark pairs.

## Not Wired Into The Main App

The Vercel/v0 branch also contains:

- `components/shell/*`
- `app/page.tsx` demo system dashboard
- placeholder images and generic app icons
- many unused shadcn primitives

Those were not wired into the live Project Nyra app because the current `apps/projectnyra` directory already contains the canonical routes for admin, CRM, assistant, campaigns, leads, quotes, pipeline, applications, settings, Nexus, and Twenty. Replacing that with the Vercel demo shell would hide real app surfaces behind a prototype dashboard.

The shell and generic UI primitives remain available in the separate checkout for selective future migration.
