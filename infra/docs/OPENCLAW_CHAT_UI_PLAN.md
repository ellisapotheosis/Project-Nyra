# OpenClaw Chat UI Plan

## Recommended insertion point

Target the admin app first, not the borrower webapp.

Reason:

- `apps/admin/app` already has an active Next.js app structure.
- `apps/projectnyra` currently reads more like a scaffold/spec than the stronger internal-tool target.
- OpenClaw operator chat is an internal operations surface, so admin is the safer first home.

## Preferred path

1. Add a server-side route such as `/api/internal/openclaw/chat` inside the admin app.
2. Proxy requests from that route to the internal OpenClaw service URL.
3. Inject auth/session context server-side only.
4. Render a thin internal chat page or panel under an admin route such as `/tools/openclaw`.

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

## Minimum UI scope

- current-session message history
- prompt submit
- loading and error states
- streaming if easy, polling otherwise
- no browser exposure of provider or OpenClaw secrets

## Deferred from the first UI pass

- voice input
- file uploads
- public auth
- multitenancy
- analytics-heavy UI
- large state-management rewrites
