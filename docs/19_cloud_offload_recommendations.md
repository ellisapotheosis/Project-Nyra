# 19 Cloud Offload Recommendations

## Immediate opportunities

1. Keep static marketing (`apps/landing`) on Cloudflare Pages.
2. Tunnel only control-plane UIs and gateway APIs through Cloudflared.
3. Preserve datastore residency on private nodes; no public ingress.

## Candidate offload matrix

| Component | Offload target | Decision |
|---|---|---|
| Marketing landing | Cloudflare Pages | proceed |
| App/API front doors | Cloudflared tunnel + Access | proceed |
| Datastores | none (private infrastructure) | keep private |
| Worker GPU inference | private worker nodes | keep private |
| Artifact/object storage | S3-compatible private bucket | evaluate |

## Security-first recommendations

- Require Access policy + IdP for all tunnel hostnames except landing site.
- Use service tokens for machine clients.
- Add WAF and rate limiting on API hostnames.
- Keep SSH access out of public tunnel unless explicitly Access TCP gated.

## Operational recommendations

- Automate DNS route creation in deployment scripts.
- Add CI rule to reject cloudflared config entries targeting datastore services.
- Add periodic scan comparing active compose ports vs tunnel ingress hostnames.

## Cost/risk notes
- Offloading stateless front doors typically reduces maintenance overhead.
- Stateful services should stay private unless managed service controls exceed current posture.
- GPU inference offload decisions should include model egress/privacy requirements.

## Decision cadence
- Reassess offload candidates quarterly against usage, reliability, and compliance constraints.
- Keep this list synchronized with ports registry and node placement docs.

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
