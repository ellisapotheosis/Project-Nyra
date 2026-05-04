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
