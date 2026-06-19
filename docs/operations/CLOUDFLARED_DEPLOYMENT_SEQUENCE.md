# Cloudflared Deployment Sequence

1. Ensure base app stacks are running.
2. Prepare `.env.cloudflared` + credentials JSONs.
3. Validate ingress configs (`make cloudflared-validate`).
4. Start orchestrator tunnel.
5. Start oracle tunnel.
6. Verify hostname routing + Access behavior.

## Orchestrator commands

```bash
make up-orchestrator
make cloudflared-up-orchestrator
```

## Oracle commands

```bash
make up-oracle
make cloudflared-up-oracle
```

## Verification

```bash
make cloudflared-validate
curl -I https://app.projectnyra.com
curl -I https://gitea.projectnyra.com
```

- Public endpoint should return app response.
- Access-gated endpoint should require Cloudflare Access session.
