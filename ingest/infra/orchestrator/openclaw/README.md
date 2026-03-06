# OpenClaw / ClawHub / MoltBot integration (wrapper stack)

This package adds a **wrapperized self-hosting path** for `openclaw/clawhub` with:
- `clawhub-web`
- `clawhub-api`
- `clawhub-worker`
- `clawhub-mcp` (adapter placeholder so Nexus can aggregate it)

## Important
The OpenClaw/ClawHub ecosystem moves quickly and upstream commands/env variables may change.
This wrapper is designed to reserve ports, networking, databases, and an integration pattern first,
then let you pin exact images/commands after validating your preferred upstream release.

## Recommended hardening before production
- Pin exact upstream commit/tag in `Dockerfile`
- Lock npm/pnpm deps
- Add network policies / reverse proxy auth
- Restrict skill/plugin installation to trusted sources
- Run malware scanning on imported skills
