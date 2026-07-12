# Project Nyra

Canonical product app for `projectnyra.com` and `app.projectnyra.com`.
Use this app for product routes, broker workflows, and embedded product-admin
pages. Keep separate control-plane consoles such as `nexus.projectnyra.com`
out of this app unless they are intentionally embedded links or lightweight
status panels.

Core surfaces:

- Public launch surface and product landing handoff
- Broker CRM mirror, lead desk, pipeline, applications, and quotes
- Campaign management and campaign builder
- Admin route group for operator controls
- Assistant route group backed by OpenClaw/Nexus proxy routes
- Links to protected control-plane tools such as Nexus UI and Twenty CRM

## App Role

This folder is the canonical place for Project Nyra user-facing product routes.
Do not add new Project Nyra product pages under `apps/webapp`, `apps/admin`, or
`apps/mortgage-crm`.

Use older app roots as migration sources:

- `apps/mortgage-crm`: lead Kanban, lead detail, and mortgage-domain prototype
  ideas.
- `apps/admin`: older operator dashboard, quote, and lead admin ideas.
- `apps/nexusUI`: separate active control-plane UI linked from this app.
- `apps/openmemoryUI`: future standalone memory console if OpenMemory becomes
  a true separate deployable; otherwise keep memory-related panels here.
- `apps/twenty*`: TwentyCRM bootstrap/integration surfaces, not Project Nyra
  product pages.

Current route groups:

```text
app/
  (public)/
  (broker)/
  (admin)/
  (assistant)/
  api/
```

## OpenClaw chat route (`/tools/openclaw`)

This repo includes a thin internal panel at `/tools/openclaw` in
`apps/projectnyra`, backed by server-side proxy routes:

- `POST /api/internal/openclaw/chat`
- `GET /api/internal/openclaw/health`

Copy the env template:

```bash
cp apps/projectnyra/.env.example apps/projectnyra/.env.local
```

Then run:

```bash
cd apps/projectnyra
npm run dev
```

## Hosting and auth direction

Host this app on the Oracle VPS once it becomes the authenticated
broker/customer app. Keep Cloudflare in front for DNS, TLS, WAF, Access, and
routing, but run the Next.js server close to the Oracle-hosted Supabase stack.

Recommended split:

- `apps/ratehunter/landing`: Cloudflare Pages, public marketing and lead capture.
- `apps/projectnyra`: Cloudflare Pages front end with Oracle-backed API calls.
- `apps/nexusUI`: standalone Access-gated operator console for Nexus Router and
  LiteLLM.
- Supabase: Oracle VPS, exposed only through HTTPS API/auth routes such as
  `api.projectnyra.com/auth/v1`.
- Postgres: private Docker/network access only; never publish the raw database
  port.

Supabase env contract lives in `apps/projectnyra/.env.example`. The browser
should only receive `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`; server-only routes may use
`SUPABASE_SERVICE_ROLE_KEY` when needed.
