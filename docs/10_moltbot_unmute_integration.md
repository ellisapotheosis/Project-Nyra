# 10 Moltbot / Kyutai Unmute Integration

## Current state

Moltbot-related runtime appears in active compose inventory, but dedicated unmute profile wiring is not yet standardized in the canonical Makefile path.

## Known services

- `moltbot-web` appears in `infra/docker-compose.yml` as a web endpoint.
- `moltbot` appears in `infra/oracle/docker-compose.oracle.yml` with RTP/WebSocket ports.

## Integration stance

- Keep voice processing services private by default.
- Expose only explicit web control APIs through Access if required.
- Avoid public exposure of raw media transport ports.

## Required env domains

- upstream LLM endpoint (internal LiteLLM or private gateway)
- voice/STT/TTS provider keys via Infisical
- orchestrator callback URLs

## Next steps

1. Add explicit Make target for optional voice profile if desired.
2. Add health endpoint docs once canonicalized.
3. Keep edge docs synchronized if any public hostname is introduced.

## Validation plan
1. Confirm compose service healthchecks are present or add synthetic probes.
2. Validate media port reachability only on private network paths.
3. Verify that no cloudflared hostnames are mapped to raw media transport ports.

## Rollback plan
- Disable optional voice profile targets first.
- Keep core routing and CRM workflows independent from voice stack.
- Re-run compose config validation after rollback.

## Owner note
- This section is intentionally conservative until full canonical voice profile files are finalized.

## Evidence references
- Source compose: `infra/docker-compose.yml`
- Targeting policy: `infra/cloudflared/config.yml`
- Control surface docs: `docs/02_ports_registry.md`

## Command snippets
```bash
rg -n "<service-name>|ports:" infra/docker-compose.yml
```

```bash
rg -n "hostname:|service:" infra/cloudflared/config.yml
```
