# OpenClaw Chat UI Plan

## Recommended path (thin internal panel)
1. Add `/api/internal/openclaw/chat` in existing webapp backend.
2. Backend proxy forwards to OpenClaw and injects auth/session context.
3. Frontend panel mounted under `/tools/openclaw` in admin UI.

## Alternative path (reverse proxy hosted UI)
- Reverse proxy OpenClaw UI to `/tools/openclaw`.
- Protect route with existing SSO/session middleware.

## Security requirements
- No direct browser->OpenClaw token exposure.
- Audit user id, org id, prompt id, and tool invocation id.
- Enforce request size/rate limits at proxy layer.


## Proxy baseline included now
- `infra/compose/openclaw.ui.compose.yml` adds nginx proxy path `/tools/openclaw/` -> `openclaw-mvp:3400`.
- Use this as the transition state until internal panel route is implemented.
