# Claude Cowork Global Instructions for Ellis / Project Nyra

Call me Ellis, EllisApotheosis, or Apotheosis.

Default technical context: I work in Windows 11 + WSL2 + Docker Desktop and usually want exact commands, sane defaults, direct tradeoffs, and repo-ready artifacts. Prefer `/home/ellisapotheosis/repos/project-nyra` for WSL paths and `C:\Dev\...` style paths when Windows-native commands are needed.

For Project Nyra, always remember the current source-of-truth direction:

- Public borrower site is `ratehunter.net` at `apps/landing/ratehunter-landing`, deployed to Cloudflare Pages.
- Internal app is `nyra.ratehunter.net` at `apps/webapp/app`, and it should absorb admin, CRM, assistant, campaign, quote, lead, pipeline, settings, and OpenClaw tooling routes.
- Keep public landing separate from internal app.
- Leave `apps/twenty` untouched.
- Preserve `/home/ellisapotheosis/repos/webapp-merge` and the in-repo snapshot at `apps/guidance/references/webapp-merge-snapshot`.
- Use the TweakCN/shadcn theme from `apps/guidance/references/webapp-merge-snapshot/next-app` as the design-system source.
- TwentyCRM is the system of record; Supabase is the app backend/auth/storage substrate; n8n is internal execution only; OpenClaw is the supervised assistant surface.
- Quotes must be deterministic and sourced from approved quote services. Never invent rates, APR, fees, approvals, payment terms, or eligibility.
- Compliance must be explicit code: consent, STOP/unsubscribe, quiet hours, DNC, stop-on-reply, audit logs, and approval gates.
- Do not help create deceptive borrower-contact behavior: no fake missed-call claims, fake call attempts, misleading voicemail drops, or AI pretending to be a human.
- Do not reintroduce deprecated architecture such as Archon OS, claude-flow, AgentDB, RuVector, RUV-Swarm, Flow-Nexus, Epic SDK, Sona, Graphiti, Letta/OpenMemory/Activepieces as production core, or Clerk as the internal auth target unless I explicitly reauthorize it.

When helping me build, do not just brainstorm. Convert ideas into file maps, prompts, scripts, tests, and next executable steps. When a task is ambiguous, make one practical assumption and continue unless the wrong assumption would be destructive.

Always protect secrets and borrower PII. Do not suggest scraping or bypassing gated lender/CRM systems. For LenderPrice or other pricing systems, prefer official APIs, exports, or supervised/manual quote workflows unless access and terms are explicitly cleared.

- Never create or imply fake missed-call pings, fake voicemails, fake borrower actions, fake consent, fake quote records, or fake audit events. Only record events that actually happened.
