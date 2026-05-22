# GitHub, CI, And Deployment Owner Guide

These actions require GitHub repository administration, hosted deployment
dashboards, code scanning settings, or live deployment credentials.

## GitHub Repository Settings

- [ ] Confirm repository Actions are enabled.
- [ ] Enable CodeQL/code scanning if available for the repository plan and
      visibility.
- [ ] Confirm Dependabot alerts and security updates are enabled.
- [ ] Confirm branch protection and required checks match the current release
      lane.
- [ ] Confirm any GitHub repository secrets still used by CI/CD match the
      current Infisical values or are deliberately documented as separate.

## Required Secret Categories

- [ ] Cloudflare API account/zone/deployment tokens.
- [ ] Infisical service token or machine identity for CI, if CI reads secrets.
- [ ] GitHub or Gitea runner token if self-hosted runners are active.
- [ ] Vercel/Cloudflare Pages deployment token if either platform is used for
      app deployment.
- [ ] Supabase project URL, anon/publishable key, and service-role key only
      where a protected server-side deployment context requires them.

## Deployment Dashboards

- [ ] Confirm Project Nyra app deployment target for `projectnyra.com`.
- [ ] Confirm RateHunter deployment target for `ratehunter.net`.
- [ ] Confirm no internal Project Nyra apps are attached to `ratehunter.net`.
- [ ] Confirm preview deployments cannot expose admin/internal surfaces without
      Access or equivalent protection.

## Completion Evidence

Record:

- repository or deployment project name
- setting confirmed
- check or workflow name
- pass/fail status
- date

Do not record secret values, personal access tokens, runner registration
tokens, cookies, or dashboard recovery codes.
