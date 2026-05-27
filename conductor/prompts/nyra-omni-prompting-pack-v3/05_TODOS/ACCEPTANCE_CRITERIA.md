# Acceptance Criteria

## Non-UI package acceptance

- Stack truth includes every correction from the user’s latest message.
- UI/theme/design remains quarantined.
- Prompts can be handed to independent Codex agents without prior context.
- Every prompt says not to ask questions and to choose safe defaults.
- Every prompt preserves docs and archives before replacing.
- Every prompt blocks secrets from being committed.
- Every relevant prompt enforces STOP/DNC/consent/human approval/audit gates.
- Activepieces is primary; n8n is constrained fallback only.
- Letta/OpenClaw/NerveUI worker architecture is explicit.
- Infisical sidecar + Docker Context secret flow is explicit.
- Host topology under `/infra/hosts/<host>` is explicit.
- Gitea/Tea/Gitea MCP distinction is explicit.

## Repo execution acceptance

- AGENTS.md exists and points to canonical docs.
- `.env.example` contains placeholders only.
- No real secrets are introduced.
- No UI/theme files changed during non-UI prompts.
- Tests/checks run or failures documented.
- Handoff report produced.
