# Nyra rollback runbook

Rollback means **restoring recorded state**, not hunting through shell history.

## Recorded rollback points

| Artifact | Value |
|---|---|
| Rollback branch | `backup/pre-litellm-native-mcp-20260904` |
| Base commit | `4f2e24c43` — *feat(infra): move ClawTeam primary to orchestrator* |
| Pre-state snapshot | `docs/refactor/NYRA_REFACTOR_PRESTATE.md` |
| Previous LiteLLM image | `ghcr.io/berriai/litellm:v1.92.0` |
| Previous LiteLLM config | in git at `4f2e24c43:infra/configs/litellm/config.yaml` |
| Previous LiteLLM bind | `127.0.0.1:4010 -> 4000`, fronted by `tailscale serve` on `100.64.0.3:4000` |
| Previous MCP gateway | `ghcr.io/grafbase/nexus:0.6.0`, config `infra/hosts/oracle-vps/nexus.toml` |
| Previous portal origin | `mcp-gateway.projectnyra.com -> caddy -> nexus:3000` |
| New LiteLLM digest | `ghcr.io/berriai/litellm@sha256:a53a7d3ffebede1925bd3ee8a21e4a7b9b63e2e68ec883af136edcccb6eeb82c` |

## Decision: what actually broke?

| Symptom | Roll back | Section |
|---|---|---|
| MCP clients cannot discover or call tools | Cloudflare portal origin only | A |
| LiteLLM will not start, or model routing regressed | LiteLLM image + config | B |
| vLLM OOM / unstable inference | worker profile | C |
| KV cache misbehaving, Redis pressure | LMCache only | D |
| Everything | full | E |

Prefer the narrowest rollback that restores service. A full rollback of a
migration whose model plane is fine, because MCP discovery regressed, is a
self-inflicted second outage.

---

## A. Cloudflare portal origin

Fastest and least invasive. The Access application, service tokens and tunnel
are unchanged — only the origin moves back.

1. In the Cloudflare dashboard, point the MCP Server Portal upstream back at the
   Nexus origin.
2. Confirm Caddy still routes `mcp-gateway.projectnyra.com -> nexus:3000`:

```bash
ssh oracle-vps 'docker exec nyra-tailscale-caddy cat /etc/caddy/Caddyfile | grep -A6 mcp-gateway'
ssh oracle-vps 'docker ps --filter name=nexus'
```

3. If the Grafbase Nexus container was stopped:

```bash
ssh oracle-vps 'docker start nyra-network-nyra-nexus'
ssh oracle-vps 'docker inspect nyra-network-nyra-nexus --format "{{.State.Health.Status}}"'
```

**Do not** re-add `?optimize_context=search_and_execute` while rolling back —
that was never in the production path.

---

## B. LiteLLM image and config

```bash
ssh oracle-vps 'cd ~/project-nyra && git checkout backup/pre-litellm-native-mcp-20260904 -- infra/configs/litellm/config.yaml'
```

Restore the previous deployment shape (`v1.92.0`, published on
`127.0.0.1:4010`):

```bash
ssh oracle-vps 'cd ~/project-nyra && docker compose --profile oracle down'
ssh oracle-vps 'cd ~/project-nyra/infra/hosts/oracle-vps && \
  docker compose -f docker-compose.yml -f docker-compose.litellm.yml up -d'
```

If you removed the `tailscale serve` forward during deployment, restore it —
the old topology depended on it:

```bash
ssh oracle-vps 'sudo tailscale serve --bg --tcp 4000 tcp://localhost:4000'
```

> Note that this forward pointed at `localhost:4000` while the container
> published `127.0.0.1:4010`, i.e. it was already a **dead forward** before the
> migration. Restoring it restores the previous state, not a working one.

Verify:

```bash
ssh oracle-vps 'curl -fsS http://127.0.0.1:4010/health/readiness'
```

---

## C. Worker profile

```bash
ssh worker-rtx5090 'cd ~/project-nyra && docker compose --profile worker-5090 down'
```

There is no previous vLLM deployment to restore — **vLLM was not running
anywhere before this migration**. "Rollback" for the GPU workers means stopping
the new services, not restoring old ones.

Consumers fall back automatically: LiteLLM's chain routes
`nyra-*` → OmniRoute → OpenRouter when local deployments are cooled down.

---

## D. LMCache only

Keep vLLM, drop distributed KV reuse:

```bash
ssh worker-rtx5090 'cd ~/project-nyra && docker compose --profile worker-5090 stop lmcache-redis'
```

Then remove `--kv-transfer-config` from the vLLM command and restart it. vLLM
serves normally without LMCache; only cross-instance prefix reuse is lost.

Do not point LMCache at the Oracle `litellm-redis` as a workaround. Mixing GPU
KV tensors into the gateway control cache evicts spend and routing state.

---

## E. Full rollback

```bash
git checkout backup/pre-litellm-native-mcp-20260904

ssh oracle-vps      'cd ~/project-nyra && git fetch && git checkout backup/pre-litellm-native-mcp-20260904'
ssh worker-rtx5090  'cd ~/project-nyra && git fetch && git checkout backup/pre-litellm-native-mcp-20260904'
```

Then run sections A, B and C.

**Never force-push. Never delete git history.** The rollback branch and
`4f2e24c43` must remain reachable.

---

## What rollback does NOT undo

Be explicit about this before starting, so nobody expects it.

| Change | Reversible? | Why |
|---|---|---|
| Retired GPU worker purge | via git only | the machine is sold; there is nothing to roll back to |
| Rotated `TAILSCALE_MCP_AUTH_TOKEN` | no | rotate forward, never back |
| Cloudflare `allow_all_keys` removal | technically yes | **do not.** Restoring it re-grants every key Cloudflare zone administration. |
| Deleted Nexus (step 21) | via git | recoverable from history, but the containers must be rebuilt |

After the migration is accepted, Nexus remains recoverable through git history
but is absent from the active architecture.

---

## Post-rollback

1. Record what failed and why in `docs/refactor/NYRA_REFACTOR_VALIDATION.md`.
2. Confirm the exposure matrix is unchanged:
   `ssh oracle-vps 'ss -lntup'`
3. Confirm no secret was written to disk during the incident:
   `gitleaks detect --config .gitleaks.toml`
4. Do not leave the fleet in a half-migrated state. Either the `oracle` profile
   is authoritative or the legacy overlays are — never both, or two LiteLLM
   instances will answer on the same host.
