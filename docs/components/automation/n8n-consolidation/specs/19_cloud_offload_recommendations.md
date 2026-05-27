# 19 Cloud Offload Recommendations

## Immediate decisions

- Keep static landing on Cloudflare Pages.
- Tunnel only approved HTTP applications via cloudflared + Access.
- Keep databases, queues, and vector stores private on node-local networks.

## Candidate matrix

| Component class  | Offload target              | Decision     |
| ---------------- | --------------------------- | ------------ |
| Marketing UI     | Cloudflare Pages            | proceed      |
| Operator UIs     | Cloudflared tunnel + Access | proceed      |
| Datastores       | none/public internet        | reject       |
| Worker inference | private worker nodes        | keep private |
| MCP services     | private network only        | keep private |

## Enforcement recommendations

- Add CI check to reject datastores in `infra/cloudflared/config.yml`.
- Keep final ingress catch-all `http_status:404` mandatory.
- Require explicit owner + policy when adding new tunnel hostnames.
- Keep SSH, Redis, Postgres, Mongo, and vector DB protocols off public edge routes.

## Suggested phased rollout

1. Stage 1: deploy cloudflared with only `n8n` and `grafana` hostnames.
2. Stage 2: add `gitea` and `infisical` with stricter Access policies.
3. Stage 3: add remaining operator surfaces after synthetic monitoring baselines.
4. Stage 4: continuous drift check between compose ports and ingress hostnames.

## Drift detection heuristics

- Fail pipeline if a datastore service appears under `ingress:`.
- Fail pipeline if any ingress target is non-HTTP and non-HTTPS.
- Warn if a public hostname is missing corresponding CNAME route instructions.
- Warn if `docs/02_ports_registry.md` and `infra/cloudflared/config.yml` diverge.

## Business-impact rationale

- Keeping stateful services private reduces accidental data exposure risk.
- Tunneling only operator UIs keeps administration available without exposing LAN ports.
- Cloudflare Pages remains the low-risk public surface for marketing content.
