# Oracle Tailscale and `projectnyra.com` split DNS

## Current state

The authorized Oracle host command is:

```bash
sudo tailscale up --advertise-tags=tag:orchestrator,tag:prod --accept-routes --reset
```

It is available as `make oracle-tailscale-up`. The command must run on
`oracle-vps`, not on the developer workstation. A successful `tailscale up`
only registers the node, tags, and route acceptance; it does not create DNS
records by itself.

As of 2026-08-26, OCI access is available through the instance's public
address `163.192.46.128` on SSH port `23` (`ubuntu`). Oracle is enrolled in
Tailscale as `nyra-oracle-vnic` at `100.64.0.3`, online with
`tag:orchestrator` and `tag:prod`. Enrollment used the Infisical
`/external/tailscale` `TAILSCALE_AUTHKEY`; the value is never written to the
repository or shown in command output.

The private Caddy proxy is now defined in
`infra/hosts/oracle-vps/docker-compose.tailscale-proxy.yml`. It is healthy and
binds HTTPS to `100.64.0.3:443`, the Tailscale interface only. OCI public 443
remains closed intentionally because public
application and MCP ingress is provided by the healthy Cloudflare Tunnel.

## Required tailnet DNS configuration

In the Tailscale admin console, configure a nameserver/split-DNS rule for
`projectnyra.com` that points to the private DNS responder which serves the
Oracle and worker service records. The responder must be reachable over the
tailnet and must return private addresses for service names such as:

- `litellm.projectnyra.com` → the private LiteLLM host
- `nexus.projectnyra.com` → the private Nexus host
- `letta.projectnyra.com` and `mem0.projectnyra.com` → the private memory host
- `nerve-5090.projectnyra.com` → the RTX5090 worker
- `nerve-3090.projectnyra.com` → the RTX3090Ti worker
- `nerve-3060.projectnyra.com` → the RTX3060 worker
- `portainer-oracle.projectnyra.com` → the Oracle Portainer host

Raw Postgres, Redis, FalkorDB, Qdrant, and Docker socket endpoints remain
private network services and must not receive public Cloudflare routes or
general-purpose DNS aliases. Tailscale ACLs should restrict administrative
names to the owner/admin group.

## Verification

From an enrolled tailnet device, verify both the DNS answer and the route:

```bash
tailscale status
dig +short litellm.projectnyra.com
curl -fsS https://litellm.projectnyra.com/health
```

For the local reverse-proxy process check on Oracle:

```bash
ssh -p 23 ubuntu@163.192.46.128
sudo docker ps --filter name=nyra-tailscale-caddy
sudo ss -ltnp | grep ':443 '
curl -sk --resolve localhost:443:127.0.0.1 https://localhost/health
```

The expected pre-enrollment result is a healthy Caddy container, a loopback
443 listener, and an `OK` response. After Tailscale enrollment, repeat the
check against the Tailscale address and confirm the split-DNS answer for each
approved service hostname.

If `make oracle-tailscale-up` cannot connect, Oracle is unavailable and the
configuration is not confirmed. Do not run the command on another host as a
substitute; that would tag the wrong node.
