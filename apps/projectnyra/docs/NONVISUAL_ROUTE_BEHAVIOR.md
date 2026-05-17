# Cockpit Nonvisual Route Behavior

The cockpit is the internal broker and operations command hub. This file maps expected behavior without visual design details.

## API Routes

| Route                                  | Behavior                                                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/api/internal/openclaw/chat`          | Proxy assistant chat through server-side OpenClaw/Nexus config; redact raw upstream responses before browser return. |
| `/api/internal/fleet/status`           | Return configured/reachable/degraded/unreachable states; do not claim live health from static config alone.          |
| `/api/internal/campaign-builder/agent` | Generate campaign proposals only; campaign service owns durable campaign state.                                      |
| `/api/internal/*`                      | Keep secrets server-side and return browser-safe response envelopes.                                                 |

## Page Behavior

- Lead pages load CRM API records and timeline events.
- Campaign pages call campaign service for state transitions.
- Quote pages call quote service for generation and CRM API for storage/history.
- Communication pages call communication service for drafts, approvals, inbound events, and provider status.
- Compliance controls call compliance service and display suppression/consent state.
- Assistant panels propose actions but never mutate CRM directly.

## Health Semantics

- `configured`: endpoint or service is defined.
- `reachable`: active probe succeeded.
- `degraded`: probe failed but fallback or stale data exists.
- `unreachable`: probe failed and no usable fallback exists.
