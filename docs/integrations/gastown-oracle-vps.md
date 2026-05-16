# Gas Town on Oracle VPS

Gas Town is deployed as an Oracle VPS test override so it can be compared
against Nerve UI, ClawTeam, Paperclip, and the llxprt/Jefe agent stack without
making it part of the default production brain.

## Runtime Boundary

- Compose file: `infra/hosts/oracle-vps/docker-compose.gastown.yml`
- Make targets: `oracle-gastown-up`, `oracle-gastown-down`,
  `oracle-gastown-ps`, `oracle-gastown-logs`
- Docker context: `oracle`
- Dashboard port: `${GASTOWN_DASHBOARD_PORT:-8096}` on the Oracle host
- Container port: `8080`
- Infisical paths: `/shared`, `/machines/oracle-vps`, `/clients/gastown`,
  `/providers/llxprt`

Keep Gastown private while testing. Access it over Tailscale or an
access-gated tunnel only; do not expose it publicly because it is an agent
coordination dashboard with command execution surfaces.

## Commands

```bash
make oracle-gastown-up
make oracle-gastown-ps
make oracle-gastown-logs
make oracle-gastown-down
```

The Make targets use the current shell's Infisical auth environment to start
the runtime sidecar. The sidecar writes `/run/nyra-secrets/runtime.env` from:

- `/shared`
- `/machines/oracle-vps`
- `/clients/gastown`
- `/providers/llxprt`

Gastown sources that runtime env inside the container process. The Docker CLI
itself is intentionally not run inside a full Infisical-injected environment
because this local Docker Compose/buildx path currently faults under a very
large injected environment.

## Test URL

Use the Oracle host port directly when the current client can route to Oracle
over Tailscale:

```text
http://100.64.0.3:8096
```

If the current client cannot route to that Tailscale HTTP port, use a local SSH
forward through the existing `nyra-dev` Docker context host:

```bash
ssh -f -N -L 18096:localhost:8096 nyra-dev
```

Then open:

```text
http://localhost:18096
```

## Notes

The container builds from `infra/docker/Dockerfile.gastown`, which clones
`https://github.com/gastownhall/gastown` inside the image. It stores the Gas
Town workspace, agent home, and Dolt data in named Docker volumes so test state
survives container restarts without writing into the Project Nyra repo checkout.
