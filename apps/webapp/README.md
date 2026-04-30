# webapp

Canonical customer app (`app.ratehunter.net`).

Core surfaces:
- Lead Capture
- Quote Viewer
- Embedded Assistant Widget (OpenClaw ChatUI)

## OpenClaw chat route (`/tools/openclaw`)

This repo includes a thin internal panel at `/tools/openclaw` in `apps/webapp/app`,
backed by server-side proxy routes:

- `POST /api/internal/openclaw/chat`
- `GET /api/internal/openclaw/health`

Copy the env template:

```bash
cp apps/webapp/app/.env.example apps/webapp/app/.env.local
```

Then run:

```bash
cd apps/webapp/app
npm run dev
```

## Hosting and auth direction

Host this app on the Oracle VPS once it becomes the authenticated broker/customer app. Keep
Cloudflare in front for DNS, TLS, WAF, Access, and routing, but run the Next.js server close to
the Oracle-hosted Supabase stack.

Recommended split:

- `apps/landing/ratehunter-landing`: Cloudflare Pages, public marketing and lead capture.
- `apps/webapp/app`: Oracle VPS, private full-stack Next.js app behind Cloudflare.
- Supabase: Oracle VPS, exposed only through HTTPS API/auth routes such as `supabase.ratehunter.net`.
- Postgres: private Docker/network access only; never publish the raw database port.

Supabase env contract lives in `apps/webapp/app/.env.example`. The browser should only receive
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; server-only routes may use
`SUPABASE_SERVICE_ROLE_KEY` when needed.
