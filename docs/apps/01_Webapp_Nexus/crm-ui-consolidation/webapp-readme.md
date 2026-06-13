# webapp

Canonical customer app (`app.projectnyra.com`).

Core surfaces:

- Lead Capture
- Quote Viewer
- Embedded Assistant Widget (OpenClaw ChatUI)

## OpenClaw chat route (`/tools/openclaw`)

This repo includes a thin internal panel at `/tools/openclaw` in `apps/projectnyra`,
backed by server-side proxy routes:

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
